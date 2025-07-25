import { cn } from '@lib/shadcn-utils'
import { Button, type IButtonProps } from '@themed/button'

import type { IModuleInfo } from '@/lib/module-info'
import { formatString } from '@lib/text/format-string'
import { format } from 'date-fns'
import { useState } from 'react'
import { BasicAlertDialog } from '../dialog/basic-alert-dialog'

export function ModuleInfoButton({
  ref,
  info,
  className,
  children,
  ...props
}: IButtonProps & { info: IModuleInfo }) {
  //const [hover, setHover] = useState(false)
  //const [down, setDown] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)

  return (
    <>
      {modalVisible && (
        <BasicAlertDialog
          title={`About ${info.name}`}
          open={modalVisible}
          onOpenChange={setModalVisible}
          onResponse={() => setModalVisible(false)}
          //className="w-3/4 md:w-1/2 lg:w-1/3 xl:w-1/4"
          //bodyCls="gap-y-4 text-xs"
          // contentVariant="glass"
          bodyCls="gap-y-1"
        >
          {info.description && (
            <p className="font-medium">{info.description}</p>
          )}

          <p>
            v{info.version} ({format(info.modified, 'MMM dd, yyyy')})
          </p>
          <p>{formatString(info.copyright)}</p>
        </BasicAlertDialog>
      )}

      <Button
        ref={ref}
        variant="muted"
        rounded="none"
        ripple={false}
        className={cn(
          'hidden md:flex h-header gap-x-2 text-sm font-semibold truncate shrink-0 px-3',
          className
        )}
        onClick={() => setModalVisible(true)}
        {...props}
      >
        {info.name}
      </Button>
    </>
  )
}
