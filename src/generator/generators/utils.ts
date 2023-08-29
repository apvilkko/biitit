import { ROOT_NOTE, NOTE_LENGTH } from '../constants'
import fills from './fills'
import { rand, sample, randFloat } from '../../utils'
import {
  DrumGeneratorOptions,
  Filler,
  GeneratorState,
  InstanceSpec,
  Note,
  NoteGetter,
  PatternGeneratorOptions,
  PreFn,
  Scene,
} from '../../types'

const { quarter, bar } = NOTE_LENGTH

const createArray = (length: number) => Array.from({ length }, () => undefined)

const isLastOf =
  (small: number, large: number) => (currentNote: number, exact?: boolean) => {
    const modulo = currentNote % large
    const delta = large - small
    return exact ? modulo === delta : modulo >= delta
  }

export const mod = (n: number, m: number) => ((n % m) + m) % m

const createPatternGenerator =
  <T extends { inFill: boolean }>(
    patLength: NonNullable<PatternGeneratorOptions<T>['patLength']>,
    pre: PatternGeneratorOptions<T>['pre'],
    noteGetter: NoteGetter<T>,
    noOff: PatternGeneratorOptions<T>['noOff'],
    update: PatternGeneratorOptions<T>['update']
  ) =>
  (style: string, scene: Scene) =>
    function* patternGenerator() {
      let currentNote = 0
      const pattern: Array<Note | undefined> = createArray(patLength)
      const data: T = pre ? pre({ style, scene }) || ({} as T) : ({} as T)
      while (true) {
        let note
        const position = currentNote % patLength
        if (update) {
          update(data, currentNote)
        }
        if (pattern[position] === undefined || data.inFill) {
          note =
            noteGetter({
              currentNote,
              position,
              patLength,
              pattern,
              scene,
              style,
              data,
            }) || (noOff ? {} : { action: 'OFF' })
          if (!data.inFill) {
            pattern[position] = note
          }
        } else {
          note = pattern[position]
        }
        currentNote = yield note
      }
    }

const isLastQuarter = isLastOf(quarter, bar)
const isLast2Bar = isLastOf(bar, 2 * bar)

const createDrumGenerator =
  <T extends Record<string, unknown>>(
    opts: DrumGeneratorOptions,
    noteGetter: NoteGetter<T>,
    pre?: PreFn<T>
  ) =>
  (style: string, scene: Scene) => {
    const data: T | undefined = pre ? pre({ scene }) : undefined
    return function* drumGenerator() {
      const { index, instrument, fill } = opts
      let currentNote = 0
      const spec: InstanceSpec = scene.instruments[index].specs[instrument]
      const common = { instrument, note: ROOT_NOTE + spec.pitch }
      currentNote = yield
      let state = {
        lastQuarter: false,
      } as GeneratorState
      const filler: Filler = typeof fill === 'string' ? fills[fill] : fill
      while (true) {
        state.lastQuarter = isLastQuarter(currentNote)
        state.last2Bar = isLast2Bar(currentNote)
        if (filler) {
          if (typeof filler === 'function') {
            let [ret, newState] = filler({
              currentNote,
              common,
              state,
              spec,
            })
            state = { ...newState }
            if (state.inFill) {
              currentNote = yield ret
            }
          }
        }
        currentNote = yield noteGetter({
          currentNote,
          spec,
          common,
          style,
          state,
          data,
          scene,
        })
      }
    }
  }

const createBasePitchedNoteGenerator = <T extends { inFill: boolean }>(
  opts: PatternGeneratorOptions<T>
) =>
  createPatternGenerator(
    opts.patLength || bar,
    opts.pre,
    (({ currentNote, scene }) => {
      const index = opts.index
      const instrument = scene.types[index]
      const spec = scene.instruments[index].specs[instrument]
      const root = ROOT_NOTE + scene.rootNoteOffset
      for (let i = 0; i < opts.probs!.length; ++i) {
        if (opts.probs![i].probFn(currentNote)) {
          let pitch =
            root +
            (opts.noteOffset || 0) +
            (rand(1, 100) < (opts.probs![i].prob || opts.rootProb || 50)
              ? 0
              : (sample(
                  (opts.probs![i].choices || opts.choices) as number[]
                ) as number))
          return {
            note: pitch,
            instrument,
            velocity:
              spec.volume *
              randFloat(opts.probs![i].min || 0.79, opts.probs![i].max || 1.0),
          }
        }
      }
      return undefined
    }) as NoteGetter<T>,
    opts.noOff,
    opts.update
  )

export {
  createPatternGenerator,
  createDrumGenerator,
  createBasePitchedNoteGenerator,
  isLastOf,
}
