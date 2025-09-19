import { APP_ID } from '@/consts'

import { getModuleName } from '@/lib/module-info'
import { create } from 'zustand'
import type { HumanReadableDelimiter } from '../../../open-files'
import MODULE_INFO from '../module.json'

import { createJSONStorage, persist } from 'zustand/middleware'

const SETTINGS_KEY = `${APP_ID}:module:${getModuleName(MODULE_INFO.name)}:settings:v42`

export interface IMatcalcSettings {
  dot: { size: { useOriginalValuesForSizes: boolean } }
  heatmap: {
    applyTranspose: boolean
    applyRowZscore: boolean
    applyLog2: boolean
    rowFilterMethod: string
    topRows: number
    distance: string
    linkage: string
    clusterRows: boolean
    clusterCols: boolean
    filterRows: boolean
  }

  apps: {
    geneConvert: {
      duplicateRows: boolean
      convertIndex: boolean
      useSelectedColumns: boolean
      delimiter: string
      outputSymbols: string
      fromSpecies: string
      toSpecies: string
    }
    kmeans: {
      showHeatmap: boolean
      sortByCluster: boolean
      topRows: number
      filterRows: boolean
      rowFilterMethod: string
      clusterRows: boolean
      clusterCols: boolean
      clusters: number
      distance: string
      applyZscore: boolean
      applyLog2: boolean
    }

    gex: {
      species: string
      gexType: string
      addGroup: boolean
      addSampleMetadataToColumns: boolean
      addAltNames: boolean
      technology: string
      genes: string[]
      selectedDatasets: string[]
    }
  }

  sortByRow: {
    sortWithinGroups: boolean
    text: string
  }

  volcano: {
    log2FC: boolean
    log10P: boolean
  }
  openFile: {
    trimWhitespace: boolean
    skipRows: number
    firstRowIsHeader: boolean

    index: {
      hasIndex: boolean
      cols: number
    }
    delimiter: HumanReadableDelimiter
    keepDefaultNA: boolean
    multiFileView: boolean
  }

  sidebar: {
    show: boolean
  }
}

export const DEFAULT_SETTINGS: IMatcalcSettings = {
  heatmap: {
    filterRows: false,
    clusterCols: false,
    clusterRows: false,
    linkage: 'Average',
    distance: 'Correlation',
    topRows: 200,
    rowFilterMethod: 'Stdev',
    applyTranspose: false,
    applyLog2: true,
    applyRowZscore: true,
  },

  sortByRow: {
    text: '',
    sortWithinGroups: false,
  },
  volcano: {
    log10P: true,
    log2FC: false,
  },
  openFile: {
    firstRowIsHeader: true,

    delimiter: '<tab>',
    keepDefaultNA: false,
    index: {
      hasIndex: true,
      cols: 1,
    },
    skipRows: 0,
    multiFileView: false,
    trimWhitespace: true,
  },

  sidebar: {
    show: true,
  },

  apps: {
    geneConvert: {
      fromSpecies: 'Human',
      toSpecies: 'Mouse',
      outputSymbols: 'Symbol',
      delimiter: ' /// ',
      convertIndex: true,
      useSelectedColumns: false,
      duplicateRows: false,
    },
    kmeans: {
      distance: 'Correlation',
      applyZscore: true,
      applyLog2: false,
      clusters: 5,
      clusterRows: true,
      clusterCols: false,
      rowFilterMethod: 'Stdev',
      filterRows: false,
      topRows: 1000,
      sortByCluster: true,
      showHeatmap: false,
    },
    gex: {
      addGroup: true,
      addSampleMetadataToColumns: false,
      addAltNames: false,
      technology: 'RNA-seq',
      gexType: 'TPM',
      genes: [],
      species: 'Human',
      selectedDatasets: [],
    },
  },
  dot: {
    size: {
      useOriginalValuesForSizes: true,
    },
  },
}

export interface IMatcalcStore extends IMatcalcSettings {
  updateSettings: (settings: Partial<IMatcalcSettings>) => void
}

export const useMatcalcStore = create<IMatcalcStore>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      updateSettings: (settings: Partial<IMatcalcSettings>) => {
        set((state) => ({ ...state, ...settings }))
      },
    }),
    {
      name: SETTINGS_KEY, // name in localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
)

// const settingsAtom = persistentAtom<IMatcalcSettings>(
//   KEY,
//   {
//     ...DEFAULT_SETTINGS,
//   },
//   {
//     encode: JSON.stringify,
//     decode: JSON.parse,
//   }
// )

// function updateSettings(settings: IMatcalcSettings) {
//   settingsAtom.set(settings)
// }

// function resetSettings() {
//   updateSettings({ ...DEFAULT_SETTINGS })
// }

export function useMatcalcSettings(): {
  settings: IMatcalcSettings
  updateSettings: (settings: Partial<IMatcalcSettings>) => void
  resetSettings: () => void
} {
  const settings = useMatcalcStore((state) => state)
  const updateSettings = useMatcalcStore((state) => state.updateSettings)
  const resetSettings = () => updateSettings({ ...DEFAULT_SETTINGS })

  return { settings, updateSettings, resetSettings }
}
