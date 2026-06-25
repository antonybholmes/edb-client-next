import { ISaveAsFileType } from '@/components/dialogs/save-as-dialog'
import { DNABase } from '@/lib/genomic/dna'
import { create } from 'zustand'

export const FASTA_FILE_TYPE: ISaveAsFileType = {
  name: 'FASTA',
  ext: 'fasta',
}

export const REV_MAP: { [K in DNABase]: DNABase } = {
  A: 'T',
  C: 'G',
  G: 'C',
  T: 'A',
  a: 't',
  c: 'g',
  g: 'c',
  t: 'a',
}

export interface ISeq {
  id: string
  seq: string
}

export interface IRevCompSeq extends ISeq {
  rev: string
}

export interface IRevCompOptions {
  outputSeqs: IRevCompSeq[]
  text: string
}

export const DEFAULT_OPTIONS: IRevCompOptions = {
  outputSeqs: [],
  text: '',
}

export interface IRevCompStore extends IRevCompOptions {
  updateSettings: (settings: IRevCompOptions) => void
}

export const useRevCompStore = create<IRevCompStore>()((set) => ({
  ...DEFAULT_OPTIONS,
  updateSettings: (settings: IRevCompOptions) => {
    set({ ...settings })
  },
}))

export function useRevComp(): {
  settings: IRevCompOptions
  updateSettings: (settings: IRevCompOptions) => void
  resetSettings: () => void
} {
  const settings = useRevCompStore((state) => state)
  const updateSettings = useRevCompStore((state) => state.updateSettings)
  const resetSettings = () => updateSettings({ ...DEFAULT_OPTIONS })

  return { settings, updateSettings, resetSettings }
}
