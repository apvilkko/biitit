import { createDrumGenerator } from "../utils";
import { randLt, randFloat } from "../../../utils";
import { NOTE_LENGTH } from "../../constants";

const { sixteenth, bar } = NOTE_LENGTH;

export default opts =>
  createDrumGenerator(opts, ({ currentNote, spec, common }) => {
    if (currentNote % bar === 0) {
      return { ...common, velocity: spec.volume };
    } else if (currentNote % sixteenth === 0 && randLt(opts.prob || 10)) {
      return { ...common, velocity: spec.volume * randFloat(0.7, 1) };
    }
    return null;
  });
