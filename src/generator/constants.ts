export const ROOT_NOTE = 36

export const OCTAVE = 12

const quarter = 8
const bar = quarter * 4
const fourBars = bar * 4
const eighth = quarter / 2
const sixteenth = eighth / 2

export const NOTE_LENGTH = {
  quarter,
  bar,
  fourBars,
  eighth,
  sixteenth,
}

export const AEOLIAN = [0, 2, 3, 5, 7, 8, 10]
