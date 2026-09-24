import {
  DEFAULT_STROKE_PROPS,
  DEFAULT_TEXT_PROPS,
  IMarginProps,
  IStrokeProps,
  ITextProps,
} from '@/components/plot/svg-props'
import { config } from '@/config'
import { IDim } from '@/interfaces/dim'
import { COLOR_BLACK, COLOR_LIGHTGRAY } from '@/lib/color/color'
import { useCallback } from 'react'

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

const SETTINGS_KEY = `${config.appId}:app:network:v6`

const PLOT_MARGIN = { top: 100, right: 400, bottom: 100, left: 100 }

type LabelPosition = 'left' | 'center' | 'right' | 'below' | 'above'

export const POSITIONS: { label: string; value: LabelPosition }[] = [
  { label: 'Center', value: 'center' },
  { label: 'Left', value: 'left' },
  { label: 'Right', value: 'right' },
  { label: 'Below', value: 'below' },
  { label: 'Above', value: 'above' },
]

type LabelType = 'label' | 'name' | 'group' | 'size' | 'id' | 'id2'

export const LABEL_TYPES: {
  label: string
  value: LabelType
}[] = [
  { label: 'Label', value: 'label' },
  { label: 'Name', value: 'name' },
  { label: 'Group', value: 'group' },
  { label: 'Size', value: 'size' },
  { label: 'ID', value: 'id' },
  { label: 'ID 2', value: 'id2' },
  // { label: 'None', value: 'none' },
]

export interface INetworkSettings {
  chargeStrength: number
  linkDistance: number
  applyMinusLog10ToSize: boolean
  plot: {
    size: IDim
    margin: IMarginProps
    scaleToFit: boolean
    scale: number
    border: IStrokeProps
    nodes: {
      //scale: number
      radius: number
      line: IStrokeProps & { autoColor: boolean }
      color: {
        mode: 'group'
        opacity: number
      }
      labels: {
        showAll: boolean
        text: ITextProps
        color: {
          on: boolean
          default: string
        }
        position: 'left' | 'center' | 'right' | 'below' | 'above'
        offset: number
        type: LabelType
      }
      keepWithinBounds: boolean
    }

    edges: {
      scale: number
      line: IStrokeProps
    }
    legend: {
      dot: {
        radius: number
      }
      // sizes: {
      //   ticks: number[]
      // }
      edges: {
        size: number
        ticks: number[]
      }
    }
  }
}

const DEFAULT_SETTINGS: INetworkSettings = {
  chargeStrength: -30,
  linkDistance: 100,
  applyMinusLog10ToSize: false,
  plot: {
    size: { w: 2000, h: 2000 },
    margin: { ...PLOT_MARGIN },
    scaleToFit: true,
    scale: 1,
    border: { ...DEFAULT_STROKE_PROPS, show: false },
    nodes: {
      //scale: 0.1,
      radius: 25,
      color: {
        mode: 'group',
        opacity: 0.5,
      },
      line: { ...DEFAULT_STROKE_PROPS, show: false, autoColor: true },
      labels: {
        showAll: true,
        text: { ...DEFAULT_TEXT_PROPS },
        color: { on: false, default: COLOR_BLACK },
        position: 'center',
        offset: 5,
        type: 'label',
      },
      keepWithinBounds: true,
    },

    edges: {
      scale: 1,
      line: { ...DEFAULT_STROKE_PROPS, value: COLOR_LIGHTGRAY },
    },
    legend: {
      dot: {
        radius: 8,
      },
      // sizes: {
      //   ticks: [100, 200, 300, 400],
      // },
      edges: {
        size: 15,
        ticks: [0.2, 0.4, 0.6, 0.8, 1],
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
