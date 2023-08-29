import { createDrumGenerator } from '../utils'
import { randLt, rand, sample } from '../../../utils'
import { NOTE_LENGTH } from '../../constants'
import { GeneratorInterface } from '../../../types'

const { sixteenth, bar, quarter } = NOTE_LENGTH

export const retrowaveSyncopated: GeneratorInterface = (opts) =>
  createDrumGenerator(
    opts,
    ({ currentNote, spec, common, data }) => {
      if (currentNote % sixteenth === 0) {
        const distance = Math.abs(
          (currentNote % data.cycleLen) - data.syncopatePosition
        )
        const sync = distance < data.syncLen
        if (currentNote % quarter === 0) {
          if (!sync) {
            return { ...common, velocity: spec.volume }
          }
        } else {
          if (
            sync &&
            currentNote % sixteenth === 0 &&
            randLt(opts.prob || 40)
          ) {
            return { ...common, velocity: spec.volume }
          }
        }
      }
      return undefined
    },
    () => {
      const cycleLen = sample([2, 4]) * bar
      const syncopatePosition = randLt(50) ? 0 : cycleLen / 2
      const syncLen = rand(3 * sixteenth, 6 * sixteenth)
      return { cycleLen, syncopatePosition, syncLen }
    }
  )
