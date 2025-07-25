import { APP_ID } from '@/consts'

import { getModuleName } from '@/lib/module-info'
import { persistentAtom } from '@nanostores/persistent'
import { useStore } from '@nanostores/react'
import type { HumanReadableDelimiter } from '../../../open-files'
import MODULE_INFO from '../module.json'

const KEY = `${APP_ID}:module:${getModuleName(MODULE_INFO.name)}:settings:v42`

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

const settingsAtom = persistentAtom<IMatcalcSettings>(
  KEY,
  {
    ...DEFAULT_SETTINGS,
  },
  {
    encode: JSON.stringify,
    decode: JSON.parse,
  }
)

function updateSettings(settings: IMatcalcSettings) {
  settingsAtom.set(settings)
}

function resetSettings() {
  updateSettings({ ...DEFAULT_SETTINGS })
}

export function useMatcalcSettings(): {
  settings: IMatcalcSettings
  updateSettings: (settings: IMatcalcSettings) => void
  resetSettings: () => void
} {
  const settings = useStore(settingsAtom)

  //console.log('use matcalc settings')
  // // first load in the default values from the store
  // const [settings, setSettings] = useState<ISettings>({
  //   passwordless: localStore.passwordless === TRUE,
  //   staySignedIn: localStore.staySignedIn === TRUE,
  //   theme: localStore.theme as Theme,
  // })

  // // when the in memory store is updated, trigger a write to localstorage.
  // // There may be an unnecessary write at the start where the localstorage
  // // is overwritten with a copy of itself, but this is ok.
  // useEffect(() => {
  //   // Write to store when there are changes
  //   localStorageMap.set({
  //     passwordless: localStore.passwordless.toString(),
  //     staySignedIn: localStore.staySignedIn.toString(),
  //     theme: settings.theme,
  //   })
  // }, [settings])

  return { settings, updateSettings, resetSettings }
}
