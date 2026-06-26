import { Form, FormField } from '@/components/shadcn/ui/themed/v2/form'
import { TEXT_OK } from '@/consts'
import { OKCancelDialog, type IModalProps } from '@/dialogs/ok-cancel-dialog'
import { findCols, type BaseDataFrame } from '@/lib/dataframe/base-dataframe'
import { SelectItem, SelectList } from '@/themed/v2/select'

import { DataFrame } from '@/lib/dataframe/dataframe'
import { filterNA, subset, zip } from '@/lib/dataframe/dataframe-utils'
import { range } from '@/lib/math/range'

import { CheckPropRow } from '@/dialogs/check-prop-row'
import { PropRow } from '@/dialogs/prop-row'

import { SeriesData } from '@/lib/dataframe/series-data'
import { produce } from 'immer'
import { useRef, type BaseSyntheticEvent } from 'react'
import { useForm } from 'react-hook-form'
import { useCurrentSheets } from '../../history/history-provider/history-contexts'
import { newVolcanoPlot } from '../../history/history-provider/history-factories'
import { HistoryPlot } from '../../history/history-provider/history-types'
import { useMatcalcSettings } from '../../settings/matcalc-settings'

const MAX_COLS = 10
const FOLD_REGEX = /fold/
const P_REGEX = /(?:padj|fdr)/

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

  console.log(df.columns)

  const cols = df.columns.filter((c) => FOLD_REGEX.test(c.toLowerCase()))

  if (cols.length === 0) {
    return 'Log2 Fold Change'
  }

  return cols[0]
}

function findPValueCol(df: BaseDataFrame | null) {
  if (!df) {
    return 'FDR'
  }

  const cols = df.columns.filter((c) => P_REGEX.test(c.toLowerCase()))

  if (cols.length === 0) {
    return 'FDR'
  }

  return cols[0]
}

export interface IProps extends IModalProps<HistoryPlot> {
  open?: boolean
  //df: BaseDataFrame

  minThreshold?: number
}

export function VolcanoDialog({
  open = true,
  //df,
  onResponse,
}: IProps) {
  const { settings, updateSettings } = useMatcalcSettings()
  const { sheets } = useCurrentSheets()

  const btnRef = useRef<HTMLButtonElement>(null)

  //const branch = findBranch(branchAddr, history)[0]
  //const step = currentStep(branch)[0]
  let df = sheets[0] as BaseDataFrame //currentSheet(step)[0] as AnnotationDataFrame

  //console.log('vdialog', df, df.colNames)

  const form = useForm<IFormInput>({
    defaultValues: {
      foldChangeCol: findFoldChangeCol(df)!,
      pValueCol: findPValueCol(df)!,
      applyLog2ToFoldChange: settings.volcano.log2FC,
      applyLog10ToPValue: settings.volcano.log10P,
    },
  })

  async function onSubmit(data: IFormInput, e: BaseSyntheticEvent | undefined) {
    e?.preventDefault()

    let idx = findCols(df, data.foldChangeCol)

    if (idx.length === 0) {
      return
    }

    let foldChanges: SeriesData[] = df.col(idx[0]!)!.values

    idx = findCols(df, data.pValueCol)

    if (idx.length === 0) {
      return
    }

    let pvalues: SeriesData[] = df.col(idx[0]!)!.values

    // remove na
    idx = filterNA(pvalues)

    foldChanges = subset(foldChanges, idx)
    pvalues = subset(pvalues, idx)

    const log2foldChanges = data.applyLog2ToFoldChange
      ? foldChanges.map((v) => -Math.log2(v as number))
      : foldChanges

    // label
    const idxUp = pvalues
      .map((v, vi) => [v, vi] as [number, number])
      .filter((v) => v[0] < 0.05 && (foldChanges[v[1]] as number) >= 0)
      .map((v) => v[1])
    const idxDown = pvalues
      .map((v, vi) => [v, vi] as [number, number])
      .filter((v) => v[0] < 0.05 && (foldChanges[v[1]] as number) < 0)
      .map((v) => v[1])

    const labels = range(foldChanges.length).map(() => 0.5)

    for (const i of idxUp) {
      labels[i] = 1
    }

    for (const i of idxDown) {
      labels[i] = 0
    }

    const logpvalues = data.applyLog10ToPValue
      ? pvalues.map((v) => -Math.log10(v as number))
      : pvalues

    const vdf = new DataFrame({
      name: 'Volcano',
      data: zip(log2foldChanges, logpvalues, labels),
      index: subset(df.index.values, idx),
      columns: ['Log2 fold change', '-log10 p-value', 'Label'],
    })

    // historyDispatch({
    //   type: 'add-step',
    //   description: 'Volcano',
    //   sheets: [vdf],
    // })

    updateSettings(
      produce(settings, (draft) => {
        draft.volcano.log2FC = settings.volcano.log2FC
        draft.volcano.log10P = data.applyLog10ToPValue
      })
    )

    const plot = newVolcanoPlot('Volcano', { main: vdf })

    //addPlots([plot])

    // plotsDispatch({ type: 'add', customProps:plots: [plot] })

    onResponse?.(TEXT_OK, plot)
  }

  return (
    <OKCancelDialog
      open={open}
      title="Volcano Plot"
      onResponse={(r) => {
        if (r === TEXT_OK) {
          btnRef.current?.click()
        } else {
          onResponse?.(r, undefined)
        }
      }}
      //contentVariant="glass"
    >
      <Form {...form}>
        <form
          className="flex flex-col gap-y-1"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            name="foldChangeCol"
            render={({ field }) => (
              <PropRow title="Fold Change">
                <SelectList
                  onValueChange={field.onChange}
                  value={field.value}
                  w="lg"
                >
                  {df?.columns
                    .filter((name) => name !== '')
                    .slice(0, MAX_COLS)
                    .map((name, ni) => (
                      <SelectItem value={name} key={ni}>
                        {name}
                      </SelectItem>
                    ))}
                </SelectList>
              </PropRow>
            )}
          />

          <FormField
            control={form.control}
            name="pValueCol"
            render={({ field }) => (
              <PropRow title="P-value">
                <SelectList
                  onValueChange={field.onChange}
                  value={field.value}
                  w="lg"
                >
                  {df?.columns
                    .filter((name) => name !== '')
                    .slice(0, MAX_COLS)
                    .map((name, ni) => (
                      <SelectItem value={name} key={ni}>
                        {name}
                      </SelectItem>
                    ))}
                </SelectList>
              </PropRow>
            )}
          />

          <FormField
            control={form.control}
            name="applyLog2ToFoldChange"
            render={({ field }) => (
              <CheckPropRow
                title="Apply log2 to fold change"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />

          <FormField
            control={form.control}
            name="applyLog10ToPValue"
            render={({ field }) => (
              <CheckPropRow
                title="Apply log10 to p-value"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />

          <button ref={btnRef} type="submit" className="hidden" />
        </form>
      </Form>
    </OKCancelDialog>
  )
}
