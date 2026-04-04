import type { IChildrenProps } from '@/interfaces/children-props'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export function HeaderSlotPortal({
  slot = 'header-left',
  children,
}: IChildrenProps & {
  slot?: 'header-left' | 'header-right' | 'header-center'
}) {
  const [target, setTarget] = useState<HTMLElement | null>(null)

  useEffect(() => {
    setTarget(document.getElementById(slot))
  }, [slot])

  if (!target) {
    return null
  }

  return createPortal(children, target)
}

//font-semibold bg-blue-600 hover:bg-blue-600 text-white shadow-md rounded px-5 py-3 trans"
