import { createDrumGenerator } from '../utils'
import { randLt, randFloat } from '../../../utils'
import { NOTE_LENGTH } from '../../constants'
import { GeneratorInterface } from '../../../types'

const { sixteenth, bar, quarter } = NOTE_LENGTH

export const retrowaveBreakbeat: GeneratorInterface = (opts) =>
  createDrumGenerator(opts, ({ currentNote, spec, common }) => {
    if (currentNote % sixteenth === 0) {
      if (currentNote % (2 * bar) === 0) {
        return { ...common, velocity: spec.volume }
      } else if (
        currentNote % (2 * quarter) !== quarter &&
        randLt(opts.prob || 20)
      ) {
        return {
          ...common,
          velocity: spec.volume * randFloat(0.5, 0.99),
        }
      }
    }
    return null
  })
