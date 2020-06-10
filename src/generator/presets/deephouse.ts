import all from '../instruments'
import { NOTE_LENGTH } from '../constants'
import { PresetSpec } from '../../types'

const { BD, HC, CP, PR, BS, PD, ST, SN, RD, HO } = all
const { bar } = NOTE_LENGTH

const PRESET: PresetSpec = {
  name: 'deephouse',
  tempo: { min: 115, max: 125 },
  shufflePercentage: { min: 0, max: 60 },
  tracks: [
    {
      type: BD,
      generator: [
        'drums/fourbyfour',
        {
          prob: 5,
          extraMinVelocity: 0.08,
          extraMaxVelocity: 0.87,
          fill: 'deephouse-bd',
        },
      ],
      randomizer: { gain: 0.55 },
      inserts: [{ name: 'compressor' }],
    },
    {
      type: CP,
      generator: [
        'drums/deephouse-cl',
        {
          prob: 10,
          extraMinVelocity: 0.08,
          extraMaxVelocity: 0.71,
        },
      ],
      randomizer: { gain: 0.4 },
    },
    {
      type: HC,
      generator: ['drums/offbeats', 5],
      randomizer: { gain: 0.4 },
    },
    {
      type: PR,
      generator: ['drums/nonbeats', 10],
      randomizer: { gain: 0.45 },
    },
    {
      type: BS,
      generator: ['bass/deephouse', { noOff: true, patLength: [bar, 2 * bar] }],
      randomizer: { polyphony: 1, gain: 0.53 },
    },
    {
      type: PD,
      generator: [
        'pad/deephouse',
        { noOff: true, patLength: [2 * bar, 4 * bar] },
      ],
      sends: [{ name: 'reverb' }],
      randomizer: { gain: 0.28 },
    },
    {
      type: ST,
      generator: [
        'stab/deephouse',
        { noOff: true, patLength: [bar, 2 * bar, 4 * bar] },
      ],
      sends: [
        {
          name: 'delay',
          sync: true,
          lDelay: 0.77,
          rDelay: 0.98,
          feedback: 0.3,
          gain: 0.22,
        },
      ],
      randomizer: { gain: 0.5 },
    },
  ],
  noteChoices: {
    [BS]: [3, 5, -2, 5],
    [PD]: [-2, 2, -5, 5],
  },
}

export default PRESET
