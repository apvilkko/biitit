import render from "./render";

const state = {};

const setState = newState => {
  if (!newState) {
    return;
  }
  Object.keys(newState).forEach(key => {
    state[key] = newState[key];
  });
  updateUi(state);
};

const updateUi = s => {
  render(s);
};

export { state, setState };
