import { findCol, type BaseDataFrame } from '@/lib/dataframe/base-dataframe'
import { range } from '@/lib/math/range'
import { create } from 'zustand'

import { makeUuid } from '@/lib/id'
import { aaSet, newAAStats, type ILollipopStats } from './lollipop-stats'
import {
  DEFAULT_DOMAIN,
  DEFAULT_LOLLIPOP,
  parseVariantClassification,
  type IAAVar,
  type IDomain,
  type ILollipop,
  type ILollipopColumns,
  type IProtein,
  type IProteinLabel,
} from './lollipop-utils'
import { parseVariant } from './variants'

export interface ILollipopStore extends ILollipop {
  set(
    aaStats: ILollipopStats[],
    datasets: string[],
    datasetsForUse: Record<string, boolean>
  ): void
  setDomain(domain: IDomain): void
  setDomains(domains: IDomain[]): void
  setLabels(labels: IProteinLabel[]): void
  setDatasets(datasets: string[]): void
  setDatasetsForUse(dbs: Record<string, boolean>): void
  setMutationsForUse(dbs: Record<string, boolean>): void
  lollipopFromTable(mutDf: BaseDataFrame, protein: IProtein): string[]
  featuresFromTable(df: BaseDataFrame): void
}

/**
 * Zustand store for managing the state of the lollipop plot, including
 * amino acid statistics, datasets, features, and labels. This is for
 * non-persistent state such as user loading a file. Lollipop settings store
 * is used for persistent settings.
 */
export const useLollipopStore = create<ILollipopStore>(set => ({
  ...DEFAULT_LOLLIPOP,
  set: (
    aaStats: ILollipopStats[],
    datasets: string[],
    datasetsForUse: Record<string, boolean>
  ) =>
    set(state => ({
      ...state,
      aaStats,
      datasets,
      datasetsForUse: { ...datasetsForUse },
    })),

  setDomain: (domain: IDomain) =>
    set(state => ({
      ...state,
      domains: state.domains.map(f => (f.id === domain.id ? domain : f)),
    })),

  setDomains: (domains: IDomain[]) =>
    set(state => ({
      ...state,
      domains,
    })),
  featuresFromTable: (df: BaseDataFrame) => {
    let nameCol = findCol(df, 'name')

    let startCol = findCol(df, 'start')
    let endCol = findCol(df, 'end')
    let colorCol = findCol(df, 'color')

    const domains: IDomain[] = []

    for (let row = 0; row < df.shape[0]; row++) {
      const name = df.get(row, nameCol).toString()
      const start = df.get(row, startCol) as number
      const end = df.get(row, endCol) as number

      const color =
        colorCol !== -1 ? df.get(row, colorCol).toString() : '#000000'

      let domain: IDomain = {
        ...DEFAULT_DOMAIN,
        id: makeUuid(),
      }

      domain.name = name
      domain.start = start
      domain.end = end

      domain.fill.value = color
      domains.push(domain)
    }

    // use setfeatures so that reactivity is triggered
    // and unspecified props are correctly set to defaults
    //get().setFeatures(features)
    set(state => ({
      ...state,
      domains,
    }))
  },
  setLabels: (labels: IProteinLabel[]) =>
    set(state => ({
      ...state,
      labels: [...labels],
    })),
  setDatasets: (datasets: string[]) =>
    set(state => ({
      ...state,
      datasets: [...datasets],
    })),
  setDatasetsForUse: (dbs: Record<string, boolean>) =>
    set(state => ({
      ...state,
      datasetsForUse: dbs,
    })),
  setMutationsForUse: (mutations: Record<string, boolean>) =>
    set(state => ({
      ...state,
      mutationsForUse: mutations,
    })),

  lollipopFromTable: (mutDf: BaseDataFrame): string[] => {
    const errors: string[] = []

    const datasets = new Set<string>()

    let geneCol = findCol(mutDf, 'Hugo_Symbol')

    let sampleCol = findCol(mutDf, 'Sample')

    if (sampleCol === -1) {
      sampleCol = findCol(mutDf, 'Tumor_Sample_Barcode') // try another name
    }

    let datasetCol = findCol(mutDf, 'Dataset')

    if (datasetCol === -1) {
      datasetCol = findCol(mutDf, 'Database') // try another name
    }

    console.log(mutDf.columns)

    if (datasetCol === -1) {
      throw new Error(
        'You must include a column named either "Dataset" or "Database" with no blank values in your table.'
      )
    }

    const colMap: ILollipopColumns = {
      gene: geneCol,
      sample: sampleCol,
      dataset: datasetCol,
      aa: findCol(mutDf, 'protein_change'),
      variant: findCol(mutDf, 'Variant_Classification'),
    }

    const aaChanges: IAAVar[] = []

    for (let row = 0; row < mutDf.shape[0]; row++) {
      const dataset = mutDf.get(row, colMap.dataset).toString()

      datasets.add(dataset)

      const sample = mutDf.get(row, colMap.sample).toString()

      const change = mutDf.get(row, colMap.aa).toString()

      const variantClass = parseVariantClassification(
        mutDf.get(row, colMap.variant).toString()
      )

      try {
        const variant = parseVariant(change)

        aaChanges.push({
          variant,
          variantClass,
          dataset,
          sample,
        })
      } catch (error) {
        console.warn(`Could not parse row: ${row}`, error)
      }
    }

    let length = Math.max(...aaChanges.map(ac => ac.variant.position))

    // if (protein) {
    //   length = protein.sequence.length
    // } else {
    //   // determine length from data
    //   length = Math.max(...aaChanges.map(ac => ac.position))
    // }

    const aaStats: ILollipopStats[] = range(length).map(i => newAAStats(i + 1))

    // basically a histogram of amino acid changes
    for (const aaChange of aaChanges) {
      aaSet(
        aaChange.variantClass,
        aaChange.dataset,
        aaChange.sample,
        aaChange.variant.raw,
        aaStats[aaChange.variant.position - 1]!
      )
    }

    //console.log('Parsed lollipop data:', aaStats)

    set(state => ({
      ...state,
      aaStats,
      datasets: [...datasets].sort(),
      datasetsForUse: Object.fromEntries([...datasets].map(db => [db, true])),
    }))

    //   const d: SeriesType[][] = df.rowMap((row: SeriesType[], index: number) => {
    //     const n = df.index.get(index) as SeriesType
    //     return [n, n].concat(row)
    //   })

    //   // const d = df.values.map((r, ri) => {
    //   //   const n = df.index.get(ri)

    //   //   return [n, n].concat(r as )
    //   // })

    //   return new DataFrame({
    //     name: "GCT",
    //     data: [l1, l2, l3].concat(d),
    //   })

    return errors
  },
}))

export function useLollipop(): ILollipopStore {
  //const protein = useLollipopStore(state => state.protein)
  const aaStats = useLollipopStore(state => state.aaStats)
  const datasets = useLollipopStore(state => state.datasets)
  const datasetsForUse = useLollipopStore(state => state.datasetsForUse)
  const mutationsForUse = useLollipopStore(state => state.mutationsForUse)

  const domains = useLollipopStore(state => state.domains)
  const labels = useLollipopStore(state => state.labels)

  return {
    aaStats,
    datasets,
    datasetsForUse,
    mutationsForUse,
    domains,
    labels,
    set: useLollipopStore(state => state.set),
    setDomain: useLollipopStore(state => state.setDomain),
    setDomains: useLollipopStore(state => state.setDomains),
    setLabels: useLollipopStore(state => state.setLabels),
    setDatasets: useLollipopStore(state => state.setDatasets),
    setDatasetsForUse: useLollipopStore(state => state.setDatasetsForUse),
    setMutationsForUse: useLollipopStore(state => state.setMutationsForUse),
    //setProtein: useLollipopStore(state => state.setProtein),
    lollipopFromTable: useLollipopStore(state => state.lollipopFromTable),
    featuresFromTable: useLollipopStore(state => state.featuresFromTable),
  }
}
