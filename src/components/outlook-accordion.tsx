import type { IChildrenProps } from '@/interfaces/children-props'
import type { IDivProps } from '@/interfaces/div-props'
import { gsap } from 'gsap'
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { BaseCol } from './layout/base-col'

interface IOutlookAccordionContext {
  id: string
  onTabChange: (id: string) => void
}

export const OutlookAccordionContext = createContext<IOutlookAccordionContext>({
  id: '',
  onTabChange: () => {},
})

interface IOutlookAccordionProvider
  extends IChildrenProps, IOutlookAccordionContext {}

export function OutlookAccordionProvider({
  id,
  onTabChange,
  children,
}: IOutlookAccordionProvider) {
  const [_id, setId] = useState(id)

  function _onTabChange(id: string) {
    setId(id)

    onTabChange?.(id)
  }

  const v = id ?? _id

  return (
    <OutlookAccordionContext.Provider
      value={{ id: v, onTabChange: _onTabChange }}
    >
      {children}
    </OutlookAccordionContext.Provider>
  )
}

interface IOutlookAccordionProps extends IDivProps {
  id: string
}

export function OutlookAccordion({ id, children }: IOutlookAccordionProps) {
  const [_id, setId] = useState(id)

  function onTabChange(id: string) {
    setId(id)
  }

  return (
    <OutlookAccordionProvider id={_id} onTabChange={onTabChange}>
      <BaseCol className="grow border border-blue-400">{children}</BaseCol>
    </OutlookAccordionProvider>
  )
}

interface IOutlookAccordionItemContext extends IChildrenProps {
  id: string
}

export const OutlookAccordionItemContext =
  createContext<IOutlookAccordionItemContext>({
    id: '',
  })

export function OutlookAccordionItemProvider({
  id,
  children,
}: IOutlookAccordionItemContext) {
  return (
    <OutlookAccordionItemContext.Provider value={{ id }}>
      {children}
    </OutlookAccordionItemContext.Provider>
  )
}

interface IOutlookAccordionItemProps extends IDivProps {
  id: string
}

export function OutlookAccordionItem({
  id,
  children,
}: IOutlookAccordionItemProps) {
  return (
    <OutlookAccordionItemProvider id={id}>
      {children}
    </OutlookAccordionItemProvider>
  )
}

export function OutlookAccordionTrigger({ children }: IDivProps) {
  const { id } = useContext(OutlookAccordionItemContext)
  const { id: selectedId, onTabChange } = useContext(OutlookAccordionContext)

  return (
    <button
      id={id}
      className="flex flex-row items-center w-full text-xs font-semibold px-1 shrink-0 h-7 cursor-pointer border-t border-b border-border/50 hover:bg-muted/50 data-[state=open]:bg-muted/50"
      data-state={id === selectedId ? 'open' : 'closed'}
      onClick={() => {
        onTabChange(id)
      }}
    >
      {children}
    </button>
  )
}

export function OutlookAccordionContent({ children }: IDivProps) {
  const { id } = useContext(OutlookAccordionItemContext)
  const { id: selectedId } = useContext(OutlookAccordionContext)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) {
      return
    }

    gsap.to(ref.current, {
      flex: id === selectedId ? 1 : 0,
      //opacity: id === selectedId ? 1 : 0,
      duration: 0.3,
      ease: 'power3.inOut',
    })

    //console.log('selectedId', selectedId, id)
  }, [selectedId, id, ref.current])

  return (
    <BaseCol ref={ref} className="flex-0 overflow-hidden">
      {children}
    </BaseCol>
  )
}
