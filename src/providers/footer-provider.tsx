import { FooterDFSize } from '@/components/pages/apps/matcalc/data/footer-df-size'
import { ITab } from '@/components/tabs/tab-provider'
import { RunningIndicator } from '@/components/toolbar/running-indicator'
import { IChildrenProps } from '@/interfaces/children-props'
import { makeUuid } from '@/lib/id'
import {
  ComponentType,
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'

type FooterContextValue = {
  left: ComponentType<{}> | ReactNode | undefined
  center: ComponentType<{}> | ReactNode | undefined
  right: ComponentType<{}> | ReactNode | undefined
  add: (slot: FooterSlot, entry: ITab) => void
  remove: (slot: FooterSlot, id: string) => void
  set: (slot: FooterSlot, entry: ITab) => void
  /**
   * Adds a running indicator to the left slot of the footer.
   * The indicator displays a message (default: 'Running...') and returns a unique ID.
   * This ID can be used to remove the indicator later.
   */
  addIndicator: (message?: string) => string
  addDFSize: () => string
}

type FooterSlot = 'left' | 'right' | 'center'

const FooterContext = createContext<FooterContextValue | null>(null)

export function useFooter() {
  const ctx = useContext(FooterContext)

  if (!ctx) {
    throw new Error('useFooter must be used within a FooterProvider')
  }

  return ctx
}

export function FooterProvider({ children }: IChildrenProps) {
  const [stack, setStack] = useState<Record<FooterSlot, ITab[]>>({
    left: [],
    right: [],
    center: [],
  })

  const [defaults, setDefaults] = useState<
    Record<FooterSlot, ITab | undefined>
  >({
    left: undefined,
    right: undefined,
    center: undefined,
  })

  const { left, center, right } = useMemo(() => {
    return {
      left: stack.left.at(-1)?.component ?? defaults.left?.component,
      center: stack.center.at(-1)?.component ?? defaults.center?.component,
      right: stack.right.at(-1)?.component ?? defaults.right?.component,
    }
  }, [stack, defaults])

  const set = useCallback((slot: FooterSlot, entry: ITab) => {
    setDefaults((prev) => ({
      ...prev,
      [slot]: entry,
    }))
  }, [])

  const add = useCallback((slot: FooterSlot, entry: ITab) => {
    setStack((prev) => ({
      ...prev,
      [slot]: [...prev[slot], entry],
    }))
  }, [])

  const remove = useCallback((slot: FooterSlot, id: string) => {
    setStack((prev) => ({
      ...prev,
      [slot]: prev[slot].filter((e) => e.id !== id),
    }))
  }, [])

  const addIndicator = useCallback((message: string = 'Running...') => {
    const id = makeUuid()

    add('left', { id, component: <RunningIndicator message={message} /> })

    return id
  }, [])

  const addDFSize = useCallback(() => {
    const id = makeUuid()

    add('left', { id, component: FooterDFSize })

    return id
  }, [])

  return (
    <FooterContext.Provider
      value={{ left, center, right, add, remove, set, addIndicator, addDFSize }}
    >
      {children}
    </FooterContext.Provider>
  )
}
