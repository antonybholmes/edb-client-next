import { onTextFileChange, OpenFiles } from '@components/pages/open-files'
import { OKCancelDialog } from '@dialog/ok-cancel-dialog'
import { BaseCol } from '@layout/base-col'

import { NO_DIALOG, TEXT_CLEAR, TEXT_OK, type IDialogParams } from '@/consts'
import { VCenterRow } from '@layout/v-center-row'

import { OpenIcon } from '@icons/open-icon'
import { HCenterRow } from '@layout/h-center-row'

import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/components/shadcn/ui/themed/toggle-group'
import { useSearchFilters } from '@/stores/search-filter-store'
import { FileDropZonePanel } from '@components/file-dropzone-panel'
import { BaseRow } from '@layout/base-row'
import { type BaseDataFrame } from '@lib/dataframe/base-dataframe'
import { filterColsById, filterRowsById } from '@lib/dataframe/dataframe-utils'
import { randId } from '@lib/id'
import { textToLines } from '@lib/text/lines'
import { Button } from '@themed/button'
import { Checkbox } from '@themed/check-box'
import { toast } from '@themed/crisp'
import { Textarea } from '@themed/textarea'
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

  const { settings, updateSettings, resetRowFilters, resetColFilters } =
    useSearchFilters()

  useEffect(() => {
    if (filterMode.includes('Rows')) {
      setText(settings.rows.ids.join('\n'))
    } else {
      setText(settings.cols.ids.join('\n'))
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
        caseSensitive: settings.rows.caseSensitive,
        matchEntireCell: settings.rows.matchEntireCell,
        keepOrder: settings.rows.keepOrder,
      }).setName('Row Filter')
    } else {
      df = filterColsById(sheet!, ids, {
        caseSensitive: settings.cols.caseSensitive,
        matchEntireCell: settings.cols.matchEntireCell,
        keepOrder: settings.cols.keepOrder,
      }).setName('Col Filter')
    }

    if (df.size > 0) {
      addStep(df.name, [df])

      if (filterMode.includes('Rows')) {
        updateSettings({
          ...settings,
          rows: {
            ...settings.rows,
            ids,
          },
        })
      } else {
        updateSettings({
          ...settings,
          cols: {
            ...settings.cols,
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
        {/* <Button
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
        </Button> */}

        <ToggleGroup
          //variant="outline"
          type="single"
          value={filterMode}
          onValueChange={(v) => {
            setFilterMode(v)
          }}
        >
          <ToggleGroupItem
            value="Rows"
            className="w-12"
            aria-label="Filter rows"
          >
            Rows
          </ToggleGroupItem>

          <ToggleGroupItem
            value="Cols"
            className="w-12"
            aria-label="Filter columns"
          >
            Cols
          </ToggleGroupItem>
        </ToggleGroup>
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
              ? settings.rows.caseSensitive
              : settings.cols.caseSensitive
          }
          onCheckedChange={(state) => {
            if (filterMode.includes('Rows')) {
              updateSettings({
                ...settings,
                rows: { ...settings.rows, caseSensitive: state },
              })
            } else {
              updateSettings({
                ...settings,
                cols: { ...settings.cols, caseSensitive: state },
              })
            }
          }}
        >
          Case sensitive
        </Checkbox>
        <Checkbox
          checked={
            filterMode.includes('Rows')
              ? settings.rows.matchEntireCell
              : settings.cols.matchEntireCell
          }
          onCheckedChange={(state) => {
            if (filterMode.includes('Rows')) {
              updateSettings({
                ...settings,
                rows: { ...settings.rows, matchEntireCell: state },
              })
            } else {
              updateSettings({
                ...settings,
                cols: { ...settings.cols, matchEntireCell: state },
              })
            }
          }}
        >
          Match entire cell
        </Checkbox>
        <Checkbox
          checked={
            filterMode.includes('Rows')
              ? settings.rows.keepOrder
              : settings.cols.keepOrder
          }
          onCheckedChange={(state) => {
            if (filterMode.includes('Rows')) {
              updateSettings({
                ...settings,
                rows: {
                  ...settings.rows,
                  keepOrder: state,
                  matchEntireCell: state ? true : settings.rows.matchEntireCell,
                },
              })
            } else {
              updateSettings({
                ...settings,
                cols: {
                  ...settings.cols,
                  keepOrder: state,
                  matchEntireCell: state ? true : settings.cols.matchEntireCell,
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
