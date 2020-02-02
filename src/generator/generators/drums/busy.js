import { createDrumGenerator } from "../utils";
import { rand, randFloat } from "../../../utils";
import { NOTE_LENGTH } from "../../constants";

const { sixteenth } = NOTE_LENGTH;

export default instrument =>
  createDrumGenerator(instrument, ({ currentNote, spec, common }) => {
    if (currentNote % sixteenth === 0 && rand(1, 100) > 50) {
      return { ...common, velocity: spec.volume * randFloat(0.5, 1.0) };
    }
    return null;
  });
