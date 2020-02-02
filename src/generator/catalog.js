import { sample, rand } from "../utils";

const ALIASES = {
  CL: "CP",
  BASS: "BS",
  STAB: "ST"
};

const BY_STYLE = {
  samples: {
    trance: {
      BD: { amount: 4 },
      BS: { amount: 4 },
      CL: { amount: 4 },
      CR: { amount: 1 },
      HC: { amount: 4 },
      HO: { amount: 4 },
      impulse: { amount: 1 },
      LP: { amount: 8 },
      MB: { amount: 4 },
      RD: { amount: 4 },
      SN: { amount: 1 }
    },
    techno: {
      BD: { amount: 5 },
      BS: { amount: 3 },
      CL: { amount: 3 },
      HC: { amount: 4 },
      HO: { amount: 6 },
      impulse: { amount: 1 },
      PR: { amount: 6 },
      RD: { amount: 3 },
      SN: { amount: 2 },
      ST: { amount: 6 }
    },
    retrowave: {
      BD: { amount: 4 },
      CP: { amount: 2 },
      CR: { amount: 1 },
      HC: { amount: 4 },
      HO: { amount: 2 },
      impulse: { amount: 3 },
      OR: { amount: 5 },
      PR: { amount: 6 },
      RD: { amount: 1 },
      SN: { amount: 4 },
      TM: { amount: 4 }
    },
    deephouse: {
      BASS: { amount: 5 },
      BD: { amount: 6 },
      CL: { amount: 6 },
      HC: { amount: 6 },
      PAD: { amount: 5 },
      PR: { amount: 6 },
      STAB: { amount: 5 }
    }
  }
};

const CATALOG = {};
Object.keys(BY_STYLE.samples).forEach(style => {
  Object.keys(BY_STYLE.samples[style]).forEach(k => {
    const key = ALIASES[k] || k;
    if (!CATALOG[key]) {
      CATALOG[key] = [];
    }
    CATALOG[key].push({
      style,
      name: k,
      ...BY_STYLE.samples[style][k]
    });
  });
});

const getRandomSample = key => {
  const styleSpec = sample(CATALOG[key]);
  const index = rand(1, styleSpec.amount);
  const ret = {
    ...styleSpec,
    index
  };
  return ret;
};

export { CATALOG as default, getRandomSample };
