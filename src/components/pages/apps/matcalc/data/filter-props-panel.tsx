import { onTextFileChange, OpenFiles } from '@/components/pages/open-files'
import { OKCancelDialog } from '@/dialog/ok-cancel-dialog'
import { BaseCol } from '@/layout/base-col'

import { NO_DIALOG, TEXT_CLEAR, TEXT_OK, type IDialogParams } from '@/consts'
import { VCenterRow } from '@/layout/v-center-row'

import { OpenIcon } from '@/icons/open-icon'

import { PropsPanel } from '@/components/props-panel'
import { LinkButton } from '@/themed/link-button'
import {
  ResizablePanel,
  ResizablePanelGroup,
  ThinVResizeHandle,
} from '@/themed/resizable'
import { GroupToggle, ToggleGroup } from '@/themed/v2/toggle-group'

import { FileDropZonePanel } from '@/components/file-dropzone-panel'
import { ToolbarSeparator } from '@/components/toolbar/toolbar-separator'
import { type BaseDataFrame } from '@/lib/dataframe/base-dataframe'
import { findCols, findRows } from '@/lib/dataframe/dataframe-utils'
import { makeUuid, randId } from '@/lib/id'
import { textToLines } from '@/lib/text/lines'
import { useSearchFilters } from '@/stores/search-filter-store'

import { Textarea } from '@/themed/textarea'
import { Button } from '@/themed/v2/button'
import { Checkbox } from '@/themed/v2/check-box'
import { Toast } from '@base-ui/react/toast'
import { useEffect, useState } from 'react'
import { useHistory, useSheet } from '../history/history-store'
import MODULE_INFO from '../module.json'

export function FilterPropsPanel() {
  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })

  const { addSheets } = useHistory()
  const sheet = useSheet()

  const { add: addToast } = Toast.useToastManager()
  const [text, setText] = useState('')
  const [confirmClear, setConfirmClear] = useState(false)
  const [filterMode, setFilterMode] = useState('Rows')

  const { settings, updateSettings, resetRowFilters, resetColFilters } =
    useSearchFilters()

  useEffect(() => {
    if (filterMode.includes('Rows')) {
      setText(settings.rows.queries.join('\n'))
    } else {
      setText(settings.cols.queries.join('\n'))
    }
  }, [filterMode])

  function filterTable() {
    const queries = textToLines(text, { trim: true })

    if (!sheet) {
      return
    }

    let df: BaseDataFrame

    if (filterMode.includes('Rows')) {
      df = findRows(sheet as BaseDataFrame, queries, {
        caseSensitive: settings.rows.caseSensitive,
        matchEntireCell: settings.rows.matchEntireCell,
        keepOrder: settings.rows.keepOrder,
      }).setName('Row Filter')
    } else {
      console.log('Filtering cols with queries', queries)
      df = findCols(sheet as BaseDataFrame, queries, {
        caseSensitive: settings.cols.caseSensitive,
        matchEntireCell: settings.cols.matchEntireCell,
        keepOrder: settings.cols.keepOrder,
      }).setName('Col Filter')
    }

    if (df.size > 0) {
      addSheets([df])

      if (filterMode.includes('Rows')) {
        updateSettings({
          ...settings,
          rows: {
            ...settings.rows,
            queries,
          },
        })
      } else {
        updateSettings({
          ...settings,
          cols: {
            ...settings.cols,
            queries,
          },
        })
      }
    } else {
      addToast({
        id: makeUuid(),
        title: MODULE_INFO.name,
        description: `There were no ${
          filterMode.includes('Rows') ? 'rows' : 'columns'
        } matching your filter.`,
        type: 'destructive',
      })
    }
  }

  return (
    <>
      {showDialog.id.includes('open') && (
        <OpenFiles
          message={showDialog.id}
          onFileChange={(message, files) =>
            onTextFileChange(message, files, (files) => {
              if (files.length > 0) {
                setText(files[0]!.text)
              }
            })
          }
        />
      )}

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

      <PropsPanel className="pr-2 gap-y-2">
        <ResizablePanelGroup
          orientation="vertical"
          className="grow"
          //autoSaveId="venn-resizable-panels-v"
        >
          <ResizablePanel
            defaultSize="30%"
            minSize="0%"
            className="grow flex flex-col gap-y-2"
            id="filter-text"
          >
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
                onTextChange={(e) => setText(e)}
                placeholder={`Filter ${filterMode.toLowerCase()}...`}
                className="h-full"
              />
            </FileDropZonePanel>
            <VCenterRow className="justify-end gap-x-2">
              <LinkButton onClick={() => setConfirmClear(true)}>
                {TEXT_CLEAR}
              </LinkButton>
            </VCenterRow>
          </ResizablePanel>

          <ThinVResizeHandle />
          <ResizablePanel
            defaultSize="70%"
            minSize="0%"
            className="grow flex flex-col gap-y-3 overflow-hidden"
            id="filter"
          >
            <VCenterRow className="gap-x-1 items-stretch">
              <Button
                size="icon"
                // ripple={false}
                onClick={() =>
                  setShowDialog({
                    id: randId('open'),
                  })
                }
                className="fill-foreground"
                title="Open list of Ids from file"
              >
                <OpenIcon />
              </Button>

              <ToolbarSeparator />

              <ToggleGroup
                //variant="outline"
                rounded="none"
                value={[filterMode]}
                onValueChange={(v) => {
                  setFilterMode(v[0] ?? 'Rows')
                }}
                //rounded="none"
                className="rounded-theme overflow-hidden gap-x-px"
              >
                <GroupToggle
                  value="Rows"
                  className="w-12"
                  aria-label="Filter rows"
                >
                  Rows
                </GroupToggle>

                <GroupToggle
                  value="Cols"
                  className="w-12"
                  aria-label="Filter columns"
                >
                  Cols
                </GroupToggle>
              </ToggleGroup>
            </VCenterRow>

            <BaseCol className="justify-between gap-y-1 shrink-0">
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
                        matchEntireCell: state
                          ? true
                          : settings.rows.matchEntireCell,
                      },
                    })
                  } else {
                    updateSettings({
                      ...settings,
                      cols: {
                        ...settings.cols,
                        keepOrder: state,
                        matchEntireCell: state
                          ? true
                          : settings.cols.matchEntireCell,
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
          </ResizablePanel>
        </ResizablePanelGroup>
      </PropsPanel>
    </>
  )
}
