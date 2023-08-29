import { createDrumGenerator } from '../utils'
import { randLt, randFloat, rand, sample } from '../../../utils'
import { NOTE_LENGTH } from '../../constants'
import { GeneratorInterface, Scene } from '../../../types'
import instruments from '../../instruments'
const { sixteenth, eighth, quarter } = NOTE_LENGTH

const { HC } = instruments

export const HC_STYLES = ['16th', '8th', 'three']

export const retrowaveHc: GeneratorInterface = (opts) => {
  const fallbackStyle = sample(HC_STYLES)

  return createDrumGenerator(
    opts,
    ({ currentNote, spec, common, data: { choices } }) => {
      const style = spec?.refs?.style ?? fallbackStyle
      const condition =
        style === '8th'
          ? currentNote % eighth === 0
          : style === '16th'
          ? currentNote % sixteenth === 0
          : style === 'three'
          ? choices
              .map((x) => currentNote % quarter === x * sixteenth)
              .some((x) => !!x)
          : false
      if (condition) {
        return { ...common, velocity: spec.volume }
      }
      return undefined
    },
    ({ scene }: { scene: Scene }) => {
      const leaveOut = rand(0, 3)
      const choices = [0, 1, 2, 3].filter((x) => x !== leaveOut)
      const index = scene.types.findIndex((x) => x == HC)
      const spec = scene.instruments[index].specs[HC]
      const common = { instrument: HC, note: spec.pitch }
      return { choices, spec, common }
    }
  )
}
