import { createDrumGenerator } from "../utils";
import { randLt, randFloat } from "../../../utils";
import { NOTE_LENGTH } from "../../constants";

const { eighth, sixteenth } = NOTE_LENGTH;

export default opts =>
  createDrumGenerator(opts, ({ currentNote, spec, common }) => {
    if (currentNote % eighth === 0) {
      return { ...common, velocity: spec.volume };
    } else if (currentNote % sixteenth === 0 && randLt(opts.prob || 5)) {
      return { ...common, velocity: spec.volume * randFloat(0.5, 1.0) };
    }
    return null;
  });
