import { config } from '@/config'
import { getAppName } from '@/lib/app-info'
import { create } from 'zustand'
import type { HumanReadableDelimiter } from '../../../open-files'
import APP_INFO from '../manifest.json'

import type { Species } from '@/lib/gene/geneconv'
import { createJSONStorage, persist } from 'zustand/middleware'

const SETTINGS_KEY = `${config.appId}:app:${getAppName(APP_INFO.name)}:settings:v72`

export interface IMatcalcSettings {
  dot: { size: { useOriginalValuesForSizes: boolean } }
  heatmap: {
    transforms: {
      apply: boolean
      transpose: boolean
      rowZscore: boolean
      log2: boolean
    }

    filters: {
      rows: {
        apply: boolean
        top: number
        method: string
      }
    }
    cluster: {
      apply: boolean
      distance: string
      linkage: string
      rows: boolean
      cols: boolean
    }
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

  files: {
    open: {
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
  }
  view: {
    dp: number
    commas: boolean
    defaultFileFormat: string
    panels: {
      tab: string
    }
    menus: {
      file: {
        show: boolean
      }
    }
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
    transforms: {
      apply: true,
      transpose: false,
      rowZscore: true,
      log2: false,
    },
    filters: {
      rows: {
        apply: false,
        top: 200,
        method: 'Stdev',
      },
    },
    cluster: {
      apply: false,
      distance: 'Correlation',
      linkage: 'Average',
      rows: false,
      cols: false,
    },
  },

  sortByRow: {
    text: '',
    sortWithinGroups: false,
  },

  files: {
    open: {
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
    // volcano: {
    //   preprocess: {
    //     applyLog2FC: false,
    //     applyMinusLog10P: true,
    //   },
    //   labels: {
    //     auto: true,
    //   },
    // },
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
    panels: {
      tab: '',
    },
    menus: {
      file: {
        show: false,
      },
    },
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
  hasHydrated: boolean
  setHasHydrated: (hasHydrated: boolean) => void
  update: (settings: IMatcalcSettings) => void
}

export const useMatcalcStore = create<IMatcalcStore>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      hasHydrated: false,
      setHasHydrated: (hasHydrated: boolean) => {
        set({ hasHydrated })
      },
      update: (settings: IMatcalcSettings) => {
        set((state) => ({ ...state, ...settings }))
      },
    }),
    {
      name: SETTINGS_KEY, // name in localStorage
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)

export function useMatcalcSettings(): {
  settings: IMatcalcSettings
  hasHydrated: boolean
  updateSettings: (settings: Partial<IMatcalcSettings>) => void
  resetSettings: () => void
} {
  const settings = useMatcalcStore((state) => state)
  const hasHydrated = useMatcalcStore((state) => state.hasHydrated)
  const updateSettings = useMatcalcStore((state) => state.update)
  const resetSettings = () => updateSettings({ ...DEFAULT_SETTINGS })

  return { settings, hasHydrated, updateSettings, resetSettings }
}
