import { type IChildrenProps } from '@interfaces/children-props'
import { nanoid } from '@lib/utils'

import { createContext, useReducer, type Dispatch } from 'react'

interface IBasicMessage {
  source: string
  target: string
  text: string
  value?: unknown
}

interface ISendMessage extends IBasicMessage {
  id?: string
}

export interface IMessage extends IBasicMessage {
  id: string
}

export type MessageAction =
  | {
      type: 'add'
      message: ISendMessage
    }
  | {
      type: 'set'
      message: ISendMessage
    }
  | {
      type: 'remove'
      id: string | string[]
    }
  | { type: 'clear' }

interface IMessagesState {
  queue: IMessage[]
}

const DEFAULT_PROPS: IMessagesState = {
  queue: [],
}

export function messagesReducer(
  state: IMessagesState,
  action: MessageAction
): IMessagesState {
  switch (action.type) {
    case 'add':
      return {
        ...state,
        queue: [
          ...state.queue,
          { ...action.message, id: action.message.id ?? nanoid() },
        ],
      }
    case 'set':
      return {
        ...state,
        queue: [{ ...action.message, id: action.message.id ?? nanoid() }],
      }
    case 'remove':
      const ids = new Set(action.id)
      return {
        ...state,
        queue: state.queue.filter((message) => ids.has(message.id)),
      }

    case 'clear':
      return { ...DEFAULT_PROPS }
    default:
      return state
  }
}

// const [DEFAULT_HISTORY, DEFAULT_HISTORY_DISPATCH] = useReducer(
//   historyReducer,
//   new HistoryState(0, DEFAULT_HISTORY_STEPS),
// )

export const MessageContext = createContext<{
  messageState: IMessagesState
  messageDispatch: Dispatch<MessageAction>
}>({ messageState: { ...DEFAULT_PROPS }, messageDispatch: () => {} })

export function MessagesProvider({ children }: IChildrenProps) {
  const [messageState, messageDispatch] = useReducer(messagesReducer, {
    ...DEFAULT_PROPS,
  })

  return (
    <MessageContext.Provider value={{ messageState, messageDispatch }}>
      {children}
    </MessageContext.Provider>
  )
}

export function messageFileFormat(message: IMessage, format: string = 'txt') {
  if (message.text.includes(':')) {
    format = message.text.split(':')[1]!
  }

  return format
}

export function messageTextFileFormat(
  message: IMessage,
  format: string = 'png'
) {
  return messageFileFormat(message, format)
}

export function messageImageFileFormat(
  message: IMessage,
  format: string = 'png'
) {
  return messageFileFormat(message, format)
}
