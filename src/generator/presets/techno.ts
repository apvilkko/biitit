import all from '../instruments'
import { PresetSpec } from '../../types'

const { BD, HC, CP, PR, BS, PD, ST, SN, RD, HO } = all

const technoStyles = {
  FOURBYFOUR: [
    'drums/fourbyfour',
    {
      prob: 5,
      extraMinVelocity: 0.08,
      extraMaxVelocity: 0.87,
    },
  ],
  BROKEN: 'drums/techno-broken',
  TWOANDFOUR: [
    'drums/downbeats',
    {
      prob: 10,
      extraMinVelocity: 0.08,
      extraMaxVelocity: 0.71,
    },
  ],
  OFFBEATS: [
    'drums/offbeats',
    {
      prob: 5,
      extraMinVelocity: 0.08,
      extraMaxVelocity: 0.87,
    },
  ],
  RANDBUSY: [
    'drums/busy',
    {
      prob: 5,
      extraMinVelocity: 0.71,
      extraMaxVelocity: 1,
    },
  ],
  RANDSPARSE: [
    'drums/sparse',
    {
      prob: 20,
      extraMinVelocity: 0.71,
      extraMaxVelocity: 1,
    },
  ],
  OCCASIONAL: [
    'drums/sparse',
    {
      prob: 5,
      extraMinVelocity: 0.5,
      extraMaxVelocity: 1,
    },
  ],
}

const PRESET: PresetSpec = {
  name: 'techno',
  tempo: { min: 118, max: 130 },
  shufflePercentage: { maybe: [50, 0, { min: 1, max: 30 }] },
  masterInserts: [
    { name: 'waveshaper', amount: { min: 1, max: 5 }, dry: 0.7, wet: 0.4 },
  ],
  tracks: [
    {
      type: BD,
      generator: {
        maybe: [75, technoStyles.FOURBYFOUR, technoStyles.BROKEN],
      },
      randomizer: { gain: 0.8 },
      inserts: [{ name: 'compressor' }],
    },
    {
      type: CP,
      generator: {
        maybe: {
          33: technoStyles.TWOANDFOUR,
          20: technoStyles.FOURBYFOUR,
          rest: { sample: Object.values(technoStyles) },
        },
      },
      randomizer: { gain: 0.7 },
    },
    {
      type: HO,
      generator: {
        maybe: {
          75: technoStyles.OFFBEATS,
          13: technoStyles.FOURBYFOUR,
          rest: { sample: Object.values(technoStyles) },
        },
      },
      randomizer: { gain: 0.7 },
    },
    {
      type: RD,
      generator: {
        maybe: {
          50: technoStyles.OFFBEATS,
          32: technoStyles.FOURBYFOUR,
          rest: { sample: Object.values(technoStyles) },
        },
      },
      randomizer: { gain: 0.4 },
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
              technoStyles.OFFBEATS,
            ],
          },
        ],
      },
      randomizer: { gain: 0.7 },
    },
    {
      type: SN,
      generator: { sample: Object.values(technoStyles) },
      randomizer: { gain: 0.6 },
    },
    {
      type: ST,
      generator: {
        sample: [
          technoStyles.BROKEN,
          technoStyles.TWOANDFOUR,
          technoStyles.RANDSPARSE,
          technoStyles.RANDBUSY,
          technoStyles.OCCASIONAL,
        ],
      },
      randomizer: { polyphony: 1, gain: 0.6 },
    },
    {
      type: BS,
      generator: { sample: Object.values(technoStyles) },
      randomizer: { polyphony: 1, gain: 0.6 },
    },
  ],
}
export default PRESET
