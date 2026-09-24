import { SIMPLE_COLOR_EXT_CLS } from '@/components/plot/color-picker-popover'
import { IS_DEV_MODE, TEXT_OK } from '@/consts'
import { OKCancelDialog } from '@/dialogs/ok-cancel-dialog'
import { Input } from '@/themed/v2/input'
import { produce } from 'immer'
import { useEffect, useState } from 'react'

import {
  ActionDialogCard,
  ActionDialogCardContent,
  ActionDialogRow,
} from '@/components/dialogs/card/action-dialog-card'
import { ICustomDialogProps } from '@/components/dialogs/dialogs'
import { FillButton } from '@/components/plot/fill-dropdown-menu'
import { DialogTitle } from '@/components/shadcn/ui/themed/v2/dialog'
import { IGroup, useNetwork } from '../network-store'

export function GroupDialog({
  payload,
  close,
}: ICustomDialogProps<{ group: IGroup }>) {
  const { group } = payload

  const { groups, setGroups } = useNetwork()

  const [name, setName] = useState('')

  const [color, setColor] = useState('#6495ED') //`#${Math.floor(Math.random() * 16777215).toString(16)}`,

  useEffect(() => {
    // if group provided, set defaults

    setName(group.name)

    if (group.color.match(/#[0-9a-fA-F]+/)) {
      setColor(group.color)
    }
  }, [group])

  return (
    <OKCancelDialog
      title={
        <DialogTitle style={{ color }}>
          {name.length > 0 ? `Edit ${name}` : 'New group'}
        </DialogTitle>
      }
      onResponse={(r) => {
        if (r === TEXT_OK) {
          setGroups(
            produce(groups, (draft) => {
              const g = draft.find((x) => x.id === group.id)
              if (g) {
                g.name = name
                g.color = color
              }
            })
          )
        }

        close()
      }}
      showClose={true}

      leftFooterChildren={
        IS_DEV_MODE ? (
          <span className="text-foreground/50">{group.id}</span>
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
          className={SIMPLE_COLOR_EXT_CLS}
        />
      }
      contentCls="gap-y-2"
    >
      <ActionDialogCard>
        <ActionDialogCardContent>
          <ActionDialogRow title="Name">
            <Input
              id="name"
              h="lg"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Group Name"
            />
          </ActionDialogRow>
        </ActionDialogCardContent>
      </ActionDialogCard>

      {/* {IS_DEV_MODE && (
        <PropRow title="Id">
          <span className="text-foreground/50">{group.id}</span>
        </PropRow>
      )} */}

      {/* <VCenterRow>
          <span className="w-24 shrink-0">Color</span>
          <ColorPickerButton
            color={color}
            onColorChange={setColor}
            className={SIMPLE_COLOR_EXT_CLS}
          />
        </VCenterRow>  

      {/* <span>Color</span> */}
    </OKCancelDialog>
  )
}
