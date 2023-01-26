import all from '../instruments'
import { PresetSpec } from '../../types'
import { AEOLIAN, NOTE_LENGTH } from '../constants'
import { HC_STYLES } from '../generators/drums/retrowave-hc'
import {
  BASS_MOVEMENT_PRESETS,
  BASS_STYLES,
} from '../generators/bass/retrowave-bs'
import { LEAD_8TH_PRESETS } from '../generators/lead/retrowave-lead1'

const { BD, HC, CP, PR, BS, SN, LD1 } = all
const { bar, fourBars } = NOTE_LENGTH

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
  chords: { sample: CHORD_PRESETS },
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
    {
      type: HC,
      refs: {
        style: { sample: HC_STYLES },
      },
      generator: 'drums/retrowave-hc',
      randomizer: { gain: { min: 0.1, max: 0.15 } },
    },
    {
      type: BS,
      generator: ['bass/retrowave', { patLength: [fourBars] }],
      refs: {
        style: { sample: BASS_STYLES },
        movement: {
          sample: [...BASS_MOVEMENT_PRESETS, null, null, null, null],
        },
        movementSpeed: { sample: [bar, bar / 2] },
      },
      randomizer: {
        polyphony: 1,
        gain: 0.65,
        synth: {
          name: 'retrosynth',
          oscType0: { sample: ['sawtooth', 'square'] },
          oscOn0: true,
          oscOn1: false,
          lfoAmount0: 0.1,
          lfoAmount1: 0.1,
          filterFreq: 800,
          filterQ: 1,
          aEnvAttack: 0.005,
          aEnvRelease: {
            if: [
              {
                or: [
                  { eq: [{ ref: 'style' }, 'offbeat'] },
                  { eq: [{ ref: 'style' }, '8th'] },
                ],
              },
              { min: 0.3, max: 0.4 },
              { min: 0.09, max: 0.2 },
            ],
          },
          aEnvDecay: 0.2,
          aEnvSustain: 0.9,
          eqFrequency: 100,
          eqGain: 6,
          eqQ: 2,
        },
      },
    },
    {
      type: LD1,
      generator: ['lead1/retrowave', { patLength: [fourBars] }],
      refs: {
        style: { sample: ['default', '8th'] },
        addOctave: { sample: [0, 1] },
        oscType: {
          maybe: {
            41: 'sawtooth',
            40: 'square',
            rest: 'triangle',
          },
        },
        theme: {
          maybe: {
            70: {
              sample: LEAD_8TH_PRESETS,
              shuffle: true,
            },
            rest: { sample: AEOLIAN, amount: 4 },
          },
        },
      },
      randomizer: {
        polyphony: 1,
        gain: 0.5,
        pan: { min: -0.75, max: -0.01 },
        synth: {
          name: 'retrosynth',
          oscType0: { ref: 'oscType' },
          oscType1: { ref: 'oscType' },
          oscDetune0: { min: 1.0, max: 10.0 },
          oscDetune1: { min: -10.0, max: -1.0 },
          oscOn0: true,
          oscOn1: true,
          filterFreq: { min: 900, max: 1300 },
          filterQ: { min: 1.5, max: 5 },
          fEnvRelease: { if: [{ eq: [{ ref: 'style' }, '8th'] }, 1.4, 0.1] },
          aEnvAttack: 0.01,
          aEnvRelease: { if: [{ eq: [{ ref: 'style' }, '8th'] }, 0.4, 0.1] },
          aEnvDecay: { if: [{ eq: [{ ref: 'style' }, '8th'] }, 0.6, 0.1] },
          eqFrequency: 250,
          eqType: 'lowshelf',
          eqGain: -6,
        },
      },
    },
  ],
}

export default PRESET
