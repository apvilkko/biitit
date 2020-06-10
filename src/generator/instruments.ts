export enum InstrumentKey {
  BD = 'BD',
  HC = 'HC',
  CP = 'CP',
  PR = 'PR',
  BS = 'BS',
  HO = 'HO',
  ST = 'ST',
  PD = 'PD',
  RD = 'RD',
  SN = 'SN',
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
}
