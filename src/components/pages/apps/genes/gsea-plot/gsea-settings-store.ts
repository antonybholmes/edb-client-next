import { config } from '@/config'

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

const SETTINGS_KEY = `${config.appId}:gsea-settings-v36`

import {
  DEFAULT_BOLD_FONT_PROPS,
  DEFAULT_BOLD_TEXT_PROPS,
  DEFAULT_COLOR_PROPS,
  DEFAULT_FILL_PROPS,
  DEFAULT_MARGIN,
  DEFAULT_STROKE_PROPS,
  DEFAULT_TEXT_PROPS,
  type IMarginProps,
  type IPaintProps,
  type IStrokeProps,
  type ITextProps,
} from '@/components/plot/svg-props'
import {
  COLOR_BLUE,
  COLOR_GRAY,
  COLOR_MEDIUM_SEA_GREEN,
  COLOR_RED,
} from '@/lib/color/color'

export interface IGseaDisplayProps {
  phenotypes: {
    invert: boolean
  }
  axes: {
    show: boolean
    labels: ITextProps
    ticks: ITextProps
    x: {
      length: number
      labels: {
        rotate: boolean
        truncate: number
      }
    }
  }
  genes: {
    show: boolean
    color: {
      on: boolean
    }
    pos: IStrokeProps
    neg: IStrokeProps
    gradient: { opacity: number; on: boolean }
    height: number
    //line: IStrokeProps
  }
  es: {
    labels: ITextProps
    phenotypes: ITextProps
    show: boolean
    line: IStrokeProps
    leadingEdge: {
      show: boolean
      fill: IPaintProps
      line: IStrokeProps
    }
    axes: {
      x: {
        showTicks: boolean
      }
      y: {
        length: number
      }
    }
  }
  title: ITextProps & { offset: number }
  page: {
    scale: number
    columns: number
  }
  plot: {
    margin: IMarginProps
    gap: {
      x: number
      y: number
    }
  }

  ranking: {
    zeroCross: { show: boolean; line: IStrokeProps }
    show: boolean
    axes: {
      y: {
        length: number
      }
    }
    fill: IPaintProps
  }
}

export const DEFAULT_GSEA_DISPLAY_PROPS: IGseaDisplayProps = {
  page: {
    columns: 3,
    scale: 1,
  },
  phenotypes: {
    invert: false,
  },

  title: {
    offset: 20,
    ...DEFAULT_BOLD_TEXT_PROPS,
    font: {
      ...DEFAULT_BOLD_FONT_PROPS,

      textAnchor: 'middle',
    },
  },
  plot: {
    margin: { ...DEFAULT_MARGIN, bottom: 0, right: 50 },
    gap: {
      y: 15,
      x: 20,
    },
  },
  axes: {
    show: true,
    labels: { ...DEFAULT_BOLD_TEXT_PROPS },
    ticks: { ...DEFAULT_TEXT_PROPS },
    x: {
      labels: {
        rotate: false,
        truncate: -2,
      },
      length: 220,
    },
  },
  es: {
    axes: {
      y: {
        length: 100,
      },
      x: {
        showTicks: false,
      },
    },
    line: { ...DEFAULT_STROKE_PROPS, value: COLOR_MEDIUM_SEA_GREEN, width: 2 },
    leadingEdge: {
      fill: { ...DEFAULT_FILL_PROPS, value: COLOR_MEDIUM_SEA_GREEN },
      line: {
        ...DEFAULT_STROKE_PROPS,
        value: COLOR_MEDIUM_SEA_GREEN,
        width: 2,
        show: false,
      },
      show: true,
    },
    show: true,
    labels: { ...DEFAULT_TEXT_PROPS },
    phenotypes: { ...DEFAULT_TEXT_PROPS },
  },
  genes: {
    height: 15,
    color: {
      on: true,
    },
    pos: { ...DEFAULT_STROKE_PROPS, value: COLOR_RED, width: 1 },
    neg: { ...DEFAULT_STROKE_PROPS, value: COLOR_BLUE, width: 1 },

    show: true,
    gradient: { opacity: 0.2, on: true },
    //line: { ...DEFAULT_STROKE_PROPS, width: 2 },
  },
  ranking: {
    show: true,
    axes: {
      y: {
        length: 100,
      },
    },
    fill: { ...DEFAULT_COLOR_PROPS, value: COLOR_GRAY, opacity: 0.3 },
    zeroCross: {
      show: true,
      line: { ...DEFAULT_STROKE_PROPS, width: 1, dasharray: '8' },
    },
  },
}

export interface IGseaSettingsStore extends IGseaDisplayProps {
  updateSettings: (settings: Partial<IGseaDisplayProps>) => void
}

export const useGseaSettingsStore = create<IGseaSettingsStore>()(
  persist(
    (set) => ({
      ...DEFAULT_GSEA_DISPLAY_PROPS,

      updateSettings: (settings: Partial<IGseaDisplayProps>) => {
        console.log('updating gsea settings', settings)
        set((state) => ({
          ...state,
          ...settings,
        }))
      },
    }),
    {
      name: SETTINGS_KEY, // name in localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
)

export function useGseaSettings(): {
  settings: IGseaDisplayProps
  updateSettings: (settings: Partial<IGseaDisplayProps>) => void
  reset: () => void
} {
  const settings = useGseaSettingsStore((state) => state)
  const updateSettings = useGseaSettingsStore((state) => state.updateSettings)

  function reset() {
    console.log('resetting useGseaSettings to default')
    updateSettings({ ...DEFAULT_GSEA_DISPLAY_PROPS })
  }

  return { settings, updateSettings, reset }
}
