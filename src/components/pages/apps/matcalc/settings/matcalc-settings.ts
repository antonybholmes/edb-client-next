import { config } from '@/config'
import { getAppName } from '@/lib/app-info'
import { create } from 'zustand'
import type { HumanReadableDelimiter } from '../../../open-files'
import APP_INFO from '../manifest.json'

import type { Species } from '@/lib/gene/geneconv'
import { createJSONStorage, persist } from 'zustand/middleware'

const SETTINGS_KEY = `${config.appId}:app:${getAppName(APP_INFO.name)}:settings:v58`

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
    geneconv: {
      duplicateRows: boolean
      convertIndex: boolean
      useSelectedColumns: boolean
      delimiter: string
      outputSymbols: string
      fromSpecies: Species
      toSpecies: Species
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
      genome: string
      gexType: string
      addGroup: boolean
      useOfficialGeneSymbol: boolean
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
    // whether to show multiple files when opened
    multiFileView: boolean
  }

  view: {
    dp: number
    commas: boolean
    defaultFileFormat: string
  }

  sidebar: {
    show: boolean
  }

  groups: {
    match: {
      exact: boolean
    }
    filter: {
      mode: 'keep' | 'hide' | 'ignore'
    }
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
    multiFileView: true,
    trimWhitespace: true,
  },

  sidebar: {
    show: true,
  },

  apps: {
    geneconv: {
      fromSpecies: 'human',
      toSpecies: 'mouse',
      outputSymbols: 'Symbol',
      delimiter: ' /// ',
      convertIndex: false,
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
      useOfficialGeneSymbol: true,
      addSampleMetadataToColumns: false,
      addAltNames: false,
      technology: 'RNA-seq',
      gexType: 'TPM',
      genes: [],
      genome: 'Human',
      selectedDatasets: [],
    },
  },
  dot: {
    size: {
      useOriginalValuesForSizes: true,
    },
  },

  view: {
    dp: 4,
    commas: true,
    defaultFileFormat: 'txt',
  },

  groups: {
    match: {
      exact: true,
    },
    filter: {
      mode: 'ignore',
    },
  },
}

export interface IMatcalcStore extends IMatcalcSettings {
  update: (settings: Partial<IMatcalcSettings>) => void
}

export const useMatcalcStore = create<IMatcalcStore>()(
  persist(
    set => ({
      ...DEFAULT_SETTINGS,
      update: (settings: Partial<IMatcalcSettings>) => {
        set(state => ({ ...state, ...settings }))
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
  const settings = useMatcalcStore(state => state)
  const update = useMatcalcStore(state => state.update)
  const resetSettings = () => update({ ...DEFAULT_SETTINGS })

  return { settings, updateSettings: update, resetSettings }
}
