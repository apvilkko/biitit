import { rand, randFloat } from '../../../utils'
import { NOTE_LENGTH, OCTAVE, ROOT_NOTE } from '../../constants'
import { createPatternGenerator } from '../utils'

const { bar, sixteenth } = NOTE_LENGTH

export const retrowaveLead2 = (opts) => {
  return createPatternGenerator(
    opts.patLength || bar * 2,
    opts.pre,
    ({ currentNote, scene }) => {
      const index = opts.index
      const instrument = scene.types[index]
      const spec = scene.instruments[index].specs[instrument]

      if (currentNote % sixteenth === 0 && rand(1, 100) > 50) {
        const offset = rand(1, 100) > 90 ? -2 : 0
        return {
          note: ROOT_NOTE + rand(1, 3) * OCTAVE + scene.rootNoteOffset + offset,
          velocity: spec.volume * randFloat(0.5, 1.0),
          instrument,
        }
      }
      return undefined
    },
    opts.noOff,
    opts.update
  )
}
