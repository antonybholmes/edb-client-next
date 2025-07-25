// Inspired by react-hot-toast library

import { nanoid } from 'nanoid'
import { useEffect, useState } from 'react'
import type { IToast } from './toast'

const TOAST_LIMIT = 3
const TOAST_REMOVE_DELAY_MS = 60000

// const actionTypes = {
//   ADD_TOAST: 'ADD_TOAST',
//   UPDATE_TOAST: 'UPDATE_TOAST',
//   DISMISS_TOAST: 'DISMISS_TOAST',
//   REMOVE_TOAST: 'REMOVE_TOAST',
// }

//let count = 0

function genId() {
  //count = (count + 1) % Number.MAX_SAFE_INTEGER
  //return count.toString()

  return nanoid()
}

//type ActionType = typeof actionTypes

type Action =
  | {
      type: 'ADD_TOAST'
      toast: IToast
    }
  | {
      type: 'UPDATE_TOAST'
      toast: Partial<IToast>
    }
  | {
      type: 'DISMISS_TOAST'
      toastId?: IToast['id'] | undefined
    }
  | {
      type: 'REMOVE_TOAST'
      toastId?: IToast['id'] | undefined
    }

interface State {
  toasts: IToast[]
}

const toastTimeouts = new Map<string | number, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string | number) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: 'REMOVE_TOAST',
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY_MS)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case 'UPDATE_TOAST':
      return {
        ...state,
        toasts: state.toasts.map(t =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case 'DISMISS_TOAST': {
      const { toastId } = action

      // ! Side effects ! - This could be extracted into a dismissToast() action,
      // but I'll keep it here for simplicity
      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach(toast => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map(t =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
              }
            : t
        ),
      }
    }
    case 'REMOVE_TOAST':
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter(t => t.id !== action.toastId),
      }
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

export function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach(listener => {
    listener(memoryState)
  })
}

type Toast = Omit<IToast, 'id'>

function toast({ ...props }: Toast) {
  const id = genId()

  const update = (props: IToast) =>
    dispatch({
      type: 'UPDATE_TOAST',
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: 'DISMISS_TOAST', toastId: id })

  dispatch({
    type: 'ADD_TOAST',
    toast: {
      ...props,
      id,
    },
  })

  return {
    id,
    dismiss,
    update,
  }
}

function useToast() {
  const [state, setState] = useState<State>(memoryState)

  useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, []) // why does it use [state] in the original?

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: 'DISMISS_TOAST', toastId }),
  }
}

export { toast, useToast }
