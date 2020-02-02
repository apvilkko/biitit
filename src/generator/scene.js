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
import { getRandomSample } from "./catalog";
import {
  createDrumGenerator,
  createPatternGenerator
} from "./generators/utils";
import { NOTE_LENGTH } from "./constants";
import { getRandomGenerator } from "./generators";

const { quarter, bar, sixteenth, eighth } = NOTE_LENGTH;

const { BD, CP, HC, PR, HO } = instruments;

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
    case PR:
    case HO: {
      const sampleSpec = specs.specs[instrument].sample;
      const shouldComp = false;
      const shouldRev = false;
      const wetRev = false;
      const inserts = [];
      if (shouldRev) {
        inserts.push(
          reverb(context.mixer.ctx, {
            impulse: specs.reverbImpulse,
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
      const synth = sampler(context.mixer.ctx, sampleSpec, inserts);
      return synth;
    }
    default:
      return {
        name: instrument
      };
  }
};

let generators = {};

const randomizeGenerators = () => {
  generators = {
    [BD]: getRandomGenerator(rand(1, 100) > 15 ? ["BD"] : null)(BD),
    [CP]: getRandomGenerator(rand(1, 100) > 15 ? ["CP"] : null)(CP),
    [HC]: getRandomGenerator(rand(1, 100) > 15 ? ["HC"] : null)(HC),
    [HO]: getRandomGenerator(rand(1, 100) > 15 ? ["HC"] : null)(HO),
    [PR]: getRandomGenerator(rand(1, 100) > 15 ? ["PR"] : null)(PR)
  };
};

const drumRandomizer = instrument => () => {
  const specs = {
    [instrument]: {
      sample: getRandomSample(instrument),
      volume: 0.6,
      pan: randFloat(-0.05, 0.05),
      pitch: randFloat(-3, 3)
      //style: sample(drumStyles[instrument] || [])
    }
  };
  const reverbImpulse = getRandomSample("impulse");
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
  [PR]: drumRandomizer(PR),
  [HO]: drumRandomizer(HO)
};

const randomize = context => {
  randomizeGenerators();
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
