import { state, setState } from "./state";

const inputs = {
  tempo: {
    callback: evt => {
      const value = evt.target.value;
      setState({ ...state, scene: { ...state.scene, tempo: value } });
    }
  }
};

const createCallback = id => {
  return evt => {
    // TODO change generator in scene
    console.log(id, evt.target.value);
  };
};

export { inputs as default, createCallback };
