import compressor from "../audio-components/compressor";

const NUM_TRACKS = 10;

const create = () => {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();

  const analyser = ctx.createAnalyser();
  analyser.connect(ctx.destination);

  const masterLimiter = compressor(ctx, { ratio: 20.0, knee: 0 });
  masterLimiter.output.connect(analyser);

  const masterGain = ctx.createGain();
  masterGain.connect(masterLimiter.input);
  masterGain.gain.value = 0.7;

  const masterInserts = {
    input: masterGain,
    output: masterLimiter.input,
    inserts: []
  };

  const tracks = [];
  for (let i = 0; i < NUM_TRACKS; ++i) {
    const gain = ctx.createGain();
    gain.gain.value = 0.7;
    tracks.push({
      gain
    });
  }

  return {
    ctx,
    masterGain,
    analyser,
    input: masterGain,
    tracks,
    masterInserts
  };
};

export default create;
