import { makeUuid } from '@/lib/id'
import { useCallback, useEffect, useState } from 'react'

export const DEFAULT_MESSAGE_CHANNEL = 'global'

export type MessageType = 'info' | 'error' | 'warning' | 'success'

export interface IMessage {
  id: string
  time: number
  type: MessageType
  source?: string
  target?: string
  data: unknown
}

const MAX_MESSAGES = 100

type Listener = (messages: IMessage[]) => void

const state: Record<string, IMessage[]> = {}
const listeners: Record<string, Set<Listener>> = {}

function emit(channel: string) {
  const msgs = state[channel] ?? []
  listeners[channel]?.forEach(l => l(msgs))
}

export function sendMessage(
  channel: string,
  msg: Omit<IMessage, 'id' | 'time'>
) {
  const next = [
    ...(state[channel] ?? []),
    {
      id: makeUuid(),
      time: Date.now(),
      ...msg,
    },
  ].slice(-MAX_MESSAGES)

  state[channel] = next
  emit(channel)
}

export function clearMessages(channel: string) {
  state[channel] = []
  emit(channel)
}

export function removeMessage(channel: string, id: string) {
  const prev = state[channel] ?? []
  const next = prev.filter(m => m.id !== id)

  // no change don't emit
  if (prev.length === next.length) {
    return
  }

  state[channel] = next
  emit(channel)
}

export function removeMessages(channel: string, ids: string[]) {
  const prev = state[channel] ?? []
  const idSet = new Set(ids)
  const next = prev.filter(m => !idSet.has(m.id))

  // no change don't emit
  if (prev.length === next.length) {
    return
  }

  state[channel] = next
  emit(channel)
}

/**
 * Listen for messages on a channel. Returns an unsubscribe
 * function.
 *
 * @param channel   a channel name to listen for messages on
 * @param listener  a callback that will be called with the current messages for the channel whenever they change
 * @returns         a function that can be called to unsubscribe the listener
 */
export function subscribeMessages(
  channel: string,
  listener: Listener
): () => void {
  if (!listeners[channel]) {
    listeners[channel] = new Set()
  }

  listeners[channel].add(listener)

  // initial emit
  listener(state[channel] ?? [])

  return () => {
    listeners[channel]!.delete(listener)
  }
}

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
  const [messages, setMessages] = useState<IMessage[]>([])

  useEffect(() => {
    return subscribeMessages(channel, setMessages)
  }, [channel])

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
