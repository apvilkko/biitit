import all from '../instruments'
import { PresetSpec } from '../../types'
import { AEOLIAN, NOTE_LENGTH } from '../constants'
import { HC_STYLES } from '../generators/drums/retrowave-hc'
import {
  BASS_MOVEMENT_PRESETS,
  BASS_STYLES,
} from '../generators/bass/retrowave-bs'
import { LEAD_8TH_PRESETS } from '../generators/lead/retrowave-lead1'

const { BD, HC, CP, PR, BS, SN, LD1, LD2, PD } = all
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
      generator: ['lead1/retrowave', { patLength: [bar * 2] }],
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
        //gain: 0.01,
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
      sends: [
        {
          name: 'delay',
          sync: true,
          lDelay: 0.75,
          rDelay: 1.0,
          feedback: 0.7,
          gain: 0.3,
          filterFrequency: 4000,
          lDelayFine: { min: -0.02, max: 0.02 },
          rDelayFine: { min: -0.02, max: 0.02 },
        },
      ],
    },
    {
      type: LD2,
      generator: ['lead2/retrowave', { patLength: [bar * 2] }],
      refs: {
        oscType: {
          sample: ['sawtooth', 'square', 'triangle', 'sine'],
        },
      },
      randomizer: {
        polyphony: 1,
        gain: { min: 0.4, max: 0.5 },
        //gain: 0.01,
        pan: { min: 0.01, max: 0.75 },
        synth: {
          name: 'retrosynth',
          oscType0: { ref: 'oscType' },
          oscType1: { ref: 'oscType' },
          oscDetune0: { min: 1.0, max: 10.0 },
          oscDetune1: { min: -10.0, max: -1.0 },
          oscOn0: true,
          oscOn1: { sample: [true, false] },
          filterFreq: { min: 600, max: 1100 },
          filterQ: { min: 1.5, max: 2.5 },
          fEnvRelease: { min: 0.04, max: 0.09 },
          aEnvAttack: 0.01,
          aEnvRelease: { min: 0.05, max: 0.1 },
          aEnvDecay: { min: 0.05, max: 0.1 },
          eqFrequency: 300,
          eqType: 'lowshelf',
          eqGain: -6,
        },
      },
      sends: [
        {
          name: 'delay',
          sync: true,
          lDelay: 1.0,
          rDelay: 0.75,
          feedback: 0.7,
          gain: 0.3,
          filterFrequency: 4000,
          lDelayFine: { min: -0.02, max: 0.02 },
          rDelayFine: { min: -0.02, max: 0.02 },
        },
      ],
    },
    {
      type: PD,
      generator: ['pad/retrowave', { noOff: true, patLength: [fourBars] }],
      refs: {
        oscType: {
          sample: ['sawtooth', 'square', 'triangle'],
        },
      },
      randomizer: {
        polyphony: 3,
        gain: { min: 0.1, max: 0.2 },
        pan: { min: 0.01, max: 0.75 },
        synth: {
          name: 'polysynth',
          oscType0: { ref: 'oscType' },
          oscType1: { ref: 'oscType' },
          oscDetune0: { min: 5.0, max: 12.0 },
          oscDetune1: { min: -12.0, max: -5.0 },
          oscOn0: true,
          oscOn1: true,
          filterFreq: { min: 600, max: 3500 },
          filterQ: { min: 0.5, max: 5.0 },
          fEnvAttack: { min: 0.1, max: 0.6 },
          fEnvRelease: { min: 0.1, max: 1.0 },
          aEnvAttack: { min: 0.2, max: 0.5 },
          aEnvRelease: { min: 0.5, max: 1.0 },
          aEnvDecay: { min: 0.1, max: 0.2 },
          eqFrequency: 300,
          eqType: 'lowshelf',
          eqGain: -6,
        },
      },
      sends: [
        {
          name: 'delay',
          sync: true,
          lDelay: 1.0,
          rDelay: 0.75,
          feedback: 0.7,
          gain: 0.3,
          filterFrequency: 4000,
          lDelayFine: { min: -0.02, max: 0.02 },
          rDelayFine: { min: -0.02, max: 0.02 },
        },
      ],
    },
  ],
}

export default PRESET
