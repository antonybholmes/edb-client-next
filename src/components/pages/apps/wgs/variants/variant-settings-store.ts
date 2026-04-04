import {
  DEFAULT_FILL_PROPS,
  DEFAULT_STROKE_PROPS,
  type IColorProps,
  type IStrokeProps,
} from '@/components/plot/svg-props'
import { config } from '@/config'
import type { IDBEntity } from '@/interfaces/db-entity'
import {
  COLOR_BLACK,
  COLOR_CORNFLOWER_BLUE,
  COLOR_GRAY,
  COLOR_LIGHTGRAY,
  COLOR_MEDIUM_SEA_GREEN,
  COLOR_ORANGE,
  COLOR_RED,
} from '@/lib/color/color'
import {
  parseGenomicLocation,
  type IGenomicLocation,
} from '@/lib/genomic/genomic'
import { makeUuid } from '@/lib/id'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

const SETTINGS_KEY = `${config.appId}:app:wgs:variants:v8`

export type PredefinedCMAP = 'coo' | 'lymphgen' | 'snv' | 'variant'

export type CMAPName = PredefinedCMAP | 'dataset' | 'none'

export type SortOrder = 'coo' | 'lymphgen' | 'variant' | 'dataset' | 'none'

export interface IMotifPattern {
  name: string
  regex: {
    pattern: string
    flags: string
  }
  bgColor: string
  bgOpacity: number
  color: string
  show: boolean
}

export interface ICMAPColor extends IDBEntity {
  color: string
}

export interface ICMAP extends IDBEntity {
  name: string
  colors: ICMAPColor[]
}

export const CMAP_NONE: ICMAP = { id: makeUuid(), name: 'None', colors: [] }

export const CMAP_ORDER: { label: string; value: string }[] = [
  { label: 'None', value: 'none' },
  { label: 'COO', value: 'coo' },
  { label: 'LymphGen', value: 'lymphgen' },
  { label: 'SNV Type', value: 'snv' },
  { label: 'Variant Type', value: 'variant' },
  { label: 'Dataset', value: 'dataset' },
]

export const SORT_ORDER: { label: string; value: string }[] = [
  { label: 'None', value: 'none' },
  { label: 'COO', value: 'coo' },
  { label: 'LymphGen', value: 'lymphgen' },
  // { label: 'SNV Type', value: 'snv' },
  { label: 'Variant Type', value: 'variant' },
  { label: 'Dataset', value: 'dataset' },
]

export const CMAP_NAMES: Record<PredefinedCMAP, string> = {
  coo: 'COO',
  lymphgen: 'LymphGen',
  snv: 'SNV',
  variant: 'Variant Type',
}

export const DEFAULT_MOTIF_PATTERNS: IMotifPattern[] = [
  {
    name: 'AID',
    regex: {
      pattern: '(?:[AG]G[CT][AT])|(?:[AT][AG]C[CT])',
      flags: 'g',
    },
    color: COLOR_RED,
    bgColor: COLOR_RED,
    bgOpacity: 0.1,
    show: true,
  },
]

export interface IPileupProps {
  assembly: string

  dna: {
    show: boolean
    index: {
      show: boolean
    }
    border: IStrokeProps
    motifs: {
      show: boolean
    }
  }
  location: IGenomicLocation
  datasets: {
    sort: {
      by: 'dataset' | 'sample'
      asc: boolean
    }
  }
  variants: {
    colorBy: CMAPName
    sortOrder: SortOrder
    prioritizeVariantTypeOrder: boolean
    cmap: ICMAP
  }
  cmaps: Record<PredefinedCMAP, ICMAP>
  motifs: {
    show: boolean
    patterns: IMotifPattern[]
  }
  mafs: {
    plot: {
      height: number
      line: IStrokeProps
      fill: IColorProps
    }
  }
  chrPrefix: {
    show: boolean
  }
  scale: number
  tooltips: {
    show: boolean
  }
  view: 'pileup' | 'maf'
}

const DEFAULT_HEATMAPS: Record<PredefinedCMAP, ICMAP> = {
  coo: {
    id: '019ce431-ee2d-7568-a9b4-1b148b26e62f',
    name: 'Cell of Origin (COO)',
    colors: [
      {
        id: '019ce432-0bce-78b1-9dd8-c69ae256feb9',
        name: 'ABC',
        color: '#4169E1',
      },
      {
        id: '019ce432-26bb-731f-9ad3-5ed8987c7055',
        name: 'GCB',
        color: COLOR_ORANGE,
      },
      {
        id: '019ce432-3cf5-7d50-9cc3-9af9213b38f2',
        name: 'UNC',
        color: '#2e8b57',
      },
      {
        id: '019ce432-54d4-7280-81a3-45d5f096c039',
        name: 'NA',
        color: COLOR_GRAY,
      },
    ],
  },
  lymphgen: {
    id: '019ce432-b2ce-7c90-863c-9e25b9480129',
    name: 'LymphGen Class',
    colors: [
      {
        id: '019ce432-6e7c-7aa9-922f-46de822419e1',
        name: 'MCD',
        color: COLOR_CORNFLOWER_BLUE,
      },
      {
        id: '019ce432-b2ce-7b64-8bf4-c428f58421be',
        name: 'BN2',
        color: '#ba55d3',
      },
      {
        id: '019ce432-b2ce-71cf-beb3-b03f4fd2d980',
        name: 'N1',
        color: COLOR_MEDIUM_SEA_GREEN,
      },
      {
        id: '019ce432-b2ce-721f-8247-593c98730334',
        name: 'EZB',
        color: '#cd853f',
      },
      {
        id: '019ce432-b2ce-72b8-9082-1617759b057a',
        name: 'ST2',
        color: '#b22222',
      },
      {
        id: '019ce432-b2ce-7fb3-9275-26465c81a2e4',
        name: 'A53',
        color: COLOR_BLACK,
      },
      {
        id: '019ce432-b2ce-7c1d-bdc0-1fb8c3aca6a3',
        name: 'Other',
        color: COLOR_LIGHTGRAY,
      },
      {
        id: '019ce432-b2ce-7d75-a009-80856e648295',
        name: 'NA',
        color: COLOR_GRAY,
      },
    ],
  },
  snv: {
    id: '019ce432-b2ce-73d5-bb5f-deda1a402ca4',
    name: 'SNV',
    colors: [
      {
        id: '019ce432-b2ce-74b4-b63f-879cf0d42057',
        name: 'A',
        color: COLOR_MEDIUM_SEA_GREEN,
      },
      {
        id: '019ce432-b2ce-7b2c-9c23-f18fed260486',
        name: 'C',
        color: COLOR_ORANGE,
      },
      {
        id: '019ce432-b2ce-76c9-a60d-3c284928a900',
        name: 'G',
        color: COLOR_CORNFLOWER_BLUE,
      },
      {
        id: '019ce432-b2ce-747f-ad61-478abeb15b08',
        name: 'T',
        color: COLOR_RED,
      },
      {
        id: '019ce432-b2ce-7618-bff0-371dd613c6e3',
        name: 'INS',
        color: COLOR_LIGHTGRAY,
      },
      {
        id: '019ce432-b2ce-735a-a2a5-08350b6f370a',
        name: 'DEL',
        color: COLOR_BLACK,
      },
    ],
  },
  variant: {
    id: '019ce432-b2ce-762d-9f42-7e3fbaa2d88f',
    name: 'Variant Type',
    colors: [
      {
        id: '019ce432-b2ce-70d2-8f6f-031f0506548c',
        name: 'SNV',
        color: COLOR_MEDIUM_SEA_GREEN,
      },
      {
        id: '019ce432-b2ce-7c98-8876-2d1e0d38a26b',
        name: 'INS',
        color: COLOR_ORANGE,
      },
      {
        id: '019ce432-b2ce-7687-8f9a-523fe379641f',
        name: 'DEL',
        color: COLOR_RED,
      },
    ],
  },
}

export const DEFAULT_PILEUP_PROPS: IPileupProps = {
  assembly: 'hg19',

  dna: {
    show: true,
    index: {
      show: true,
    },
    border: { ...DEFAULT_STROKE_PROPS },
    motifs: {
      show: true,
    },
  },

  cmaps: { ...DEFAULT_HEATMAPS },
  location: parseGenomicLocation('chr3:187462653-187462712'),
  datasets: {
    sort: {
      by: 'dataset',
      asc: true,
    },
  },
  variants: {
    colorBy: 'coo',
    sortOrder: 'coo',
    prioritizeVariantTypeOrder: true,
    cmap: { ...CMAP_NONE },
  },
  motifs: { show: true, patterns: [...DEFAULT_MOTIF_PATTERNS] },
  chrPrefix: {
    show: true,
  },
  mafs: {
    plot: {
      height: 200,
      line: {
        ...DEFAULT_STROKE_PROPS,
        color: COLOR_CORNFLOWER_BLUE,
        width: 1.5,
      },
      fill: { ...DEFAULT_FILL_PROPS, color: COLOR_CORNFLOWER_BLUE },
    },
  },
  scale: 1,
  tooltips: {
    show: true,
  },
  view: 'pileup',
}

export interface IVariantSettingsStore extends IPileupProps {
  updateSettings: (settings: IPileupProps) => void
}

export const useVariantSettingsStore = create<IVariantSettingsStore>()(
  persist(
    set => ({
      ...DEFAULT_PILEUP_PROPS,

      updateSettings: (settings: IPileupProps) => {
        console.log('updating settings', settings)
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

export function useVariantSettings(): {
  settings: IVariantSettingsStore
  updateSettings: (settings: IVariantSettingsStore) => void
  resetSettings: () => void
} {
  const settings = useVariantSettingsStore(state => state)
  const updateSettings = useVariantSettingsStore(state => state.updateSettings)

  function resetSettings() {
    updateSettings({ ...DEFAULT_PILEUP_PROPS })
  }

  return {
    settings,
    updateSettings,
    resetSettings,
  }
}
