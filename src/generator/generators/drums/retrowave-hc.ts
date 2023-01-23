import { createDrumGenerator } from '../utils'
import { randLt, randFloat, rand } from '../../../utils'
import { NOTE_LENGTH } from '../../constants'
import { GeneratorInterface, Scene } from '../../../types'
import instruments from '../../instruments'
const { sixteenth, eighth, quarter } = NOTE_LENGTH

const { HC } = instruments

/*
quarter,
    ({ scene }) => {
      const leaveOut = rand(0, 3);
      const choices = [0, 1, 2, 3].filter(x => x !== leaveOut);
      const spec = scene.instruments[DRUMS].specs[HC];
      const common = { instrument: HC, note: spec.pitch };
      return { choices, spec, common };
    },
    ({ currentNote, data: { spec, common, choices } }) => {
      const condition =
        spec.style === "8th"
          ? currentNote % eighth === 0
          : spec.style === "16th"
          ? currentNote % sixteenth === 0
          : spec.style === "three"
          ? choices
              .map(x => currentNote % quarter === x * sixteenth)
              .some(x => !!x)
          : false;
      if (condition) {
        return { ...common, velocity: spec.volume };
      }
      return null;
    }
*/

export const retrowaveHc: GeneratorInterface = (opts) =>
  createDrumGenerator(
    opts,
    ({ currentNote, spec, common, data: { choices } }) => {
      const condition =
        opts.style === '8th'
          ? currentNote % eighth === 0
          : opts.style === '16th'
          ? currentNote % sixteenth === 0
          : opts.style === 'three'
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
