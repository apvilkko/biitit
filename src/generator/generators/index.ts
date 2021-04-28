import fourbyfour from './drums/fourbyfour'
import breakbeat from './drums/breakbeat'
import { sample } from '../../utils'
import downbeats from './drums/downbeats'
import eighths from './drums/eighths'
import offbeats from './drums/offbeats'
import busy from './drums/busy'
import sparse from './drums/sparse'
import nonbeats from './drums/nonbeats'
import { dhBass, dhPad, dhStab } from './deephouse'
import deephouseCl from './drums/deephouse-cl'
import retrowaveBreakbeat from './drums/retrowave-breakbeat'
import retrowaveSyncopated from './drums/retrowave-syncopated'
import { teBroken } from './techno'
import {
  GeneratorFactory,
  GeneratorName,
  GeneratorDefinition,
} from '../../types'
import instruments, { InstrumentKey } from '../instruments'
import { dnbDrumloop, dnbStab, dnbSub } from './dnb'

const { BD, CP, HC, PR, HO, BS, PD, ST, SN, DL, FX } = instruments

const generators: Record<GeneratorName, GeneratorDefinition> = {
  'drums/fourbyfour': { generator: fourbyfour, for: [BD, CP, HC] },
  'drums/breakbeat': { generator: breakbeat, for: [BD] },
  'drums/downbeats': { generator: downbeats, for: [SN, CP] },
  'drums/eighths': { generator: eighths, for: [HC, HO] },
  'drums/offbeats': { generator: offbeats, for: [HC, HO] },
  'drums/busy': { generator: busy, for: [HC] },
  'drums/sparse': { generator: sparse, for: [PR, HO] },
  'drums/nonbeats': { generator: nonbeats, for: [PR, HC, HO] },
  'bass/deephouse': { generator: dhBass, for: [BS] },
  'stab/deephouse': { generator: dhStab, for: [ST] },
  'pad/deephouse': { generator: dhPad, for: [PD] },
  'drums/deephouse-cl': { generator: deephouseCl, for: [CP] },
  'drums/retrowave-breakbeat': { generator: retrowaveBreakbeat, for: [BD] },
  'drums/retrowave-syncopated': { generator: retrowaveSyncopated, for: [BD] },
  'drums/techno-broken': { generator: teBroken, for: [BD, CP, SN] },
  'stab/dnb': { generator: dnbStab, for: [ST] },
  'drumloop/dnb': { generator: dnbDrumloop, for: [DL] },
  'bass/dnb': { generator: dnbSub, for: [BS] },
  'fx/dnb': { generator: dnbStab, for: [FX, ST] },
}

export const all = {}
Object.keys(generators).forEach((key) => {
  all[key] = {
    ...generators[key],
    name: key,
  }
})

export const getRandomGenerator = (
  suitableFor: Array<InstrumentKey>
): GeneratorFactory => {
  let choices = []
  if (suitableFor) {
    Object.keys(all).forEach((key) => {
      suitableFor.forEach((preferred) => {
        if (all[key].for && all[key].for.includes(preferred)) {
          choices.push(key)
        }
      })
    })
  }
  if (!choices || choices.length === 0) {
    choices = Object.keys(all)
  }
  return all[sample(choices)]
}
