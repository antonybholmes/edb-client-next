import { makeUuid } from '@/lib/id'
import { useCallback } from 'react'
import { create } from 'zustand'

export const DEFAULT_MESSAGE_CHANNEL = 'global'

export type MessageType = 'info' | 'error' | 'warning' | 'success'

export interface IMessage<T = unknown> {
  id: string
  time: number
  type: MessageType
  source?: string
  target?: string
  data?: T
}

const MAX_MESSAGES = 100
const EMPTY_MESSAGES: IMessage[] = []

interface IMessageStore {
  messages: Record<string, IMessage[]>
  sendMessage: (channel: string, msg: Omit<IMessage, 'id' | 'time'>) => void
  clearMessages: (channel: string) => void
  removeMessage: (channel: string, id: string) => void
  removeMessages: (channel: string, ids: string[]) => void
}

export const useMessageStore = create<IMessageStore>()((set) => ({
  messages: {},

  sendMessage: (channel, msg) => {
    set((state) => {
      const next = [
        ...(state.messages[channel] ?? []),
        {
          id: makeUuid(),
          time: Date.now(),
          ...msg,
        },
      ].slice(-MAX_MESSAGES)

      return {
        messages: {
          ...state.messages,
          [channel]: next,
        },
      }
    })
  },

  clearMessages: (channel) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [channel]: [],
      },
    }))
  },

  removeMessage: (channel, id) => {
    set((state) => {
      const prev = state.messages[channel] ?? []
      const next = prev.filter((m) => m.id !== id)

      if (prev.length === next.length) {
        return state
      }

      return {
        messages: {
          ...state.messages,
          [channel]: next,
        },
      }
    })
  },

  removeMessages: (channel, ids) => {
    set((state) => {
      const prev = state.messages[channel] ?? []
      const idSet = new Set(ids)
      const next = prev.filter((m) => !idSet.has(m.id))

      if (prev.length === next.length) {
        return state
      }

      return {
        messages: {
          ...state.messages,
          [channel]: next,
        },
      }
    })
  },
}))

export function messageFileFormat(message: IMessage, format: string = 'txt') {
  if (typeof message.data === 'string' && message.data.includes(':')) {
    format = message.data.split(':')[1]!
  }

  return format
}

export function messageTextFileFormat(
  message: IMessage,
  format: string = 'txt'
) {
  return messageFileFormat(message, format)
}

export function messageImageFileFormat(
  message: IMessage,
  format: string = 'png'
) {
  return messageFileFormat(message, format)
}

export function useMessages(channel = DEFAULT_MESSAGE_CHANNEL) {
  const messages = useMessageStore(
    (state) => state.messages[channel] ?? EMPTY_MESSAGES
  )
  const sendMessage = useMessageStore((state) => state.sendMessage)
  const clearMessages = useMessageStore((state) => state.clearMessages)
  const removeMessage = useMessageStore((state) => state.removeMessage)
  const removeMessages = useMessageStore((state) => state.removeMessages)

  const _sendMessage = useCallback(
    (msg: Omit<IMessage, 'id' | 'time'>) => sendMessage(channel, msg),
    [channel]
  )

  const _clearMessages = useCallback(() => {
    clearMessages(channel)
  }, [channel])

  const _removeMessage = useCallback(
    (id: string) => {
      removeMessage(channel, id)
    },
    [channel]
  )

  const _removeMessages = useCallback(
    (ids: string[]) => {
      removeMessages(channel, ids)
    },
    [channel]
  )

  return {
    messages,
    sendMessage: _sendMessage,
    clearMessages: _clearMessages,
    removeMessage: _removeMessage,
    removeMessages: _removeMessages,
  }
}
