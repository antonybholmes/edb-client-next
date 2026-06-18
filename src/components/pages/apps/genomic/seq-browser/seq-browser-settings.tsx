import {
  DEFAULT_CENTERED_TEXT_PROPS,
  DEFAULT_COLOR_PROPS,
  DEFAULT_STROKE_PROPS,
  DEFAULT_TEXT_PROPS,
  type IMarginProps,
  type IPaintProps,
  type IStrokeProps,
  type ITextProps,
} from '@/components/plot/svg-props'
import { config } from '@/config'
import { getAppName } from '@/lib/app-info'
import {
  COLOR_BLACK,
  COLOR_CORNFLOWER_BLUE,
  COLOR_NAVY_BLUE,
} from '@/lib/color/color'

import {
  parseGenomicLocation,
  type IGenomicLocation,
} from '@/lib/genomic/genomic-location'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import APP_INFO from './manifest.json'
import type { BandStyle, GeneArrowStyle } from './tracks-provider'

const SETTINGS_KEY = `${config.appId}:app:${getAppName(APP_INFO.name)}:settings:v102`

const DEFAULT_LOCATIONS = [
  parseGenomicLocation('chr3:187441954-187466041'),
  parseGenomicLocation('chr6:106441338-106557814'),
]

export type TrackTitlePosition = 'top' | 'right'

export type ReadScaleMode = 'Count' | 'CPM' | 'BPM'

export type BinSize = 50 | 100 | 1000 | 10000 // 16 | 64 | 256 | 1024 | 4096 | 16384 //10 | 100 | 1000 | 10000

export type GeneDisplay = 'full' | 'pack' | 'dense'
export type GeneView = 'transcript' | 'features'
export type GeneType = 'all' | 'protein-coding'

export const GENE_DISPLAY_OPTIONS = [
  { value: 'dense', label: 'Dense' },
  { value: 'pack', label: 'Pack' },
  { value: 'full', label: 'Full' },
]

// const GENE_DISPLAY_MAP: Record<GeneDisplay, string> = {
//   dense: 'Dense',
//   pack: 'Pack',
//   full: 'Full',
// }

export interface ISeqBrowserSettings {
  plot: { width: number; gap: number }

  zoom: number
  reverse: boolean
  locations: IGenomicLocation[]
  tracks: {
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
    cytobands: {
      height: number
      band: { height: number }
      style: BandStyle
      labels: {
        skip: { on: boolean; auto: boolean; x: number }
        text: ITextProps
      }
    }
    scale: { autoSize: boolean; bp: number }
    ruler: { autoSize: boolean; bp: number }
    genes: {
      labels: {
        text: ITextProps
        showGeneId: boolean

        offset: number
      }
      stroke: IStrokeProps
      transcripts: { show: boolean; fill: IPaintProps; height: number }
      exons: { show: boolean; fill: IPaintProps; height: number }
      cds: { show: boolean; fill: IPaintProps; height: number }
      utrs: { show: boolean; fill: IPaintProps; height: number }
      endArrows: {
        fill: IPaintProps
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
        fill: IPaintProps
      }
      display: GeneDisplay
      view: GeneView
      types: GeneType
      offset: number
      gap: number
    }
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
  tracks: {
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
        size: 50,
      },
    },
    beds: {
      height: 16,
      collapsed: false,
      band: {
        height: 10,
      },
      style: 'square',
    },
    genes: {
      canonical: {
        only: false,
        isColored: true,
        fill: { ...DEFAULT_COLOR_PROPS, value: COLOR_CORNFLOWER_BLUE },
      },
      arrows: {
        show: true,
        style: 'lines',
      },
      endArrows: {
        show: false,
        firstTranscriptOnly: true,
        stroke: { ...DEFAULT_STROKE_PROPS, value: COLOR_NAVY_BLUE },
        fill: { ...DEFAULT_COLOR_PROPS, value: COLOR_NAVY_BLUE },
      },

      stroke: { ...DEFAULT_STROKE_PROPS, value: COLOR_NAVY_BLUE },
      transcripts: {
        show: true,
        height: 16,
        fill: { ...DEFAULT_COLOR_PROPS, value: COLOR_NAVY_BLUE },
      },
      exons: {
        show: false,
        height: 16,
        fill: { ...DEFAULT_COLOR_PROPS, value: COLOR_NAVY_BLUE },
      },
      cds: {
        show: true,
        height: 16,
        fill: { ...DEFAULT_COLOR_PROPS, value: COLOR_NAVY_BLUE },
      },
      utrs: {
        show: true,
        height: 8,
        fill: { ...DEFAULT_COLOR_PROPS, value: COLOR_NAVY_BLUE },
      },
      display: 'full',
      view: 'features',
      types: 'protein-coding',
      offset: 16,
      labels: {
        text: { ...DEFAULT_TEXT_PROPS },
        offset: 6,

        showGeneId: false,
      },
      gap: 3,
    },
    scale: {
      autoSize: true,
      bp: 5000,
    },
    ruler: {
      autoSize: true,
      bp: 5000,
    },
    cytobands: {
      style: 'rounded',
      labels: {
        text: { ...DEFAULT_CENTERED_TEXT_PROPS },
        skip: {
          on: true,
          x: 50,
          auto: true,
        },
      },
      height: 24,
      band: {
        height: 12,
      },
    },
  },
  apiKey: '',

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
  locations: [...DEFAULT_LOCATIONS],
}

export interface ISeqBrowserStore extends ISeqBrowserSettings {
  updateSettings: (settings: Partial<ISeqBrowserSettings>) => void
}

export const useSeqBrowserStore = create<ISeqBrowserStore>()(
  persist(
    set => ({
      ...DEFAULT_TRACKS_DISPLAY_PROPS,
      updateSettings: (settings: Partial<ISeqBrowserSettings>) => {
        set({ ...settings })
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
  const settings = useSeqBrowserStore(state => state)
  const updateSettings = useSeqBrowserStore(state => state.updateSettings)
  const resetSettings = () =>
    updateSettings({ ...DEFAULT_TRACKS_DISPLAY_PROPS })

  //console.log('use matcalc settings')
  // first load in the default values from the store
  // const [settings, setSettings] = useState<ISettings>({
  //   passwordless: localStore.passwordless === TRUE,
  //   staySignedIn: localStore.staySignedIn === TRUE,
  //   theme: localStore.theme as Theme,
  // })

  // when the in memory store is updated, trigger a write to localstorage.
  // There may be an unnecessary write at the start where the localstorage
  // is overwritten with a copy of itself, but this is ok.
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

// export const SeqBrowserSettingsContext = createContext<{
//   settings: ISeqBrowserSettings
//   updateSettings: (settings: ISeqBrowserSettings) => void
//   resetSettings: () => void
// }>({
//   settings: { ...DEFAULT_TRACKS_DISPLAY_PROPS },
//   updateSettings: () => {},
//   resetSettings: () => {},
// })

// export function SeqBrowserSettingsProvider({ children }: IChildrenProps) {
//   const { settings, updateSettings, resetSettings } = useSeqBrowserSettings()

//   return (
//     <SeqBrowserSettingsContext.Provider
//       value={{ settings, updateSettings, resetSettings }}
//     >
//       {children}
//     </SeqBrowserSettingsContext.Provider>
//   )
// }
