import type { IDivProps } from '@interfaces/div-props'
import { createContext, useEffect, useState } from 'react'

export type ItemsChange = (label: string, items: string[]) => void

export interface IVennProvider {
  values: { label: string; items: string[] }
  setItems: ItemsChange
}

export const VennContext = createContext<IVennProvider>({
  values: { label: '', items: [] },
  setItems: () => {},
})

interface IProps extends IVennProvider, IDivProps {}

export function VennProvider({ values, setItems, children }: IProps) {
  const [_values, setValues] = useState<{ label: string; items: string[] }>({
    label: '',
    items: [],
  })

  useEffect(() => {
    setValues(values)
  }, [values])

  function _setItems(label: string, items: string[]) {
    setValues({ label, items })

    setItems?.(label, items)
  }

  return (
    <VennContext.Provider value={{ values: _values, setItems: _setItems }}>
      {children}
    </VennContext.Provider>
  )
}
