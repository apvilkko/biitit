import { state, setState } from "./state";

const receiveNote = (event, counter) => {
  if (counter % 2 !== 0) {
    return;
  }
  const newState = {
    ...state,
    pattern: {
      ...state.pattern
    }
  };
  const inst = event.instrument;
  const len = 16;
  if (!newState.pattern[inst]) {
    newState.pattern[inst] = Array.from({ length: len }).map(() => null);
  }
  const index = (counter / 2) % len;
  newState.pattern[inst][index] = { ...event };
  setState(newState);
};

export { receiveNote };
