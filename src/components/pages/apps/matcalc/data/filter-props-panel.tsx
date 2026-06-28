import {
  onTextFileChange,
  openFilesDialog,
} from '@/components/pages/open-files'
import { BaseCol } from '@/layout/base-col'

import { VCenterRow } from '@/layout/v-center-row'

import { PropsPanel } from '@/components/props-panel'
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
import { makeUuid } from '@/lib/id'
import { textToLines } from '@/lib/text/lines'
import { useSearchFilters } from '@/stores/search-filter-store'

import { useDialogs } from '@/components/dialogs/dialogs'
import { UploadIcon } from '@/components/icons/upload-icon'
import { ResizableSidebarHeaderPortal } from '@/components/slide-bar/resizable-sidebar'
import { Textarea } from '@/themed/textarea'
import { Button } from '@/themed/v2/button'
import { Checkbox } from '@/themed/v2/check-box'
import { Toast } from '@base-ui/react/toast'
import { useEffect, useState } from 'react'

import { LinkButton } from '@/components/shadcn/ui/themed/link-button'
import { TEXT_CLEAR, TEXT_OK } from '@/consts'
import { useCurrentSheets } from '../history/history-provider/history-contexts'
import { useHistory } from '../history/history-provider/history-provider'
import APP_INFO from '../manifest.json'

export function FilterPropsPanel() {
  const { addSheets } = useHistory()
  const { sheets } = useCurrentSheets()

  const { open: openDialog } = useDialogs()

  const { add: addToast } = Toast.useToastManager()
  const [text, setText] = useState('')

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

    let df: BaseDataFrame

    if (filterMode.includes('Rows')) {
      df = findRows(sheets[0] as BaseDataFrame, queries, {
        caseSensitive: settings.rows.caseSensitive,
        matchEntireCell: settings.rows.matchEntireCell,
        keepOrder: settings.rows.keepOrder,
      }).setName('Row Filter')
    } else {
      df = findCols(sheets[0] as BaseDataFrame, queries, {
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
        title: APP_INFO.name,
        description: `There were no ${
          filterMode.includes('Rows') ? 'rows' : 'columns'
        } matching your filter.`,
        type: 'destructive',
      })
    }
  }

  return (
    <>
      <ResizableSidebarHeaderPortal>
        <h2 className="text-sm font-medium">Filter</h2>
      </ResizableSidebarHeaderPortal>
      <ResizableSidebarHeaderPortal side="right">
        <LinkButton
          onClick={() => {
            openDialog({
              type: 'warning',
              payload: {
                title: 'Clear filter',
                content: 'Are you sure you want to clear the filter?',
                callback: (response) => {
                  if (response === TEXT_OK) {
                    setText('')

                    if (filterMode.includes('Rows')) {
                      resetRowFilters()
                    } else {
                      resetColFilters()
                    }
                  }
                },
              },
            })
          }}
          className="text-xs"
        >
          {TEXT_CLEAR}
        </LinkButton>
      </ResizableSidebarHeaderPortal>

      <PropsPanel className="gap-y-2">
        <ResizablePanelGroup orientation="vertical" className="grow">
          <ResizablePanel
            defaultSize="30%"
            minSize="0%"
            className="grow flex flex-col gap-y-2 overflow-hidden"
            id="filter-text"
          >
            <FileDropZonePanel
              className="grow"
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
                  openFilesDialog({
                    onFileChange: (message, files) => {
                      onTextFileChange(message, files, (files) => {
                        if (files.length > 0) {
                          setText(files[0]!.text)
                        }
                      })
                    },
                  })
                }
                className="fill-foreground"
                title="Open list of Ids from file"
              >
                <UploadIcon />
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
                variant="app-theme"
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
