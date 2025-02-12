import { TRANS_COLOR_CLS } from '@/theme'
import type { IChildrenProps } from '@interfaces/children-props'
import { cn } from '@lib/class-names'
import { useEffect, useState } from 'react'
import { CloseIcon } from '../icons/close-icon'
import { HCenterRow } from '../layout/h-center-row'
import { VCenterRow } from '../layout/v-center-row'

export type AlertType = 'info' | 'error'

export interface IAlert {
  message: string
  type: AlertType
}

interface IProps extends IChildrenProps {
  message: IAlert
}

export function AlertBanner({ message }: IProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(true)
  }, [message])

  const color =
    message.type === 'info'
      ? 'bg-emerald-500/30 border-emerald-500/50'
      : 'border-red-400/50 bg-red-400/30'

  return (
    <HCenterRow className="p-2">
      <div
        className={cn(
          'trans-300 grid h-10 grid-cols-4 items-center justify-between rounded-lg border px-3 text-sm font-bold text-white transition-all',

          color,
          [visible && message.message !== '', 'opacity-100', 'opacity-0']
        )}
      >
        <div></div>
        <HCenterRow className="col-span-2 items-center">
          {message.message}
        </HCenterRow>
        <VCenterRow className="justify-end">
          <button onClick={() => setVisible(false)}>
            <CloseIcon
              className={cn('fill-white/70 hover:fill-white', TRANS_COLOR_CLS)}
            />
          </button>
        </VCenterRow>
      </div>
    </HCenterRow>
  )
}
