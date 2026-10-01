import {
  DEFAULT_STROKE_PROPS,
  DEFAULT_TEXT_PROPS,
  IMarginProps,
  IStrokeProps,
  ITextProps,
} from '@/components/plot/svg-props'
import { config } from '@/config'
import { IDim } from '@/interfaces/dim'
import { COLOR_BLACK, COLOR_GRAY } from '@/lib/color/color'
import { ICmap } from '@/lib/color/colormap'
import { useCallback } from 'react'

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { RadiusScaleMode } from '../matcalc/apps/heatmap/svg/cell-svg'

const SETTINGS_KEY = `${config.appId}:app:network:v10`

const PLOT_MARGIN = { top: 100, right: 400, bottom: 100, left: 100 }

export type LabelPosition = 'left' | 'center' | 'right' | 'below' | 'above'

export type NodeViewMode = 'normal' | 'translucent' | 'hidden'

export const POSITIONS: { label: string; value: LabelPosition }[] = [
  { label: 'Center', value: 'center' },
  { label: 'Left', value: 'left' },
  { label: 'Right', value: 'right' },
  { label: 'Below', value: 'below' },
  { label: 'Above', value: 'above' },
]

//type LabelType = 'label' | 'name' | 'group' | 'size' | 'id' | 'id2'

// export const LABEL_TYPES: {
//   label: string
//   value: LabelType
// }[] = [
//   { label: 'Label', value: 'label' },
//   { label: 'Name', value: 'name' },
//   { label: 'Group', value: 'group' },
//   { label: 'Size', value: 'size' },
//   { label: 'ID', value: 'id' },
//   { label: 'ID 2', value: 'id2' },
//   // { label: 'None', value: 'none' },
// ]

export interface INetworkSettings {
  layout: {
    chargeStrength: number
    linkDistance: number
    useStrength: boolean
  }
  data: {
    applyMinusLog10ToMetric1: boolean
    applyMinusLog10ToMetric2: boolean
  }
  plot: {
    size: IDim
    margin: IMarginProps
    autoFit: boolean
    scale: number
    border: IStrokeProps
    nodes: {
      //scale: number
      radius: number
      scale: {
        mode: RadiusScaleMode
      }
      line: IStrokeProps & { autoColor: boolean }
      color: {
        mode: 'group' | 'auto'
        opacity: number
        cmap: ICmap
      }
      labels: {
        showAll: boolean
        text: ITextProps
        color: {
          on: boolean
          default: string
        }
        position: LabelPosition
        offset: number
        //type: LabelType
      }
      view: {
        /**
         * The default view mode for the node.
         */
        mode: NodeViewMode
        /**
         * If the node is labelled, it can have a different view mode.
         */
        labelled: {
          on: boolean
          /**
           * The view mode for the node when it is labelled.
           */
          mode: NodeViewMode
        }
        translucent: {
          opacity: number
        }
      }
      clamp: boolean
      clip: boolean
    }

    edges: {
      scale: number
      /**
       * The default way edges are displayed.
       */
      mode: NodeViewMode
      /**
       * If either node is labelled, edge can be styled differently.
       */
      labelled: {
        /**
         * If on, will draw edges between labelled nodes.
         */
        on: boolean
        /**
         * The view mode for the edge when either connected node is labelled.
         */
        mode: NodeViewMode
      }
      minWidth: number
      line: IStrokeProps
      highlight: boolean
    }
    legend: {
      dot: {
        radius: number
      }
      sizes: {
        ticks: number
      }
      edges: {
        size: number
        ticks: number
      }
    }
    crosshair: {
      show: boolean
      search: {
        radius: number
      }
    }
  }
}

const DEFAULT_SETTINGS: INetworkSettings = {
  layout: {
    chargeStrength: -30,
    linkDistance: 100,
    useStrength: false,
  },
  data: { applyMinusLog10ToMetric1: false, applyMinusLog10ToMetric2: false },
  plot: {
    size: { w: 2000, h: 2000 },
    margin: { ...PLOT_MARGIN },
    autoFit: true,
    scale: 1,
    border: { ...DEFAULT_STROKE_PROPS, show: false },
    nodes: {
      //scale: 0.1,
      radius: 25,
      scale: {
        mode: 'area',
      },
      color: {
        mode: 'group',
        opacity: 0.5,
        cmap: { name: 'bwr-v2', reversed: false },
      },
      line: { ...DEFAULT_STROKE_PROPS, show: false, autoColor: true },
      labels: {
        showAll: true,
        text: { ...DEFAULT_TEXT_PROPS },
        color: { on: false, default: COLOR_BLACK },
        position: 'center',
        offset: 5,
        //type: 'label',
      },
      view: {
        mode: 'normal',
        labelled: {
          on: true,
          mode: 'normal',
        },
        translucent: {
          opacity: 0.1,
        },
      },
      clamp: false,
      clip: false,
    },

    edges: {
      scale: 1,
      mode: 'normal',
      labelled: {
        on: true,
        mode: 'normal',
      },
      minWidth: 1,
      highlight: true,
      line: { ...DEFAULT_STROKE_PROPS, value: COLOR_GRAY, opacity: 0.5 },
    },
    legend: {
      dot: {
        radius: 8,
      },
      sizes: {
        ticks: 4,
      },
      edges: {
        size: 15,
        ticks: 5,
      },
    },
    crosshair: {
      show: true,
      search: {
        radius: 20,
      },
    },
  },
}

export interface INetworkSettingsStore extends INetworkSettings {
  updateSettings: (settings: INetworkSettings) => void
}

export const useNetworkSettingsStore = create<INetworkSettingsStore>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,

      updateSettings: (settings: INetworkSettings) => {
        set({
          ...settings,
        })
      },
    }),
    {
      name: SETTINGS_KEY, // name in localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
)

export function useNetworkSettings(): {
  settings: INetworkSettingsStore
  updateSettings: (settings: INetworkSettingsStore) => void
  resetSettings: () => void
} {
  const settings = useNetworkSettingsStore((state) => state)
  const updateSettings = useNetworkSettingsStore(
    (state) => state.updateSettings
  )

  const resetSettings = useCallback(() => {
    updateSettings({ ...DEFAULT_SETTINGS })
  }, [updateSettings])

  return {
    settings,
    updateSettings,
    resetSettings,
  }
}
