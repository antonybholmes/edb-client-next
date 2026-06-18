import { config } from '@/config'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import {
  DEFAULT_DISPLAY_PROPS,
  DEFAULT_DOMAIN,
  type IDomain,
  type ILollipopDisplayProps,
  type IProtein,
} from './lollipop-utils'
import { AA_RASMOL_COLORS } from './variants'

const SETTINGS_KEY = `${config.appId}:app:lollipop:v42`

export interface IAAColor {
  show: boolean
  scheme: Record<string, string> // Color scheme for amino acids, e.g., AA_COLOR_SCHEMES[AAColorScheme]
  invert: boolean
}

export const DEFAULT_AA_COLOR: IAAColor = {
  show: true,
  scheme: { ...AA_RASMOL_COLORS },
  invert: false, // Default is not inverted
}

export type LollipopPlotStyleType = 'stack' | 'single'

interface ILollipopSettings {
  protein: IProtein | null
  domain: IDomain
  displayProps: ILollipopDisplayProps
  aaColor: IAAColor // Optional, can be used to set a specific color scheme for amino acids
  plotStyle: LollipopPlotStyleType // Default plot style
  showMaxVariantOnly: boolean // Whether to show only the maximum variant for each position

  setDomain: (feature: IDomain) => void
  resetDomain: () => void
  setProtein: (protein: IProtein) => void
  setDisplayProps: (displayProps: ILollipopDisplayProps) => void
  resetDisplayProps: () => void
  setAAColor: (aaColor: IAAColor) => void
  setPlotStyle: (plotStyle: 'stack' | 'single') => void
  setShowMaxVariantOnly: (showMaxVariantOnly: boolean) => void
}

export const useLollipopSettingsStore = create<ILollipopSettings>()(
  persist(
    set => ({
      protein: null,
      domain: { ...DEFAULT_DOMAIN },
      displayProps: { ...DEFAULT_DISPLAY_PROPS },
      aaColor: { ...DEFAULT_AA_COLOR }, // Default color scheme for amino acids
      plotStyle: 'stack', // Default plot style
      showMaxVariantOnly: false, // Default is to show all variants

      setProtein: (protein: IProtein) =>
        set(state => ({
          ...state,
          protein: { ...protein },
        })),
      setDomain: (feature: IDomain) =>
        set(state => ({ ...state, domain: feature })),
      setDisplayProps: (displayProps: ILollipopDisplayProps) =>
        set(state => ({ ...state, displayProps })),
      resetDisplayProps: () =>
        set(state => ({
          ...state,
          displayProps: { ...DEFAULT_DISPLAY_PROPS },
        })),
      resetDomain: () =>
        set(state => ({ ...state, domain: { ...DEFAULT_DOMAIN } })),
      setAAColor: (aaColor: IAAColor) => set(state => ({ ...state, aaColor })),
      setPlotStyle: (plotStyle: LollipopPlotStyleType) =>
        set(state => ({ ...state, plotStyle })),
      setShowMaxVariantOnly: (showMaxVariantOnly: boolean) =>
        set(state => ({ ...state, showMaxVariantOnly })),

      // Add any other methods you need for the store
    }),
    {
      name: SETTINGS_KEY, // name in localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
)

export function useLollipopSettings(): ILollipopSettings {
  const protein = useLollipopSettingsStore(state => state.protein)
  const setProtein = useLollipopSettingsStore(state => state.setProtein)
  const domain = useLollipopSettingsStore(state => state.domain)
  const setDomain = useLollipopSettingsStore(state => state.setDomain)
  const resetDomain = useLollipopSettingsStore(state => state.resetDomain)
  const displayProps = useLollipopSettingsStore(state => state.displayProps)
  const setDisplayProps = useLollipopSettingsStore(
    state => state.setDisplayProps
  )
  const resetDisplayProps = useLollipopSettingsStore(
    state => state.resetDisplayProps
  )
  const aaColor = useLollipopSettingsStore(state => state.aaColor)
  const setAAColor = useLollipopSettingsStore(state => state.setAAColor)

  const plotStyle = useLollipopSettingsStore(state => state.plotStyle)
  const setPlotStyle = useLollipopSettingsStore(state => state.setPlotStyle)

  const showMaxVariantOnly = useLollipopSettingsStore(
    state => state.showMaxVariantOnly
  )
  const setShowMaxVariantOnly = useLollipopSettingsStore(
    state => state.setShowMaxVariantOnly
  )

  return {
    protein,
    setProtein,
    domain,
    setDomain,
    resetDomain,
    displayProps,
    setDisplayProps,
    resetDisplayProps,
    aaColor,
    setAAColor,
    plotStyle,
    setPlotStyle,
    showMaxVariantOnly,
    setShowMaxVariantOnly,
  }
}
