import { TEXT_CONNECTION_ISSUE, TEXT_SERVER_ISSUE } from '@/lib/edb/edb'
import { InfoIcon } from '@components/icons/info-icon'
import { WarningIcon } from '@components/icons/warning-icon'
import { type IChildrenProps } from '@interfaces/children-props'
import { capitalizeSentence } from '@lib/text/text'
import { nanoid } from '@lib/utils'
import type { AxiosError } from 'axios'
import { createContext, useReducer, type Dispatch, type ReactNode } from 'react'

const ALERT_LIMIT = 100

type AlertType = 'default' | 'info' | 'error' | 'warning'
type AlertSize = 'popup' | 'dialog'

// export class Alert {
//   private _title: string
//   private _id: string
//   private _message: string
//   private _type: AlertType

//   constructor(title: string, message: string, type: AlertType) {
//     this._id = crypto.randomnanoid()
//     this._title = title
//     this._message = message
//     this._type = type
//   }

//   get id(): string {
//     return this._id
//   }

//   get title(): string {
//     return this._title
//   }

//   get message(): string {
//     return this._message
//   }

//   get type(): AlertType {
//     return this._type
//   }
// }

export interface IAlert {
  id: string
  title: string
  icon?: ReactNode
  content: ReactNode
  type: AlertType
  size: AlertSize
  //maxAge: number
  onClose?: () => void
}

interface IMakeAlertProps {
  id?: string
  icon?: ReactNode
  title?: string
  content?: ReactNode
  type?: AlertType
  size?: AlertSize
  //maxAge?: number
  onClose?: () => void
}

export function makeErrorAlert(props: IMakeAlertProps): IAlert {
  return makeAlert({
    //maxAge: -1,
    ...props,
    icon: <WarningIcon />,
    type: 'error',
  })
}

export function makeWarningAlert(props: IMakeAlertProps): IAlert {
  return makeAlert({
    //maxAge: -1,
    ...props,
    icon: <WarningIcon fill="fill-yellow-400" />,
    type: 'warning',
  })
}

export function makeInfoAlert(props: IMakeAlertProps): IAlert {
  return makeAlert({
    ...props,
    icon: <InfoIcon fill="stroke-emerald-500 fill-emerald-500" />,
    type: 'info',
  })
}

export function makeAlertFromAxiosError(error: AxiosError): IAlert {
  if (error.code === 'ERR_BAD_REQUEST') {
    return makeErrorAlertFromResp(
      (error.response!.data as { message: string }).message
    )
  }

  return makeErrorAlert({
    title: TEXT_CONNECTION_ISSUE,
    content: TEXT_SERVER_ISSUE,
  })
}

export function makeErrorAlertFromResp(message: string): IAlert {
  function parseMessage(message: string) {
    const tokens = message.split(':')

    if (tokens.length > 1) {
      return makeErrorAlert({
        title: capitalizeSentence(tokens[0]!),
        content: `${capitalizeSentence(tokens[1]!)}.`,
      })
    } else {
      return makeErrorAlert({
        title: capitalizeSentence(tokens[0]!),
      })
    }
  }

  switch (message) {
    case 'invalid name':
      return makeErrorAlert({
        title: capitalizeSentence(message),
        content:
          'Please enter a valid name. This is optional so it can be left blank.',
      })
    case 'invalid username':
      return makeErrorAlert({
        title: capitalizeSentence(message),
        content:
          'Please enter a valid username, which can also be an email address.',
      })
    case 'invalid email address':
      return makeErrorAlert({
        title: capitalizeSentence(message),
        content: 'Please enter a valid email address.',
      })
    case 'invalid password':
      return makeErrorAlert({
        title: capitalizeSentence(message),
        content: 'Your password can contain letters, numbers and @$!%*#?&.',
      })
    case 'passwords do not match':
      return makeErrorAlert({
        title: capitalizeSentence(message),
        content: 'Please check you have entered your password correctly.',
      })
    case 'user does not exist':
      return makeErrorAlert({
        title: capitalizeSentence(message),
        content:
          'Please check you have entered the correct username or email address.',
      })
    case 'invalid or expired jwt':
      return makeErrorAlert({
        title: 'Your reset link has expired',
      })
    default:
      return parseMessage(message)
  }
}

export function makeAlert(props: IMakeAlertProps): IAlert {
  return {
    id: nanoid(),
    title: '',
    content: '',
    type: 'default',
    size: 'popup',
    //maxAge: -1,
    ...props,
  }
}

export type IAlertAction =
  | {
      type: 'set'
      alert: IAlert
    }
  | {
      type: 'add'
      alert: IAlert
    }
  | { type: 'remove'; id: string }
  | { type: 'clear' }

interface AlertState {
  alerts: IAlert[]
  removeIds: Set<string>
}

export function alertReducer(
  state: AlertState,
  action: IAlertAction
): AlertState {
  switch (action.type) {
    case 'set':
      //console.log(action.alert)
      return {
        ...state,
        alerts: [action.alert],
      }
    case 'add':
      return {
        ...state,
        alerts: [action.alert, ...state.alerts].slice(0, ALERT_LIMIT),
      }
    case 'clear':
      return {
        ...state,
        alerts: [],
      }

    case 'remove':
      return {
        ...state,
        removeIds: new Set<string>([...state.removeIds, action.id]), // state.alerts.filter(alert => alert.id !== action.id),
      }
    default:
      return state
  }
}

// export function useAlerts(): [AlertState, Dispatch<IAlertAction>] {
//   const [state, toast] = useReducer(alertReducer, {
//     alerts: [],
//     removeIds: new Set<string>(),
//   })

//   return [state, toast]
// }

// const [DEFAULT_HISTORY, DEFAULT_HISTORY_DISPATCH] = useReducer(
//   historyReducer,
//   new HistoryState(0, DEFAULT_HISTORY_STEPS),
// )

export const AlertsContext = createContext<{
  alertState: AlertState
  toast: Dispatch<IAlertAction>
}>({
  alertState: { alerts: [], removeIds: new Set<string>() },
  toast: () => {},
})

export function AlertsProvider({ children }: IChildrenProps) {
  const [alertState, toast] = useReducer(alertReducer, {
    alerts: [],
    removeIds: new Set<string>(),
  })

  //const ids = useRef<Set<string>>(new Set())

  // useEffect(() => {
  //   for (const alert of state.alerts) {
  //     if (!ids.current.has(alert.id)) {
  //       setTimeout(() => {
  //         toast({ type: "remove", id: alert.id })
  //       }, 12000)
  //       ids.current.add(alert.id)
  //     }
  //   }

  // }, [state])

  return (
    <AlertsContext.Provider value={{ alertState, toast }}>
      {children}
    </AlertsContext.Provider>
  )
}
