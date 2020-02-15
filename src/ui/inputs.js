import { state, setState } from "./state";
import { changeGenerator, changeSample } from "../generator/scene";

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
    const index = parseInt(id.replace(/[^\d]/g, ""), 10);
    const value = evt.target.value;
    if (id.indexOf("generator") > -1) {
      changeGenerator(index, value, setState);
    } else {
      changeSample(index, value, setState);
    }
  };
};

export { inputs as default, createCallback };
