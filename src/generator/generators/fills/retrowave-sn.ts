import { rand, sample, randFloat } from '../../../utils'
import { isLastOf } from '../utils'
import { NOTE_LENGTH } from '../../constants'
import { Filler, Note } from '../../../types'
import { randLt } from '../../../utils'

const { sixteenth, quarter, fourBars, bar, eighth } = NOTE_LENGTH

const filler: Filler = ({ currentNote, common, spec, state }) => {
  let out: Note = null

  let newState = { ...state }

  let isNextInFill = false
  if (state.inFill) {
    isNextInFill = true
    if (!isLastOf(state.fillLength, state.cycle)(currentNote)) {
      isNextInFill = false
      newState = { ...newState, inFill: false }
    }
  } else {
    const cycle = sample([fourBars, 2 * fourBars, 4 * fourBars])
    const fillLength = sample([quarter, 2 * quarter, bar, eighth])
    if (isLastOf(fillLength, cycle)(currentNote)) {
      if (randLt(50)) {
        isNextInFill = true
        newState = { ...newState, inFill: true, fillLength, cycle }
      }
    }
  }

  if (isNextInFill) {
    const prob =
      state.fillLength === quarter || state.fillLength === eighth
        ? 25
        : state.fillLength === 2 * quarter
        ? 50
        : 80
    if (currentNote % sixteenth === 0 && rand(1, 100) > prob) {
      out = { ...common, velocity: spec.volume * randFloat(0.3, 0.95) }
    } else if (currentNote % (2 * quarter) === quarter && randLt(85)) {
      out = { ...common, velocity: spec.volume * randFloat(0.9, 1.0) }
    }
  }

  return [out, newState]
}

export default filler
