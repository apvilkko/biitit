const createArray = length => Array.from({ length }, () => null);

const createPatternGenerator = (patLength, pre, noteGetter, noOff, update) => (
  style,
  scene
) =>
  function* patternGenerator() {
    let currentNote = 0;
    const pattern = createArray(patLength);
    const data = pre({ style, scene }) || {};
    while (true) {
      let note;
      const position = currentNote % patLength;
      if (update) {
        update(data, currentNote);
      }
      if (pattern[position] === null || data.inFill) {
        note =
          noteGetter({
            currentNote,
            position,
            patLength,
            pattern,
            scene,
            style,
            data
          }) || (noOff ? {} : { action: "OFF" });
        if (!data.inFill) {
          pattern[position] = note;
        }
      } else {
        note = pattern[position];
      }
      currentNote = yield note;
    }
  };

const createDrumGenerator = ({ index, instrument }, noteGetter) => (
  style,
  scene
) =>
  function* drumGenerator() {
    let currentNote = 0;
    const spec = scene.instruments[index].specs[instrument];
    const common = { instrument, note: spec.pitch };
    currentNote = yield;
    const state = {};
    while (true) {
      currentNote = yield noteGetter({
        currentNote,
        spec,
        common,
        style,
        state
      });
    }
  };

export { createPatternGenerator, createDrumGenerator };
