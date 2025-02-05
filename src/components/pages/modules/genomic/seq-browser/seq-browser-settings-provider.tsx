import { APP_ID, COLOR_BLACK, COLOR_MEDIUM_SEA_GREEN } from '@/consts'
import type { IChildrenProps } from '@interfaces/children-props'
import { createContext } from 'react'

import { persistentAtom } from '@nanostores/persistent'
import { useStore } from '@nanostores/react'

import {
  DEFAULT_STROKE_PROPS,
  OPAQUE_FILL_PROPS,
  type IFillProps,
  type IFontProps,
  type IMarginProps,
  type IStrokeProps,
} from '@/components/plot/svg-props'
import MODULE_INFO from './module.json'
import type { BandStyle, GeneArrowStyle } from './tracks-provider'

const KEY = `${APP_ID}-${MODULE_INFO.name.toLowerCase().replaceAll(' ', '-')}-settings-v54`

export type TrackTitlePosition = 'Top' | 'Right'

export type ReadScaleMode = 'Count' | 'CPM' | 'BPM'

export type BinSize = 16 | 64 | 256 | 1024 | 4096 | 16384 //10 | 100 | 1000 | 10000

export interface ISeqBrowserSettings {
  plot: { width: number; gap: number }
  genome: string
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
    exons: { show: boolean }
    endArrows: {
      fill: IFillProps
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
  }

  zoom: number
  margin: IMarginProps
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
    smooth: boolean
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
  margin: { top: 20, left: 250, bottom: 20, right: 400 },
  titles: {
    show: true,
    offset: 5,
    height: 20,
    position: 'Top',
    font: {
      size: 'small',
      color: COLOR_BLACK,
    },
  },
  seqs: {
    smooth: true,
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
      only: true,
      isColored: true,
      stroke: { ...DEFAULT_STROKE_PROPS, color: COLOR_MEDIUM_SEA_GREEN },
    },
    arrows: {
      show: true,
      style: 'Filled',
    },
    endArrows: {
      show: true,
      firstTranscriptOnly: true,
      stroke: { ...DEFAULT_STROKE_PROPS },
      fill: { ...OPAQUE_FILL_PROPS },
    },
    exons: {
      show: true,
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
      font: {
        size: 'x-small',
        color: COLOR_BLACK,
      },
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
    width: 400,
    gap: 100,
  },
}

const localStorageMap = persistentAtom<ISeqBrowserSettings>(
  KEY,
  {
    ...DEFAULT_TRACKS_DISPLAY_PROPS,
  },
  {
    encode: JSON.stringify,
    decode: JSON.parse,
  }
)

export function useSeqBrowserSettingsStore(): {
  settings: ISeqBrowserSettings
  updateSettings: (settings: ISeqBrowserSettings) => void
  resetSettings: () => void
} {
  const settings = useStore(localStorageMap)

  function updateSettings(settings: ISeqBrowserSettings) {
    localStorageMap.set(settings)
  }

  function resetSettings() {
    updateSettings({ ...DEFAULT_TRACKS_DISPLAY_PROPS })
  }

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
  const { settings, updateSettings, resetSettings } =
    useSeqBrowserSettingsStore()

  return (
    <SeqBrowserSettingsContext.Provider
      value={{ settings, updateSettings, resetSettings }}
    >
      {children}
    </SeqBrowserSettingsContext.Provider>
  )
}
