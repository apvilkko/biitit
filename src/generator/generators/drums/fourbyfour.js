import { createDrumGenerator } from "../utils";
import { rand, randFloat } from "../../../utils";
import { NOTE_LENGTH } from "../../constants";

const { quarter, sixteenth } = NOTE_LENGTH;

export default opts =>
  createDrumGenerator(opts, ({ currentNote, spec, common }) => {
    if (currentNote % quarter === 0) {
      return { ...common, velocity: spec.volume };
    } else if (
      currentNote % sixteenth === 0 &&
      rand(1, 100) > (opts.prob || 97)
    ) {
      return { ...common, velocity: spec.volume * randFloat(0.5, 1.0) };
    }
    return null;
  });
