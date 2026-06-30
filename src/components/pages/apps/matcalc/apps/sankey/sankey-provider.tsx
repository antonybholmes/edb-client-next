import { IStrokeProps } from '@/components/plot/svg-props'
import { createContext, useContext, type ReactNode } from 'react'
import { SankeyPlot } from '../../history/history-provider/history-types'

export interface ISankeyDisplayOptions    {
  border: IStrokeProps
  logP: {
    show: boolean
    threshold: number
    line: {
      show: boolean
      color: string
      dash: number
    }
    neg: {
      color: string
    }
    pos: {
      color: string
    }
  }
  logFc: {
    show: boolean
    threshold: number

    neg: {
      color: string
    }
    pos: {
      color: string
    }
  }
  scale: number
}

export interface SankeyPropsContextType {
  displayProps: ISankeyDisplayOptions
  plot: SankeyPlot
}

export const SankeyContext = createContext<
  SankeyPropsContextType | undefined
>(undefined)

export function useSankeyContext() {
  const ctx = useContext(SankeyContext)

  if (!ctx) {
    throw new Error(
      'useSankeyContext must be used within a SankeyContext.Provider'
    )
  }

  return ctx
}

export function SankeyProvider({
  plot,
  children,
}: {
  plot: SankeyPlot
  children: ReactNode
}) {
  return (
    <SankeyContext.Provider value={{ displayProps: plot.props, plot }}>
      {children}
    </SankeyContext.Provider>
  )
}
