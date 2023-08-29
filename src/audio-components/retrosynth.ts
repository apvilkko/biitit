import createVco from './vco'
import { noteToFreq } from '../core/math'
import { ads, r } from './envelope'
import { NoteOff, NoteOn, ParamHandler, SetParam, Synth, VCO } from '../types'

const create = (ctx: AudioContext): Synth => {
  const vcos = [createVco(ctx), createVco(ctx)]
  const vcas = [ctx.createGain(), ctx.createGain()]
  const maxGain = 0.5

  const output = ctx.createGain()
  output.gain.value = 0.6

  const eq = ctx.createBiquadFilter()
  eq.type = 'peaking'
  eq.Q.value = 1
  eq.frequency.value = 100
  eq.gain.value = 0
  eq.connect(output)

  let fFrequency = 100
  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.Q.value = 3
  filter.frequency.value = fFrequency
  filter.connect(eq)

  let fEnvAttack = 0.05
  let fEnvAmount = 1200
  let fEnvRelease = 0.1

  let aAttack = 0.003
  let aDecay = 0.02
  let aSustain = maxGain
  let aRelease = 0.05

  vcas.forEach((vca) => {
    vca.gain.value = 0
    vca.connect(filter)
  })

  for (let i = 0; i < vcos.length; ++i) {
    vcos[i].output.connect(vcas[i])
  }

  const noteOn: NoteOn = (note, atTime) => {
    const time = atTime || ctx.currentTime
    //console.log('noteOn', note, time, time + aAttack)
    vcos.forEach((vco) => {
      const freq = noteToFreq(note.note, vco.detune)
      vco.setFreq(freq, atTime)
    })
    vcas.forEach((vca) => {
      ads(vca.gain, time, 0, maxGain * note.velocity, aAttack, aDecay, aSustain)
    })
    ads(
      filter.frequency,
      time,
      fFrequency,
      fFrequency + fEnvAmount,
      fEnvAttack,
      fEnvRelease,
      fFrequency
    )
  }

  const noteOff: NoteOff = (_, atTime) => {
    const time = atTime || ctx.currentTime
    //console.log('noteOff', time, time + aRelease)
    vcas.forEach((vca) => {
      r(vca.gain, time, aRelease)
    })
  }

  const paramHandlers: Record<string, ParamHandler> = {
    filterFreq: (value, time) => {
      fFrequency = value
      filter.frequency.setValueAtTime(value, time)
    },
    filterQ: (value, time) => filter.Q.setValueAtTime(value, time),
    aEnvAttack: (value: number) => {
      aAttack = value
    },
    aEnvDecay: (value: number) => {
      aDecay = value
    },
    aEnvRelease: (value: number) => {
      aRelease = value
    },
    aEnvSustain: (value: number) => {
      aSustain = value
    },
    fEnvRelease: (value: number) => {
      fEnvRelease = value
    },
    eqFrequency: (value: number) => {
      eq.frequency.value = value
    },
    eqGain: (value: number) => {
      eq.gain.value = value
    },
    eqType: (value: string) => {
      eq.type = value as BiquadFilterType
    },
    eqQ: (value: number) => {
      eq.Q.value = value
    },
  }

  const stop = () => {
    vcos.forEach((vco) => vco.stop())
  }

  const cleanup = () => {
    stop()
    vcas.forEach((vca) => {
      vca.disconnect(filter)
    })
    filter.disconnect(eq)
    eq.disconnect(output)
  }

  const apply = (vcos: VCO[], index, fn, ...params) => {
    vcos[index][fn](...params)
  }

  const setParam: SetParam = (param, value, atTime) => {
    //console.log('setParam', param, value, atTime)
    const time = atTime || ctx.currentTime
    let match
    if (paramHandlers[param]) {
      paramHandlers[param](value, time)
    } else if ((match = param.match(/detune(\d)/))) {
      apply(vcos, match[1], 'setDetune', value)
    } else if ((match = param.match(/oscType(\d)/))) {
      apply(vcos, match[1], 'setOscType', value)
    } else if ((match = param.match(/lfoAmount(\d)/))) {
      apply(vcos, match[1], 'setLfoAmount', value)
    } else if ((match = param.match(/oscOn(\d)/))) {
      apply(vcos, match[1], value ? 'start' : 'stop')
    }
  }

  return {
    gain: output,
    vcos,
    vcas,
    output,
    filter,

    noteOn,
    noteOff,
    setParam,
    stop,
    cleanup,
  }
}

export default create
