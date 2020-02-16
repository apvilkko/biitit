import { createDrumGenerator } from "../utils";
import { rand, randFloat } from "../../../utils";
import { NOTE_LENGTH } from "../../constants";

const { eighth, sixteenth } = NOTE_LENGTH;

export default opts =>
  createDrumGenerator(opts, ({ currentNote, spec, common }) => {
    if (currentNote % eighth === 0) {
      return { ...common, velocity: spec.volume };
    } else if (currentNote % sixteenth === 0 && rand(1, 100) > 95) {
      return { ...common, velocity: spec.volume * randFloat(0.5, 1.0) };
    }
    return null;
  });
