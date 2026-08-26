import { IChildrenProps } from '@/interfaces/children-props'
import { SVGSaveProvider, useSVGSave } from './svg-save-provider'
import { SVGStoreProvider, useSVGStore } from './svg-store-provider'

export function useSVG() {
  return { ...useSVGStore(), ...useSVGSave() }
}

export function SVGProvider({ children }: IChildrenProps) {
  return (
    <SVGStoreProvider>
      <SVGSaveProvider>{children}</SVGSaveProvider>
    </SVGStoreProvider>
  )
}
