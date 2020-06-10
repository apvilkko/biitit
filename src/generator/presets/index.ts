import { sample, maybe, isObject } from '../../utils'
import {
  PresetName,
  PresetSpec,
  MaybeSpec,
  GeneratorPresetObjOptions,
} from '../../types'
import retrowavePreset from './retrowave'
import technoPreset from './techno'
import deephousePreset from './deephouse'

// TODO ability to enable/disable tracks

const PRESETS: Record<PresetName, PresetSpec> = {
  techno: technoPreset,
  retrowave: retrowavePreset,
  deephouse: deephousePreset,
}

const SCENE_PRESETS = Object.keys(PRESETS)

const normalizeProb = (obj) => {
  if (typeof obj !== 'number' && obj.sample) {
    return sample(obj.sample)
  }
  return obj
}

const normalizeOptions = (spec: GeneratorPresetObjOptions) => {
  if (typeof spec === 'number') {
    return { prob: spec }
  }
  if (spec.patLength && Array.isArray(spec.patLength)) {
    return { ...spec, patLength: sample(spec.patLength) }
  }
  return normalizeProb(spec)
}

const normalizeMaybeObj = (obj: MaybeSpec) => {
  if (!isObject(obj)) {
    return obj
  }
  const out = {}
  Object.keys(obj).forEach((key) => {
    out[key] = normalizeProb(obj[key])
  })
  return out
}

const normalizeGenSpec = (spec) => {
  if (!spec) {
    return spec
  }
  if (Array.isArray(spec)) {
    return {
      name: spec[0],
      opts: normalizeOptions(spec[1]),
    }
  } else if (typeof spec === 'string') {
    return { name: spec }
  } else if (spec.maybe) {
    if (Array.isArray(spec.maybe)) {
      const norm = spec.maybe.map(normalizeMaybeObj)
      return normalizeGenSpec(maybe(...norm))
    } else {
      return normalizeGenSpec(maybe(normalizeMaybeObj(spec.maybe)))
    }
  }
  if (spec.sample) {
    return normalizeGenSpec(normalizeProb(spec))
  }
  return spec
}

export { PRESETS as default, SCENE_PRESETS, normalizeGenSpec }
