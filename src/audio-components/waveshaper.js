const makeDistortionCurve = amount => {
  const k = amount;
  // const nSamples = 32768;
  const nSamples = 4096;
  const curve = new Float32Array(nSamples);
  // const deg = Math.PI / 180;
  let x;
  for (let i = 0; i < nSamples; ++i) {
    x = (i * 2) / nSamples - 1;
    curve[i] = Math.tanh(k * Math.sin(x));
  }
  return curve;
};

const create = (ctx, opts) => {
  const options = opts || {};
  const shaper = ctx.createWaveShaper();
  shaper.curve = makeDistortionCurve(options.amount || 1.6);
  shaper.oversample = "4x";
  const output = ctx.createGain();
  const input = ctx.createGain();
  const dry = ctx.createGain();
  dry.gain.value = options.dry || 0.0;
  const wet = ctx.createGain();
  wet.gain.value = options.wet || 0.9;
  input.connect(dry);
  input.connect(wet);
  wet.connect(shaper);
  shaper.connect(output);
  dry.connect(output);

  return {
    output,
    input
  };
};

export default create;
