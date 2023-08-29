import { createDrumGenerator } from '../utils'
import { rand, randFloat } from '../../../utils'
import { NOTE_LENGTH } from '../../constants'

const { quarter, sixteenth } = NOTE_LENGTH

export default (opts) =>
  createDrumGenerator(opts, ({ currentNote, spec, common }) => {
    if (currentNote % (2 * quarter) === quarter) {
      return { ...common, velocity: spec.volume }
    } else if (
      currentNote % quarter !== 0 &&
      currentNote % sixteenth === 0 &&
      rand(1, 100) < (opts.prob || 3)
    ) {
      return {
        ...common,
        velocity:
          spec.volume *
          randFloat(opts.extraMinVelocity || 0.5, opts.extraMaxVelocity || 1.0),
      }
    }
    return undefined
  })
