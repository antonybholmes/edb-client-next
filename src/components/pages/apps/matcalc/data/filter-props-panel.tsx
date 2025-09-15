import { onTextFileChange, OpenFiles } from '@components/pages/open-files'
import { OKCancelDialog } from '@dialog/ok-cancel-dialog'
import { BaseCol } from '@layout/base-col'

import { NO_DIALOG, TEXT_CLEAR, TEXT_OK, type IDialogParams } from '@/consts'
import { VCenterRow } from '@layout/v-center-row'

import { OpenIcon } from '@icons/open-icon'
import { HCenterRow } from '@layout/h-center-row'

import { useSearchFilters } from '@/stores/search-filter-store'
import { FileDropZonePanel } from '@components/file-dropzone-panel'
import { BaseRow } from '@layout/base-row'
import { type BaseDataFrame } from '@lib/dataframe/base-dataframe'
import { filterColsById, filterRowsById } from '@lib/dataframe/dataframe-utils'
import { textToLines } from '@lib/text/lines'
import { randId } from '@lib/utils'
import { Button } from '@themed/button'
import { Checkbox } from '@themed/check-box'
import { toast } from '@themed/crisp'
import { Textarea } from '@themed/textarea'
import { BetweenHorizonalStart, BetweenVerticalStart } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useBranch } from '../history/history-store'
import MODULE_INFO from '../module.json'

export interface IProps {
  branchId: string
}

export function FilterPropsPanel({ branchId }: IProps) {
  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })

  const { sheet, addStep } = useBranch(branchId)

  //const [caseSensitive, setCaseSensitive] = useState(false)
  //const [entireCell, setMatchEntireCell] = useState(false)
  //const [keepOrder, setKeepOrder] = useState(false)
  const [text, setText] = useState('')
  const [confirmClear, setConfirmClear] = useState(false)
  const [filterMode, setFilterMode] = useState('Rows')

  const { filters, updateFilters, resetRowFilters, resetColFilters } =
    useSearchFilters()

  useEffect(() => {
    if (filterMode.includes('Rows')) {
      setText(filters.rows.ids.join('\n'))
    } else {
      setText(filters.cols.ids.join('\n'))
    }
  }, [filterMode])

  function filterTable() {
    const ids = textToLines(text, { trim: true })

    if (!sheet) {
      return
    }

    console.log(ids)

    let df: BaseDataFrame

    if (filterMode.includes('Rows')) {
      df = filterRowsById(sheet!, ids, {
        caseSensitive: filters.rows.caseSensitive,
        matchEntireCell: filters.rows.matchEntireCell,
        keepOrder: filters.rows.keepOrder,
      }).setName('Row Filter')
    } else {
      df = filterColsById(sheet!, ids, {
        caseSensitive: filters.cols.caseSensitive,
        matchEntireCell: filters.cols.matchEntireCell,
        keepOrder: filters.cols.keepOrder,
      }).setName('Col Filter')
    }

    if (df.size > 0) {
      addStep(df.name, [df])

      if (filterMode.includes('Rows')) {
        updateFilters({
          ...filters,
          rows: {
            ...filters.rows,
            ids,
          },
        })
      } else {
        updateFilters({
          ...filters,
          cols: {
            ...filters.cols,
            ids,
          },
        })
      }
    } else {
      toast({
        title: MODULE_INFO.name,
        description: `There were no ${
          filterMode.includes('Rows') ? 'rows' : 'columns'
        } matching your filter.`,
        variant: 'destructive',
      })
    }

    // historyState.current = ({
    //   step: historyState.current.step + 1,
    //   history: [{ title: df.name, df: [df] }],
    // })
  }

  return (
    <>
      <OKCancelDialog
        open={confirmClear}
        title={MODULE_INFO.name}
        //contentVariant="glass"
        //bodyVariant="card"
        modalType="Warning"
        onResponse={(r) => {
          if (r === TEXT_OK) {
            setText('')

            if (filterMode.includes('Rows')) {
              resetRowFilters()
            } else {
              resetColFilters()
            }
          }
          setConfirmClear(false)
        }}
      >
        Are you sure you want to clear all the filter items?
      </OKCancelDialog>

      {/* <Tabs
        defaultValue={filterMode}
        value={filterMode}
        onValueChange={setFilterMode}
      >
        <HCenterRow className="py-2 text-xs">
          <IOSTabsList
            value={filterMode}
            //defaultWidth={5}
            tabs={[
              {
                id: 'Rows',
              },
              {
                id: 'Cols',
              },
            ]}
            defaultWidth="64px"
          />
        </HCenterRow>
      </Tabs> */}

      {/* <HCenterRow className="gap-x-2 shrink-0 py-2">
        <ToggleButtons
          value={filterMode}
          onTabChange={(selectedTab) => {
            if (selectedTab) {
              setFilterMode(selectedTab.tab.id)
            }
          }}
          tabs={[
            {
              id: 'Rows',
            },
            {
              id: 'Cols',
            },
          ]}
        >
          <ToggleButtonTriggers variant="outline" defaultWidth={4} />
        </ToggleButtons>
      </HCenterRow> */}

      <HCenterRow className="py-2 text-xs gap-x-0.5">
        <Button
          onClick={() => setFilterMode('Rows')}
          checked={filterMode === 'Rows'}
        >
          <BetweenHorizonalStart className="w-4" />
          <span>Rows</span>
        </Button>
        <Button
          onClick={() => setFilterMode('Cols')}
          checked={filterMode === 'Cols'}
        >
          <BetweenVerticalStart className="w-4" />
          <span>Cols</span>
        </Button>
      </HCenterRow>

      {/* <VScrollPanel innerClassName="gap-y-2"> */}
      <BaseRow className="gap-x-2">
        <FileDropZonePanel
          onFileDrop={(files) => {
            if (files.length > 0) {
              onTextFileChange('Open filter list', files, (files) => {
                if (files.length > 0) {
                  setText(files[0]!.text)
                }
              })
            }
          }}
        >
          <Textarea
            id="filter"
            aria-label="Filter"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Filter ${filterMode.toLowerCase()}...`}
            className="h-64"
          />
        </FileDropZonePanel>
        <Button
          variant="muted"
          size="icon"
          // ripple={false}
          onClick={() =>
            setShowDialog({
              id: randId('open'),
            })
          }
          className="fill-foreground"
          title="Open List of IDs from File"
        >
          <OpenIcon />
        </Button>
      </BaseRow>

      <VCenterRow>
        <Button
          variant="link"
          size="none"
          // ripple={false}
          onClick={() => setConfirmClear(true)}
        >
          {TEXT_CLEAR}
        </Button>
      </VCenterRow>

      <BaseCol className="justify-between gap-y-1 py-2 shrink-0">
        <Checkbox
          checked={
            filterMode.includes('Rows')
              ? filters.rows.caseSensitive
              : filters.cols.caseSensitive
          }
          onCheckedChange={(state) => {
            if (filterMode.includes('Rows')) {
              updateFilters({
                ...filters,
                rows: { ...filters.rows, caseSensitive: state },
              })
            } else {
              updateFilters({
                ...filters,
                cols: { ...filters.cols, caseSensitive: state },
              })
            }
          }}
        >
          Case sensitive
        </Checkbox>
        <Checkbox
          checked={
            filterMode.includes('Rows')
              ? filters.rows.matchEntireCell
              : filters.cols.matchEntireCell
          }
          onCheckedChange={(state) => {
            if (filterMode.includes('Rows')) {
              updateFilters({
                ...filters,
                rows: { ...filters.rows, matchEntireCell: state },
              })
            } else {
              updateFilters({
                ...filters,
                cols: { ...filters.cols, matchEntireCell: state },
              })
            }
          }}
        >
          Match entire cell
        </Checkbox>
        <Checkbox
          checked={
            filterMode.includes('Rows')
              ? filters.rows.keepOrder
              : filters.cols.keepOrder
          }
          onCheckedChange={(state) => {
            if (filterMode.includes('Rows')) {
              updateFilters({
                ...filters,
                rows: {
                  ...filters.rows,
                  keepOrder: state,
                  matchEntireCell: state ? true : filters.rows.matchEntireCell,
                },
              })
            } else {
              updateFilters({
                ...filters,
                cols: {
                  ...filters.cols,
                  keepOrder: state,
                  matchEntireCell: state ? true : filters.cols.matchEntireCell,
                },
              })
            }
          }}
        >
          Keep order
        </Checkbox>
      </BaseCol>

      <VCenterRow className="mb-2 shrink-0">
        <Button
          variant="theme"
          //rounded="full"
          className="px-4"
          aria-label="Apply filter to current matrix"
          onClick={() => filterTable()}
        >
          Apply
        </Button>
      </VCenterRow>
      {/* </VScrollPanel>
      </PropsPanel> */}
      {showDialog.id.includes('open') && (
        <OpenFiles
          open={showDialog.id}
          onFileChange={(message, files) =>
            onTextFileChange(message, files, (files) => {
              if (files.length > 0) {
                setText(files[0]!.text)
              }
            })
          }
        />
      )}
    </>
  )
}
