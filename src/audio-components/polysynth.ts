import { Note, NoteOff, NoteOn, SetParam, Synth } from '../types'
import retrosynth from './retrosynth'
const POLYPHONY = 3

type TrackedNote = { index: number; atTime: number; note: Note }

const oldest = (a: TrackedNote | undefined, b: TrackedNote | undefined) => {
  if (!a || !b) {
    return 0
  }
  if (a.atTime < b.atTime) {
    return -1
  }
  if (a.atTime > b.atTime) {
    return -1
  }
  return 0
}

const create = (
  ctx: AudioContext
): Omit<Synth, 'filter' | 'gain' | 'vcos' | 'vcas'> & {
  instances: Synth[]
} => {
  const output = ctx.createGain()
  output.gain.value = 0.6

  const POOL_SIZE = POLYPHONY * 2
  const instances = Array.from({ length: POOL_SIZE }).map(() => retrosynth(ctx))
  instances.map((x) => x.output.connect(output))
  const tracker: Array<TrackedNote | undefined> = Array.from({
    length: POOL_SIZE,
  }).map(() => undefined)

  const getFreeIndex = () => {
    const found = tracker.findIndex((x) => !x)
    if (found !== -1) {
      return found
    }
    const sorted = [...tracker].sort(oldest)
    return sorted[0]!.index
  }

  const noteOn: NoteOn = (note, atTime) => {
    const index = getFreeIndex()
    instances[index].noteOn(note, atTime)
    const data = { index, atTime, note }
    tracker[index] = data
    return data
  }

  const noteOff: NoteOff = (note, atTime) => {
    let found
    if (!note || !note.note) {
      // Note off the oldest if not specified
      const sorted = [...tracker.filter((x) => !!x)].sort(oldest)
      if (sorted.length) {
        found = sorted[0]
      }
    } else {
      found = Object.values(tracker).find(
        (x) => x && note && x.note.note === note.note
      )
    }
    if (found) {
      instances[found.index].noteOff(undefined, atTime)
      tracker[found.index] = undefined
    }
  }

  const setParam: SetParam = (param, value, atTime) => {
    instances.map((x) => x.setParam(param, value, atTime))
  }

  const stop = () => {
    instances.forEach((x) => x.stop())
  }

  const cleanup = () => {
    instances.map((x) => {
      x.cleanup()
      x.output.disconnect(output)
    })
    stop()
    for (let i = 0; i < instances.length; ++i) {
      delete instances[i]
    }
  }

  return {
    output,
    instances,

    noteOn,
    noteOff,
    setParam,
    stop,
    cleanup,
  }
}

export default create
