import type { IMannWhitneyUResult } from '@lib/math/mann-whitney'

//const SETTINGS_KEY = `${APP_ID}.gex-settings-v6`

export interface IGexTechnology {
  publicId: string
  name: 'RNA-seq' | 'Microarray'
  gexTypes: ('Counts' | 'TPM' | 'VST' | 'RMA')[]
}

// export type IGexTechnologies = Record<
//   'Human' | 'Mouse',
//   Record<'RNA-seq' | 'Microarray', string[]>
// >

export interface IGexGene {
  hugo: string
  mgi: string
  ensembl: string
  refseq: string
  geneName: string
}

export interface INameValue {
  name: string
  value: string | number
}

export interface IGexSample {
  publicId: string
  name: string
  altNames: string[]
  metadata: INameValue[]
}

export interface IGexDataset {
  publicId: string
  name: string // a human readable name for the database
  institution: string // a public id for the database

  samples: IGexSample[]

  //displayProps: IGexPlotDisplayProps
}

export interface IGexResultSample {
  id: number
  //counts: number
  //tpm: number
  //vst: number
  value: number
}

export interface IGexResultDataset {
  publicId: string
  //samples: IGexResultSample[]
  values: number[]
}

export interface IGexResultFeature {
  probeId?: string
  gene: IGexGene
  //platform: IGexPlatform
  //gexValueType: IGexValueType
  expression: number[]
}

export interface IGexSearchResult {
  dataset: string
  gexType: string
  features: IGexResultFeature[]
}

export interface IGexStats extends IMannWhitneyUResult {
  idx1: number
  idx2: number
}

// export interface IGexPlotDisplayProps {
//   box: {
//     show: boolean
//     width: number
//     fill: IColorProps
//     stroke: IStrokeProps

//     median: { stroke: IStrokeProps }
//   }
//   violin: {
//     show: boolean
//     fill: IColorProps
//     stroke: IStrokeProps
//   }
//   swarm: {
//     show: boolean
//     r: number
//     fill: IColorProps
//     stroke: IStrokeProps
//   }
// }

// export interface IGexDisplayProps {
//   title: {
//     offset: number
//   }
//   page: {
//     gap: { x: number; y: number }
//     cols: number
//     zoom: number
//   }
//   axes: {
//     x: {
//       labels: {
//         rotate: boolean
//         truncate: number
//       }
//     }
//     y: {
//       globalMax: boolean
//       offset: number
//     }
//   }
//   // box: {
//   //   show: boolean
//   //   width: number
//   // }
//   violin: {
//     //show: boolean
//     globalNorm: boolean
//   }
//   plot: {
//     gap: number
//     bar: { width: number }
//     height: number
//   }

//   cmap: string

//   // swarm: {
//   //   show: boolean
//   //   r: number
//   // }

//   tpm: {
//     log2Mode: boolean
//   }

//   stats: {
//     show: boolean
//     line: {
//       // how much to offset each stat test line
//       offset: number
//       // size of drop down lines
//       tail: number
//     }
//     p: {
//       cutoff: number
//     }
//   }
// }

// export type GexPlotPropMap = { [key: string]: IGexPlotDisplayProps }

// export const DEFAULT_GEX_DISPLAY_PROPS: IGexDisplayProps = {
//   cmap: 'COO',
//   tpm: {
//     log2Mode: true,
//   },
//   plot: {
//     gap: 10,
//     bar: { width: 50 },
//     height: 200,
//   },
//   // box: {
//   //   show: true,
//   //   width: 10,
//   // },
//   // swarm: {
//   //   show: false,
//   //   r: 2,
//   // },
//   violin: {
//     //show: true,
//     globalNorm: false,
//   },
//   page: {
//     cols: 2,
//     gap: { x: 150, y: 100 },
//     zoom: 1,
//   },
//   axes: {
//     y: {
//       globalMax: true,
//       offset: -20,
//     },
//     x: {
//       labels: {
//         rotate: false,
//         truncate: -2,
//       },
//     },
//   },

//   title: {
//     offset: -10,
//   },

//   stats: {
//     p: {
//       cutoff: 0.05,
//     },
//     line: {
//       offset: 10,
//       tail: 4,
//     },
//     show: true,
//   },
// }

// export const DEFAULT_GEX_PLOT_DISPLAY_PROPS: IGexPlotDisplayProps = {
//   box: {
//     median: { stroke: { ...DEFAULT_STROKE_PROPS, color: COLOR_RED } },

//     show: true,
//     width: 10,
//     fill: {
//       show: true,
//       color: COLOR_WHITE,
//       alpha: 1,
//     },
//     stroke: { ...DEFAULT_STROKE_PROPS, width: 1.5 },
//   },
//   violin: {
//     show: true,
//     fill: { ...DEFAULT_FILL_PROPS },
//     stroke: { ...NO_STROKE_PROPS, width: 1.5 },
//   },
//   swarm: {
//     show: false,
//     r: 2,
//     fill: {
//       ...DEFAULT_FILL_PROPS,
//       color: COLOR_WHITE,
//     },
//     stroke: { ...DEFAULT_STROKE_PROPS },
//   },
// }

// const gexAtom = persistentAtom<IGexDisplayProps>(
//   SETTINGS_KEY,
//   { ...DEFAULT_GEX_DISPLAY_PROPS },
//   {
//     encode: JSON.stringify,
//     decode: JSON.parse,
//   }
// )

// function setStore(props: IGexDisplayProps) {
//   gexAtom.set(props)
// }

// function resetStore() {
//   gexAtom.set({ ...DEFAULT_GEX_DISPLAY_PROPS })
// }

// export function useGexStore(): {
//   store: IGexDisplayProps
//   setStore: (props: IGexDisplayProps) => void
//   resetStore: () => void
// } {
//   const store = useStore(gexAtom)

//   useEffect(() => {
//     // auto recreate if deleted and app is running
//     if (!store) {
//       resetStore()
//     }
//   }, [store])

//   return { store, setStore, resetStore }
// }
