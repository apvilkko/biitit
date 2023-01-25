import instruments, { InstrumentKey } from './instruments'
import { rand, randFloat, isObject, maybe, randLt, sample } from '../utils'
import sampler from '../audio-components/sampler'
import compressor from '../audio-components/compressor'
import reverb from '../audio-components/reverb'
import retrosynth from '../audio-components/retrosynth'
import stereoDelay from '../audio-components/stereoDelay'
import waveshaper from '../audio-components/waveshaper'
import { getRandomSample } from './catalog'
import { all, getRandomGenerator } from './generators'
import PRESETS, { normalizeGenSpec } from './presets'
import { play, reset, pause } from '../core/sequencer'
import {
  Scene,
  Context,
  MasterInsertSpec,
  GeneratorFactory,
  ValueRandomizerSpec,
  MaybeSpec,
  RangedValueSpec,
  PresetRandomizerSpec,
  SampleRandomizerSpec,
  PresetTrackSpec,
  ScalarOrRandSpec,
  ConditionalSpec,
  Condition,
  OrClause,
  Equality,
  SpecRef,
} from '../types'

const { BD, CP, HC, PR, HO, BS, PD, ST, SN, RD, DL, FX } = instruments

let context: Context

const cleanupInstance = (instance) => {
  if (instance.cleanup) {
    instance.cleanup()
  }
  if (instance.vcos) {
    instance.vcos.forEach((vco) => {
      vco.stop()
    })
  }
  if (instance.output) {
    instance.output.disconnect()
  }
  if (instance.instances) {
    instance.instances.forEach(cleanupInstance)
  }
}

const cleanup = (context: Context, index?: number) => {
  const scene = context.scene
  if (!scene) {
    return
  }
  scene.types.forEach((_, i) => {
    if (typeof index !== 'undefined' && i !== index) {
      return
    }
    const instance = scene.instances[i]
    const track = context.mixer.tracks[i]
    const inserts = instance.mixerInserts
    const sends = instance.mixerSends
    for (let j = 0; j < inserts.length; ++j) {
      inserts[j].input.disconnect()
      inserts[j].output.disconnect()
      delete inserts[j]
    }
    for (let j = 0; j < sends.length; ++j) {
      sends[j].input.disconnect()
      sends[j].output.disconnect()
      delete sends[j]
    }
    cleanupInstance(instance)
    track.panner.disconnect(context.mixer.input)
    track.gain.disconnect(track.panner)
    scene.instances[i] = null
  })
}

const createInstrumentInstance = (context, instrument, specs) => {
  console.log('createInstrumentInstance', instrument, specs)

  const handle = (isSynth) => {
    console.log(instrument, isSynth)
    const polyphony = specs.specs[instrument].polyphony
    const shouldComp = false
    const shouldRev = false
    const wetRev = false
    const inserts = []
    if (shouldRev) {
      inserts.push(
        reverb(context.mixer.ctx, {
          impulse: specs.reverbImpulse,
          dry: 1,
          wet: wetRev ? randFloat(0.5, 0.7) : randFloat(0.3, 0.5),
        })
      )
    }
    if (shouldComp) {
      inserts.push(
        compressor(context.mixer.ctx, {
          threshold: -15,
          ratio: 6,
          attack: 0.004,
          release: 0.18,
        })
      )
    }
    let synth
    if (isSynth) {
      const params = specs.specs[instrument].synth
      const synthFactory = params.name === 'retrosynth' ? retrosynth : null
      if (!synthFactory) {
        throw new Error('invalid synth name ' + params.name)
      }
      synth = retrosynth(context.mixer.ctx)
      Object.keys(params).forEach((k) => {
        synth.setParam(k, params[k])
      })
    } else {
      const sampleSpec = specs.specs[instrument].sample
      synth = sampler(context.mixer.ctx, sampleSpec, inserts, polyphony)
    }

    return synth
  }

  switch (instrument) {
    case BS:
    case BD:
    case CP:
    case HC:
    case PR:
    case HO:
    case PD:
    case BS:
    case ST:
    case SN:
    case DL:
    case FX:
    case RD: {
      return handle(!!specs.specs[instrument].synth)
    }
    default:
      console.error('no instance created for', instrument, specs)
      return null
  }
}

let generators: Record<InstrumentKey, GeneratorFactory> | {} = {}

const getGenSpec = (preset, i) => {
  const out = normalizeGenSpec(preset.tracks[i].generator)
  return out || {}
}

const randomizeGenerators = (preset) => {
  if (preset) {
    generators = {}
    preset.tracks.forEach((trackSpec, i) => {
      const genSpec = getGenSpec(preset, i)
      generators[trackSpec.type] = all[genSpec.name]
    })
  } else {
    startingSet.forEach((key) => {
      generators[key] = getRandomGenerator(rand(1, 100) > 15 ? [key] : null)
    })
  }
}

const ifSpec = (spec: ConditionalSpec['if'], refs) => {
  const cond = randFromSpec(spec[0], refs)
  const v1 = randFromSpec(spec[1], refs)
  const v2 = randFromSpec(spec[2], refs)
  return cond ? v1 : v2
}

const orSpec = (spec: OrClause['or'], refs) => {
  return randFromSpec(spec[0], refs) || randFromSpec(spec[1], refs)
}

const eqSpec = (spec: Equality['eq'], refs) => {
  return randFromSpec(spec[0], refs) == randFromSpec(spec[1], refs)
}

const randFromSpec = (
  spec: number | ValueRandomizerSpec | ScalarOrRandSpec | Condition | SpecRef,
  refs?: Record<string, number | string | boolean>
) => {
  if (spec === undefined || spec === null) {
    return spec
  }
  if (
    spec === 0 ||
    typeof spec === 'number' ||
    typeof spec == 'boolean' ||
    typeof spec == 'string'
  ) {
    return spec
  }
  if (!spec) {
    return null
  }
  if ((spec as ConditionalSpec).if) {
    return ifSpec((spec as ConditionalSpec).if, refs)
  }
  if ((spec as OrClause).or) {
    return orSpec((spec as OrClause).or, refs)
  }
  if ((spec as Equality).eq) {
    return eqSpec((spec as Equality).eq, refs)
  }
  if ((spec as SpecRef).ref) {
    return refs ? randFromSpec(refs[(spec as SpecRef).ref], refs) : null
  }
  const mSpec = spec as MaybeSpec
  if (mSpec.maybe) {
    return maybe(mSpec.maybe)
  }
  const ranged = spec as RangedValueSpec
  if (ranged.min && ranged.max) {
    return rand(ranged.min, ranged.max)
  }
  const sSpec = spec as SampleRandomizerSpec
  if (sSpec.sample) {
    return sample(sSpec.sample)
  }
  if (isObject(spec)) {
    return Object.keys(spec).reduce((acc, curr) => {
      acc[curr] = randFromSpec(spec[curr])
      return acc
    }, {})
  }
  return null
}

const drumRandomizer = (instrument, sampleGroup?: string, opts?) => () => {
  const options = opts || {}
  const specs = {
    [instrument]: {
      sample: getRandomSample(instrument, sampleGroup),
      pan: randFloat(-0.05, 0.05),
      pitch: randFloat(-3, 3),
      ...options,
      volume: 1.0,
    },
  }
  const reverbImpulse = getRandomSample('impulse', sampleGroup)
  return {
    specs,
    reverbImpulse,
    gain: options.gain || 0.6,
  }
}

const synthRandomizer = (instrument, sampleGroup?, opts?) => () => {
  const options = opts || {}
  console.log('synthRandomizer', options)
  const specs = {
    [instrument]: {
      pan: randFloat(-0.05, 0.05),
      ...options,
      volume: 1.0,
    },
  }
  const reverbImpulse = getRandomSample('impulse', sampleGroup)
  return {
    specs,
    reverbImpulse,
    gain: options.gain || 0.6,
  }
}

let randomizers = {}

const specify = (x: PresetRandomizerSpec, refs?: PresetTrackSpec['refs']) => {
  if (!x) {
    return x
  }
  let processedRefs = {}
  if (refs) {
    processedRefs = Object.keys(refs).reduce((acc, curr) => {
      acc[curr] = randFromSpec(refs[curr])
      return acc
    }, {})
  }
  const out = {}
  Object.keys(x).forEach((key) => {
    out[key] = randFromSpec(x[key], processedRefs)
  })
  return out
}

const setupRandomizers = (preset) => {
  if (preset) {
    randomizers = {}
    preset.tracks.forEach((trackSpec, i) => {
      const key = trackSpec.type
      // TODO preset ability to use "wrong" samples
      let randomizer = drumRandomizer
      if (trackSpec.randomizer.synth) {
        randomizer = synthRandomizer
      }
      randomizers[`${key}-${i}`] = randomizer(
        key,
        preset.name,
        Object.assign(
          {},
          { refs: specify(trackSpec.refs) },
          specify(trackSpec.randomizer, trackSpec.refs)
        )
      )
    })
  } else {
    startingSet.forEach((key, i) => {
      randomizers[`${key}-${i}`] = drumRandomizer(key)
    })
  }
}

const mapObject = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(mapObject)
  } else if (isObject(obj)) {
    const out = {}
    Object.keys(obj).forEach((key) => {
      out[key] = mapObject(obj[key])
    })
    return out
  } else {
    if (typeof obj === 'string' || typeof obj === 'number') {
      return obj
    }
  }
}

const syncToState = (scene, setState) => {
  const state = { scene: mapObject(scene) }
  setState(state)
}

const changeGenerator = (index, value, setState) => {
  const scene = context.scene
  const key = scene.types[index]
  const gen = all[value]
  scene.generators[index] = {
    name: gen.name,
    generator: gen.generator({ index, instrument: key })(gen.name, scene)(),
  }
  syncToState(scene, setState)
}

const PATTERN = /^(\w+)(\d+)\((\w+)\)$/

const toEffectInstance = (scene, i) => (isSend?: boolean) => (effectSpec) => {
  const specs = scene.instruments[i]
  const tempo = scene.tempo
  if (typeof effectSpec.name === 'string') {
    switch (effectSpec.name) {
      case 'compressor': {
        return compressor(context.mixer.ctx, {
          threshold: effectSpec.threshold || -8,
          ratio: effectSpec.ratio || 4,
          attack: effectSpec.attack || 0.01,
          release: effectSpec.release || 0.1,
        })
      }
      case 'reverb': {
        return reverb(context.mixer.ctx, {
          impulse: specs.reverbImpulse,
          dry: randFromSpec(effectSpec.dry) || (isSend ? 0 : 1.0),
          wet: randFromSpec(effectSpec.wet) || randFloat(0.5, 0.7),
        })
      }
      case 'delay': {
        return stereoDelay(context.mixer.ctx, {
          ...effectSpec,
          tempo,
        })
      }
    }
  }
  return null
}

const setupInstrumentInstance = (scene: Scene, index: number, presetTrack?) => {
  const track = context.mixer.tracks[index]
  const inserts = (presetTrack ? presetTrack.inserts : []) || []
  const sends = (presetTrack ? presetTrack.sends : []) || []
  const mapper = toEffectInstance(scene, index)
  const insertInstances = inserts.map(mapper()).filter((x) => !!x)
  const sendInstances = sends.map(mapper(true)).filter((x) => !!x)
  for (let i = 0; i < insertInstances.length; ++i) {
    const insert = insertInstances[i]
    insert.output.connect(
      i < insertInstances.length - 1 ? insertInstances[i + 1].input : track.gain
    )
  }
  const instance = scene.instances[index]
  for (let i = 0; i < sendInstances.length; ++i) {
    instance.output.connect(sendInstances[i].input)
    sendInstances[i].output.connect(track.gain)
  }
  const dest = insertInstances.length ? insertInstances[0].input : track.gain
  if (instance.output) {
    instance.output.connect(dest)
  }
  if (scene.instruments[index].gain) {
    track.gain.gain.value = scene.instruments[index].gain
  }
  instance.mixerInserts = insertInstances
  instance.mixerSends = sendInstances
  const panner = context.mixer.ctx.createStereoPanner()
  const instSpecs = scene.instruments[index].specs
  panner.pan.value = instSpecs[Object.keys(instSpecs)[0]].pan || 0
  panner.connect(context.mixer.input)
  track.gain.connect(panner)
  track.panner = panner
}

const changeTempo = (value, setState) => {
  const scene = context.scene
  scene.tempo = value
  syncToState(scene, setState)
}

const changeSample = (index, value, setState) => {
  const match = value.match(PATTERN)
  const newSample = {
    name: match[1],
    index: Number(match[2]),
    style: match[3],
  }
  const scene = context.scene
  const key = scene.types[index]

  cleanup(context, index)
  scene.instruments[index].specs[key].sample = {
    ...scene.instruments[index].specs[key].sample,
    ...newSample,
  }
  scene.instances[index] = createInstrumentInstance(
    context,
    key,
    scene.instruments[index]
  )
  setupInstrumentInstance(scene, index)
  syncToState(scene, setState)
}

const changePreset = (value, setState) => {
  pause(context.sequencer)
  context.scene = randomize(setState, value)
  reset(context.sequencer)
  play(context.sequencer)
}

const startingSet = [BD, BS, CP, HC, HO, PR]

const cleanupMasterEffects = () => {
  const needCleanup = !!context.mixer.masterInserts.inserts.length
  if (needCleanup) {
    context.mixer.masterInserts.input.disconnect()
  }
  context.mixer.masterInserts.inserts.forEach((insert) => {
    insert.input.disconnect()
    insert.output.disconnect()
  })
  context.mixer.masterInserts.inserts = []
  if (needCleanup) {
    context.mixer.masterInserts.input.connect(
      context.mixer.masterInserts.output
    )
  }
}

const normalizeSpec = (spec): MasterInsertSpec => {
  const out = { name: 'undefined' }
  Object.keys(spec).forEach((key) => {
    let val = spec[key]
    if (spec[key].min && spec[key].max) {
      val = randFloat(spec[key].min, spec[key].max)
    }
    out[key] = val
  })
  return out
}

const setupMasterEffects = (scene: Scene) => {
  cleanupMasterEffects()
  if (scene && scene.masterInserts) {
    const instances = []
    for (let i = 0; i < scene.masterInserts.length; ++i) {
      const spec = scene.masterInserts[i]
      let instance
      switch (spec.name) {
        case 'waveshaper': {
          instance = waveshaper(context.mixer.ctx, spec)
          break
        }
        default:
          continue
      }
      if (instance) {
        instances.push(instance)
      }
    }
    if (instances.length) {
      context.mixer.masterInserts.input.disconnect()
      for (let i = 0; i < instances.length + 1; ++i) {
        const instance = instances[i]
        const source =
          i === 0 ? context.mixer.masterInserts.input : instances[i - 1].output
        const destination =
          i === instances.length
            ? context.mixer.masterInserts.output
            : instance.input
        if (i < instances.length) {
          context.mixer.masterInserts.inserts.push(instance)
        }
        source.connect(destination)
      }
    }
  }
}

const randomize = (setState, presetName?: string): Scene => {
  cleanup(context)
  const preset = PRESETS[presetName] || null
  randomizeGenerators(preset)
  setupRandomizers(preset)
  let shufflePercentage = preset ? randFromSpec(preset.shufflePercentage) : null
  if (typeof shufflePercentage !== 'number') {
    shufflePercentage = rand(0, 30)
  }
  const scene: Scene = {
    tempo: (preset ? randFromSpec(preset.tempo) : null) || rand(80, 165),
    shufflePercentage,
    types: [],
    instruments: [],
    generators: [],
    instances: [],
    rootNoteOffset: rand(-4, 4),
    chords: preset ? randFromSpec(preset.chords) : null,
    masterInserts:
      preset && preset.masterInserts
        ? preset.masterInserts.map(normalizeSpec)
        : (randLt(50) ? [{ name: 'waveshaper' }] : null) || null,
  }
  const instSet = preset ? preset.tracks.map((x) => x.type) : startingSet
  instSet.forEach((instrument, i) => {
    scene.types.push(instrument)
    const randKey = `${instrument}-${i}`
    scene.instruments.push(randomizers[randKey]())
    const gen: GeneratorFactory = generators[instrument]
    let genOpts = {
      index: i,
      instrument,
      ...(preset ? getGenSpec(preset, i).opts || {} : {}),
    }
    scene.generators.push({
      name: gen.name,
      generator: gen.generator(genOpts)(gen.name, scene)(),
    })
    scene.instances.push(
      createInstrumentInstance(context, instrument, scene.instruments[i])
    )
    setupInstrumentInstance(scene, i, preset ? preset.tracks[i] : null)
  })

  setupMasterEffects(scene)

  syncToState(scene, setState)
  return scene
}

const initScene = (ctx: Context) => {
  context = ctx
}

export {
  initScene,
  randomize,
  changeGenerator,
  changeSample,
  changeTempo,
  changePreset,
}
