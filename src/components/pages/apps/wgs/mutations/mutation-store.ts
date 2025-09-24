import { APP_ID } from '@/consts'
import { COLOR_BLACK } from '@lib/color/color'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

const SETTINGS_KEY = `${APP_ID}:module:wgs:mutations:v6`

export interface IPileupProps {
  border: {
    show: boolean
    color: string
  }

  index: {
    show: boolean
  }

  cmap: string
  cmaps: {
    None: object
    COO: {
      ABC: string
      GCB: string
      UNCLASS: string
      UNC: string
      U: string
      NA: string
    }
    Lymphgen: {
      MCD: string
      BN2: string
      N1: string
      EZB: string
      ST2: string
      A53: string
      Other: string
    }
    SNP: {
      DEL: string
      INS: string
      A: string
      C: string
      G: string
      T: string
    }
  }
  chrPrefix: {
    show: boolean
  }
  scale: number
  showTooltips: boolean
}

export const DEFAULT_PILEUP_PROPS: IPileupProps = {
  border: {
    show: true,
    color: COLOR_BLACK,
  },

  index: {
    show: true,
  },

  cmaps: {
    None: {},
    COO: {
      ABC: 'royalblue',
      GCB: 'orange',
      UNC: 'seagreen',
      UNCLASS: 'seagreen',
      U: 'seagreen',
      NA: 'gray',
    },
    Lymphgen: {
      MCD: 'cornflowerblue',
      BN2: 'mediumorchid',
      N1: 'mediumseagreen',
      EZB: 'peru',
      ST2: 'firebrick',
      A53: COLOR_BLACK,
      Other: 'gainsboro',
    },
    SNP: {
      DEL: COLOR_BLACK,
      INS: 'gainsboro',
      A: 'mediumseagreen',
      C: 'orange',
      G: 'cornflowerblue',
      T: 'red',
    },
  },
  cmap: 'COO',
  chrPrefix: {
    show: true,
  },
  scale: 1,
  showTooltips: true,
}

export interface IMutationsStore extends IPileupProps {
  updateSettings: (settings: Partial<IPileupProps>) => void
}

export const useMutationsStore = create<IMutationsStore>()(
  persist(
    (set) => ({
      ...DEFAULT_PILEUP_PROPS,

      updateSettings: (settings: Partial<IMutationsStore>) => {
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

export function useMutations(): {
  settings: IMutationsStore
  updateSettings: (settings: Partial<IMutationsStore>) => void
  resetSettings: () => void
} {
  const settings = useMutationsStore((state) => state)
  const updateSettings = useMutationsStore((state) => state.updateSettings)

  function resetSettings() {
    updateSettings({ ...DEFAULT_PILEUP_PROPS })
  }

  return {
    settings,
    updateSettings,
    resetSettings,
  }
}
