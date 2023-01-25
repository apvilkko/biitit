import {
  createBasePitchedNoteGenerator,
  createPatternGenerator,
} from '../utils'
import { rand, randFloat, sample } from '../../../utils'
import { NOTE_LENGTH, ROOT_NOTE } from '../../constants'

const { sixteenth, bar } = NOTE_LENGTH

export const BASS_STYLES = [
  '16th', // single note 16ths
  '16thOct', // like 16th but octave is changed
  // 'arp', // like 16th but variation in notes
  'offbeat', // 8th on the offbeat only
  '8th', // single note 8ths
  // 'ifeellove', // note changes on 8th, 16ths
]

export const BASS_MOVEMENT_PRESETS = [
  [0, 0, 0, 2],
  [0, 0, -3, -1],
  [0, 0, 3, 2],
  [0, 0, 0, -1],
]

/*

const style = sample(styles);
    const isEighth = style === "offbeat" || style === "8th";
    const movement = rand(0, 100) > 50 ? sample(BASS_MOVEMENT_PRESETS) : null;
    const movementSpeed = style === "offbeat" ? bar : sample([bar, bar / 2]);
    return {
      style,
      movement,
      movementSpeed,
      volume: muted[BASS] ? 0.01 : 0.65,
      aEnvRelease: isEighth ? randFloat(0.3, 0.4) : randFloat(0.09, 0.2),
      oscType: sample(["sawtooth", "square"])
    };


 createPatternGenerator(
    fourBars,
    () => null,
    ({ currentNote, position, scene, style }) => {
      if (
        style === "16th" ||
        style === "8th" ||
        style === "16thOct" ||
        style === "offbeat"
      ) {
        const movement = scene.instruments[BASS].movement;
        const movementSpeed = scene.instruments[BASS].movementSpeed;
        const cycle =
          style === "8th" ? eighth : style === "offbeat" ? quarter : sixteenth;
        if (currentNote % cycle === (style === "offbeat" ? eighth : 0)) {
          const root = ROOT_NOTE + scene.rootNoteOffset;
          const currentChord =
            scene.chords[Math.floor(position / bar) % scene.chords.length];
          let pitch = root + currentChord;
          if (movement) {
            const currentChordIndex = AEOLIAN.findIndex(
              x => mod(currentChord, 12) === x
            );
            let indexDelta =
              movement[
                Math.floor(position / (movementSpeed / 4)) % movement.length
              ];
            if (currentChordIndex === 5 && indexDelta === 3) {
              // avoid sharp 4 on VI chord
              indexDelta = 4;
            }
            if (currentChordIndex === 6 && indexDelta === -1) {
              // avoid seventh flavor on VII chord
              indexDelta = -2;
            }
            if (currentChordIndex === 5 && indexDelta === 2) {
              // avoid third on VI chord
              indexDelta = 0;
            }
            if (currentChordIndex === 6 && indexDelta === 2) {
              // avoid third on VII chord
              indexDelta = 3;
            }
            const pitchOffset = currentChordIndex + indexDelta;
            const newChordTone = AEOLIAN[mod(pitchOffset, AEOLIAN.length)];
            pitch = root + newChordTone;
            // console.log(root, currentChord, currentChordIndex, indexDelta, pitchOffset, newChordTone, pitch);
          }
          if (pitch - ROOT_NOTE >= 8) {
            pitch -= 12;
          }
          if (style === "16thOct") {
            pitch += currentNote % eighth === 0 ? 0 : 12;
          }
          let velocity = scene.instruments[BASS].volume;
          if (style !== "8th" && currentNote % quarter === 0) {
            velocity *= 0.7;
          }
          return { note: pitch, velocity };
        }
      }
      return null;
    }
  ),


*/

export const retrowaveBass = (options) => {
  const opts = {
    rootProb: 50,
    choices: [3, 5, -2, -5],
    probs: [
      {
        probFn: (currentNote) =>
          currentNote % sixteenth === 0 && rand(1, 100) < 15,
      },
    ],
    ...options,
  }
  console.log(opts)
  return createPatternGenerator(
    opts.patLength || bar,
    opts.pre,
    ({ currentNote, position, patLength, pattern, scene, style, data }) => {
      const index = opts.index
      const instrument = scene.types[index]
      const spec = scene.instruments[index].specs[instrument]
      console.log(style, data, spec)
      const root = ROOT_NOTE + scene.rootNoteOffset
      for (let i = 0; i < opts.probs.length; ++i) {
        if (opts.probs[i].probFn(currentNote)) {
          let pitch =
            root +
            (opts.noteOffset || 0) +
            (rand(1, 100) < (opts.probs[i].prob || opts.rootProb || 50)
              ? 0
              : (sample(opts.probs[i].choices || opts.choices) as number))
          return {
            note: pitch,
            instrument,
            velocity:
              spec.volume *
              randFloat(opts.probs[i].min || 0.79, opts.probs[i].max || 1.0),
          }
        }
      }
      return null
    },
    opts.noOff,
    opts.update
  )
}
