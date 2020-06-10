import { InstrumentKey } from './generator/instruments'

export type VCO = any

export type UndefinedGeneratorType = any

export type GeneratorName = string

export type GeneratorGenerator = Generator<any, any, any>

export interface GeneratorDefinition {
  generator: (
    genOpts
  ) => (genName: GeneratorName, scene: Scene) => () => GeneratorGenerator
  for: Array<InstrumentKey>
}

export interface GeneratorFactory extends GeneratorDefinition {
  name: GeneratorName
}

export interface InstantiatedGenerator {
  name: GeneratorName
  generator: GeneratorGenerator
}

export type Instrument = any

export interface SampleSpec {
  amount: number
  index: number
  name: string
  style: string
}

export interface InstanceSpec {
  pan: number
  pitch: number
  sample: SampleSpec
  volume: number
}

export interface InstrumentSpec {
  gain: number
  perc: boolean
  reverbImpulse: SampleSpec
  specs: Record<InstrumentKey, InstanceSpec>
}

export interface AudioComponent {
  input: AudioNode
  output: AudioNode
}

export interface Instance {
  generators: Array<UndefinedGeneratorType>
  vcos: Array<VCO>
  cleanup: () => void
}

export interface NullSceneInstance {
  name: string
}

export interface SceneInstance {
  mixerInserts?: Array<AudioComponent>
  mixerSends?: Array<AudioComponent>
  output: AudioNode
}

export interface MasterInsertSpec {
  name: string
}

export interface Scene {
  tempo: number
  shufflePercentage?: number
  rootNoteOffset: number
  instances: Array<SceneInstance>
  types: Array<InstrumentKey>
  instruments: Array<InstrumentSpec>
  generators: Array<InstantiatedGenerator>
  masterInserts?: Array<MasterInsertSpec>
}

export interface Context {
  scene?: Scene
  mixer?: any
  sequencer?: any
  actions?: any
}

export type PresetName = string

export interface RangedValueSpec {
  min: number
  max: number
}

export type MaybeParameter = any | RangedValueSpec

export interface SampleRandomizerSpec {
  sample: Array<any>
}

export interface MaybeObjectShape extends Record<number, any> {
  rest: SampleRandomizerSpec | any
}

export interface MaybeSpec {
  maybe: [number, MaybeParameter, MaybeParameter] | MaybeObjectShape
}

export type ValueRandomizerSpec =
  | RangedValueSpec
  | MaybeSpec
  | SampleRandomizerSpec

export interface TrackEffectSpec extends Record<string, any> {
  name: string
}

export interface GeneratorPresetObjOptions {
  fill?: string
  prob?: number
  extraMinVelocity?: number
  extraMaxVelocity?: number
  noOff?: boolean
  patLength?: Array<number>
}

export type GeneratorPresetOptions = number | GeneratorPresetObjOptions

export type GeneratorPresetRandomizerSpec = [
  GeneratorName,
  GeneratorPresetOptions
]

export interface PresetTrackSpec {
  type: InstrumentKey
  generator: ValueRandomizerSpec | GeneratorPresetRandomizerSpec
  randomizer: { gain: number | ValueRandomizerSpec; polyphony?: number }
  inserts?: Array<TrackEffectSpec>
  sends?: Array<TrackEffectSpec>
}

export type EffectName = string

export interface PresetMasterInsertSpec {
  name: EffectName
  amount: ValueRandomizerSpec
  dry: number
  wet: number
}

export interface PresetSpec {
  name: string
  tempo: ValueRandomizerSpec
  shufflePercentage?: number | ValueRandomizerSpec
  tracks: Array<PresetTrackSpec>
  masterInserts?: Array<PresetMasterInsertSpec>
  noteChoices?: Partial<Record<InstrumentKey, Array<number>>>
}

export interface Note {
  velocity: number
  instrument: InstrumentKey
  note: number
}

type CommonNote = Partial<Note>

export type GeneratorState = Record<string, any>

export interface Filler {
  ({
    currentNote: number,
    common: CommonNote,
    spec: InstanceSpec,
    state: GeneratorState,
  }): [Note, GeneratorState?]
}
