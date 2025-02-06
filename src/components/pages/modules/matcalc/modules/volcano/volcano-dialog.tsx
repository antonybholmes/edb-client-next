import { TEXT_OK } from '@/consts'
import {
  OKCancelDialog,
  type IModalProps,
} from '@components/dialog/ok-cancel-dialog'
import { Checkbox } from '@components/shadcn/ui/themed/check-box'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@components/shadcn/ui/themed/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/shadcn/ui/themed/select'
import type { IndexFromType } from '@lib/dataframe'
import { type BaseDataFrame } from '@lib/dataframe/base-dataframe'
import { HistoryContext, newPlot } from '@providers/history-provider'

import { DataFrame } from '@lib/dataframe/dataframe'
import { filterNA, findCols, subset, zip } from '@lib/dataframe/dataframe-utils'
import { range } from '@lib/math/range'

import type { SeriesData } from '@lib/dataframe/dataframe-types'
import { produce } from 'immer'
import { useContext, useRef, type BaseSyntheticEvent } from 'react'
import { useForm } from 'react-hook-form'
import { MatcalcSettingsContext } from '../../matcalc-settings-provider'
import { DEFAULT_VOLCANO_PROPS } from './volcano-plot-svg'

const MAX_COLS = 10
const FOLD_REGEX = /fold/
const P_REGEX = /(?:padj|fdr)/

interface IFormInput {
  foldChangeCol: string
  pValueCol: string
  applyLog2ToFoldChange: boolean
  applyLog10ToPValue: boolean
}

function findFoldChangeCol(df: BaseDataFrame | null) {
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

export interface IProps extends IModalProps {
  open?: boolean
  df: BaseDataFrame

  minThreshold?: number
}

export function VolcanoDialog({ open = true, df, onReponse }: IProps) {
  const { historyDispatch } = useContext(HistoryContext)
  const { settings, updateSettings } = useContext(MatcalcSettingsContext)

  const btnRef = useRef<HTMLButtonElement>(null)

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

    idxUp.forEach((i) => {
      labels[i] = 1
    })

    idxDown.forEach((i) => {
      labels[i] = 0
    })

    const logpvalues = data.applyLog10ToPValue
      ? pvalues.map((v) => -Math.log10(v as number))
      : pvalues

    const vdf = new DataFrame({
      name: 'Volcano',
      data: zip(log2foldChanges, logpvalues, labels),
      index: subset(df.index.values, idx) as IndexFromType,
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

    const plot = {
      ...newPlot('Volcano'),
      customProps: {
        df: vdf,
        displayOptions: { ...DEFAULT_VOLCANO_PROPS },
      },
    }

    historyDispatch({ type: 'add-plots', plots: plot })

    onReponse?.(TEXT_OK)
  }

  return (
    <OKCancelDialog
      open={open}
      title="Volcano Plot"
      onReponse={(r) => {
        if (r === TEXT_OK) {
          btnRef.current?.click()
        } else {
          onReponse?.(r)
        }
      }}
      contentVariant="glass"
    >
      <Form {...form}>
        <form
          className="flex flex-col gap-y-2 text-sm p-4 bg-background rounded-lg"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            name="foldChangeCol"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-x-2">
                <FormLabel className="w-24 shrink-0">Fold Change</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Select the fold change column" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {df?.colNames
                      .filter((name) => name !== '')
                      .slice(0, MAX_COLS)
                      .map((name, ni) => (
                        <SelectItem value={name} key={ni}>
                          {name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pValueCol"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-x-2">
                <FormLabel className="w-24 shrink-0">P-value</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Select the fold change column" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {df?.colNames
                      .filter((name) => name !== '')
                      .slice(0, MAX_COLS)
                      .map((name, ni) => (
                        <SelectItem value={name} key={ni}>
                          {name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="applyLog2ToFoldChange"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-x-2">
                <div className="w-24 shrink-0" />
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>

                <FormLabel>Apply log2 to fold change</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="applyLog10ToPValue"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-x-2">
                <div className="w-24 shrink-0" />
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>

                <FormLabel>Apply log10 to p-value</FormLabel>
              </FormItem>
            )}
          />

          <button ref={btnRef} type="submit" className="hidden" />
        </form>
      </Form>
    </OKCancelDialog>
  )
}
