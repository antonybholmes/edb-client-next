import { makeUuid } from '@/lib/id'
import { useCallback } from 'react'
import { create } from 'zustand'

export const DEFAULT_MESSAGE_CHANNEL = 'global'

export type MessageType = 'info' | 'error' | 'warning' | 'success'

export interface IMessage {
  id: string
  time: number
  type?: MessageType
  source?: string
  target?: string
  data: any
}

interface IUserMessage extends Omit<IMessage, 'id' | 'time'> {}

const EMPTY_MESSAGE_ARRAY = Object.freeze([] as IMessage[])

const MAX_MESSAGES = 100

interface IMessageStore {
  messages: Record<string, IMessage[]>
  sendMessage: (channel: string, msg: IUserMessage) => void
  clearMessages: (channel: string) => void
  removeMessage: (channel: string, id: string) => void
}

export const useMessageStore = create<IMessageStore>((set) => ({
  messages: {},
  sendMessage: (channel, msg) =>
    set((state) => {
      const prev = state.messages[channel] ?? EMPTY_MESSAGE_ARRAY

      const next = [
        ...prev,
        { id: makeUuid(), time: Date.now(), ...msg },
      ].slice(-MAX_MESSAGES)

      return {
        messages: {
          ...state.messages,
          [channel]: next,
        },
      }
    }),
  clearMessages: (channel) =>
    set((state) => {
      if ((state.messages[channel] ?? EMPTY_MESSAGE_ARRAY).length === 0) {
        return state
      }

      return {
        messages: { ...state.messages, [channel]: [] },
      }
    }),
  removeMessage: (channel, id) =>
    set((state) => {
      const prev = state.messages[channel] ?? EMPTY_MESSAGE_ARRAY
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
    }),
}))

export function useMessages(channel: string = DEFAULT_MESSAGE_CHANNEL) {
  const messages =
    useMessageStore((state) => state.messages[channel]) ?? EMPTY_MESSAGE_ARRAY

  // 2️⃣ Subscribe to stable action references
  const sendMessage = useMessageStore((state) => state.sendMessage)
  const clearMessages = useMessageStore((state) => state.clearMessages)
  const removeMessage = useMessageStore((state) => state.removeMessage)

  const sendChannelMessage = useCallback(
    (message: IUserMessage) => sendMessage(channel, message),
    [channel, sendMessage]
  )

  const clearChannelMessages = useCallback(
    () => clearMessages(channel),
    [channel, clearMessages]
  )

  const removeChannelMessage = useCallback(
    (id: string) => removeMessage(channel, id),
    [channel, removeMessage]
  )

  return {
    messages,
    sendMessage: sendChannelMessage,
    clearMessages: clearChannelMessages,
    removeMessage: removeChannelMessage,
  }
}

export function messageFileFormat(message: IMessage, format: string = 'txt') {
  if (message.data.includes(':')) {
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
