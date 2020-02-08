import { all } from "../generator/instruments";
import worker from "./worker";
import { state } from "../ui/state";
import { receiveNote } from "../ui/pattern";

const WORKER_TICK_LEN = 0.2;
const SAFETY_OFFSET = 0.01;

const getNextNoteTime = (tempo, noteLength, time) => {
  const beatLen = 60.0 / tempo;
  const currentNote = Math.floor(time / (noteLength * beatLen));
  return (currentNote + 1) * (noteLength * beatLen);
};

const scheduleNote = (context, when) => {
  const currentNote = context.sequencer.currentNote;
  const scene = context.scene;
  all.forEach(i => {
    const event = scene.generators[i].generator.next(currentNote).value;
    let hasChildren = Array.isArray(event);
    // console.log(hasChildren, event, i);
    (hasChildren ? event : [event]).forEach(e => {
      if (e && (e.note || e.action)) {
        const parent = context.scene.instances[i];
        hasChildren =
          hasChildren &&
          parent.children &&
          e.instrument &&
          parent.children[e.instrument];
        const instance = hasChildren ? parent.children[e.instrument] : parent;
        // console.log(instance, parent.children, e.instrument);
        if (instance) {
          if (e.action === "OFF") {
            if (instance.noteOff) {
              instance.noteOff(e, when);
            }
          } else if (instance.noteOn) {
            instance.noteOn(e, when);
            receiveNote(e, currentNote);
          }
        }
      } else {
        receiveNote({ instrument: i }, currentNote);
      }
    });
  });
};

const tick = context => {
  const ctx = context.mixer.ctx;
  const seq = context.sequencer;
  const currentTime = ctx.currentTime;
  const tempo = state.scene.tempo;
  const noteLength = seq.noteLength;
  if (seq.playing) {
    let time = seq.lastTickTime;
    const nextNotes = [];
    let nextNoteTime;
    do {
      nextNoteTime = getNextNoteTime(tempo, noteLength, time);
      if (nextNoteTime < currentTime) {
        nextNotes.push(nextNoteTime);
      }
      time += nextNoteTime - time + 0.005;
    } while (nextNoteTime < currentTime);

    for (let i = 0; i < nextNotes.length; ++i) {
      const delta = Math.max(
        nextNotes[i] - (currentTime - WORKER_TICK_LEN) + SAFETY_OFFSET,
        0
      );
      scheduleNote(context, currentTime + delta);
      context.sequencer.currentNote++;
    }
  }
  seq.lastTickTime = currentTime;
};

export default context => {
  worker(context, tick);
};
