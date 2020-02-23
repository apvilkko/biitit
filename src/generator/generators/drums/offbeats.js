import { createDrumGenerator } from "../utils";
import { rand, randFloat } from "../../../utils";
import { NOTE_LENGTH } from "../../constants";

const { quarter, sixteenth, eighth } = NOTE_LENGTH;

export default opts =>
  createDrumGenerator(opts, ({ currentNote, spec, common }) => {
    if (currentNote % quarter === eighth) {
      return { ...common, velocity: spec.volume };
    } else if (
      currentNote % sixteenth === 0 &&
      rand(1, 100) < (opts.prob || 3)
    ) {
      return { ...common, velocity: spec.volume * randFloat(0.5, 1.0) };
    }
    return null;
  });
