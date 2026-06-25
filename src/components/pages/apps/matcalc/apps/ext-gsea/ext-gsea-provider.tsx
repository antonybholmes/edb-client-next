import { createContext, useContext, type ReactNode } from 'react'

import { ExtGseaPlot } from '../../history/history-provider/history-types'
import { IExtGseaDisplayOptions } from './ext-gsea-store'

export interface ExtGseaPropsContextType {
  displayProps: IExtGseaDisplayOptions
  plot: ExtGseaPlot
}

export const ExtGseaContext = createContext<
  ExtGseaPropsContextType | undefined
>(undefined)

export function useExtGseaContext() {
  const ctx = useContext(ExtGseaContext)

  if (!ctx)
    throw new Error(
      'useExtGseaContext must be used within a ExtGseaContext.Provider'
    )
  return ctx
}

export function ExtGseaProvider({
  plot,
  children,
}: {
  plot: ExtGseaPlot
  children: ReactNode
}) {
  return (
    <ExtGseaContext.Provider value={{ displayProps: plot.props, plot }}>
      {children}
    </ExtGseaContext.Provider>
  )
}
