import {
  DEFAULT_FILL_PROPS,
  DEFAULT_STROKE_PROPS,
  type IPaintProps,
  type IStrokeProps,
} from '@/components/plot/svg-props'
import { config } from '@/config'
import { COLOR_CORNFLOWER_BLUE, COLOR_RED } from '@/lib/color/color'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

const SETTINGS_KEY = `${config.appId}:ext-gsea:settings:v24`

export interface IExtGseaSettings {
  phenotypes: {
    p1: {
      name: string
    }
    p2: {
      name: string
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
      }
    }
    stats: {
      show: boolean
    }
  }
}

export const DEFAULT_EXT_GSEA_SETTINGS: IExtGseaSettings = {
  phenotypes: {
    p1: {
      name: '',
    },
    p2: {
      name: '',
    },
  },
  es: {
    useGeneScoreForES: true,
    axes: {
      y: {
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
  // genes: {
  //   height: 15,
  //   line: { ...DEFAULT_STROKE_PROPS },
  //   labels: {
  //     font: { ...DEFAULT_BOLD_TEXT_PROPS },
  //     isColored: true,
  //   },
  //   geneScoreWeight: 1,
  // },
  // ranking: {
  //   show: true,
  //   axes: {
  //     y: {
  //       length: 100,
  //     },
  //   },
  //   fill: {
  //     value: 'gray',
  //     opacity: 0.2,
  //     show: true,
  //   },
  //   zeroCross: { ...DEFAULT_DASH_PROPS },
  // },
  // viper: {
  //   reverse: true,
  // },
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
