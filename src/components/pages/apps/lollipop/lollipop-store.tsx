import { findCol, type BaseDataFrame } from '@/lib/dataframe/base-dataframe'
import { range } from '@/lib/math/range'
import { create } from 'zustand'
import type { ILollipopStore } from './lollipop-provider'
import { aaSet, newAAStats, type ILollipopStats } from './lollipop-stats'
import {
  DEFAULT_LOLLIPOP,
  parseVariant,
  SUB_REGEX,
  SUB_V2_REGEX,
  type IAAVar,
  type ILollipopColumns,
  type IProtein,
  type IProteinFeature,
  type IProteinLabel,
} from './lollipop-utils'

export const useLollipopStore = create<ILollipopStore>(set => ({
  ...DEFAULT_LOLLIPOP,
  set: (
    protein: IProtein,
    aaStats: ILollipopStats[],
    databases: string[],
    databasesForUse: Record<string, boolean>
  ) =>
    set(state => ({
      ...state,
      protein,
      aaStats,
      databases,
      databasesForUse: { ...databasesForUse },
    })),
  setProtein: (protein: IProtein) =>
    set(state => ({
      ...state,
      protein: { ...protein }, // create a new object to trigger reactivity
    })),
  setFeature: (feature: IProteinFeature) =>
    set(state => ({
      ...state,
      features: state.features.map(f => (f.id === feature.id ? feature : f)),
    })),
  setFeatures: (features: IProteinFeature[]) =>
    set(state => ({
      ...state,
      features: [...features],
    })),
  setLabels: (labels: IProteinLabel[]) =>
    set(state => ({
      ...state,
      labels: [...labels],
    })),
  setDatabases: (databases: string[]) =>
    set(state => ({
      ...state,
      databases: [...databases],
    })),
  setDatabasesForUse: (dbs: Record<string, boolean>) =>
    set(state => ({
      ...state,
      databasesForUse: dbs,
    })),
  setMutationsForUse: (mutations: Record<string, boolean>) =>
    set(state => ({
      ...state,
      mutationsForUse: mutations,
    })),

  lollipopFromTable: (mutDf: BaseDataFrame): string[] => {
    const errors: string[] = []
    try {
      const databases = new Set<string>()

      let geneCol = findCol(mutDf, 'Hugo_Symbol')

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

      // if (featuresDf) {
      //   range(featuresDf.shape[0]).forEach(i => {
      //     const name = featuresDf.get(i, 0).toString()
      //     const start = featuresDf.get(i, 1) as number
      //     const end = featuresDf.get(i, 2) as number
      //     const color = featuresDf.get(i, 3).toString() ?? DEFAULT_FEATURE_BG_COLOR

      //     features.push({
      //       ...DEFAULT_PROTEIN_COLORS,
      //       id: nanoid(),
      //       name,
      //       start,
      //       end,
      //       fill: {
      //         ...DEFAULT_FILL_PROPS,
      //         color,
      //       },
      //       show: true,
      //       z: 1,
      //     })
      //   })
      // }

      const aaChanges: IAAVar[] = []

      for (let row = 0; row < mutDf.shape[0]; row++) {
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

        if (matchArray) {
          //console.log('matchArray', matchArray)
          from = matchArray[0]![1]!
          position = Number(matchArray[0]![2]!)
          to = matchArray[0]![3]!
        } else {
          // try v2

          matchArray = [...aa.matchAll(SUB_V2_REGEX)]

          if (matchArray) {
            position = Number(matchArray[0]![1]!)
            from = matchArray[0]![2]!
            to = matchArray[0]![3]!
          } else {
            console.warn(
              `Could not parse amino acid change: ${mutDf.get(row, colMap.aa)}`
            )
            errors.push(
              `amino acid change ${mutDf.get(row, colMap.aa)} was ignored`
            )
            continue
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

      set(state => ({
        ...state,
        aaStats,
        databases: [...databases].sort(),
        databasesForUse: Object.fromEntries(
          [...databases].map(db => [db, true])
        ),
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
    } catch (error) {
      console.error('Error parsing lollipop data:', error)
    }

    return errors
  },
}))

export function useLollipop(): ILollipopStore {
  const df = useLollipopStore(state => state)
  const set = useLollipopStore(state => state.set)
  const setFeature = useLollipopStore(state => state.setFeature)
  const setFeatures = useLollipopStore(state => state.setFeatures)
  const setLabels = useLollipopStore(state => state.setLabels)
  const setDatabases = useLollipopStore(state => state.setDatabases)
  const setDatabasesForUse = useLollipopStore(state => state.setDatabasesForUse)
  const setMutationsForUse = useLollipopStore(state => state.setMutationsForUse)
  const lollipopFromTable = useLollipopStore(state => state.lollipopFromTable)

  return {
    ...df,
    set,
    setFeature,
    setFeatures,
    setLabels,
    setDatabases,
    setDatabasesForUse,
    setMutationsForUse,
    lollipopFromTable,
  }
}

// interface IPlotState {
//   df: ILollipop
// }

// export type PlotAction =
//   | {
//       type: 'set'
//       df: ILollipop
//     }
//   | {
//       type: 'features'
//       features: IProteinFeature[]
//     }
//   | {
//       type: 'feature'
//       feature: IProteinFeature
//     }
//   | {
//       type: 'labels'
//       labels: IProteinLabel[]
//     }
// // | {
// //     type: 'display'
// //     displayProps: ILollipopDisplayProps
// //   }

// // export function makePlot(cf: ClusterFrame, type: PlotType, params:IFieldMap={}): IPlot {
// //   return {
// //     id: randId(),
// //     type,
// //     cf,
// //     params
// //   }
// // }

// export function plotReducer(state: IPlotState, action: PlotAction): IPlotState {
//   switch (action.type) {
//     case 'set':
//       return {
//         df: action.df,
//       }
//     case 'features':
//       return {
//         df: {
//           ...state.df,
//           features: [...action.features],
//         },
//       }
//     case 'feature':
//       return {
//         df: {
//           ...state.df,
//           features: state.df.features.map(f =>
//             f.id === action.feature.id ? action.feature : f
//           ),
//         },
//       }
//     case 'labels':
//       return {
//         df: {
//           ...state.df,
//           labels: [...action.labels],
//         },
//       }
//     // case 'display':
//     //   return {
//     //     df: {
//     //       ...state.df,
//     //       displayProps: { ...action.displayProps },
//     //     },
//     //   }
//     default:
//       return state
//   }
// }

// // const [DEFAULT_HISTORY, DEFAULT_HISTORY_DISPATCH] = useReducer(
// //   historyReducer,
// //   new HistoryState(0, DEFAULT_HISTORY_STEPS),
// // )

// export const PlotContext = createContext<{
//   plotState: IPlotState
//   plotDispatch: Dispatch<PlotAction>
// }>({
//   plotState: {
//     df: { ...DEFAULT_LOLLIPOP },
//   },
//   plotDispatch: () => {},
// })

// export function PlotProvider({ children }: IChildrenProps) {
//   const [plotState, plotDispatch] = useReducer(plotReducer, {
//     df: { ...DEFAULT_LOLLIPOP },
//   })

//   return (
//     <PlotContext.Provider value={{ plotState, plotDispatch }}>
//       {children}
//     </PlotContext.Provider>
//   )
// }
