import all from '../instruments'
import { PresetSpec } from '../../types'
import { NOTE_LENGTH } from '../constants'

const { DL, BS, ST, FX } = all
const { bar } = NOTE_LENGTH

const PRESET: PresetSpec = {
  name: 'dnb',
  tempo: { min: 160, max: 180 },
  shufflePercentage: 0,
  tracks: [
    {
      type: DL,
      generator: [
        'drumloop/dnb',
        { noOff: true, patLength: [2 * bar, 4 * bar], index: 0 },
      ],
      randomizer: {
        polyphony: 1,
        gain: 0.9,
        variant: { sample: ['246', 'ksc'] },
      },
    },
    /*{
      type: DL,
      generator: [
        'drumloop/dnb',
        { noOff: true, patLength: [2 * bar, 4 * bar] },
      ],
      randomizer: { polyphony: 1, gain: 0.7 },
    },*/
    {
      type: BS,
      generator: ['bass/dnb', { noOff: true, patLength: [2 * bar, 4 * bar] }],
      randomizer: {
        polyphony: 1,
        gain: 0.7,
        variant: { sample: [/*'rushStart', 'rushEnd',*/ 'follow'] },
      },
    },
    {
      type: ST,
      generator: ['stab/dnb', { noOff: true, patLength: [4 * bar, 8 * bar] }],
      sends: [
        {
          name: 'delay',
          sync: true,
          lDelay: 1.44,
          rDelay: 0.98,
          feedback: 0.7,
          gain: 0.55,
        },
      ],
      randomizer: { gain: 0.3 },
    },
    {
      type: FX,
      generator: ['fx/dnb', { noOff: true, patLength: [4 * bar, 8 * bar] }],
      sends: [
        {
          name: 'delay',
          sync: true,
          lDelay: 1.44,
          rDelay: 0.98,
          feedback: 0.7,
          gain: 0.55,
        },
      ],
      randomizer: { gain: 0.3 },
    },
  ],
}

export default PRESET
