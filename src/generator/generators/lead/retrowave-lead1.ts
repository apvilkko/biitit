import { rand, randWeighted, sample } from '../../../utils'
import {
  AEOLIAN,
  NOTE_LENGTH,
  OCTAVE,
  ROOT_NOTE,
  WEIGHTS,
} from '../../constants'
import instruments from '../../instruments'
import { createPatternGenerator, isLastOf } from '../utils'

const { bar, sixteenth, eighth } = NOTE_LENGTH
const { LD1 } = instruments

export const LEAD_8TH_PRESETS = [
  [0, 2, 3, 7],
  [0, 3, 5, 7],
  [0, 3, 7, 8],
  [-5, -2, 2, 3],
  [0, 7, 8, 12],
]

export const retrowaveLead1 = (opts) => {
  let pos = 0
  return createPatternGenerator(
    opts.patLength || bar * 2,
    opts.pre,
    ({ currentNote, scene }) => {
      const index = opts.index
      const instrument = scene.types[index]
      const spec = scene.instruments[index].specs[instrument]

      const style = spec.refs.style
      const theme = (spec.refs.theme as unknown as number[]).map(
        (x) => x + (spec.refs.addOctave as unknown as number) * OCTAVE
      )
      if (style === 'default') {
        if (currentNote % sixteenth === 0 && rand(1, 100) > 60) {
          return {
            note:
              ROOT_NOTE +
              rand(1, 2) * OCTAVE +
              scene.rootNoteOffset +
              randWeighted(AEOLIAN, WEIGHTS),
            velocity: spec.volume,
            instrument,
          }
        }
      } else if (style === '8th') {
        if (currentNote % eighth === 0) {
          const note =
            isLastOf(eighth, 8 * eighth)(currentNote, true) && rand(0, 100) > 60
              ? sample(AEOLIAN)
              : theme[pos % theme.length]
          pos++
          return {
            note: ROOT_NOTE + OCTAVE + scene.rootNoteOffset + note,
            velocity: spec.volume,
            instrument,
          }
        }
      }
      return null
    },
    opts.noOff,
    opts.update
  )
}
