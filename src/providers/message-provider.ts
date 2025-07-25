interface IMessage {
  id: string
  time: number
  source: string
  target: string
  text: string
}

import { nanoid } from '@/lib/utils'
import { create } from 'zustand'

interface IMessageBusStore {
  messages: IMessage[]
  sendMessage: (msg: Omit<IMessage, 'id' | 'time'>) => void
  clearMessages: () => void
  removeMessage: (id: string) => void
}

export const useMessageBusStore = create<IMessageBusStore>(set => ({
  messages: [],
  sendMessage: msg =>
    set(state => ({
      messages: [...state.messages, { id: nanoid(), time: Date.now(), ...msg }],
    })),
  clearMessages: () => set({ messages: [] }),
  removeMessage: id =>
    set(state => ({
      messages: state.messages.filter(msg => msg.id !== id),
    })),
}))

export function useMessages() {
  const messages = useMessageBusStore(state => state.messages)
  const sendMessage = useMessageBusStore(state => state.sendMessage)
  const clearMessages = useMessageBusStore(state => state.clearMessages)
  const removeMessage = useMessageBusStore(state => state.removeMessage)

  return {
    messages,
    sendMessage,
    clearMessages,
    removeMessage,
  }
}

export function messageFileFormat(message: IMessage, format: string = 'txt') {
  if (message.text.includes(':')) {
    format = message.text.split(':')[1]!
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

// interface IGlobalState {
//   messages: IMessage[]
//   listeners: Array<(messages: IMessage[]) => void>
// }

// const globalState: IGlobalState = {
//   messages: [],
//   listeners: [],
// }

// export function messageDispatch(message: Omit<IMessage, 'id' | 'time'>) {
//   const m: IMessage = { id: nanoid(), time: Date.now(), ...message }
//   // we need to change the ref each time with a new array to get react
//   // to notice the difference and trigger re-render
//   globalState.messages = [...globalState.messages, m]

//   globalState.listeners.forEach(listener => {
//     listener(globalState.messages)
//   })
// }

// export function addListener(listener: (messages: IMessage[]) => void) {
//   globalState.listeners.push(listener)
//   // Return a function to remove the listener
//   return () => {
//     globalState.listeners = globalState.listeners.filter(l => l !== listener)
//   }
// }

// export function removeMessage(id: string) {
//   globalState.messages = globalState.messages.filter(m => m.id !== id)

//   globalState.listeners.forEach(listener => {
//     listener(globalState.messages)
//   })
// }

// export function useMessages(): {
//   messageState: IMessage[]
//   messageDispatch: (message: Omit<IMessage, 'id' | 'time'>) => void
//   removeMessage: (id: string) => void
// } {
//   const [messages, setMessages] = useState<IMessage[]>([])

//   useEffect(() => {
//     // Add this component as a listener to the global state
//     const removeListener = addListener((messages: IMessage[]) => {
//       //console.log(id, messages)

//       // By using the spread operator ([...]), you're ensuring that you're not mutating
//       // the original array (newMessages). Instead, you're creating a new array. This
//       // new array has a new reference, and React can detect that the state has changed.
//       setMessages(messages)
//     })

//     // Clean up the listener when the component is unmounted
//     return () => {
//       removeListener()
//     }
//   }, [])

//   return {
//     messageState: messages,
//     messageDispatch,
//     removeMessage,
//   }
// }
