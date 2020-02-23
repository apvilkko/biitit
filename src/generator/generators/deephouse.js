import { createBasePitchedNoteGenerator } from "./utils";
import { NOTE_LENGTH } from "../constants";
import { rand } from "../../utils";

const { sixteenth } = NOTE_LENGTH;

const PAD_NOTES = [-2, 2, -5, 5];

const dhBass = opts =>
  createBasePitchedNoteGenerator({
    rootProb: 50,
    choices: [3, 5, -2, -5],
    probs: [
      {
        probFn: currentNote =>
          currentNote % sixteenth === 0 && rand(1, 100) < 15
      }
    ],
    ...opts
  });

const dhPad = opts =>
  createBasePitchedNoteGenerator({
    rootProb: 85,
    choices: PAD_NOTES,
    probs: [
      {
        probFn: currentNote => currentNote % sixteenth === 0 && rand(1, 100) < 7
      }
    ],
    ...opts
  });

const dhStab = opts =>
  createBasePitchedNoteGenerator({
    rootProb: 75,
    choices: PAD_NOTES,
    probs: [
      {
        probFn: currentNote =>
          currentNote % sixteenth === 0 && rand(1, 100) < 10
      }
    ],
    ...opts
  });

export { dhBass, dhPad, dhStab };
