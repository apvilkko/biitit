import all from "./instruments";

const { BD, HC, CP, PR, BS, PD, ST } = all;

const PRESETS = {
  deephouse: {
    name: "deephouse",
    //tempo: { min: 115, max: 125 },
    tempo: { min: 120, max: 120 },
    shuffle: { min: 0, max: 60 },
    tracks: [
      { type: BD, generator: ["drums/fourbyfour", 95] },
      { type: CP, generator: ["drums/downbeats", 90] },
      // { type: HC, generator: ["drums/offbeats", 95] },
      { type: HC, generator: ["drums/busy", 5] },
      { type: PR, generator: ["drums/nonbeats", 90] },
      {
        type: BS,
        generator: ["bass/deephouse", { noOff: true }],
        randomizer: { polyphony: 1 }
      },
      { type: PD, generator: "drums/sparse" },
      { type: ST, generator: "drums/sparse" }
    ],
    noteChoices: {
      [BS]: [3, 5, -2, 5],
      [PD]: [-2, 2, -5, 5]
    }
  }
};

const SCENE_PRESETS = Object.keys(PRESETS);

const normalizeOptions = spec => {
  if (typeof spec === "number") {
    return { prob: spec };
  }
  return spec;
};

const normalizeGenSpec = spec => {
  if (Array.isArray(spec)) {
    return {
      name: spec[0],
      opts: normalizeOptions(spec[1])
    };
  } else if (typeof spec === "string") {
    return { name: spec };
  }
  return spec;
};

export { PRESETS as default, SCENE_PRESETS, normalizeGenSpec };
