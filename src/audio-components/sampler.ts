import { getRateFromPitch } from '../core/math'
import loadBuffer from './loadBuffer'
import { ROOT_NOTE } from '../generator/constants'
import { Note } from '../types'

const create = (ctx, sampleSpec, inserts, polyphony) => {
  let bufferSource
  let buffer = null
  loadBuffer(ctx, sampleSpec).then((ret) => {
    buffer = ret
  })
  const output = ctx.createGain()
  const vca = ctx.createGain()
  if (!inserts || inserts.length === 0) {
    vca.connect(output)
  } else {
    vca.connect(inserts[0].input)
    for (let i = 0; i < inserts.length; ++i) {
      inserts[i].output.connect(
        i < inserts.length - 1 ? inserts[i + 1].input : output
      )
    }
  }

  const noteOn = (note: Note, atTime: number) => {
    const pitch = note.note
    const time = atTime || ctx.currentTime
    const offset = note.time || 0
    if (!buffer) {
      return
    }
    bufferSource = ctx.createBufferSource()
    bufferSource.buffer = buffer
    bufferSource.connect(vca)
    if (pitch !== 0) {
      const playbackRate = note.rate
        ? note.rate
        : getRateFromPitch(pitch - ROOT_NOTE)
      bufferSource.playbackRate.setValueAtTime(playbackRate, time)
    }
    bufferSource.start(time, offset)
    vca.gain.setValueAtTime(note.velocity || 1, time)
  }

  const noteOff = (note, atTime) => {
    const time = atTime || ctx.currentTime
    if (bufferSource) {
      bufferSource.stop(time)
    }
  }

  return {
    gain: output,
    output,

    noteOn,
    noteOff,
    polyphony,
  }
}

export default create
