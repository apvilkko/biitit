import instruments, { all } from "./instruments";
import {
  sample,
  rand,
  randFloat,
  randWeighted,
  sampleN,
  shuffle
} from "../utils";
import setParams from "../audio-components/setParams";
import sampler from "../audio-components/sampler";
import compressor from "../audio-components/compressor";
import reverb from "../audio-components/reverb";
import stereoDelay from "../audio-components/stereoDelay";
import catalog from "./catalog";

const ROOT_NOTE = 36;
const { BD, CP, HC, SM } = instruments;

const quarter = 8;
const bar = quarter * 4;
const fourBars = bar * 4;
const eighth = quarter / 2;
const sixteenth = eighth / 2;
const octave = 12;

const cleanupInstance = instance => {
  if (instance.cleanup) {
    instance.cleanup();
  }
  if (instance.vcos) {
    instance.vcos.forEach(vco => {
      vco.stop();
    });
  }
  if (instance.output) {
    instance.output.disconnect();
  }
  if (instance.children) {
    Object.values(instance.children).forEach(child => {
      child.panner.disconnect();
      child.output.disconnect();
    });
  }
  if (instance.instances) {
    instance.instances.forEach(cleanupInstance);
  }
};

const cleanup = context => {
  const scene = context.scene;
  if (!scene) {
    return;
  }
  all.forEach(instrument => {
    const instance = scene.instances[instrument];
    const track = context.mixer.tracks[instrument];
    const inserts = instance.mixerInserts;
    const sends = instance.mixerSends;
    for (let i = 0; i < inserts.length; ++i) {
      inserts[i].input.disconnect();
      inserts[i].output.disconnect();
      delete inserts[i];
    }
    for (let i = 0; i < sends.length; ++i) {
      sends[i].input.disconnect();
      sends[i].output.disconnect();
      delete sends[i];
    }
    cleanupInstance(instance);
    track.panner.disconnect(context.mixer.input);
    track.gain.disconnect(track.panner);
    delete scene.instances[instrument];
  });
};

const createInstrumentInstance = (context, instrument, specs) => {
  switch (instrument) {
    case BD:
    case CP:
    case HC:
    case SM: {
      const sampleName = `${instrument}${specs.specs[instrument].sample}`;
      const shouldComp = false;
      const shouldRev = false;
      const wetRev = false;
      const inserts = [];
      if (shouldRev) {
        inserts.push(
          reverb(context.mixer.ctx, {
            impulse: `impulse${specs.reverbImpulse}`,
            dry: 1,
            wet: wetRev ? randFloat(0.5, 0.7) : randFloat(0.3, 0.5)
          })
        );
      }
      if (shouldComp) {
        inserts.push(
          compressor(context.mixer.ctx, {
            threshold: -15,
            ratio: 6,
            attack: 0.004,
            release: 0.18
          })
        );
      }
      const synth = sampler(context.mixer.ctx, sampleName, inserts);
      return synth;
    }
    default:
      return {
        name: instrument
      };
  }
};

const getChoices = max => Array.from({ length: max }, (_, i) => i + 1);
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

const createDrumGenerator = (instrument, noteGetter) => (style, scene) =>
  function* drumGenerator() {
    let currentNote = 0;
    const spec = scene.instruments[instrument].specs[instrument];
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

const generators = {
  [BD]: createDrumGenerator(BD, ({ currentNote, spec, common }) => {
    if (currentNote % quarter === 0 && rand(1, 100) > 10) {
      return { ...common, velocity: spec.volume * randFloat(0.7, 1.0) };
    } else if (currentNote % sixteenth === 0 && rand(1, 100) > 95) {
      return { ...common, velocity: spec.volume * randFloat(0.5, 1.0) };
    }
    return null;
  }),
  [CP]: createDrumGenerator(CP, ({ currentNote, spec, common }) => {
    if (currentNote % (quarter * 2) === quarter && rand(1, 100) > 10) {
      return { ...common, velocity: spec.volume * randFloat(0.7, 1.0) };
    } else if (currentNote % sixteenth === 0 && rand(1, 100) > 95) {
      return { ...common, velocity: spec.volume * randFloat(0.5, 1.0) };
    }
    return null;
  }),
  [HC]: createDrumGenerator(HC, ({ currentNote, spec, common }) => {
    if (currentNote % eighth === 0 && rand(1, 100) > 33) {
      return { ...common, velocity: spec.volume * randFloat(0.7, 1.0) };
    } else if (currentNote % sixteenth === 0 && rand(1, 100) > 67) {
      return { ...common, velocity: spec.volume * randFloat(0.5, 1.0) };
    }
    return null;
  }),
  [SM]: (style, scene) => {
    let current;
    return createPatternGenerator(
      2 * bar,
      () => null,
      ({ currentNote, scene }) => {
        if (currentNote % sixteenth === 0 && rand(1, 100) > 60) {
          current = {
            note: scene.rootNoteOffset + rand(-6, 7),
            velocity: scene.instruments[SM].volume * randFloat(0.8, 1.0)
          };
          return current;
        } else if (currentNote % sixteenth === 0 && rand(1, 100) > 30) {
          return {
            action: "OFF"
          };
        }
        return null;
      },
      true
    )(style, scene);
  }
};

const drumStyles = {
  [BD]: ["4x4", "breakbeat", "mixed"]
};

const drumRandomizer = instrument => () => {
  const max = catalog.samples[instrument];
  const choices = getChoices(max);
  const specs = {
    [instrument]: {
      sample: sample(choices),
      volume: 0.6,
      pan: randFloat(-0.05, 0.05),
      pitch: randFloat(-3, 3),
      style: sample(drumStyles[instrument] || [])
    }
  };
  const reverbImpulse = sample(getChoices(catalog.samples.impulse));
  return {
    specs,
    reverbImpulse,
    perc: rand(1, 100) > 33,
    volume: 0.8
  };
};

const randomizers = {
  [BD]: drumRandomizer(BD),
  [CP]: drumRandomizer(CP),
  [HC]: drumRandomizer(HC),
  [SM]: drumRandomizer(SM)
};

const randomize = context => {
  cleanup(context);
  const scene = {
    tempo: rand(80, 165),
    instruments: {},
    generators: {},
    instances: {},
    rootNoteOffset: rand(-4, 4)
  };
  all.forEach(instrument => {
    scene.instruments[instrument] = randomizers[instrument]();
    const style = scene.instruments[instrument].style;
    scene.generators[instrument] = generators[instrument](style, scene)();
    scene.instances[instrument] = createInstrumentInstance(
      context,
      instrument,
      scene.instruments[instrument]
    );
    const track = context.mixer.tracks[instrument];
    const inserts = [];
    const sends = [];
    if (instrument === BD) {
      inserts.push(
        compressor(context.mixer.ctx, {
          threshold: -8,
          ratio: 4,
          attack: 0.01,
          release: 0.1
        })
      );
    }
    for (let i = 0; i < inserts.length; ++i) {
      inserts[i].output.connect(
        i < inserts.length - 1 ? inserts[i + 1].input : track.gain
      );
    }
    const instance = scene.instances[instrument];
    for (let i = 0; i < sends.length; ++i) {
      instance.output.connect(sends[i].input);
      sends[i].output.connect(track.gain);
    }
    const dest = inserts.length ? inserts[0].input : track.gain;
    if (instance.output) {
      instance.output.connect(dest);
    }
    if (scene.instruments[instrument].volume) {
      track.gain.gain.value = scene.instruments[instrument].volume;
    }
    instance.mixerInserts = inserts;
    instance.mixerSends = sends;
    const panner = context.mixer.ctx.createStereoPanner();
    panner.pan.value = scene.instruments[instrument].pan || 0;
    panner.connect(context.mixer.input);
    track.gain.connect(panner);
    track.panner = panner;
  });

  return scene;
};

export { randomize };
