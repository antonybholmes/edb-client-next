import type { IChildrenProps } from '@/interfaces/children-props'
import { BaseDataFrame, findCol } from '@/lib/dataframe/base-dataframe'
import { range } from '@/lib/math/range'
import { createContext, useEffect, useState } from 'react'
import {
  DEFAULT_LOLLIPOP,
  parseVariant,
  SUB_REGEX,
  SUB_SPLICE_REGEX,
  SUB_V2_REGEX,
  type IAAVar,
  type ILollipop,
  type ILollipopColumns,
  type IProtein,
  type IProteinFeature,
  type IProteinLabel,
} from './lollipop-utils'

import { APP_ID } from '@/consts'
import { aaSet, newAAStats, type ILollipopStats } from './lollipop-stats'

export interface ILollipopStore extends ILollipop {
  set(
    protein: IProtein,
    aaStats: ILollipopStats[],
    databases: string[],
    databasesForUse: Record<string, boolean>
  ): void
  setProtein(protein: IProtein): void
  setFeature(feature: IProteinFeature): void
  setFeatures(features: IProteinFeature[]): void
  setLabels(labels: IProteinLabel[]): void
  setDatabases(databases: string[]): void
  setDatabasesForUse(dbs: Record<string, boolean>): void
  setMutationsForUse(dbs: Record<string, boolean>): void
  lollipopFromTable(mutDf: BaseDataFrame, protein: IProtein): string[]
}

export const LollipopContext = createContext<ILollipopStore | undefined>(
  undefined
)

interface IProps extends IChildrenProps {
  id: string
}

export function LollipopProvider({ id, children }: IProps) {
  const key = `${APP_ID}:lollipop:${id}` // unique key for localStorage
  const [lollipop, setLollipop] = useState<ILollipop>(
    sessionStorage.getItem(key)
      ? JSON.parse(sessionStorage.getItem(key)!)
      : { ...DEFAULT_LOLLIPOP }
  )

  // Write to localStorage whenever lollipop changes
  useEffect(() => {
    sessionStorage.setItem(key, JSON.stringify(lollipop))
  }, [lollipop])

  function set(
    protein: IProtein,
    aaStats: ILollipopStats[],
    databases: string[],
    databasesForUse: Record<string, boolean>
  ) {
    setLollipop({
      ...lollipop,
      protein,
      aaStats,
      databases,
      databasesForUse: { ...databasesForUse },
    })
  }

  function setProtein(protein: IProtein) {
    setLollipop({
      ...lollipop,
      protein: { ...protein },
    })
  }

  function setFeature(feature: IProteinFeature) {
    setLollipop({
      ...lollipop,
      features: lollipop.features.map(f => (f.id === feature.id ? feature : f)),
    })
  }

  function setFeatures(features: IProteinFeature[]) {
    setLollipop({
      ...lollipop,
      features: [...features],
    })
  }

  function setLabels(labels: IProteinLabel[]) {
    setLollipop({
      ...lollipop,
      labels: [...labels],
    })
  }
  function setDatabases(databases: string[]) {
    setLollipop({
      ...lollipop,
      databases: [...databases],
    })
  }
  function setDatabasesForUse(dbs: Record<string, boolean>) {
    setLollipop({
      ...lollipop,
      databasesForUse: dbs,
    })
  }
  function setMutationsForUse(mutations: Record<string, boolean>) {
    setLollipop({
      ...lollipop,
      mutationsForUse: mutations,
    })
  }

  function lollipopFromTable(
    mutDf: BaseDataFrame,
    protein: IProtein
  ): string[] {
    const errors: string[] = []

    try {
      const databases = new Set<string>()

      let geneCol = findCol(mutDf, 'Hugo_Symbol')

      if (geneCol === -1) {
        geneCol = findCol(mutDf, 'Gene') // try another name
      }

      let sampleCol = findCol(mutDf, 'Sample')

      if (sampleCol === -1) {
        sampleCol = findCol(mutDf, 'Tumor_Sample_Barcode') // try another name
      }

      const colMap: ILollipopColumns = {
        gene: geneCol,
        sample: sampleCol,
        database: findCol(mutDf, 'Database'),
        aa: findCol(mutDf, 'protein_change'),
        variant: findCol(mutDf, 'Variant_Classification'),
      }

      const aaChanges: IAAVar[] = []

      for (let row = 0; row < mutDf.shape[0]; row++) {
        const gene = mutDf.get(row, colMap.gene).toString()

        if (gene !== protein.gene) {
          // skip rows that do not match the protein gene
          continue
        }

        const database = mutDf.get(row, colMap.database).toString()

        databases.add(database)

        const sample = mutDf.get(row, colMap.sample).toString()

        const change = mutDf.get(row, colMap.aa).toString()

        const variant = parseVariant(mutDf.get(row, colMap.variant).toString())

        const aa = change.replace('p.', '')

        let matchArray = [...aa.matchAll(SUB_REGEX)]

        let from: string = ''
        let to: string = ''
        let position: number = 0

        //console.log('aa', aa)

        if (matchArray.length > 0) {
          //console.log('matchArray', matchArray)
          from = matchArray[0]![1]!
          position = Number(matchArray[0]![2]!)
          to = matchArray[0]![3]!
        } else {
          // try v2

          matchArray = [...aa.matchAll(SUB_V2_REGEX)]

          if (matchArray.length > 0) {
            position = Number(matchArray[0]![1]!)
            from = matchArray[0]![2]!
            to = matchArray[0]![3]!
          } else {
            // see if it is a splice variant X142_splice etc
            matchArray = [...aa.matchAll(SUB_SPLICE_REGEX)]

            if (matchArray.length > 0) {
              position = Number(matchArray[0]![1]!)
              from = 'X' //matchArray[0]![2]!
              to = 'X' //matchArray[0]![3]!
            } else {
              // could not parse amino acid change
              console.warn(
                `Could not parse amino acid change: ${mutDf.get(row, colMap.aa)}`
              )

              if (aa === '') {
                errors.push(`Empty amino acid was ignored`)
              } else {
                errors.push(`Amino acid change ${aa} was ignored`)
              }
              continue
            }
          }
        }

        aaChanges.push({
          from,
          to,
          position,
          variant,
          database,
          sample,
          change,
        })
      }

      let length = Math.max(...aaChanges.map(ac => ac.position))

      // if (protein) {
      //   length = protein.sequence.length
      // } else {
      //   // determine length from data
      //   length = Math.max(...aaChanges.map(ac => ac.position))
      // }

      const aaStats: ILollipopStats[] = range(length).map(i =>
        newAAStats(i + 1)
      )

      // basically a histogram of amino acid changes
      for (const aaChange of aaChanges) {
        aaSet(
          aaChange.variant,
          aaChange.database,
          aaChange.sample,
          aaChange.change,
          aaStats[aaChange.position - 1]!
        )

        // aaStats[aaChange.position - 1]!.set(
        //   aaChange.variant,
        //   aaChange.database,
        //   aaChange.sample,
        //   aaChange.change
        // )
      }

      console.log('Setting lollipop state with protein:', protein.gene)

      set(
        protein,
        aaStats,
        [...databases].sort(),
        Object.fromEntries([...databases].map(db => [db, true]))
      )

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
    } catch (error) {
      console.error('Error parsing lollipop data:', error)
    }

    return errors
  }

  return (
    <LollipopContext.Provider
      value={{
        ...lollipop,
        set,
        setProtein,
        setFeature,
        setFeatures,
        setLabels,
        setDatabases,
        setDatabasesForUse,
        setMutationsForUse,
        lollipopFromTable,
      }}
    >
      {children}
    </LollipopContext.Provider>
  )
}
