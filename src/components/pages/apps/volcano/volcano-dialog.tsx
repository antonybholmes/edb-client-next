import { Form, FormField } from '@/components/shadcn/ui/themed/baseui/form'
import { TEXT_OK } from '@/consts'
import { OKCancelDialog, type IModalProps } from '@/dialogs/ok-cancel-dialog'
import { findCols, type BaseDataFrame } from '@/lib/dataframe/base-dataframe'
import { SelectItem, SelectList } from '@/themed/baseui/select'

import { filterNA, subset, zip } from '@/lib/dataframe/utils/dataframe-utils'

import { ActionDialogRow } from '@/components/dialogs/card/action-dialog-card'
import { ICustomDialogProps } from '@/components/dialogs/dialogs'
import { LogSpan } from '@/components/log-span'
import { Checkbox } from '@/components/shadcn/ui/themed/baseui/check-box'
import { makeUuid } from '@/lib/id'
import { produce } from 'immer'
import { useRef, type BaseSyntheticEvent } from 'react'
import { useForm } from 'react-hook-form'
import { useCurrentSheets } from '../matcalc/history/history-provider/history-contexts'
import { newVolcanoPlot } from '../matcalc/history/history-provider/history-factories'
import { HistoryPlot } from '../matcalc/history/history-provider/history-types'
import { useVolcanoSettings } from './volcano-settings'

const MAX_COLS = 10
const FOLD_REGEX = /fold/
const P_REGEX = /(?:padj|fdr)/
const MAX_NEG_LOG10_P = 50

interface IFormInput {
  foldChangeCol: string
  pValueCol: string
  applyLog2ToFoldChange: boolean
  applyLog10ToPValue: boolean
}

function findFoldChangeCol(df: BaseDataFrame) {
  if (!df) {
    return 'Log2 Fold Change'
  }

  const cols = df.colNames.filter((c) => FOLD_REGEX.test(c.toLowerCase()))

  if (cols.length === 0) {
    return 'Log2 Fold Change'
  }

  return cols[0]
}

function findPValueCol(df: BaseDataFrame | null) {
  if (!df) {
    return 'FDR'
  }

  const cols = df.colNames.filter((c) => P_REGEX.test(c.toLowerCase()))

  if (cols.length === 0) {
    return 'FDR'
  }

  return cols[0]
}

export interface IProps extends IModalProps<HistoryPlot> {
  open?: boolean

  minThreshold?: number
}

export function VolcanoDialog({
  payload: { callback },
  close,
}: ICustomDialogProps<{ callback: (plot: HistoryPlot) => void }>) {
  const { settings, updateSettings } = useVolcanoSettings() // Assuming there is a custom hook for volcano settings

  const { sheets } = useCurrentSheets()

  const btnRef = useRef<HTMLButtonElement>(null)

  //const branch = findBranch(branchAddr, history)[0]
  //const step = currentStep(branch)[0]
  let df = sheets[0] as BaseDataFrame //currentSheet(step)[0] as AnnotationDataFrame

  const form = useForm<IFormInput>({
    defaultValues: {
      foldChangeCol: findFoldChangeCol(df)!,
      pValueCol: findPValueCol(df)!,
      applyLog2ToFoldChange: settings.preprocess.applyLog2FC,
      applyLog10ToPValue: settings.preprocess.applyMinusLog10P,
    },
  })

  async function onSubmit(data: IFormInput, e: BaseSyntheticEvent | undefined) {
    e?.preventDefault()

    let idx = findCols(df, data.foldChangeCol)

    if (idx.length === 0) {
      return
    }

    let foldChanges: readonly number[] = df.col(idx[0]!)!.nums

    idx = findCols(df, data.pValueCol)

    if (idx.length === 0) {
      return
    }

    let pvalues: readonly number[] = df.col(idx[0]!)!.nums

    // remove na
    idx = filterNA(pvalues)

    foldChanges = subset(foldChanges, idx)
    pvalues = subset(pvalues, idx)

    const log2foldChanges: readonly number[] = data.applyLog2ToFoldChange
      ? foldChanges.map((v) => -Math.log2(v as number))
      : foldChanges

    // label
    // const idxUp = pvalues
    //   .map((v, vi) => [v, vi] as [number, number])
    //   .filter((v) => v[0] < 0.05 && (foldChanges[v[1]] as number) >= 0)
    //   .map((v) => v[1])

    // const idxDown = pvalues
    //   .map((v, vi) => [v, vi] as [number, number])
    //   .filter((v) => v[0] < 0.05 && (foldChanges[v[1]] as number) < 0)
    //   .map((v) => v[1])

    // const labels = range(foldChanges.length).map(() => 0.5)

    // for (const i of idxUp) {
    //   labels[i] = 1
    // }

    // for (const i of idxDown) {
    //   labels[i] = 0
    // }

    const labels = subset(df.index.strs, idx)

    const logpvalues = data.applyLog10ToPValue
      ? (pvalues as number[]).map((v) =>
          v > 0 ? -Math.log10(v) : MAX_NEG_LOG10_P
        )
      : pvalues

    updateSettings(
      produce(settings, (draft) => {
        draft.preprocess.applyLog2FC = data.applyLog2ToFoldChange
        draft.preprocess.applyMinusLog10P = data.applyLog10ToPValue
      })
    )

    console.log(labels)

    const plot = newVolcanoPlot('Volcano', {
      entries: zip(labels, log2foldChanges, logpvalues).map(
        ([label, log2fc, logp]) => ({
          id: makeUuid(),
          label: label as string,
          log2foldChange: log2fc as number,
          logpvalue: logp as number,
        })
      ),
    })

    callback?.(plot)

    close()
  }

  return (
    <OKCancelDialog
      title="Volcano Plot"
      onResponse={(r) => {
        if (r === TEXT_OK) {
          btnRef.current?.click()
        } else {
          close()
        }
      }}
    >
      <Form {...form}>
        <form
          className="flex flex-col gap-y-2"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <ActionDialogRow title="Fold Change">
            <FormField
              control={form.control}
              name="foldChangeCol"
              render={({ field }) => (
                <SelectList
                  onValueChange={field.onChange}
                  value={field.value}
                  w="lg"
                >
                  {df?.colNames
                    .filter((name) => name !== '')
                    .slice(0, MAX_COLS)
                    .map((name, ni) => (
                      <SelectItem value={name} key={ni}>
                        {name}
                      </SelectItem>
                    ))}
                </SelectList>
              )}
            />
            <FormField
              control={form.control}
              name="applyLog2ToFoldChange"
              render={({ field }) => (
                <Checkbox
                  title="Fold change"

                  checked={field.value}
                  onCheckedChange={field.onChange}
                >
                  Apply{' '}
                  <LogSpan base={2} minus={true}>
                    fold change
                  </LogSpan>
                </Checkbox>
              )}
            />
          </ActionDialogRow>
          <ActionDialogRow title="P-value">
            <FormField
              control={form.control}
              name="pValueCol"
              render={({ field }) => (
                <SelectList
                  onValueChange={field.onChange}
                  value={field.value}
                  w="lg"
                >
                  {df?.colNames
                    .filter((name) => name !== '')
                    .slice(0, MAX_COLS)
                    .map((name, ni) => (
                      <SelectItem value={name} key={ni}>
                        {name}
                      </SelectItem>
                    ))}
                </SelectList>
              )}
            />

            <FormField
              control={form.control}
              name="applyLog10ToPValue"
              render={({ field }) => (
                <Checkbox
                  title="P-value"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                >
                  Apply{' '}
                  <LogSpan base={10} minus={true}>
                    p-value
                  </LogSpan>
                </Checkbox>
              )}
            />
          </ActionDialogRow>
          <button ref={btnRef} type="submit" className="hidden" />
        </form>
      </Form>
    </OKCancelDialog>
  )
}
