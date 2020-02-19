import worker from "./worker";
import { receiveNote } from "../ui/pattern";

const WORKER_TICK_LEN = 0.2;
const SAFETY_OFFSET = 0.01;

const scheduleNote = (context, when) => {
  const currentNote = context.sequencer.currentNote;
  const scene = context.scene;
  scene.types.forEach((key, i) => {
    const event = scene.generators[i].generator.next(currentNote).value;
    let hasChildren = Array.isArray(event);
    (hasChildren ? event : [event]).forEach(e => {
      if (e && (e.note || e.action)) {
        const parent = context.scene.instances[i];
        hasChildren =
          hasChildren &&
          parent.children &&
          e.instrument &&
          parent.children[e.instrument];
        const instance = hasChildren ? parent.children[e.instrument] : parent;
        if (instance) {
          if (e.action === "OFF") {
            if (instance.noteOff) {
              instance.noteOff(e, when);
              receiveNote({ instrument: key }, i, currentNote);
            }
          } else if (instance.noteOn) {
            if (instance.polyphony === 1) {
              instance.noteOff(e, when);
            }
            instance.noteOn(e, when);
            receiveNote(e, i, currentNote);
          }
        }
      } else {
        receiveNote({ instrument: key }, i, currentNote);
      }
    });
  });
};

const tick = context => {
  const ctx = context.mixer.ctx;
  const seq = context.sequencer;
  const currentTime = ctx.currentTime;
  const tempo = context.scene.tempo;
  const shufflePercentage = context.scene.shufflePercentage || 0;
  const noteLength = seq.noteLength;
  if (seq.playing) {
    let time = seq.lastTickTime;
    let shuffleDelta = 0;
    let nextNoteTime;

    const beatLen = 60.0 / tempo;
    const tickLen = noteLength * beatLen;

    for (let t = time; t < currentTime; t += tickLen) {
      const currentTick = Math.floor(t / tickLen);
      if (seq.lastTick !== currentTick) {
        const nextTick = currentTick + 1;
        nextNoteTime = nextTick * tickLen;
        if (context.sequencer.currentNote % 4 === 2) {
          shuffleDelta = (tickLen * 2 * (shufflePercentage / 100) * 2) / 3;
        } else {
          shuffleDelta = 0;
        }

        const delta = Math.max(
          nextNoteTime +
            shuffleDelta -
            (currentTime - WORKER_TICK_LEN) +
            SAFETY_OFFSET,
          0
        );
        scheduleNote(context, currentTime + delta);

        context.sequencer.currentNote++;
      }
      seq.lastTick = currentTick;
    }
  }
  seq.lastTickTime = currentTime;
};

export default context => {
  worker(context, tick);
};
