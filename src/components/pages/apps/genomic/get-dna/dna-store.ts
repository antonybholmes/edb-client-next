import { ISaveAsFileType } from '@/components/dialogs/save-as-dialog'
import { DNABase, IDNA } from '@/lib/genomic/dna'
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

export interface IDNAOptions {
  outputSeqs: IDNA[]
  text: string
}

export const DEFAULT_OPTIONS: IDNAOptions = {
  outputSeqs: [],
  text: '',
}

export interface IDNAStore extends IDNAOptions {
  updateSettings: (settings: IDNAOptions) => void
}

export const useDNAStore = create<IDNAStore>()((set) => ({
  ...DEFAULT_OPTIONS,
  updateSettings: (settings: IDNAOptions) => {
    set({ ...settings })
  },
}))

export function useDNA(): {
  settings: IDNAOptions
  updateSettings: (settings: IDNAOptions) => void
  resetSettings: () => void
} {
  const settings = useDNAStore((state) => state)
  const updateSettings = useDNAStore((state) => state.updateSettings)
  const resetSettings = () => updateSettings({ ...DEFAULT_OPTIONS })

  return { settings, updateSettings, resetSettings }
}
