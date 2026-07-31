import { IS_DEV_MODE, TEXT_CANCEL, TEXT_OK } from '@/consts'
import { OKCancelDialog, type IModalProps } from '@/dialogs/ok-cancel-dialog'
import { Input } from '@/themed/v2/input'
import { useEffect, useState } from 'react'

import {
  ActionDialogCard,
  ActionDialogCardContent,
  ActionDialogRow,
} from '@/components/dialogs/card/action-dialog-card'
import { FillButton } from '@/components/plot/fill-dropdown-menu'
import { DialogTitle } from '@/components/shadcn/ui/themed/v2/dialog'

import { IHub } from './hub-store'

export interface IProps extends IModalProps<IHub> {
  hub: IHub
}

export function HubDialog({ hub, onResponse }: IProps) {
  const [name, setName] = useState('')

  const [color, setColor] = useState('#6495ED') //`#${Math.floor(Math.random() * 16777215).toString(16)}`,

  useEffect(() => {
    // if group provided, set defaults

    setName(hub.name)

    if (hub.color.match(/#[0-9a-fA-F]+/)) {
      setColor(hub.color)
    }
  }, [hub])

  function makeHub() {
    const newHub = {
      ...hub,
      name,
      color,
    }

    // return modified hub
    onResponse?.(TEXT_OK, newHub)
  }

  return (
    <OKCancelDialog
      title={
        <DialogTitle style={{ color }}>
          {name.length > 0 ? `Edit ${name} Hub` : 'New hub'}
        </DialogTitle>
      }
      onResponse={(r) => {
        console.log('HubDialog onResponse', r, name, color)
        if (r === TEXT_CANCEL) {
          onResponse?.(r, undefined)
        } else {
          makeHub()
        }
      }}
      showClose={true}

      leftFooterChildren={
        IS_DEV_MODE ? (
          <span className="text-foreground/50">{hub.id}</span>
        ) : undefined
      }
      leftHeaderChildren={
        <FillButton
          colors={[
            {
              color,
              allowNoColor: false,
              onColorChange: ({ color }) => setColor(color),
            },
          ]}
        />
      }
      bodyCls="gap-y-2"
    >
      <ActionDialogCard>
        <ActionDialogCardContent>
          <ActionDialogRow title="Name">
            <Input
              id="name"
              h="lg"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Hub Name"
            />
          </ActionDialogRow>
        </ActionDialogCardContent>
      </ActionDialogCard>
    </OKCancelDialog>
  )
}
