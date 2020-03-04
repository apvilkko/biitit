import { createDrumGenerator } from "../utils";
import { randLt, randFloat } from "../../../utils";
import { NOTE_LENGTH } from "../../constants";

const { sixteenth } = NOTE_LENGTH;

export default opts =>
  createDrumGenerator(opts, ({ currentNote, spec, common }) => {
    if (currentNote % sixteenth === 0 && randLt(opts.prob || 15)) {
      return {
        ...common,
        velocity:
          spec.volume *
          randFloat(opts.extraMinVelocity || 0.5, opts.extraMaxVelocity || 1.0)
      };
    }
    return null;
  });
