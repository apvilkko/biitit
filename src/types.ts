import { InstrumentKey } from './generator/instruments'

export type VCO = any

export type UndefinedGeneratorType = any

export type GeneratorName = string

export type GeneratorGenerator = Generator<any, any, any>

export type GeneratorOptions = {
  prob: number
}

export type GeneratorInterface = (
  genOpts: GeneratorOptions
) => (genName: GeneratorName, scene: Scene) => () => GeneratorGenerator

export interface GeneratorDefinition {
  generator: GeneratorInterface
  for: Array<InstrumentKey>
}

export interface GeneratorFactory extends GeneratorDefinition {
  name: GeneratorName
}

export interface InstantiatedGenerator {
  name: GeneratorName
  generator: GeneratorGenerator
}

export type SimpleSampleSpec = {
  amount: number
}

export type Indexed = { index: number }

export type SampleSpec = SimpleSampleSpec &
  Indexed & {
    name: string
    style: string
  }

export type DrumloopItemSpec = {
  name: string
  bars: number
  bpm: number
  hits: string
  gain?: number
}

export type Style = string
export type SampleKey = string

export type DrumloopSampleSpec = Array<DrumloopItemSpec>

export type CatalogItemType = {
  style: Style
  name: SampleKey
  spec?: DrumloopSampleSpec
} & Partial<SimpleSampleSpec>

export type DrumloopIndexedSampleSpec = DrumloopItemSpec &
  CatalogItemType & { hitmap: HitmapItem[] } & Indexed

export type DrumloopSceneSampleSpec = DrumloopIndexedSampleSpec

export type SceneSampleSpec = DrumloopSceneSampleSpec | SampleSpec

export interface InstanceSpec {
  pan: number
  pitch: number
  sample: SceneSampleSpec
  volume: number
  variant?: string
  refs?: Record<string, ScalarOrRandSpec>
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

export type MasterInsertSpec = {
  name: string
} & Record<string, unknown>

export interface Scene {
  tempo: number
  shufflePercentage?: number
  rootNoteOffset: number
  instances: Array<SceneInstance>
  types: Array<InstrumentKey>
  instruments: Array<InstrumentSpec>
  generators: Array<InstantiatedGenerator>
  masterInserts?: Array<MasterInsertSpec>
  chords?: number[]
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
  amount?: number
  shuffle?: boolean
}

export interface MaybeObjectShape extends Record<number, any> {
  rest: SampleRandomizerSpec | any
}

export interface MaybeSpec {
  maybe: [number, MaybeParameter, MaybeParameter] | MaybeObjectShape
}

export type SpecRef = { ref: string }
export type Equality = {
  eq: [SpecRef | ScalarOrRandSpec, SpecRef | ScalarOrRandSpec]
}
export type OrClause = { or: [Condition, Condition] }
export type Condition = Equality | OrClause

export type ConditionalSpec = {
  if: [Condition, ScalarOrRandSpec, ScalarOrRandSpec]
}

export type ScalarOrRandSpec = ValueRandomizerSpec | boolean | string | number

export type ValueRandomizerSpec =
  | RangedValueSpec
  | MaybeSpec
  | SampleRandomizerSpec
  | ConditionalSpec

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
  index?: number
}

export type GeneratorPresetOptions = number | GeneratorPresetObjOptions

export type GeneratorPresetRandomizerSpec = [
  GeneratorName,
  GeneratorPresetOptions
]

export type SynthParamsSpec = Record<string, ScalarOrRandSpec | SpecRef>

export type PresetRandomizerSpec = {
  gain: number | ValueRandomizerSpec
  polyphony?: number
  variant?: ValueRandomizerSpec
  synth?: SynthParamsSpec
  pan?: number | ValueRandomizerSpec
}

export interface PresetTrackSpec {
  type: InstrumentKey
  generator: GeneratorName | ValueRandomizerSpec | GeneratorPresetRandomizerSpec
  randomizer: PresetRandomizerSpec
  inserts?: Array<TrackEffectSpec>
  sends?: Array<TrackEffectSpec>
  refs?: Record<string, ScalarOrRandSpec>
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
  chords?: ValueRandomizerSpec
}

export interface Note {
  velocity: number
  instrument: InstrumentKey
  note: number
  time?: number
  rate?: number
  hit?: string
}

type CommonNote = Partial<Note>

export type GeneratorState = Record<string, any>

export interface Filler {
  ({
    currentNote,
    common,
    spec,
    state,
  }: {
    currentNote: number
    common: CommonNote
    spec: InstanceSpec
    state: GeneratorState
  }): [Note | undefined, GeneratorState?]
}

export type HitmapItem = {
  index: number
  hit: string
  time: number
}

export type Hitmap = HitmapItem[]

export type DrumGeneratorOptions = {
  index: number
  instrument: InstrumentKey
  fill: string | Filler
}

export type PatternGeneratorOptions<T> = {
  patLength?: number
  pre?: PreFn<T>
  index: number
  noteOffset?: number
  choices?: number[]
  noOff?: boolean
  update?: UpdateFn<T>
  probs?: Array<{
    probFn: (a0: number) => boolean
    prob?: number
    choices?: number[]
    min?: number
    max?: number
  }>
  rootProb?: number
}

export type NoteGetterParams<T> = {
  currentNote: number
  position?: number
  patLength?: number
  pattern?: Array<unknown>
  scene: Scene
  style: string
  data: T | undefined
  spec?: InstanceSpec
  common?: CommonNote
  state?: GeneratorState
}

export type NoteGetter<T> = (x: NoteGetterParams<T>) => Note

export type PreFnParams = {
  style?: string
  scene: Scene
}

export type PreFn<T> = (arg0: PreFnParams) => T

export type UpdateFn<T> = (data: T, currentNote: number) => void

export type SetParam = (
  param: string,
  value: number | string,
  atTime: number
) => void

export type ParamHandler =
  | ((value: number, time: number) => void)
  | ((value: string) => void)
  | ((value: number) => void)

export type NoteOn = (note: Note, time: number) => void
export type NoteOff = (note: Note | undefined, time: number) => void

export type Synth = {
  gain: GainNode
  vcos: VCO[]
  vcas: GainNode[]
  output: GainNode
  filter: AudioNode
  setParam: SetParam
  noteOn: NoteOn
  noteOff: NoteOff
  stop: () => void
  cleanup: () => void
}
