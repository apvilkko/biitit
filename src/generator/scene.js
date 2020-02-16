import instruments from "./instruments";
import { rand, randFloat, isObject } from "../utils";
import sampler from "../audio-components/sampler";
import compressor from "../audio-components/compressor";
import reverb from "../audio-components/reverb";
import { getRandomSample } from "./catalog";
import allGenerators, { getRandomGenerator } from "./generators";
import PRESETS, { normalizeGenSpec } from "./presets";

const { BD, CP, HC, PR, HO, BS, PD, ST } = instruments;

let context;

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

const cleanup = (context, index) => {
  const scene = context.scene;
  if (!scene) {
    return;
  }
  scene.types.forEach((_, i) => {
    if (typeof index !== "undefined" && i !== index) {
      return;
    }
    const instance = scene.instances[i];
    const track = context.mixer.tracks[i];
    const inserts = instance.mixerInserts;
    const sends = instance.mixerSends;
    for (let j = 0; j < inserts.length; ++j) {
      inserts[j].input.disconnect();
      inserts[j].output.disconnect();
      delete inserts[j];
    }
    for (let j = 0; j < sends.length; ++j) {
      sends[j].input.disconnect();
      sends[j].output.disconnect();
      delete sends[j];
    }
    cleanupInstance(instance);
    track.panner.disconnect(context.mixer.input);
    track.gain.disconnect(track.panner);
    scene.instances[i] = null;
  });
};

const createInstrumentInstance = (context, instrument, specs) => {
  switch (instrument) {
    case BD:
    case CP:
    case HC:
    case PR:
    case HO:
    case PD:
    case BS:
    case ST: {
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
      console.error("no instance created for", instrument, specs);
      return {
        name: instrument
      };
  }
};

let generators = {};

const randomizeGenerators = preset => {
  if (preset) {
    generators = {};
    preset.types.forEach(key => {
      const genSpec = normalizeGenSpec(preset.generators[key]);
      generators[key] = allGenerators[genSpec.name];
    });
  } else {
    generators = {
      [BD]: getRandomGenerator(rand(1, 100) > 15 ? ["BD"] : null),
      [CP]: getRandomGenerator(rand(1, 100) > 15 ? ["CP"] : null),
      [HC]: getRandomGenerator(rand(1, 100) > 15 ? ["HC"] : null),
      [HO]: getRandomGenerator(rand(1, 100) > 15 ? ["HC"] : null),
      [PR]: getRandomGenerator(rand(1, 100) > 15 ? ["PR"] : null)
    };
  }
};

const drumRandomizer = (instrument, sampleGroup) => () => {
  const specs = {
    [instrument]: {
      sample: getRandomSample(instrument, sampleGroup),
      volume: 0.6,
      pan: randFloat(-0.05, 0.05),
      pitch: randFloat(-3, 3)
      //style: sample(drumStyles[instrument] || [])
    }
  };
  const reverbImpulse = getRandomSample("impulse", sampleGroup);
  return {
    specs,
    reverbImpulse,
    perc: rand(1, 100) > 33,
    volume: 0.8
  };
};

let randomizers = {};

const setupRandomizers = preset => {
  if (preset) {
    randomizers = {};
    preset.types.forEach(key => {
      randomizers[key] = drumRandomizer(key, preset.name);
    });
  } else {
    randomizers = {
      [BD]: drumRandomizer(BD),
      [CP]: drumRandomizer(CP),
      [HC]: drumRandomizer(HC),
      [PR]: drumRandomizer(PR),
      [HO]: drumRandomizer(HO)
    };
  }
};

const mapObject = obj => {
  if (Array.isArray(obj)) {
    return obj.map(mapObject);
  } else if (isObject(obj)) {
    const out = {};
    Object.keys(obj).forEach(key => {
      out[key] = mapObject(obj[key]);
    });
    return out;
  } else {
    if (typeof obj === "string" || typeof obj === "number") {
      return obj;
    }
  }
};

const syncToState = (scene, setState) => {
  const state = { scene: mapObject(scene) };
  setState(state);
};

const changeGenerator = (index, value, setState) => {
  const scene = context.scene;
  const key = scene.types[index];
  const gen = allGenerators[value];
  scene.generators[index] = {
    name: gen.name,
    generator: gen.generator({ index, instrument: key })(gen.name, scene)()
  };
  syncToState(scene, setState);
};

const PATTERN = /^(\w+)(\d+)\((\w+)\)$/;

const setupInstrumentInstance = (scene, index) => {
  const track = context.mixer.tracks[index];
  const inserts = [];
  const sends = [];
  if (scene.types[index] === BD) {
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
  const instance = scene.instances[index];
  for (let i = 0; i < sends.length; ++i) {
    instance.output.connect(sends[i].input);
    sends[i].output.connect(track.gain);
  }
  const dest = inserts.length ? inserts[0].input : track.gain;
  if (instance.output) {
    instance.output.connect(dest);
  }
  if (scene.instruments[index].volume) {
    track.gain.gain.value = scene.instruments[index].volume;
  }
  instance.mixerInserts = inserts;
  instance.mixerSends = sends;
  const panner = context.mixer.ctx.createStereoPanner();
  panner.pan.value = scene.instruments[index].pan || 0;
  panner.connect(context.mixer.input);
  track.gain.connect(panner);
  track.panner = panner;
};

const changeTempo = (value, setState) => {
  const scene = context.scene;
  scene.tempo = value;
  syncToState(scene, setState);
};

const changeSample = (index, value, setState) => {
  const match = value.match(PATTERN);
  const newSample = {
    name: match[1],
    index: Number(match[2]),
    style: match[3]
  };
  const scene = context.scene;
  const key = scene.types[index];

  cleanup(context, index);
  scene.instruments[index].specs[key].sample = {
    ...scene.instruments[index].specs[key].sample,
    ...newSample
  };
  scene.instances[index] = createInstrumentInstance(
    context,
    key,
    scene.instruments[index]
  );
  setupInstrumentInstance(scene, index);
  syncToState(scene, setState);
};

const changePreset = (value, setState) => {
  context.scene = randomize(setState, value);
};

const startingSet = [BD, CP, HC, HO, PR];

const randomize = (setState, presetName) => {
  cleanup(context);
  const preset = PRESETS[presetName] || null;
  randomizeGenerators(preset);
  setupRandomizers(preset);
  const scene = {
    tempo: rand(
      preset ? preset.tempo.min : 80,
      preset ? preset.tempo.max : 165
    ),
    types: [],
    instruments: [],
    generators: [],
    instances: [],
    rootNoteOffset: rand(-4, 4)
  };
  const instSet = preset ? preset.types : startingSet;
  instSet.forEach((instrument, i) => {
    scene.types.push(instrument);
    scene.instruments.push(randomizers[instrument]());
    const gen = generators[instrument];
    scene.generators.push({
      name: gen.name,
      generator: gen.generator({ index: i, instrument })(gen.name, scene)()
    });
    scene.instances.push(
      createInstrumentInstance(context, instrument, scene.instruments[i])
    );
    setupInstrumentInstance(scene, i, preset);
  });

  syncToState(scene, setState);
  return scene;
};

const initScene = ctx => {
  context = ctx;
};

export {
  initScene,
  randomize,
  changeGenerator,
  changeSample,
  changeTempo,
  changePreset
};
