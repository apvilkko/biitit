import { rand } from "../../../utils";
import { NOTE_LENGTH } from "../../constants";

const { sixteenth, quarter } = NOTE_LENGTH;

export default ({ currentNote, common, spec, state }) => {
  let out = null;
  if (currentNote % quarter === 0) {
    return [false, out];
  }
  if (
    currentNote % sixteenth === 0 &&
    state.last2Bar &&
    state.lastQuarter &&
    rand(1, 100) > 50
  ) {
    out = { ...common, velocity: spec.volume * rand(0.5, 1.0) };
    return [true, out];
  }
  return [false, out];
};
