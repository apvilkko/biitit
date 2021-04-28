import { getRateFromPitch } from '../../core/math'
import {
  DrumloopSceneSampleSpec,
  Hitmap,
  Note,
  NoteGetterParams,
  PreFnParams,
} from '../../types'
import { rand, randLt, sample, takeRandom } from '../../utils'
import { NOTE_LENGTH, ROOT_NOTE } from '../constants'
import { createBasePitchedNoteGenerator, createPatternGenerator } from './utils'

const { sixteenth, eighth, bar } = NOTE_LENGTH

const empty = (len) => Array.from({ length: len }).map((_) => undefined)

const asNotes = (
  arr: Array<Record<string, unknown>>,
  rate?: number
): Note[] => {
  const out = Array.from({ length: arr.length * sixteenth }).map(
    (_) => undefined
  )
  for (let i = 0; i < arr.length; ++i) {
    const i1 = i * sixteenth
    const x = arr[i]
    out[i1] = x
      ? {
          ...x,
          note: x.note || 1,
          velocity: 1.0,
          instrument: undefined,
          rate: x.pitch ? getRateFromPitch(x.pitch) : rate,
        }
      : undefined
  }
  return out
}

type AlgoFn = (len: number, hitMap: Hitmap, rate: number) => Note[]
type SubAlgoFn = (len: number, rootPitch: number, drumloop?: Note[]) => Note[]

const randSub = (rootPitch) => ({
  note: ROOT_NOTE + rootPitch + rand(-2, 10),
  velocity: 1.0,
})

const subAlgos: Record<string, SubAlgoFn> = {
  // rush start + ending fill
  rushStart: (len, rootPitch) => {
    const pattern = empty(len)
    const startChoices = [1, 2, 3, 4]
    ;[0].concat(takeRandom(rand(1, 4), startChoices)).forEach((index) => {
      pattern[index * 2] = randSub(rootPitch)
    })
    const endChoices = [-4, -6, -8]
    takeRandom(rand(0, 2), endChoices).forEach((index) => {
      pattern[len + index] = randSub(rootPitch)
    })
    return asNotes(pattern)
  },

  // start root + end rush
  rushEnd: (len, rootPitch) => {
    const pattern = empty(len)
    pattern[0] = rootPitch
    const endChoices = [-2, -4, -6, -8, -10]
    takeRandom(rand(1, 5), endChoices).forEach((index) => {
      pattern[len + index] = randSub(rootPitch)
    })
    return asNotes(pattern)
  },

  // follow drums
  follow: (len, rootPitch, drumloop) => {
    const pattern = empty(len)
    for (let i = 0; i < len; ++i) {
      const v = drumloop[i % drumloop.length]
      if (
        v &&
        (v.hit === 'k' || v.hit === 's' || v.hit === 'c') &&
        i % 2 === 0 &&
        randLt(i === 0 ? 100 : 50)
      ) {
        pattern[i] = randSub(rootPitch)
      }
    }
    if (!pattern[0]) {
      pattern[0] = randSub(rootPitch)
    }
    return asNotes(pattern)
  },
}

const drumloopAlgos: Record<string, AlgoFn> = {
  // random 2-4-6s
  '246': (len, hitMap, rate) => {
    const pattern = empty(len)
    const choices = hitMap.map((v) => v.time)
    let i = 0
    let skip
    while (i < pattern.length) {
      const randomSlice = sample(hitMap)
      pattern[i] = randomSlice
      const skipChoices = [2]
      // If slice is near the end it can't be played as long (could loop, TODO)
      if (randomSlice.index + 2 <= choices.length) {
        skipChoices.push(4)
      }
      if (randomSlice.index + 4 <= choices.length) {
        skipChoices.push(6)
      }
      skip = sample(skipChoices)
      i += skip
    }
    return asNotes(pattern, rate)
  },

  // kicks + snares + crashes
  ksc: (len, hitMap, rate) => {
    const pattern = empty(len)
    const snare = hitMap.filter((v) => v.hit === 's')[0]
    const tweens = hitMap.filter((v) => v.hit === 't')
    const kick = hitMap.filter((v) => v.hit === 'k')[0]
    const crash = hitMap.filter((v) => v.hit === 'c')[0]
    const choices = hitMap.map((v) => v.time)
    let i = 0
    let skip
    while (i < pattern.length) {
      // Emphasize snare on second quarter
      const randomSlice = randLt((i - 4) % 16 === 0 ? 80 : 50) ? snare : kick
      pattern[i] = randomSlice
      if (randomSlice === snare && i > 1 && randLt(25)) {
        let fillSnare = randomSlice
        if (randLt(40)) {
          fillSnare = Object.assign({}, randomSlice, { pitch: rand(-1, 1) })
        }
        pattern[i - 1] = fillSnare
      }
      const skipChoices = [2]
      if (randomSlice.index + 2 <= choices.length) {
        skipChoices.push(4)
      }
      if (randomSlice.index + 4 <= choices.length) {
        skipChoices.push(6)
      }
      skip = sample(skipChoices)
      if (i === 0 && skip === 2 && randLt(70)) {
        skip = sample([4, 6])
      }
      if ((skip === 4 || skip === 6) && randLt(50)) {
        const tweenIndex = i + (skip === 4 ? 2 : 4)
        if (tweenIndex < len) {
          pattern[tweenIndex] = sample(tweens)
        }
      }
      i += skip
    }
    const amountCrashes = rand(0, 3)
    for (let i = 0; i < amountCrashes; ++i) {
      let index = rand(0, (len - 2) / 2) * 2
      // Emphasize 0
      if (i === 0 && randLt(75)) {
        index = 0
      }
      pattern[index] = crash
    }
    return asNotes(pattern, rate)
  },
}

type DnbLoopData = {
  pattern: Note[]
  inFill: boolean
}

const store = {
  pattern: [],
}

export const dnbDrumloop = (opts) => {
  return createPatternGenerator<DnbLoopData>(
    opts.patLength,
    ({ scene }: PreFnParams) => {
      const specs = Object.values(scene.instruments[opts.index].specs)[0]
      const sampleSpec = specs.sample as DrumloopSceneSampleSpec
      const { hitmap, bpm } = sampleSpec
      const playbackRate = (scene.tempo / bpm) * 0.99
      const { variant } = specs
      const algo =
        drumloopAlgos[(variant as string) || sample(Object.keys(drumloopAlgos))]
      if (!algo) {
        console.error('no algorithm for ' + variant)
      }
      const pattern = algo(opts.patLength, hitmap, playbackRate)
      store.pattern = pattern
      return {
        pattern,
        inFill: false,
      }
    },
    (params: NoteGetterParams<DnbLoopData>) => {
      const { position, data } = params
      return data.pattern[position]
    },
    opts.noOff,
    opts.update
  )
}

export const dnbSub = (opts) => {
  const patLength = opts.patLength || 2 * bar
  return createPatternGenerator<DnbLoopData>(
    patLength,
    ({ scene }: PreFnParams) => {
      const specs = Object.values(scene.instruments[opts.index].specs)[0]
      const { variant } = specs
      const algo =
        subAlgos[
          (variant as string) ||
            sample(Object.keys(subAlgos).filter((x) => x !== 'follow'))
        ]
      if (!algo) {
        console.error('no algorithm for ' + variant)
      }
      const pattern = algo(patLength, scene.rootNoteOffset, store.pattern)
      return {
        pattern,
        inFill: false,
      }
    },
    (params: NoteGetterParams<DnbLoopData>) => {
      const { position, data } = params
      return data.pattern[position]
    },
    opts.noOff,
    opts.update
  )
}

export const dnbStab = (opts) =>
  createBasePitchedNoteGenerator({
    rootProb: 75,
    choices: Array.from({ length: 15 }).map((_, i) => i - 7),
    probs: [
      {
        probFn: (currentNote) => currentNote % eighth === 0 && randLt(4),
      },
    ],
    ...opts,
  })
