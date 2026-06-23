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
  const { present, sheets } = useHistory()
  const { file } = useFiles()

  useEffect(() => {
    function oncoplot() {
      if (genes.length === 0 || mutations.length === 0) {
        return
      }

      // Assume first sheet is
      const sheet = findSheet(present, sheets, 'Variants', { file })

      if (!sheet) {
        return
      }

      const df = sheet as BaseDataFrame

      console.log('Generating oncoplot from df:', df, mutations)

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

      //console.log('Variants in use:', mutationsInUse)

      // setDisplayProps(
      //   produce(displayProps, draft => {
      //     draft.legend.mutations.names = legend.names
      //     draft.legend.mutations.colorMap = legend.colorMap
      //   })
      // )

      if (newMutations.length > 0) {
        setMutations([...mutations, ...newMutations])
      }
    }

    // auto make oncoplot when data or settings change
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
    //oncoQuery.data,
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
// | {
//     type: 'display'
//     displayProps: ILollipopDisplayProps
//   }

// export function makePlot(cf: ClusterFrame, type: PlotType, params:IFieldMap={}): IPlot {
//   return {
//     id: randId(),
//     type,
//     cf,
//     params
//   }
// }

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

// const [DEFAULT_HISTORY, DEFAULT_HISTORY_DISPATCH] = useReducer(
//   historyReducer,
//   new HistoryState(0, DEFAULT_HISTORY_STEPS),
// )

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
