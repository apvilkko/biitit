import { rand, sample, randFloat } from '../../../utils'
import { isLastOf } from '../utils'
import { NOTE_LENGTH } from '../../constants'
import { Filler, Note } from '../../../types'

const { sixteenth, quarter, fourBars } = NOTE_LENGTH

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
    const fillLength = sample([quarter, 2 * quarter])
    if (isLastOf(fillLength, cycle)(currentNote)) {
      if (rand(1, 100) > 50) {
        isNextInFill = true
        newState = { ...newState, inFill: true, fillLength, cycle }
      }
    }
  }

  if (isNextInFill && currentNote % sixteenth === 0 && rand(1, 100) > 60) {
    out = { ...common, velocity: spec.volume * randFloat(0.5, 1.0) } as Note
  }

  return [out, newState]
}

export default filler
