import { ConditionalSpec } from '../types'
import { randFromSpec } from './randFromSpec'

describe('randFromSpec', () => {
  it('works for empty', () => {
    expect(randFromSpec(undefined)).toEqual(undefined)
  })

  it('works for scalars', () => {
    expect(randFromSpec(false)).toEqual(false)
    expect(randFromSpec('asdf')).toEqual('asdf')
    expect(randFromSpec(1234)).toEqual(1234)
  })

  it('works for conditional', () => {
    expect(randFromSpec({ if: [{ eq: [1, 1] }, 'yes', 'no'] })).toEqual('yes')
    expect(randFromSpec({ if: [{ eq: [1, 2] }, 'yes', 'no'] })).toEqual('no')
  })

  it('simple ref works', () => {
    expect(randFromSpec({ ref: 'asdf' }, { asdf: 1234 })).toBe(1234)
  })

  it('works with refs and or', () => {
    const spec: ConditionalSpec = {
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
    }
    expect(randFromSpec(spec, { style: 'offbeat' })).toBeGreaterThan(0.25)
    expect(randFromSpec(spec, { style: 'offbeat' })).toBeLessThan(0.41)
    expect(randFromSpec(spec, { style: '8th' })).toBeGreaterThan(0.25)
    expect(randFromSpec(spec, { style: '8th' })).toBeLessThan(0.41)
    expect(randFromSpec(spec, { style: 'other' })).toBeLessThan(0.21)
  })

  it('works with sample amount', () => {
    const res = randFromSpec({ sample: [1, 2, 3, 4, 5, 6, 7, 8], amount: 4 })
    expect(res.length).toBe(4)
  })

  it('samples with shuffle', () => {
    const res = randFromSpec({
      sample: [
        [8, 7, 6],
        [8, 5, 4],
        [8, 7, 6, 4],
      ],
      shuffle: true,
    })
    expect(res[0]).not.toBe(8)
  })
})
