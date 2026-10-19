import { ActionDialogRow } from '@/components/dialogs/card/action-dialog-card'
import { ICustomDialogProps } from '@/components/dialogs/dialogs'
import { NumericalInput } from '@/components/shadcn/ui/themed/numerical-input'
import { TEXT_OK } from '@/consts'
import { OKCancelDialog } from '@/dialogs/ok-cancel-dialog'
import { type BaseDataFrame } from '@/lib/dataframe/base-dataframe'
import { log } from '@/lib/dataframe/utils/log'
import { useState } from 'react'
import { useCurrentSheets } from './history/history-provider/history-contexts'
import { useHistory } from './history/history-provider/history-provider'

export function LogDialog({ close }: ICustomDialogProps<unknown>) {
  const [base, setBase] = useState<number>(2)
  const [add, setAdd] = useState<number>(1)

  const { sheet } = useCurrentSheets()
  const { addSheets } = useHistory()

  async function submit() {
    addSheets(
      [log(sheet as BaseDataFrame, base, add)],

      {
        message: `Log${base}(x+${add > 0 ? add : ''})`,
      }
    )

    close()
  }

  return (
    <OKCancelDialog
      title="Log Transform Table"
      onResponse={(r) => {
        if (r === TEXT_OK) {
          submit()
        } else {
          close()
        }
      }}
    >
      <ActionDialogRow title="Base">
        <NumericalInput
          limit={[2, 100]}
          step={1}
          dp={0}
          value={base}
          onNumChange={setBase}
        />
        <span>Add</span>
        <NumericalInput
          limit={[0, 100]}
          step={1}
          dp={0}
          value={add}
          onNumChange={setAdd}
        />
      </ActionDialogRow>
    </OKCancelDialog>
  )
}
