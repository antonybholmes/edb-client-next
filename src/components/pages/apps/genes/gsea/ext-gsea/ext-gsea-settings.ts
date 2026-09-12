import {
  DEFAULT_BOLD_TEXT_PROPS,
  DEFAULT_DASH_PROPS,
  DEFAULT_FILL_PROPS,
  DEFAULT_MARGIN_MEDIUM,
  DEFAULT_STROKE_PROPS,
  DEFAULT_TEXT_PROPS,
  type IPaintProps,
  type IStrokeProps,
  type ITextProps,
} from '@/components/plot/svg-props'
import { config } from '@/config'
import { COLOR_CORNFLOWER_BLUE, COLOR_RED } from '@/lib/color/color'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

const SETTINGS_KEY = `${config.appId}:ext-gsea:settings:v18`

export interface IExtGseaSettings {
  axes: {
    x: {
      length: number
      font: ITextProps

      labels: {
        rotate: boolean
        truncate: number
        font: ITextProps
      }
    }
  }
  es: {
    useGeneScoreForES: boolean
    gs1: {
      curve: IStrokeProps
      leadingEdge: IPaintProps
    }
    gs2: {
      curve: IStrokeProps
      leadingEdge: IPaintProps
    }
    axes: {
      x: {
        showTicks: boolean
      }
      y: {
        title: string
        length: number
      }
    }
    stats: {
      show: boolean
    }
    step: number
  }
  genes: {
    line: IStrokeProps
    height: number

    labels: {
      font: ITextProps
      isColored: boolean
    }
    geneScoreWeight: number
  }
  title: ITextProps & {
    offset: number
  }
  page: {
    //scale: number
    columns: number
  }
  plot: {
    margin: {
      top: number
      left: number
      bottom: number
      right: number
    }
    gap: { x: number; y: number }
  }

  ranking: {
    zeroCross: IStrokeProps
    show: boolean
    axes: {
      y: {
        length: number
      }
    }
    fill: IPaintProps
  }
}

export const DEFAULT_EXT_GSEA_SETTINGS: IExtGseaSettings = {
  page: {
    columns: 3,
    //scale: 1,
  },

  title: {
    ...DEFAULT_BOLD_TEXT_PROPS,
    offset: 10,
  },
  plot: {
    margin: { ...DEFAULT_MARGIN_MEDIUM },
    gap: {
      x: 20,
      y: 20,
    },
  },
  axes: {
    x: {
      font: { ...DEFAULT_TEXT_PROPS },
      labels: {
        rotate: false,
        truncate: -2,
        font: { ...DEFAULT_BOLD_TEXT_PROPS },
      },
      length: 220,
    },
  },
  es: {
    useGeneScoreForES: true,
    step: 100,
    axes: {
      y: {
        length: 150,
        title: 'ES',
      },
      x: {
        showTicks: false,
      },
    },
    gs1: {
      curve: { ...DEFAULT_STROKE_PROPS, value: COLOR_RED, width: 2 },
      leadingEdge: { ...DEFAULT_FILL_PROPS, value: COLOR_RED },
    },

    gs2: {
      curve: {
        ...DEFAULT_STROKE_PROPS,
        value: COLOR_CORNFLOWER_BLUE,
        width: 2,
      },

      leadingEdge: { ...DEFAULT_FILL_PROPS, value: COLOR_CORNFLOWER_BLUE },
    },
    stats: {
      show: true,
    },
  },
  genes: {
    height: 15,
    line: { ...DEFAULT_STROKE_PROPS },
    labels: {
      font: { ...DEFAULT_BOLD_TEXT_PROPS },
      isColored: true,
    },
    geneScoreWeight: 1,
  },
  ranking: {
    show: true,
    axes: {
      y: {
        length: 100,
      },
    },
    fill: {
      value: 'gray',
      opacity: 0.2,
      show: true,
    },
    zeroCross: { ...DEFAULT_DASH_PROPS },
  },
}

export interface IExtGseaSettingsStore extends IExtGseaSettings {
  updateSettings: (settings: Partial<IExtGseaSettings>) => void
}

export const useExtGseaStore = create<IExtGseaSettingsStore>()(
  persist(
    (set) => ({
      ...DEFAULT_EXT_GSEA_SETTINGS,
      updateSettings: (settings: Partial<IExtGseaSettings>) => {
        set((state) => ({ ...state, ...settings }))
      },
    }),
    {
      name: SETTINGS_KEY, // name in localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
)

// const extGseaAtom = persistentAtom<IExtGseaDisplayOptions>(
//   SETTINGS_KEY,
//   { ...DEFAULT_EXT_GSEA_PROPS },
//   {
//     encode: JSON.stringify,
//     decode: JSON.parse,
//   }
// )

// function setDisplayProps(props: IExtGseaDisplayOptions) {
//   extGseaAtom.set(props)
// }

// function resetDisplayProps() {
//   extGseaAtom.set({ ...DEFAULT_EXT_GSEA_PROPS })
// }

export function useExtGseaSettings(): {
  settings: IExtGseaSettings
  updateSettings: (settings: Partial<IExtGseaSettings>) => void
  resetSettings: () => void
} {
  const settings = useExtGseaStore((state) => state)
  const updateSettings = useExtGseaStore((state) => state.updateSettings)
  const resetSettings = () => updateSettings({ ...DEFAULT_EXT_GSEA_SETTINGS })

  return { settings, updateSettings, resetSettings }
}
