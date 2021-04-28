import { MaybeObjectShape } from './types'

export const rand = (min, max) =>
  min + Math.floor(Math.random() * (max - min + 1))
export const randFloat = (min, max) => min + Math.random() * (max - min)

export const randWeighted = (choices, weights) => {
  let sum = 0
  const r = Math.random()
  for (let i = 0; i < choices.length; ++i) {
    sum += weights[i]
    if (r <= sum) return choices[i]
  }
}

export const sample = <T>(arr: Array<T>): T | undefined =>
  arr.length > 0 ? arr[rand(0, arr.length - 1)] : undefined

export const shuffle = <T>(arr: Array<T>): Array<T> =>
  arr
    .map((a): [number, T] => [Math.random(), a])
    .sort((a, b) => a[0] - b[0])
    .map((a) => a[1])

export const sampleN = (n) => (arr) => {
  const shuffled = shuffle(arr)
  return shuffled.slice(0, n)
}

export const isObject = (obj) =>
  Object.prototype.toString.call(obj) === '[object Object]'

export const randLt = (value) => Math.random() < value / 100.0

export const maybe = (prob?: number | MaybeObjectShape | {}, opt1?, opt2?) => {
  if (typeof prob === 'number') {
    return randLt(prob) ? opt1 : opt2
  }
  let sum = 0
  let chosen = null
  const sorted = Object.keys(prob).sort(
    (a: number | string, b: number | string) => {
      if (a === 'rest') {
        return 1
      } else if (b === 'rest') {
        return -1
      }
      return Number(a) - Number(b)
    }
  )
  sorted.forEach((key) => {
    sum += key === 'rest' ? 100 - sum : Number(key)
    if (!chosen && randLt(sum)) {
      chosen = prob[key]
    }
  })
  return chosen
}

export const takeRandom = <T>(num: number, arr: Array<T>): Array<T> =>
  shuffle(arr).slice(0, num)
