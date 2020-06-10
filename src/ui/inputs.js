import { setState } from './state'
import {
  changeGenerator,
  changeSample,
  changeTempo,
  changePreset,
} from '../generator/scene'

const inputs = {
  tempo: {
    callback: (evt) => {
      const value = evt.target.value
      changeTempo(value, setState)
    },
  },
  preset: {
    callback: (evt) => {
      const value = evt.target.value
      changePreset(value, setState)
    },
  },
}

const createCallback = (id) => {
  return (evt) => {
    const index = parseInt(id.replace(/[^\d]/g, ''), 10)
    const value = evt.target.value
    if (id.indexOf('generator') > -1) {
      changeGenerator(index, value, setState)
    } else {
      changeSample(index, value, setState)
    }
  }
}

export { inputs as default, createCallback }
