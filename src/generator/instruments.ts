export enum InstrumentKey {
  BD = 'BD', // Kick
  HC = 'HC', // Hi-hat closed
  CP = 'CP', // Clap
  PR = 'PR', // Percussion
  BS = 'BS', // Bass
  HO = 'HO', // Hi-hat open
  ST = 'ST', // Stab
  PD = 'PD', // Pad
  RD = 'RD', // Ride
  SN = 'SN', // Snare
  FX = 'FX', // Effect
  DL = 'DL', // Drum loop
  LD1 = 'LD1', // Lead 1
}

export const all = [
  InstrumentKey.BD,
  InstrumentKey.HC,
  InstrumentKey.CP,
  InstrumentKey.PR,
  InstrumentKey.HO,
  InstrumentKey.ST,
  InstrumentKey.BS,
  InstrumentKey.PD,
  InstrumentKey.RD,
  InstrumentKey.SN,
  InstrumentKey.DL,
  InstrumentKey.FX,
  InstrumentKey.LD1,
]

export default {
  BD: InstrumentKey.BD,
  HC: InstrumentKey.HC,
  CP: InstrumentKey.CP,
  PR: InstrumentKey.PR,
  HO: InstrumentKey.HO,
  ST: InstrumentKey.ST,
  BS: InstrumentKey.BS,
  PD: InstrumentKey.PD,
  RD: InstrumentKey.RD,
  SN: InstrumentKey.SN,
  FX: InstrumentKey.FX,
  DL: InstrumentKey.DL,
  LD1: InstrumentKey.LD1,
}
