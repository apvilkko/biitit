import {
  Condition,
  ConditionalSpec,
  Equality,
  MaybeSpec,
  OrClause,
  RangedValueSpec,
  SampleRandomizerSpec,
  ScalarOrRandSpec,
  SpecRef,
  ValueRandomizerSpec,
} from '../types'
import {
  isObject,
  maybe,
  rand,
  randFloat,
  sample,
  sampleN,
  shuffle,
} from '../utils'

const ifSpec = (spec: ConditionalSpec['if'], refs) => {
  const cond = randFromSpec(spec[0], refs)
  const v1 = randFromSpec(spec[1], refs)
  const v2 = randFromSpec(spec[2], refs)
  return cond ? v1 : v2
}

const orSpec = (spec: OrClause['or'], refs) => {
  return randFromSpec(spec[0], refs) || randFromSpec(spec[1], refs)
}

const eqSpec = (spec: Equality['eq'], refs) => {
  return randFromSpec(spec[0], refs) == randFromSpec(spec[1], refs)
}

export const randFromSpec = (
  spec: number | ValueRandomizerSpec | ScalarOrRandSpec | Condition | SpecRef,
  refs?: Record<string, number | string | boolean>
) => {
  if (typeof spec === 'undefined') {
    return spec
  }
  if (
    spec === 0 ||
    typeof spec === 'number' ||
    typeof spec == 'boolean' ||
    typeof spec == 'string'
  ) {
    return spec
  }
  if (!spec) {
    return undefined
  }
  if ((spec as ConditionalSpec).if) {
    return ifSpec((spec as ConditionalSpec).if, refs)
  }
  if ((spec as OrClause).or) {
    return orSpec((spec as OrClause).or, refs)
  }
  if ((spec as Equality).eq) {
    return eqSpec((spec as Equality).eq, refs)
  }
  if ((spec as SpecRef).ref) {
    return refs ? randFromSpec(refs[(spec as SpecRef).ref], refs) : undefined
  }
  const mSpec = spec as MaybeSpec
  if (mSpec.maybe) {
    return maybe(mSpec.maybe)
  }
  const ranged = spec as RangedValueSpec
  if (ranged.min && ranged.max) {
    if (Number.isInteger(ranged.min) && Number.isInteger(ranged.max)) {
      return rand(ranged.min, ranged.max)
    }
    return randFloat(ranged.min, ranged.max)
  }
  const sSpec = spec as SampleRandomizerSpec
  if (sSpec.sample) {
    let sampled
    if (typeof sSpec.amount == 'number') {
      sampled = sampleN(sSpec.amount)(sSpec.sample)
    } else {
      sampled = sample(sSpec.sample)
    }
    if (sSpec.shuffle) {
      return shuffle(sampled)
    }
    return sampled
  }
  if (isObject(spec)) {
    return Object.keys(spec).reduce((acc, curr) => {
      acc[curr] = randFromSpec(spec[curr], refs)
      return acc
    }, {})
  }
  return undefined
}
