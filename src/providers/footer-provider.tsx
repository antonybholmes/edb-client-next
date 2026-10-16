import { FooterDFSize } from '@/components/pages/apps/matcalc/data/footer-df-size'
import { ITab } from '@/components/tabs/tab-provider'
import { RunningIndicator } from '@/components/toolbar/running-indicator'
import { IChildrenProps } from '@/interfaces/children-props'
import { makeUuid } from '@/lib/id'
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'

type FooterContextValue = {
  left: ITab | undefined
  center: ITab | undefined
  right: ITab | undefined
  add: (entry: ITab, opts?: { slot?: FooterSlot }) => void
  remove: (id: string, opt?: { slot?: FooterSlot }) => void
  set: (entry: ITab, opts?: { slot?: FooterSlot }) => void
  /**
   * Adds a running indicator to the left slot of the footer.
   * The indicator displays a message (default: 'Running...') and returns a unique ID.
   * This ID can be used to remove the indicator later.
   */
  addIndicator: (message?: string, opts?: { slot?: FooterSlot }) => string
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
      left: stack.left.at(-1) ?? defaults.left,
      center: stack.center.at(-1) ?? defaults.center,
      right: stack.right.at(-1) ?? defaults.right,
    }
  }, [stack, defaults])

  const set = useCallback((entry: ITab, opts: { slot?: FooterSlot } = {}) => {
    const { slot = 'left' } = opts

    setDefaults((prev) => ({
      ...prev,
      [slot]: entry,
    }))
  }, [])

  const add = useCallback((entry: ITab, opts: { slot?: FooterSlot } = {}) => {
    const { slot = 'left' } = opts

    setStack((prev) => ({
      ...prev,
      [slot]: [...prev[slot], entry],
    }))
  }, [])

  const remove = useCallback((id: string, opts: { slot?: FooterSlot } = {}) => {
    const { slot = 'left' } = opts

    setStack((prev) => ({
      ...prev,
      [slot]: prev[slot].filter((e) => e.id !== id),
    }))
  }, [])

  const addIndicator = useCallback(
    (
      message: string = 'Running...',
      opts: { slot?: FooterSlot } = { slot: 'left' }
    ) => {
      const { slot = 'left' } = opts

      const id = makeUuid()

      add({ id, render: <RunningIndicator message={message} /> }, { slot })

      return id
    },
    []
  )

  const addDFSize = useCallback(() => {
    const id = makeUuid()

    add({ id, component: FooterDFSize }, { slot: 'left' })

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
