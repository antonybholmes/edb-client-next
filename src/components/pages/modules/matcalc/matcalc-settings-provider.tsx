import { APP_ID } from '@/consts'
import type { IChildrenProps } from '@interfaces/children-props'
import { createContext } from 'react'

import { persistentAtom } from '@nanostores/persistent'
import { useStore } from '@nanostores/react'
import type { HumanReadableDelimiter } from '../../open-files'
import MODULE_INFO from './module.json'

const KEY = `${APP_ID}-${MODULE_INFO.name.toLowerCase()}-settings-v11`

export interface IMatcalcSettings {
  heatmap: {
    applyTranspose: boolean
    applyLog2: boolean
    rowFilterMethod: string
    topRows: number
    distance: string
    linkage: string
    clusterRows: boolean
    clusterCols: boolean
    filterRows: boolean
    applyRowZscore: boolean
  }

  geneConvert: {
    duplicateRows: boolean
    convertIndex: boolean
    useSelectedColumns: boolean
    delimiter: string
    outputSymbols: string
    fromSpecies: string
    toSpecies: string
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
    firstRowIsHeader: boolean
    firstColIsIndex: boolean
    delimiter: HumanReadableDelimiter
    keepDefaultNA: boolean
  }

  data: {
    sidebar: {
      show: boolean
    }
  }
}

export const DEFAULT_SETTINGS: IMatcalcSettings = {
  heatmap: {
    applyRowZscore: true,
    filterRows: false,
    clusterCols: false,
    clusterRows: false,
    linkage: 'Average',
    distance: 'Correlation',
    topRows: 200,
    rowFilterMethod: 'Stdev',
    applyLog2: false,
    applyTranspose: false,
  },
  geneConvert: {
    fromSpecies: 'Human',
    toSpecies: 'Mouse',
    outputSymbols: 'Symbol',
    delimiter: ' /// ',
    convertIndex: true,
    useSelectedColumns: false,
    duplicateRows: false,
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
    firstColIsIndex: false,
    delimiter: '<tab>',
    keepDefaultNA: false,
  },
  data: {
    sidebar: {
      show: true,
    },
  },
}

const localStorageMap = persistentAtom<IMatcalcSettings>(
  KEY,
  {
    ...DEFAULT_SETTINGS,
  },
  {
    encode: JSON.stringify,
    decode: JSON.parse,
  }
)

export function useMatcalcSettingsStore(): {
  settings: IMatcalcSettings
  updateSettings: (settings: IMatcalcSettings) => void
  resetSettings: () => void
} {
  const settings = useStore(localStorageMap)

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

  function updateSettings(settings: IMatcalcSettings) {
    localStorageMap.set(settings)
  }

  function resetSettings() {
    updateSettings({ ...DEFAULT_SETTINGS })
  }

  return { settings, updateSettings, resetSettings }
}

export const MatcalcSettingsContext = createContext<{
  settings: IMatcalcSettings
  updateSettings: (settings: IMatcalcSettings) => void
  resetSettings: () => void
}>({
  settings: { ...DEFAULT_SETTINGS },
  updateSettings: () => {},
  resetSettings: () => {},
})

export function MatcalcSettingsProvider({ children }: IChildrenProps) {
  const { settings, updateSettings, resetSettings } = useMatcalcSettingsStore()

  return (
    <MatcalcSettingsContext.Provider
      value={{ settings, updateSettings, resetSettings }}
    >
      {children}
    </MatcalcSettingsContext.Provider>
  )
}
