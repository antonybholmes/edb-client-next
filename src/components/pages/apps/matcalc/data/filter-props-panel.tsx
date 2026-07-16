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

import { FileDropZonePanel } from '@/components/file-dropzone-panel'
import { type BaseDataFrame } from '@/lib/dataframe/base-dataframe'
import { findCols, findRows } from '@/lib/dataframe/dataframe-utils'
import { makeUuid } from '@/lib/id'
import { textToLines } from '@/lib/text/lines'
import { useSearchFilters } from '@/stores/search-filter-store'

import { useDialogs } from '@/components/dialogs/dialogs'
import { UploadIcon } from '@/components/icons/upload-icon'
import { Textarea } from '@/themed/textarea'
import { Button } from '@/themed/v2/button'
import { Checkbox } from '@/themed/v2/check-box'
import { Toast } from '@base-ui/react/toast'
import { useEffect, useMemo, useState } from 'react'

import { CenterRow } from '@/components/layout/center-row'
import { LinkButton } from '@/components/shadcn/ui/themed/link-button'
import { SideBarHeader } from '@/components/sidebar/resizable-sidebar'
import { SafariTabs } from '@/components/tabs/safari-tabs'
import { getTabName, useTabs } from '@/components/tabs/tab-provider'
import { TEXT_CLEAR, TEXT_OK } from '@/consts'
import { useStableId } from '@/hooks/stable-id'
import { BetweenHorizonalStart } from 'lucide-react'
import { useCurrentSheets } from '../history/history-provider/history-contexts'
import { useHistory } from '../history/history-provider/history-provider'
import APP_INFO from '../manifest.json'

const TABS = [
  {
    id: 'rows',
    name: 'Rows',
    icon: <BetweenHorizonalStart size={16} strokeWidth={3} />,
  },
  {
    id: 'cols',
    name: 'Cols',
    icon: (
      <BetweenHorizonalStart size={16} strokeWidth={3} className="rotate-90" />
    ),
  },
]

export function FilterPropsPanel() {
  const tabsId = useStableId('filter-props-panel-tabs')
  const { selectedTab, setTabs } = useTabs(tabsId)
  const { addSheets } = useHistory()
  const { sheets } = useCurrentSheets()

  const { open: openDialog } = useDialogs()

  const { add: addToast } = Toast.useToastManager()
  const [text, setText] = useState('')

  //const [filterMode, setFilterMode] = useState('Rows')
  const filterMode = useMemo(
    () => getTabName(selectedTab) ?? 'Rows',
    [selectedTab]
  )

  const { settings, updateSettings, resetRowFilters, resetColFilters } =
    useSearchFilters()

  useEffect(() => {
    setTabs(TABS)
  }, [setTabs])

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
    <PropsPanel className="gap-y-2">
      <SideBarHeader className="justify-end">
        {/* <DialogFloatingToolbar className="mt-2">
          <SafariTabs id={tabsId} defaultWidth={4} />
        </DialogFloatingToolbar> */}

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
      </SideBarHeader>

      <CenterRow>
        <SafariTabs id={tabsId} defaultWidth={4} />
      </CenterRow>

      <ResizablePanelGroup orientation="vertical" className="grow mt-4">
        <ResizablePanel
          defaultSize="30%"
          minSize="0%"
          className="grow flex flex-col overflow-hidden"
          id="filter-text"
        >
          <FileDropZonePanel
            className="grow h-full"
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
          <VCenterRow>
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

            {/* <ToolbarSeparator /> */}

            {/* <ToggleGroup
              variant="outline"
              rounded="none"
              value={[filterMode]}
              onValueChange={(v) => {
                setFilterMode(v[0] ?? 'Rows')
              }}
              //rounded="none"
              className="gap-x-px"
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
            </ToggleGroup> */}
          </VCenterRow>

          <BaseCol className="justify-between gap-y-2 shrink-0">
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

          <VCenterRow>
            <Button
              variant="app-theme"
              aria-label="Apply filter to current matrix"
              onClick={() => filterTable()}
            >
              Apply
            </Button>
          </VCenterRow>
        </ResizablePanel>
      </ResizablePanelGroup>
    </PropsPanel>
  )
}
