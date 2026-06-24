import { RunningIndicator } from '@/components/toolbar/running-indicator'
import { IChildrenProps } from '@/interfaces/children-props'
import { makeUuid } from '@/lib/id'
import {
  ComponentType,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'

type FooterEntry = {
  id: string
  component: ComponentType<{}>
}

type FooterContextValue = {
  left: ComponentType<{}> | undefined
  center: ComponentType<{}> | undefined
  right: ComponentType<{}> | undefined
  add: (slot: FooterSlot, entry: FooterEntry) => void
  remove: (slot: FooterSlot, id: string) => void
  set: (slot: FooterSlot, entry: FooterEntry) => void
  addIndicator: (message?: string) => string
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
  const [stack, setStack] = useState<Record<FooterSlot, FooterEntry[]>>({
    left: [],
    right: [],
    center: [],
  })

  const [defaults, setDefaults] = useState<
    Record<FooterSlot, FooterEntry | undefined>
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

  const set = useCallback((slot: FooterSlot, entry: FooterEntry) => {
    setDefaults((prev) => ({
      ...prev,
      [slot]: entry,
    }))
  }, [])

  const add = useCallback((slot: FooterSlot, entry: FooterEntry) => {
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

    add('left', { id, component: () => <RunningIndicator message={message} /> })

    return id
  }, [])

  return (
    <FooterContext.Provider
      value={{ left, center, right, add, remove, set, addIndicator }}
    >
      {children}
    </FooterContext.Provider>
  )
}
