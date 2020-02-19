import { createPatternGenerator } from "../utils";
import { ROOT_NOTE, NOTE_LENGTH } from "../../constants";
import { rand, randFloat } from "../../../utils";

const { sixteenth, bar } = NOTE_LENGTH;

export default opts =>
  createPatternGenerator(
    opts.patLength || bar,
    opts.pre,
    ({ currentNote, position, patLength, pattern, scene, style, data }) => {
      const index = opts.index;
      const spec = scene.instruments[index];
      const instrument = scene.types[index];
      const root = ROOT_NOTE + scene.rootNoteOffset;
      if (currentNote % sixteenth === 0 && rand(1, 100) > 85) {
        let pitch = root;
        return {
          note: pitch,
          instrument,
          velocity: spec.volume * randFloat(0.5, 1.0)
        };
      }
      return null;
    },
    opts.noOff,
    opts.update
  );
