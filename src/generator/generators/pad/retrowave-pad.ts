import { randFloat, sample } from '../../../utils'
import { NOTE_LENGTH, OCTAVE, ROOT_NOTE } from '../../constants'
import { createPatternGenerator } from '../utils'

export const PAD_PRESETS = [
  [0, 2, 7],
  [0, 5, 7],
  [0, 3, 7],
  [2, 5, 10],
  [0, 5, 10],
  [2, 3, 10],
  [0, 7, 12],
  [-2, 2, 3],
]

const { fourBars, bar } = NOTE_LENGTH

export const retrowavePad = (opts) => {
  let current
  return createPatternGenerator(
    opts.patLength || fourBars,
    opts.pre,
    ({ currentNote, scene }) => {
      const index = opts.index
      const instrument = scene.types[index]
      const spec = scene.instruments[index].specs[instrument]

      if (currentNote % bar === 0) {
        current = sample(PAD_PRESETS)
        const notes = current.map((x) => ({
          note: ROOT_NOTE + 2 * OCTAVE + scene.rootNoteOffset + x,
          velocity: spec.volume * randFloat(0.8, 1.0),
          instrument,
        }))
        return notes
      } else if (currentNote % bar === bar / 2) {
        return current.map(() => ({
          action: 'OFF',
          instrument,
        }))
      }
      return null
    },
    opts.noOff,
    opts.update
  )
}
