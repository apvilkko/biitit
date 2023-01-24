import { sample, rand } from '../utils'
import type {
  Hitmap,
  Style,
  SampleKey,
  SimpleSampleSpec,
  DrumloopSampleSpec,
  DrumloopIndexedSampleSpec,
  CatalogItemType,
  Indexed,
  DrumloopItemSpec,
} from '../types'

const ALIASES = {
  CL: 'CP',
  BASS: 'BS',
  STAB: 'ST',
  PAD: 'PD',
  SUB: 'BS',
}

type CatalogSampleSpec = SimpleSampleSpec | DrumloopSampleSpec

type StyleCatalog = {
  samples: Record<Style, Record<SampleKey, CatalogSampleSpec>>
}

const BY_STYLE: StyleCatalog = {
  samples: {
    trance: {
      BD: { amount: 4 },
      BS: { amount: 4 },
      CL: { amount: 4 },
      CR: { amount: 1 },
      HC: { amount: 4 },
      HO: { amount: 4 },
      impulse: { amount: 1 },
      LP: { amount: 8 },
      MB: { amount: 4 },
      RD: { amount: 4 },
      SN: { amount: 1 },
    },
    techno: {
      BD: { amount: 5 },
      BS: { amount: 3 },
      CL: { amount: 3 },
      HC: { amount: 4 },
      HO: { amount: 6 },
      impulse: { amount: 1 },
      PR: { amount: 6 },
      RD: { amount: 3 },
      SN: { amount: 2 },
      ST: { amount: 6 },
    },
    retrowave: {
      BD: { amount: 4 },
      CP: { amount: 2 },
      CR: { amount: 1 },
      HC: { amount: 4 },
      HO: { amount: 2 },
      impulse: { amount: 3 },
      OR: { amount: 5 },
      PR: { amount: 6 },
      RD: { amount: 1 },
      SN: { amount: 4 },
      TM: { amount: 4 },
    },
    deephouse: {
      BASS: { amount: 5 },
      BD: { amount: 6 },
      CL: { amount: 6 },
      HC: { amount: 6 },
      impulse: { amount: 1 },
      PAD: { amount: 5 },
      PR: { amount: 6 },
      STAB: { amount: 5 },
    },
    dnb: {
      impulse: { amount: 1 },
      SUB: { amount: 3 },
      FX: { amount: 9 },
      STAB: { amount: 9 },
      DL: [
        {
          name: 'amen1',
          bars: 2,
          bpm: 165,
          hits: 'krstksttc0skkstt',
          gain: 0.7,
        },
        {
          name: 'apache1',
          bars: 2,
          bpm: 165,
          hits: 'krsttkstkksttkst',
        },
        {
          name: 'dothe1',
          bars: 1,
          bpm: 165,
          hits: 'krsttkst',
        },
        {
          name: 'funky1',
          bars: 2,
          bpm: 165,
          hits: 'kksttkstkksttkst',
        },
        {
          name: 'hot1',
          bars: 2,
          bpm: 165,
          hits: 'krsttkskkrstrstt',
        },
        {
          name: 'runs1',
          bars: 2,
          bpm: 165,
          hits: 'c0sttkstkksttks0',
        },
        {
          name: 'think1',
          bars: 2,
          bpm: 165,
          hits: 'krsttrs0krsttrsr',
        },
      ],
    },
  },
}

const CATALOG: Record<SampleKey, Array<CatalogItemType>> = {}
Object.keys(BY_STYLE.samples).forEach((style) => {
  Object.keys(BY_STYLE.samples[style]).forEach((k) => {
    const key = ALIASES[k] || k
    if (!CATALOG[key]) {
      CATALOG[key] = []
    }
    const spec = BY_STYLE.samples[style][k]
    let rest: Partial<CatalogItemType>
    if (Array.isArray(spec)) {
      rest = { spec }
    } else {
      rest = spec
    }
    CATALOG[key].push({
      style,
      name: k,
      ...rest,
    })
  })
})

type SampleSpec = (CatalogItemType & Indexed) | DrumloopIndexedSampleSpec

const isDrumloopSpec = (
  catalogItem: CatalogItemType
): catalogItem is DrumloopIndexedSampleSpec => {
  return catalogItem && Array.isArray(catalogItem.spec)
}

const getRandomSample = (key, sampleGroup): SampleSpec | undefined => {
  const choices = sampleGroup
    ? CATALOG[key].filter((x) => x.style === sampleGroup)
    : CATALOG[key]
  const styleSpec = sample(choices)
  if (!styleSpec) {
    return undefined
  }
  let index = 1
  let sampleSpec = styleSpec
  if (!isDrumloopSpec(sampleSpec)) {
    index = rand(1, styleSpec.amount)
  } else {
    const choice = sample(styleSpec.spec)
    sampleSpec = {
      ...choice,
      hitmap: generateHitMap(choice),
      style: styleSpec.style,
      name: choice.name.replace(/\d+/g, ''),
    } as DrumloopIndexedSampleSpec
  }
  const ret: SampleSpec = {
    ...sampleSpec,
    index,
  }
  return ret
}

const indexToTime = (spec, index) => {
  const oneBeat = 60.0 / spec.bpm
  const amountBeats = spec.bars * 4
  const amountEights = amountBeats * 2
  const sampleLenSecs = oneBeat * amountBeats
  const sliceLen = sampleLenSecs / amountEights
  return index * sliceLen
}

const generateHitMap = (spec: DrumloopItemSpec): Hitmap => {
  return spec.hits
    .split('')
    .map((v, k) => ({ index: k, hit: v, time: indexToTime(spec, k) }))
    .filter((x) => x.hit !== '0')
}

export { CATALOG as default, getRandomSample }
