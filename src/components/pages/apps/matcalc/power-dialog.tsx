import { ActionDialogRow } from '@/components/dialogs/card/action-dialog-card'
import { ICustomDialogProps } from '@/components/dialogs/dialogs'
import { NumericalInput } from '@/components/shadcn/ui/themed/numerical-input'
import { TEXT_OK } from '@/consts'
import { OKCancelDialog } from '@/dialogs/ok-cancel-dialog'
import { type BaseDataFrame } from '@/lib/dataframe/base-dataframe'
import { pow } from '@/lib/dataframe/utils/pow'
import { useState } from 'react'
import { useCurrentSheets } from './history/history-provider/history-contexts'
import { useHistory } from './history/history-provider/history-provider'

export function PowerDialog({ close }: ICustomDialogProps<unknown>) {
  const [power, setPower] = useState<number>(2)

  const { sheet } = useCurrentSheets()
  const { addSheets } = useHistory()

  async function submit() {
    addSheets(
      [pow(sheet as BaseDataFrame, power)],

      {
        message: `Power(x, ${power})`,
      }
    )

    close()
  }

  return (
    <OKCancelDialog
      title="Raise Table to Power"
      onResponse={(r) => {
        if (r === TEXT_OK) {
          submit()
        } else {
          close()
        }
      }}
    >
      <ActionDialogRow title="Power">
        <NumericalInput
          limit={[1, 100]}
          step={1}
          dp={0}
          value={power}
          onNumChange={setPower}
        />
      </ActionDialogRow>
    </OKCancelDialog>
  )
}
