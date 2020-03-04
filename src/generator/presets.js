import all from "./instruments";
import { NOTE_LENGTH } from "./constants";
import { sample, maybe, isObject } from "../utils";

const { BD, HC, CP, PR, BS, PD, ST, SN, RD, HO } = all;
const { bar } = NOTE_LENGTH;

const technoStyles = {
  FOURBYFOUR: [
    "drums/fourbyfour",
    {
      prob: 5,
      extraMinVelocity: 0.08,
      extraMaxVelocity: 0.87
    }
  ],
  BROKEN: "drums/techno-broken",
  TWOANDFOUR: [
    "drums/downbeats",
    {
      prob: 10,
      extraMinVelocity: 0.08,
      extraMaxVelocity: 0.71
    }
  ],
  OFFBEATS: [
    "drums/offbeats",
    {
      prob: 5,
      extraMinVelocity: 0.08,
      extraMaxVelocity: 0.87
    }
  ],
  RANDBUSY: [
    "drums/busy",
    {
      prob: 5,
      extraMinVelocity: 0.71,
      extraMaxVelocity: 1
    }
  ],
  RANDSPARSE: [
    "drums/sparse",
    {
      prob: 20,
      extraMinVelocity: 0.71,
      extraMaxVelocity: 1
    }
  ],
  OCCASIONAL: [
    "drums/sparse",
    {
      prob: 5,
      extraMinVelocity: 0.5,
      extraMaxVelocity: 1
    }
  ]
};

// TODO ability to enable/disable tracks

const PRESETS = {
  techno: {
    name: "techno",
    tempo: { min: 118, max: 130 },
    shufflePercentage: { maybe: [50, 0, { min: 1, max: 30 }] },
    masterInserts: [
      { name: "waveshaper", amount: { min: 1, max: 5 }, dry: 0.7, wet: 0.4 }
    ],
    tracks: [
      {
        type: BD,
        generator: {
          maybe: [75, technoStyles.FOURBYFOUR, technoStyles.BROKEN]
        },
        randomizer: { gain: 0.8 },
        inserts: [{ name: "compressor" }]
      },
      {
        type: CP,
        generator: {
          maybe: {
            33: technoStyles.TWOANDFOUR,
            20: technoStyles.FOURBYFOUR,
            rest: { sample: Object.values(technoStyles) }
          }
        },
        randomizer: { gain: 0.7 }
      },
      {
        type: HO,
        generator: {
          maybe: {
            75: technoStyles.OFFBEATS,
            13: technoStyles.FOURBYFOUR,
            rest: { sample: Object.values(technoStyles) }
          }
        },
        randomizer: { gain: 0.7 }
      },
      {
        type: RD,
        generator: {
          maybe: {
            50: technoStyles.OFFBEATS,
            32: technoStyles.FOURBYFOUR,
            rest: { sample: Object.values(technoStyles) }
          }
        },
        randomizer: { gain: 0.4 }
      },
      {
        type: HC,
        generator: {
          maybe: [
            75,
            technoStyles.RANDBUSY,
            {
              sample: [
                technoStyles.BROKEN,
                technoStyles.TWOANDFOUR,
                technoStyles.RANDSPARSE,
                technoStyles.FOURBYFOUR,
                technoStyles.OFFBEATS
              ]
            }
          ]
        },
        randomizer: { gain: 0.7 }
      },
      {
        type: SN,
        generator: { sample: Object.values(technoStyles) },
        randomizer: { gain: 0.6 }
      },
      {
        type: ST,
        generator: {
          sample: [
            technoStyles.BROKEN,
            technoStyles.TWOANDFOUR,
            technoStyles.RANDSPARSE,
            technoStyles.RANDBUSY,
            technoStyles.OCCASIONAL
          ]
        },
        randomizer: { polyphony: 1, gain: 0.6 }
      },
      {
        type: BS,
        generator: { sample: Object.values(technoStyles) },
        randomizer: { polyphony: 1, gain: 0.6 }
      }
    ]
  },
  deephouse: {
    name: "deephouse",
    tempo: { min: 115, max: 125 },
    shufflePercentage: { min: 0, max: 60 },
    tracks: [
      {
        type: BD,
        generator: [
          "drums/fourbyfour",
          {
            prob: 5,
            extraMinVelocity: 0.08,
            extraMaxVelocity: 0.87,
            fill: "deephouse-bd"
          }
        ],
        randomizer: { gain: 0.55 },
        inserts: [{ name: "compressor" }]
      },
      {
        type: CP,
        generator: [
          "drums/deephouse-cl",
          {
            prob: 10,
            extraMinVelocity: 0.08,
            extraMaxVelocity: 0.71
          }
        ],
        randomizer: { gain: 0.4 }
      },
      {
        type: HC,
        generator: ["drums/offbeats", 5],
        randomizer: { gain: 0.4 }
      },
      {
        type: PR,
        generator: ["drums/nonbeats", 10],
        randomizer: { gain: 0.45 }
      },
      {
        type: BS,
        generator: [
          "bass/deephouse",
          { noOff: true, patLength: [bar, 2 * bar] }
        ],
        randomizer: { polyphony: 1, gain: 0.53 }
      },
      {
        type: PD,
        generator: [
          "pad/deephouse",
          { noOff: true, patLength: [2 * bar, 4 * bar] }
        ],
        sends: [{ name: "reverb" }],
        randomizer: { gain: 0.28 }
      },
      {
        type: ST,
        generator: [
          "stab/deephouse",
          { noOff: true, patLength: [bar, 2 * bar, 4 * bar] }
        ],
        sends: [
          {
            name: "delay",
            sync: true,
            lDelay: 0.77,
            rDelay: 0.98,
            feedback: 0.3,
            gain: 0.22
          }
        ],
        randomizer: { gain: 0.5 }
      }
    ],
    noteChoices: {
      [BS]: [3, 5, -2, 5],
      [PD]: [-2, 2, -5, 5]
    }
  }
};

const SCENE_PRESETS = Object.keys(PRESETS);

const normalizeProb = obj => {
  if (obj.sample) {
    return sample(obj.sample);
  }
  return obj;
};

const normalizeOptions = spec => {
  if (typeof spec === "number") {
    return { prob: spec };
  }
  if (spec.patLength && Array.isArray(spec.patLength)) {
    return { ...spec, patLength: sample(spec.patLength) };
  }
  return normalizeProb(spec);
};

const normalizeMaybeObj = obj => {
  if (!isObject(obj)) {
    return obj;
  }
  const out = {};
  Object.keys(obj).forEach(key => {
    out[key] = normalizeProb(obj[key]);
  });
  return out;
};

const normalizeGenSpec = spec => {
  if (!spec) {
    return spec;
  }
  if (Array.isArray(spec)) {
    return {
      name: spec[0],
      opts: normalizeOptions(spec[1])
    };
  } else if (typeof spec === "string") {
    return { name: spec };
  } else if (spec.maybe) {
    if (Array.isArray(spec.maybe)) {
      const norm = spec.maybe.map(normalizeMaybeObj);
      return normalizeGenSpec(maybe(...norm));
    } else {
      return normalizeGenSpec(maybe(normalizeMaybeObj(spec.maybe)));
    }
  }
  if (spec.sample) {
    return normalizeGenSpec(normalizeProb(spec));
  }
  return spec;
};

export { PRESETS as default, SCENE_PRESETS, normalizeGenSpec };
