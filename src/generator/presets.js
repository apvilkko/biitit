import all from "./instruments";

const { BD, HC, CP, PR, BS, PD, ST } = all;

const PRESETS = {
  deephouse: {
    name: "deephouse",
    tempo: { min: 115, max: 125 },
    shuffle: { min: 0, max: 60 },
    types: [BD, CP, HC, PR, BS, PD, ST],
    noteChoices: {
      [BS]: [3, 5, -2, 5],
      [PD]: [-2, 2, -5, 5]
    },
    generators: {
      [BD]: ["drums/fourbyfour", 95],
      [CP]: ["drums/downbeats", 90],
      [HC]: ["drums/offbeats", 95],
      [PR]: ["drums/nonbeats", 90],
      [BS]: "drums/sparse",
      [PD]: "drums/sparse",
      [ST]: "drums/sparse"
    }
  }
};

const SCENE_PRESETS = Object.keys(PRESETS);

const normalizeGenSpec = spec => {
  if (Array.isArray(spec)) {
    return {
      name: spec[0],
      prob: spec[1]
    };
  } else if (typeof spec === "string") {
    return { name: spec };
  }
  return spec;
};

export { PRESETS as default, SCENE_PRESETS, normalizeGenSpec };
