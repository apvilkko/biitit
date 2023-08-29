import { Filler } from '../../../types'
import deephouseBd from './deephouse-bd'
import retrowaveBd from './retrowave-bd'
import retrowaveSn from './retrowave-sn'

const fills: Record<string, Filler> = {
  'deephouse-bd': deephouseBd,
  'retrowave-bd': retrowaveBd,
  'retrowave-sn': retrowaveSn,
}

export default fills
