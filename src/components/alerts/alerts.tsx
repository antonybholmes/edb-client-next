import { cn } from '@lib/class-names'
import { useContext } from 'react'

import { AlertsContext, type IAlert } from '@components/alerts/alerts-provider'
import { CloseIcon } from '../icons/close-icon'

import { BaseCol } from '@/components/layout/base-col'

import { Button } from '@components/shadcn/ui/themed/button'
import { motion } from 'motion/react'
import { AlertDialog } from './alert-dialog'

const ALERT_Z = 400

interface IAlertProps {
  ai: number
  alert: IAlert
  isTop: boolean
}

export function Alert({ ai, alert, isTop }: IAlertProps) {
  // const ref = useRef(null)

  // useEffect(() => {
  //   if (!ref.current) {
  //     return
  //   }

  //   if (alert.maxAge === -1) {
  //     return
  //   }

  //   gsap
  //     .timeline({ delay: 0 })
  //     .from(
  //       ref.current,
  //       {
  //         duration: 0.5,
  //         opacity: 0,
  //         ease: "power3.out",
  //       },
  //       0,
  //     )
  //     .from(
  //       ref.current,
  //       {
  //         duration: 1,
  //         y: -10,

  //         ease: "power3.out",
  //       },
  //       0,
  //     )
  //   //.from(
  //   //   ref.current,
  //   //   {
  //   //     duration: 0.5,
  //   //     scale:0.95,

  //   //     ease: "power3.out",
  //   //   },
  //   //   0,
  //   // )

  //   gsap
  //     .timeline({ delay: alert.maxAge })
  //     .to(
  //       ref.current,
  //       {
  //         duration: 0.5,
  //         opacity: 0,
  //         ease: "power3.out",
  //       },
  //       0,
  //     )
  //     .to(
  //       ref.current,
  //       {
  //         duration: 1,
  //         y: -10,
  //         ease: "power3.out",
  //       },
  //       0,
  //     )
  //   // .to(
  //   //   ref.current,
  //   //   {
  //   //     duration: 0.5,
  //   //     scale: 0.95,
  //   //     ease: "power3.out",
  //   //   },
  //   //   0,
  //   // )

  //   // auto remove (add a 2 second buffer to allow for animations)
  //   setTimeout(
  //     () => {
  //       toast({ type: "remove", id: alert.id })
  //     },
  //     (alert.maxAge + ANIMATION_BUFFER_S) * 1000,
  //   )
  // }, [ref])

  //let indicator: ReactNode = null

  //let icon: ReactNode = null

  let border = ''

  switch (alert.type) {
    case 'info':
      //indicator = <span className="grow shrink-0 h-full w-1 bg-emerald-500 border" />
      border = 'border-l-[6px] border-l-emerald-500 bg-white'
      //icon = <InfoIcon fill="stroke-emerald-500 fill-emerald-500" />
      break
    case 'error':
      //indicator = <span className="grow shrink-0 h-8 w-1 bg-red-500" />
      //icon = <WarningIcon />
      border = 'border-l-[6px] border-l-red-500 bg-white'
      break
    case 'warning':
      //indicator = <span className="grow shrink-0 h-full w-1 bg-yellow-500" />
      //icon = <WarningIcon fill="fill-yellow-400" />
      border = 'border-l-[6px] border-l-yellow-500 bg-white'
      break
    default:
      border = 'border-l-[6px] border-l-blue-400  bg-white'

      break
  }

  return (
    <motion.div
      className={cn(
        'flex flex-row items-center group fixed min-w-120 px-4 gap-x-4 rounded-theme p-4 text-xs left-1/2 top-4',

        border,
        [isTop, 'shadow-box2']
      )}
      style={{ zIndex: ALERT_Z + ai }}
      initial={{
        opacity: 0,
        //top: "1rem",
        //x: "calc(50vw - 1rem)",
        transform: 'translateX(-48%)',
        //transformOrigin: "bottom center",
      }}
      animate={{
        opacity: 1,
        //x: "50vw",
        //top: "1rem",
        transform: 'translateX(-50%)',
        //transformOrigin: "bottom center",
      }}
      exit={{
        opacity: 0,
        //x: "calc(50vw - 1rem)",
        //top: "1rem",
        transform: 'translateX(-50%) scale(0.95)',
        //transformOrigin: "center",
      }}
      transition={{
        //ease: "easeInOut",
        //type: 'spring',
        //duration: 0.8,
        // opacity: {
        //   delay: 0.1,
        //   //duration: 0.4
        // }
        opacity: { duration: 0.4 },
        transform: { duration: 0.2 },
      }}
    >
      {alert.icon && alert.icon}

      <BaseCol className="grow gap-y-1">
        <h1 className="font-semibold">{alert.title}</h1>
        <span>{alert.content}</span>
        {/* <span>{alert.id}</span> */}
      </BaseCol>

      <Button
        variant="muted"
        size="icon-sm"
        rounded="full"
        pad="none"
        onClick={() => {
          if (alert.onClose) {
            alert.onClose()
          }

          //alerts({ type: 'remove', id: alert.id })
        }}
        //className="-mt-2 -mr-2"
        ripple={false}
      >
        <CloseIcon w="w-2.5" />
      </Button>
    </motion.div>
  )
}

export function Alerts() {
  const { alertState } = useContext(AlertsContext)

  //console.log(state.alerts)

  // const alerts = alertState.alerts
  //   .toReversed()
  //   .filter(
  //     alert => alert.size === 'popup' && !alertState.removeIds.has(alert.id)
  //   )

  return (
    <>
      {alertState.alerts
        .toReversed()
        .filter(alert => alert.size === 'dialog')
        .map(alert => {
          return <AlertDialog alert={alert} key={alert.id} />
        })}

      {/* <AnimatePresence>
        {alerts.map((alert, ai) => {
 
          return (
            <Alert
              ai={ai}
              alert={alert}
              isTop={ai == alerts.length - 1}
              key={alert.id}
            />
          )
        })}
      </AnimatePresence> */}
    </>
  )
}
