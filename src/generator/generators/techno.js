import { createDrumGenerator } from './utils'
import { randLt, randFloat } from '../../utils'
import { NOTE_LENGTH } from '../constants'

const { sixteenth, bar, eighth } = NOTE_LENGTH

const teBroken = (opts) =>
  createDrumGenerator(opts, ({ currentNote, spec, common }) => {
    if (currentNote % (bar / 2) === 0) {
      return {
        ...common,
        velocity: spec.volume,
      }
    } else if (
      currentNote % (bar / 2) === 3 * sixteenth ||
      currentNote % (bar / 2) === 3 * eighth
    ) {
      return {
        ...common,
        velocity: spec.volume * randFloat(0.87, 1.0),
      }
    } else if (currentNote % sixteenth === 0 && randLt(opts.prob || 5)) {
      return {
        ...common,
        velocity:
          spec.volume *
          randFloat(
            opts.extraMinVelocity || 0.08,
            opts.extraMaxVelocity || 0.71
          ),
      }
    }
    return undefined
  })

export { teBroken }
