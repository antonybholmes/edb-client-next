import { create } from 'zustand'

import { randomHexColor } from '@/lib/color/color'
import { findCol, type BaseDataFrame } from '@/lib/dataframe/base-dataframe'
import { makeUuid } from '@/lib/id'
import { useEffect } from 'react'

import { useFiles } from '../../matcalc/history/history-provider/history-contexts'
import { findSheet } from '../../matcalc/history/history-provider/history-hooks'
import { useHistory } from '../../matcalc/history/history-provider/history-provider'
import type { ClinicalDataTrack } from './clinical-utils'
import { useOncoplotSettings } from './oncoplot-settings-store'
import {
  makeOncoPlot,
  type IOncoColumns,
  type IOncoGene,
  type OncoplotFrame,
} from './oncoplot-utils'

export interface IPlotState {
  mutationFrame: OncoplotFrame | null
  mutationsInUse: string[]
  genes: IOncoGene[]
  clinicalTracks: ClinicalDataTrack[]
}

export interface IOncoplotStore extends IPlotState {
  setMutationFrame(mutationFrame: OncoplotFrame): void
  setVariantsInUse(mutationsInUse: string[]): void
  setGenes(genes: IOncoGene[]): void
  setGenesFromTable(df: BaseDataFrame): void
  setClinicalTracks(clinicalTracks: ClinicalDataTrack[]): void
}

export const useOncoplotStore = create<IOncoplotStore>((set) => ({
  mutationFrame: null,
  mutationsInUse: [],
  genes: [],
  clinicalTracks: [],
  trackOrder: [],

  setMutationFrame: (mutationFrame: OncoplotFrame) =>
    set((state) => ({
      ...state,
      mutationFrame,
    })),
  setVariantsInUse: (mutationsInUse: string[]) =>
    set((state) => ({
      ...state,
      mutationsInUse: [...mutationsInUse],
    })),
  setGenes: (genes: IOncoGene[]) =>
    set((state) => ({
      ...state,
      genes: [...genes],
    })),
  setGenesFromTable: (df: BaseDataFrame) =>
    set((state) => {
      const genes = [...new Set(df.col('Gene')?.strs)].sort()

      const genesInUse: IOncoGene[] = genes.map((g) => ({
        id: makeUuid(),
        name: g,
        color: randomHexColor(),
        show: true,
      }))

      return {
        ...state,
        genes: genesInUse,
      }
    }),
  setClinicalTracks: (clinicalTracks: ClinicalDataTrack[]) =>
    set((state) => ({
      ...state,
      clinicalTracks,
      trackOrder: clinicalTracks.map((track) => track.name),
    })),
}))

export function useOncoplot(): IOncoplotStore {
  const mutationFrame = useOncoplotStore((state) => state.mutationFrame)
  const mutationsInUse = useOncoplotStore((state) => state.mutationsInUse)
  const genes = useOncoplotStore((state) => state.genes)
  const clinicalTracks = useOncoplotStore((state) => state.clinicalTracks)

  const setMutationFrame = useOncoplotStore((state) => state.setMutationFrame)
  const setVariantsInUse = useOncoplotStore((state) => state.setVariantsInUse)

  const { mutations, displayProps, setMutations } = useOncoplotSettings()
  const { present } = useHistory()
  const { file } = useFiles()

  useEffect(() => {
    function oncoplot() {
      if (genes.length === 0 || mutations.length === 0) {
        return
      }

      // Assume first sheet is
      const sheet = findSheet(present, 'Variants', { file })

      if (!sheet) {
        return
      }

      const df = sheet as BaseDataFrame

      const colMap: IOncoColumns = {
        sample: findCol(df, 'Sample'),
        chr: findCol(df, 'Chromosome'),
        start: findCol(df, 'Start_Position'),
        end: findCol(df, 'End_position'),
        ref: findCol(df, 'Reference_Allele'),
        tum: findCol(df, 'Tumor_Seq_Allele2'),
        gene: findCol(df, 'Gene'),
        type: findCol(df, 'Type'),
      }

      // for people who don't use the correct names

      if (colMap.sample === -1) {
        colMap.sample = findCol(df, 'Tumor_Sample_Barcode')
      }

      if (colMap.type === -1) {
        colMap.type = findCol(df, 'Variant Classification')
      }

      const { oncoFrame, mutationsInUse, newMutations } = makeOncoPlot(
        df,
        mutations,
        colMap,
        displayProps.multi,
        displayProps.sort,
        displayProps.removeEmptySamples,
        genes,
        clinicalTracks
      )

      setMutationFrame(oncoFrame)
      setVariantsInUse(mutationsInUse)

      if (newMutations.length > 0) {
        setMutations([...mutations, ...newMutations])
      }
    }

    oncoplot()
  }, [
    file,
    mutations,
    genes,
    clinicalTracks,
    displayProps.multi,
    displayProps.sort,
    displayProps.removeEmptySamples,
    setMutationFrame,
    setVariantsInUse,
    setMutations,
  ])

  return {
    mutationFrame,
    mutationsInUse,
    genes,
    clinicalTracks,
    setMutationFrame,
    setVariantsInUse,
    setClinicalTracks: useOncoplotStore((state) => state.setClinicalTracks),
    setGenes: useOncoplotStore((state) => state.setGenes),
    setGenesFromTable: useOncoplotStore((state) => state.setGenesFromTable),
  }
}
