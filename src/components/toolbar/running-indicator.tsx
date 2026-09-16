import type { IChildrenProps } from '@/interfaces/children-props'
import { makeUuid } from '@/lib/id'
import { cn } from '@/lib/shadcn-utils'
import { useCallback } from 'react'
import { create } from 'zustand'
import { LoadingSpinner } from '../alerts/loading-spinner'
import { VCenterRow } from '../layout/v-center-row'

interface IMessage {
  id: string
  message: string
  time: number
}

interface IRunningStore {
  messages: Record<string, IMessage | null>
  setMessage: (id: string, message: string) => void
  clearMessage: (id: string) => void
}

const useRunningStore = create<IRunningStore>()((set) => ({
  messages: {},
  setMessage: (id, message) => {
    if (id === '') {
      return
    }

    set((state) => ({
      messages: {
        ...state.messages,
        [id]: { id: makeUuid(), message, time: Date.now() },
      },
    }))
  },
  clearMessage: (id) =>
    set((state) => {
      const newMessages = { ...state.messages }
      delete newMessages[id]
      return { messages: newMessages }
    }),
}))

export function useRunning(id: string) {
  const message = useRunningStore((state) => state.messages[id])
  const setMessage = useRunningStore((state) => state.setMessage)
  const clearMessage = useRunningStore((state) => state.clearMessage)

  const setMessageForId = useCallback(
    (message: string) => setMessage(id, message),
    [id, setMessage]
  )

  const clearMessageForId = useCallback(
    () => clearMessage(id),
    [id, clearMessage]
  )

  return {
    message,
    setMessage: setMessageForId,
    clearMessage: clearMessageForId,
  }
}

export function RunningIndicator({
  id,
  message,
  size = 'w-4',
  children,
  className,
}: IChildrenProps & {
  id?: string
  message?: string | null | undefined
  size?: string
}) {
  const { message: runningMessage } = useRunning(id ?? '')

  const _message = message ?? runningMessage?.message

  // if message is null or undefined or empty string, show children, else show spinner with message
  if (!_message) {
    return children
  }

  return (
    <VCenterRow className={cn('gap-x-1.5', className)}>
      <LoadingSpinner size={size} /> {_message}
    </VCenterRow>
  )
}
