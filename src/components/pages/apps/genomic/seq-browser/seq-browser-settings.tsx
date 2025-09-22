import type { IChildrenProps } from '@interfaces/children-props'
import { createContext } from 'react'

import { APP_ID } from '@/consts'
import { getModuleName } from '@/lib/module-info'
import {
  DEFAULT_FONT_PROPS,
  DEFAULT_STROKE_PROPS,
  OPAQUE_FILL_PROPS,
  type IColorProps,
  type IFontProps,
  type IMarginProps,
  type IStrokeProps,
} from '@components/plot/svg-props'
import {
  COLOR_BLACK,
  COLOR_CORNFLOWER_BLUE,
  COLOR_NAVY_BLUE,
} from '@lib/color/color'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import MODULE_INFO from './module.json'
import type { BandStyle, GeneArrowStyle } from './tracks-provider'

const SETTINGS_KEY = `${APP_ID}:module:${getModuleName(MODULE_INFO.name)}:settings:v68`

export type TrackTitlePosition = 'top' | 'right'

export type ReadScaleMode = 'Count' | 'CPM' | 'BPM'

export type BinSize = 16 | 64 | 256 | 1024 | 4096 | 16384 //10 | 100 | 1000 | 10000

export type GeneDisplay = 'full' | 'pack' | 'dense'
export type GeneView = 'transcript' | 'exon'
export type GeneType = 'all' | 'protein-coding'

export interface ISeqBrowserSettings {
  plot: { width: number; gap: number }
  genome: string
  zoom: number
  reverse: boolean
  locations: string[]
  cytobands: {
    height: number
    band: { height: number }
    style: BandStyle
    labels: {
      skip: { on: boolean; auto: boolean; x: number }
      font: IFontProps
      show: boolean
    }
  }
  scale: { autoSize: boolean; bp: number }
  ruler: { autoSize: boolean; bp: number }
  genes: {
    labels: {
      show: boolean
      showGeneId: boolean
      font: IFontProps
      offset: number
    }
    stroke: IStrokeProps
    exons: { show: boolean; fill: IColorProps }
    endArrows: {
      fill: IColorProps
      firstTranscriptOnly: boolean
      show: boolean
      stroke: IStrokeProps
    }
    arrows: {
      style: GeneArrowStyle
      show: boolean
    }
    canonical: {
      only: boolean
      isColored: boolean
      stroke: IStrokeProps
    }
    display: GeneDisplay
    view: GeneView
    types: GeneType
    offset: number
  }
  margin: IMarginProps
  axes: {
    x: { height: number }
  }
  titles: {
    font: {
      color: string
      size: string
    }
    show: boolean
    offset: number
    height: number
    position: TrackTitlePosition
  }
  seqs: {
    bins: { autoSize: boolean; size: BinSize }
    smoothing: {
      // whether to smooth lines or not. This controls if the smoothing factor is applied
      on: boolean
      // a multiplier between 0 and 1 to control smoothing appearance
      factor: number
    }

    scale: {
      mode: ReadScaleMode
    }
    globalY: {
      on: boolean
      auto: boolean
      ymax: number
    }
  }
  beds: {
    style: BandStyle
    height: number
    band: { height: number }
    collapsed: boolean
  }
  apiKey: string
}

export const DEFAULT_TRACKS_DISPLAY_PROPS: ISeqBrowserSettings = {
  zoom: 1,
  //gap: 20,
  margin: { top: 20, left: 250, bottom: 20, right: 250 },
  titles: {
    show: true,
    offset: 5,
    height: 20,
    position: 'top',
    font: {
      size: 'small',
      color: COLOR_BLACK,
    },
  },
  seqs: {
    smoothing: {
      on: true,
      factor: 0.5,
    },
    scale: {
      mode: 'Count',
    },
    globalY: {
      auto: true,
      ymax: 10,
      on: true,
    },
    bins: {
      autoSize: true,
      size: 64,
    },
  },
  beds: {
    height: 16,
    collapsed: false,
    band: {
      height: 10,
    },
    style: 'Square',
  },
  genes: {
    canonical: {
      only: false,
      isColored: true,
      stroke: { ...DEFAULT_STROKE_PROPS, color: COLOR_CORNFLOWER_BLUE },
    },
    arrows: {
      show: true,
      style: 'lines',
    },
    endArrows: {
      show: false,
      firstTranscriptOnly: true,
      stroke: { ...DEFAULT_STROKE_PROPS, color: COLOR_NAVY_BLUE },
      fill: { ...OPAQUE_FILL_PROPS, color: COLOR_NAVY_BLUE },
    },

    stroke: { ...DEFAULT_STROKE_PROPS, color: COLOR_NAVY_BLUE },
    exons: {
      show: true,
      //height: 15,
      fill: { ...OPAQUE_FILL_PROPS, color: COLOR_NAVY_BLUE },
    },
    display: 'full',
    view: 'exon',
    types: 'protein-coding',
    offset: 16,
    labels: {
      show: true,
      offset: 6,
      font: { ...DEFAULT_FONT_PROPS, size: 'x-small' },
      showGeneId: false,
    },
  },
  scale: {
    autoSize: true,
    bp: 5000,
  },
  ruler: {
    autoSize: true,
    bp: 5000,
  },
  apiKey: '',
  cytobands: {
    style: 'Rounded',
    labels: {
      show: true,
      font: { ...DEFAULT_FONT_PROPS, size: 'x-small' },
      skip: {
        on: true,
        x: 50,
        auto: true,
      },
    },
    height: 20,
    band: {
      height: 12,
    },
  },
  genome: 'hg19',
  plot: {
    width: 500,
    gap: 200,
  },
  reverse: false,
  axes: {
    x: {
      height: 25,
    },
  },
  locations: ['chr3:187441954-187466041', 'chr6:106441338-106557814'],
}

export interface ISeqBrowserStore extends ISeqBrowserSettings {
  updateSettings: (settings: Partial<ISeqBrowserSettings>) => void
  //applyTheme: (theme: Theme) => void
}

export const useSeqBrowserStore = create<ISeqBrowserStore>()(
  persist(
    (set) => ({
      ...DEFAULT_TRACKS_DISPLAY_PROPS,
      updateSettings: (settings: Partial<ISeqBrowserSettings>) => {
        set((state) => ({ ...state, ...settings }))
      },
    }),
    {
      name: SETTINGS_KEY, // name in localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
)

// const settingsAtom = persistentAtom<ISeqBrowserSettings>(
//   SETTINGS_KEY,
//   {
//     ...DEFAULT_TRACKS_DISPLAY_PROPS,
//   },
//   {
//     encode: JSON.stringify,
//     decode: JSON.parse,
//   }
// )

// function updateSettings(settings: ISeqBrowserSettings) {
//   settingsAtom.set(settings)
// }

// function resetSettings() {
//   updateSettings({ ...DEFAULT_TRACKS_DISPLAY_PROPS })
// }

export function useSeqBrowserSettings(): {
  settings: ISeqBrowserSettings
  updateSettings: (settings: Partial<ISeqBrowserSettings>) => void
  resetSettings: () => void
} {
  const settings = useSeqBrowserStore((state) => state)
  const updateSettings = useSeqBrowserStore((state) => state.updateSettings)
  const resetSettings = () =>
    updateSettings({ ...DEFAULT_TRACKS_DISPLAY_PROPS })

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

export const SeqBrowserSettingsContext = createContext<{
  settings: ISeqBrowserSettings
  updateSettings: (settings: ISeqBrowserSettings) => void
  resetSettings: () => void
}>({
  settings: { ...DEFAULT_TRACKS_DISPLAY_PROPS },
  updateSettings: () => {},
  resetSettings: () => {},
})

export function SeqBrowserSettingsProvider({ children }: IChildrenProps) {
  const { settings, updateSettings, resetSettings } = useSeqBrowserSettings()

  return (
    <SeqBrowserSettingsContext.Provider
      value={{ settings, updateSettings, resetSettings }}
    >
      {children}
    </SeqBrowserSettingsContext.Provider>
  )
}
