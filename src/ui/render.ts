import inputs, { createCallback } from './inputs'
import { all } from '../generator/generators'
import CATALOG from '../generator/catalog'
import { SCENE_PRESETS } from '../generator/presets'

const getSampleLabel = (spec) => {
  if (!spec) {
    return 'N/A'
  }
  return `${spec.pre ? spec.pre + '_' : ''}${spec.name}${
    typeof spec.index === 'number' ? spec.index : ''
  }(${spec.style})`
}

const prepareSampleList = () => {
  const choices = []
  const keys = Object.keys(CATALOG).sort()
  keys.forEach((inst) => {
    choices.push({ group: true, label: inst })
    CATALOG[inst].forEach((sample) => {
      if (sample.amount) {
        for (let i = 0; i < sample.amount; ++i) {
          choices.push({ ...sample, index: i + 1 })
        }
      } else if (sample.spec) {
        sample.spec.forEach((spec) => {
          choices.push({ ...spec, style: sample.style, pre: inst })
        })
      }
    })
  })
  return choices
}

const sampleChoices = prepareSampleList()

const renderLabel = ({ id, label }) =>
  `<label for="${id}">${label || id}</label>`

const formGroup = ({ children }) => `<div class="form-group">${children}</div>`
const emptyWrapper = ({ children }) => children

const renderSelect = ({
  id,
  options,
  selected,
  valueFn,
  groups,
  label,
}: {
  id: string
  options: Array<{ group: string }> | string[]
  selected: string
  valueFn?: (x: unknown) => string
  groups?: boolean
  label?: string
}) => {
  let inGroup = false
  let out = []
  let wrapper = emptyWrapper
  if (label) {
    wrapper = formGroup
    out.push(renderLabel({ id, label }))
  }
  out.push(`<select id="${id}">
  ${options
    .map((x) => {
      if (groups && x.group) {
        let out = ''
        if (inGroup) {
          inGroup = false
          out += `</optgroup>`
        }
        return out + `<optgroup label="${valueFn(x)}">`
      }
      const value = valueFn ? valueFn(x) : x
      return `<option value="${value}" ${
        selected === value ? 'selected' : ''
      }>${value}</option>`
    })
    .join('')}
  </select>
  `)
  return wrapper({ children: out.join('') })
}

const renderSampleValue = (x) => {
  if (x.group) {
    return x.label
  }
  return getSampleLabel(x)
}

const isUpperCase = (str: string): boolean => str.toUpperCase() === str

const renderSample = (spec, i, key?: string) => {
  let value = getSampleLabel(spec)
  if (!(isUpperCase(value[0]) && isUpperCase(value[1]))) {
    value = `${key}_${value}`
  }
  return renderSelect({
    id: `sample-select-${i}`,
    options: sampleChoices,
    selected: value,
    valueFn: renderSampleValue,
    groups: true,
  })
}

const renderGenerator = (scene, key, i) => {
  const value = scene.generators[i] ? scene.generators[i].name : null
  if (value) {
    return renderSelect({
      id: `generator-select-${i}`,
      options: Object.keys(all),
      selected: value,
    })
  } else {
    return ''
  }
}

const attr = (obj) => {
  const key = Object.keys(obj)[0]
  const value = Object.values(obj)[0]
  if (typeof value === 'undefined') {
    return ''
  }
  return `${key}=${value}`
}

const input = (props) => {
  const { id, type, label } = props
  return formGroup({
    children: `${renderLabel({ id, label })}<input ${[
      'id',
      'value',
      'min',
      'max',
    ]
      .map((x) => attr({ [x]: props[x] }))
      .join(' ')}
  ${attr({ type: type || 'text' })} />
  `,
  })
}

const listeners = {}

const addListener = (id: string, callback, type?) => {
  const e = document.getElementById(id)
  if (e) {
    e.addEventListener(type || 'change', callback)
  }
}

const removeListener = (id: string, callback, type?) => {
  const e = document.getElementById(id)
  if (e) {
    e.removeEventListener(type || 'change', callback)
  }
}

const renderPattern = (pattern) => {
  if (!pattern) {
    return ''
  }
  return `
  <div class="pattern">
  ${pattern
    .map((x) => {
      const empty = !(x && x.velocity)
      const velo = empty ? null : Math.floor(255 * x.velocity)
      return empty
        ? '<div class="note empty"></div>'
        : `<div class="note" style="background-color: rgba(${velo},0,0,255);"></div>`
    })
    .join('')}
  </div>
  `
}

const section = (sections, obj, tag) => {
  const t = tag || 'div'
  const id = Object.keys(obj)[0]
  const value = `<${t} id="${id}">${Object.values(obj)[0]}</${t}>`
  sections[id] = value
  return value
}

const cache: {
  numItems?: number
} = {}

let firstRenderDone = false

let logged = false
const logOnce = (...params) => {
  if (!logged) {
    console.log(...params)
    logged = true
  }
}

const addListeners = (state) => {
  const trackIds = Object.keys(state.scene.generators).map((x, i) => i)
  const generatorIds = trackIds.map((i) => `generator-select-${i}`)
  const sampleIds = trackIds.map((i) => `sample-select-${i}`)
  generatorIds.forEach((id) => {
    const callback = createCallback(id)
    addListener(id, callback)
    listeners[id] = { callback, id }
  })
  sampleIds.forEach((id) => {
    const callback = createCallback(id)
    addListener(id, callback)
    listeners[id] = { callback, id }
  })
  Object.keys(inputs).forEach((key) => {
    const spec = inputs[key]
    addListener(key, spec.callback)
    listeners[key] = { ...spec, id: key }
  })
}

const removeListeners = () => {
  Object.keys(listeners).forEach((key) => {
    removeListener(key, listeners[key].callback)
  })
}

const PRESETS = ['select…', ...SCENE_PRESETS]

const renderPresets = (scene) => {
  return renderSelect({
    id: 'preset',
    options: PRESETS,
    selected: scene.preset || null,
    label: 'preset',
  })
}

const render = (state) => {
  const el = document.getElementById('content')
  const { scene } = state
  const sections: Record<string, unknown> = {}

  const sect = (obj: Record<string, unknown>, tag?) =>
    section(sections, obj, tag)

  sect({
    header:
      input({
        value: scene.tempo,
        id: 'tempo',
        type: 'number',
        min: 30,
        max: 250,
      }) + renderPresets(scene),
  })
  sect(
    {
      debug: '', //JSON.stringify(state, null, 2),
    },
    'pre'
  )
  sect(
    {
      tableHeader: `${['#', 'pattern', 'generator', 'sample']
        .map((x) => `<th>${x}</th>`)
        .join('')}`,
    },
    'tr'
  )

  const instruments = scene.types

  instruments.forEach((key, i) => {
    const inst = scene.instruments[i]
    sect({ [`index-${i}`]: i + 1 }, 'td')
    sect({ [`pattern-${i}`]: renderPattern((state.pattern || {})[i]) }, 'td')
    sect({ [`generator-${i}`]: renderGenerator(scene, key, i) }, 'td')
    sect(
      { [`sample-${i}`]: renderSample(inst.specs[key].sample, i, key) },
      'td'
    )
  })

  const changed = {}
  let anyChanged = false
  Object.keys(sections).forEach((s) => {
    const same = cache[s] && sections[s] === cache[s]
    changed[s] = !same
    if (!same) {
      anyChanged = true
    }
    cache[s] = sections[s]
  })

  const amountChanged = cache.numItems !== Object.keys(sections).length
  cache.numItems = Object.keys(sections).length

  if (!anyChanged && !amountChanged) {
    return
  }

  if (firstRenderDone && !amountChanged) {
    removeListeners()
    Object.keys(changed).forEach((s) => {
      if (changed[s]) {
        const e = document.getElementById(s)
        if (e) {
          e.outerHTML = sections[s] as string
          cache[s] = sections[s]
        }
      }
    })
    addListeners(state)
    return
  }

  const html = `
<div>
  ${sections.header}
  <table>
    ${sections.tableHeader}
    ${instruments
      .map(
        (key, i) => `<tr>
    ${['index', 'pattern', 'generator', 'sample']
      .map((cell) => sections[`${cell}-${i}`])
      .join('')}
    </tr>`
      )
      .join('')}
  </table>
  ${sections.debug}
</div>
`

  removeListeners()
  el.innerHTML = html
  firstRenderDone = true
  addListeners(state)
}

export default render
