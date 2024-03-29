import { createPatternGenerator, mod } from '../utils'
import { rand } from '../../../utils'
import { AEOLIAN, NOTE_LENGTH, ROOT_NOTE } from '../../constants'

const { sixteenth, bar, quarter, eighth, fourBars } = NOTE_LENGTH

export const BASS_STYLES = [
  '16th', // single note 16ths
  '16thOct', // like 16th but octave is changed
  // 'arp', // like 16th but variation in notes
  'offbeat', // 8th on the offbeat only
  '8th', // single note 8ths
  // 'ifeellove', // note changes on 8th, 16ths
]

export const BASS_MOVEMENT_PRESETS = [
  [0, 0, 0, 2],
  [0, 0, -3, -1],
  [0, 0, 3, 2],
  [0, 0, 0, -1],
]

export const retrowaveBass = (opts) => {
  return createPatternGenerator(
    opts.patLength || fourBars,
    opts.pre,
    ({ currentNote, position, patLength, pattern, scene, data }) => {
      const index = opts.index
      const instrument = scene.types[index]
      const spec = scene.instruments[index].specs[instrument]

      const movement = spec.refs.movement as unknown as number[]
      const style = spec.refs.style
      const movementSpeed: number =
        style === 'offbeat' ? bar : (spec.refs.movementSpeed as number)

      if (
        style === '16th' ||
        style === '8th' ||
        style === '16thOct' ||
        style === 'offbeat'
      ) {
        const cycle =
          style === '8th' ? eighth : style === 'offbeat' ? quarter : sixteenth
        if (currentNote % cycle === (style === 'offbeat' ? eighth : 0)) {
          const root = ROOT_NOTE + scene.rootNoteOffset
          const currentChord =
            scene.chords[Math.floor(position / bar) % scene.chords.length]
          let pitch = root + currentChord
          if (movement) {
            const currentChordIndex = AEOLIAN.findIndex(
              (x) => mod(currentChord, 12) === x
            )
            let indexDelta =
              movement[
                Math.floor(position / (movementSpeed / 4)) % movement.length
              ]
            if (currentChordIndex === 5 && indexDelta === 3) {
              // avoid sharp 4 on VI chord
              indexDelta = 4
            }
            if (currentChordIndex === 6 && indexDelta === -1) {
              // avoid seventh flavor on VII chord
              indexDelta = -2
            }
            if (currentChordIndex === 5 && indexDelta === 2) {
              // avoid third on VI chord
              indexDelta = 0
            }
            if (currentChordIndex === 6 && indexDelta === 2) {
              // avoid third on VII chord
              indexDelta = 3
            }
            const pitchOffset = currentChordIndex + indexDelta
            const newChordTone = AEOLIAN[mod(pitchOffset, AEOLIAN.length)]
            pitch = root + newChordTone
            // console.log(root, currentChord, currentChordIndex, indexDelta, pitchOffset, newChordTone, pitch);
          }
          if (pitch - ROOT_NOTE >= 8) {
            pitch -= 12
          }
          if (style === '16thOct') {
            pitch += currentNote % eighth === 0 ? 0 : 12
          }
          let velocity = spec.volume
          if (style !== '8th' && currentNote % quarter === 0) {
            velocity *= 0.7
          }
          return { note: pitch, velocity, instrument }
        }
      }
      return undefined
    },
    opts.noOff,
    opts.update
  )
}
