import { state, setState } from './state'

const len = 16

const receiveNote = (event, i, counter) => {
  if (counter % 2 !== 0) {
    return
  }
  const newState = {
    ...state,
    pattern: {
      ...state.pattern,
    },
  }
  if (!newState.pattern[i]) {
    newState.pattern[i] = Array.from({ length: len }).map(() => undefined)
  }
  const index = (counter / 2) % len
  newState.pattern[i][index] = { ...event }
  setState(newState)
}

export { receiveNote }
