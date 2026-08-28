import { IChildrenProps } from '@/interfaces/children-props'
import { ILim } from '@/lib/math/math'
import { createContext, useState } from 'react'

export interface IAxisContext {
  lim: ILim | undefined
  range: ILim | undefined
  domain: ILim | undefined
  setLim: (lim: ILim) => void
  setRange: (range: ILim) => void
  setDomain: (domain: ILim) => void
}

export const AxisContext = createContext<IAxisContext>({
  lim: [0, 1],
  range: [0, 100],
  domain: [0, 500],
  setLim: () => {},
  setRange: () => {},
  setDomain: () => {},
})

interface IProps extends IChildrenProps {}

export function AxisProvider({ children }: IProps) {
  const [lim, setLim] = useState<ILim | undefined>(undefined)
  const [range, setRange] = useState<ILim | undefined>(undefined)
  const [domain, setDomain] = useState<ILim | undefined>(undefined)

  return (
    <AxisContext.Provider
      value={{
        lim,
        range,
        domain,
        setLim,
        setRange,
        setDomain,
      }}
    >
      {children}
    </AxisContext.Provider>
  )
}
