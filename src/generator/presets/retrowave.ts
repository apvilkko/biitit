import all from '../instruments'
import { PresetSpec } from '../../types'

const { BD, HC, CP, PR, BS, PD, ST, SN, RD, HO } = all

const CHORD_PRESETS = [
  [0, 0, -2, -4],
  [-4, -2, 0, 0],
  [0, 0, 5, 7],
  [0, 0, -4, 7],
  [-4, 5, 0, -2],
  [0, 0, -4, 5],
]

const COMPRESSOR = {
  name: 'compressor',
  threshold: -15,
  ratio: 6,
  attack: 0.004,
  release: 0.18,
}
const REVERB1 = { name: 'reverb', wet: { min: 0.3, max: 0.5 } }
const REVERB2 = { name: 'reverb', wet: { min: 0.5, max: 0.7 } }

const PRESET: PresetSpec = {
  /**
   * compressor: SN TM CP, threshold -15, ratio: 6, attack: 0.004, release: 0.18
   * reverb (wet 0.3-0.5): SN TM PR CP ORCH, extra wet (0.5-0.7): CP PR ORCH
   *
   */
  name: 'retrowave',
  tempo: { min: 100, max: 125 },
  shufflePercentage: 0,
  tracks: [
    {
      type: BD,
      generator: {
        maybe: {
          32: [
            'drums/fourbyfour',
            {
              prob: 1,
              fill: 'retrowave-bd',
            },
          ],
          33: [
            'drums/retrowave-breakbeat',
            {
              prob: 20,
              fill: 'retrowave-bd',
            },
          ],
          rest: [
            'drums/retrowave-syncopated',
            {
              prob: 40,
              fill: 'retrowave-bd',
            },
          ],
        },
      },
      randomizer: { gain: { min: 0.95, max: 1.05 } },
    },
    {
      type: SN,
      generator: [
        'drums/downbeats',
        {
          prob: 1,
          fill: 'retrowave-sn',
        },
      ],
      randomizer: { gain: { min: 0.95, max: 1.05 } },
      inserts: [COMPRESSOR],
      sends: [REVERB1],
    },
    {
      type: PR,
      generator: [
        'drums/sparse',
        {
          prob: 5,
        },
      ],
      randomizer: { gain: { min: 0.5, max: 0.7 } },
      sends: [REVERB2],
    },
    {
      type: CP,
      generator: [
        'drums/sparse',
        {
          prob: 5,
        },
      ],
      randomizer: { gain: { min: 0.6, max: 0.9 } },
      inserts: [COMPRESSOR],
      sends: [REVERB2],
    },
  ],
}

export default PRESET
