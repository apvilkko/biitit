import { createDrumGenerator } from '../utils'
import { randLt, randFloat, rand, sample } from '../../../utils'
import { NOTE_LENGTH } from '../../constants'
import { GeneratorInterface, Scene } from '../../../types'
import instruments from '../../instruments'
const { sixteenth, eighth, quarter } = NOTE_LENGTH

const { HC } = instruments

export const retrowaveHc: GeneratorInterface = (opts) => {
  const hhStyle = opts.style ?? sample(['8th', '16th', 'three'])

  return createDrumGenerator(
    opts,
    ({ currentNote, spec, common, data: { choices } }) => {
      const condition =
        hhStyle === '8th'
          ? currentNote % eighth === 0
          : hhStyle === '16th'
          ? currentNote % sixteenth === 0
          : hhStyle === 'three'
          ? choices
              .map((x) => currentNote % quarter === x * sixteenth)
              .some((x) => !!x)
          : false
      if (condition) {
        return { ...common, velocity: spec.volume }
      }
      return null
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
