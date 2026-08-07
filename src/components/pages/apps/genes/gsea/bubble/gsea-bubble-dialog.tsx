import { TEXT_OK } from '@/consts'
import { OKCancelDialog, type IModalProps } from '@/dialogs/ok-cancel-dialog'
import { findCols, type BaseDataFrame } from '@/lib/dataframe/base-dataframe'
import { SelectItem, SelectList } from '@/themed/v2/select'

import {
  ActionDialogRow,
  ActionDialogSeparator,
} from '@/components/dialogs/card/action-dialog-card'
import { useEffect, useState } from 'react'
import { useCurrentSheets } from '../../../matcalc/history/history-provider/history-contexts'

import { argsort } from '@/lib/math/argsort'
import { produce } from 'immer'
import { HistoryPlot } from '../../../matcalc/history/history-provider/history-types'
import { newGseaBubblePlot } from './gsea-bubble-provider'
import { SortBy, useGseaBubbleSettings } from './gsea-bubble-settings-store'

const MAX_COLS = 10

const MAX_NEG_LOG10_P = 50

const SORT_BY_ITEMS = [
  { value: 'none', label: 'None' },
  { value: 'nes', label: 'NES' },
  { value: 'size', label: 'Size' },
  { value: 'pvalue', label: 'P-value' },
]

function findNESCol(df: BaseDataFrame) {
  if (!df) {
    return 'NES'
  }

  console.log('Finding NES column in dataframe:', df.columns)

  const cols = df.columns.filter((c) => c.toUpperCase().includes('NES'))

  if (cols.length === 0) {
    return 'NES'
  }

  return cols[0]
}

function findSizeCol(df: BaseDataFrame | null) {
  if (!df) {
    return 'Size'
  }

  const cols = df.columns.filter((c) => c.toLowerCase().includes('size'))

  if (cols.length === 0) {
    return 'Size'
  }

  return cols[0]
}

function findPValueCol(df: BaseDataFrame | null) {
  if (!df) {
    return 'q'
  }

  const cols = df.columns.filter((c) => c.toLowerCase().startsWith('fdr q-val'))

  if (cols.length === 0) {
    return 'q'
  }

  return cols[0]
}

function findIdCol(df: BaseDataFrame | null) {
  if (!df) {
    return 'Name'
  }

  const cols = df.columns.filter((c) => c.toLowerCase().includes('name'))

  if (cols.length === 0) {
    return 'Name'
  }

  return cols[0]
}

export interface IProps extends IModalProps<HistoryPlot> {
  open?: boolean
  //df: BaseDataFrame

  minThreshold?: number
}

export function GseaBubbleDialog({
  open = true,
  //df,
  onResponse,
}: IProps) {
  const { sheets } = useCurrentSheets()
  const { settings, updateSettings } = useGseaBubbleSettings()

  //const branch = findBranch(branchAddr, history)[0]
  //const step = currentStep(branch)[0]
  let df = sheets[0] as BaseDataFrame //currentSheet(step)[0] as AnnotationDataFrame

  const [nesCol, setNESCol] = useState<string>('')
  const [sizeCol, setSizeCol] = useState<string>('')
  const [pValueCol, setPValueCol] = useState<string>('')

  useEffect(() => {
    setNESCol(findNESCol(df))
    setSizeCol(findSizeCol(df))
    setPValueCol(findPValueCol(df))
  }, [df])

  async function submit() {
    let idx = findCols(df, nesCol)

    if (idx.length === 0) {
      console.error(`NES column "${nesCol}" not found in the dataframe.`)
      return
    }

    let nes: number[] = df.col(idx[0]!)!.nums

    idx = findCols(df, sizeCol)

    if (idx.length === 0) {
      console.error(`Size column "${sizeCol}" not found in the dataframe.`)
      return
    }

    let sizes: number[] = df.col(idx[0]!)!.nums

    idx = findCols(df, pValueCol)

    if (idx.length === 0) {
      console.error(`P-value column "${pValueCol}" not found in the dataframe.`)
      return
    }

    let log10pvalues: number[] = df
      .col(idx[0]!)!
      .nums.map((v) => (v > 0 ? -Math.log10(v) : MAX_NEG_LOG10_P))

    let ids = df.index.strs

    idx = []

    switch (settings.sortBy) {
      case 'nes':
        idx = argsort(nes, true)

        break
      case 'size':
        idx = argsort(sizes, true)
        break
      case 'pvalue':
        idx = argsort(log10pvalues, true)
        break

      default:
        break
    }

    if (idx.length > 0) {
      nes = idx.map((i) => nes[i])
      sizes = idx.map((i) => sizes[i])
      log10pvalues = idx.map((i) => log10pvalues[i])
      ids = idx.map((i) => ids[i])
    }

    const plot = newGseaBubblePlot('GSEA Bubble Plot', {
      nes: { values: nes, label: nesCol },
      sizes: { values: sizes, label: sizeCol },
      log10pvalues: { values: log10pvalues, label: pValueCol },
      ids,
    })

    onResponse?.(TEXT_OK, plot)
  }

  return (
    <OKCancelDialog
      open={open}
      title="GSEA Bubble Plot"
      onResponse={(r) => {
        if (r === TEXT_OK) {
          submit()
        } else {
          onResponse?.(r, undefined)
        }
      }}
      //contentVariant="glass"
    >
      {/* <ActionDialogRow title="Name">
        <SelectList onValueChange={setIdCol} value={idCol} w="lg">
          {df?.columns
            .filter((name) => name !== '')
            .slice(0, MAX_COLS)
            .map((name, ni) => (
              <SelectItem value={name} key={ni}>
                {name}
              </SelectItem>
            ))}
        </SelectList>
      </ActionDialogRow> */}

      <ActionDialogRow title="NES">
        <SelectList onValueChange={setNESCol} value={nesCol} w="lg">
          {df?.columns
            .filter((name) => name !== '')
            .slice(0, MAX_COLS)
            .map((name, ni) => (
              <SelectItem value={name} key={ni}>
                {name}
              </SelectItem>
            ))}
        </SelectList>
      </ActionDialogRow>

      <ActionDialogRow title="Size">
        <SelectList onValueChange={setSizeCol} value={sizeCol} w="lg">
          {df?.columns
            .filter((name) => name !== '')
            .slice(0, MAX_COLS)
            .map((name, ni) => (
              <SelectItem value={name} key={ni}>
                {name}
              </SelectItem>
            ))}
        </SelectList>
      </ActionDialogRow>

      <ActionDialogRow title="P-value">
        <SelectList onValueChange={setPValueCol} value={pValueCol} w="lg">
          {df?.columns
            .filter((name) => name !== '')
            .slice(0, MAX_COLS)
            .map((name, ni) => (
              <SelectItem value={name} key={ni}>
                {name}
              </SelectItem>
            ))}
        </SelectList>
      </ActionDialogRow>

      <ActionDialogSeparator />

      <ActionDialogRow title="Sort">
        <SelectList
          items={SORT_BY_ITEMS}
          onValueChange={(v) =>
            updateSettings(
              produce(settings, (draft) => {
                draft.sortBy = v as SortBy
              })
            )
          }
          value={settings.sortBy}
          w="lg"
        >
          {SORT_BY_ITEMS.map((item) => (
            <SelectItem value={item.value} key={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectList>
      </ActionDialogRow>
    </OKCancelDialog>
  )
}
