import { BaseCol } from '@/components/layout/base-col'
import { OKCancelDialog } from '@components/dialog/ok-cancel-dialog'
import { onTextFileChange, OpenFiles } from '@components/pages/open-files'
import { ToggleButtons, ToggleButtonTriggers } from '@components/toggle-buttons'

import { VCenterRow } from '@/components/layout/v-center-row'
import { NO_DIALOG, TEXT_CLEAR, TEXT_OK, type IDialogParams } from '@/consts'

import { FileDropPanel } from '@/components/file-drop-panel'
import { OpenIcon } from '@/components/icons/open-icon'
import { HCenterRow } from '@/components/layout/h-center-row'
import { Textarea3 } from '@/components/shadcn/ui/themed/textarea3'
import { useToast } from '@/hooks/use-toast'
import { textToLines } from '@/lib/text/lines'
import { makeRandId } from '@/lib/utils'
import { SearchFiltersContext } from '@/providers/search-filter-provider'
import { PropsPanel } from '@components/props-panel'
import { Button } from '@components/shadcn/ui/themed/button'
import { Checkbox } from '@components/shadcn/ui/themed/check-box'
import { VScrollPanel } from '@components/v-scroll-panel'
import { type BaseDataFrame } from '@lib/dataframe/base-dataframe'
import { filterColsById, filterRowsById } from '@lib/dataframe/dataframe-utils'
import { HistoryContext } from '@providers/history-provider'
import {
  forwardRef,
  useContext,
  useEffect,
  useState,
  type ForwardedRef,
} from 'react'
import MODULE_INFO from './module.json'

export interface IProps {
  df: BaseDataFrame | null
}

export const FilterPropsPanel = forwardRef(function FilterPropsPanel(
  { df }: IProps,
  _ref: ForwardedRef<HTMLDivElement>
) {
  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })
  const { historyDispatch } = useContext(HistoryContext)
  const { toast } = useToast()
  //const [caseSensitive, setCaseSensitive] = useState(false)
  //const [entireCell, setMatchEntireCell] = useState(false)
  //const [keepOrder, setKeepOrder] = useState(false)
  const [text, setText] = useState<string>('')
  const [confirmClear, setConfirmClear] = useState(false)
  const [filterMode, setFilterMode] = useState('Rows')

  const { filters, updateFilters, resetRowFilters, resetColFilters } =
    useContext(SearchFiltersContext)

  // useEffect(() => {
  //   console.log("zzz")
  //   if (filterMode.includes('Rows')) {
  //     setText(filters.rows.ids.join('\n'))
  //   } else {
  //     setText(filters.cols.ids.join('\n'))
  //   }
  // }, [])

  useEffect(() => {
    if (filterMode.includes('Rows')) {
      setText(filters.rows.ids.join('\n'))
    } else {
      setText(filters.cols.ids.join('\n'))
    }
  }, [filterMode])

  // function onFileChange(_message: string, files: FileList | null) {
  //   if (!files) {
  //     return
  //   }

  //   const file = files[0]!

  //   //setFile(files[0])
  //   //setShowLoadingDialog(true)

  //   const fileReader = new FileReader()

  //   fileReader.onload = e => {
  //     const result = e.target?.result

  //     if (result) {
  //       // since this seems to block rendering, delay by a second so that the
  //       // animation has time to start to indicate something is happening and
  //       // then finish processing the file
  //       const text: string =
  //         typeof result === 'string' ? result : Buffer.from(result).toString()

  //       setText(text)
  //     }
  //   }

  //   fileReader.readAsText(file)

  //   //setShowFileMenu(false)
  // }

  function filterTable() {
    const ids = textToLines(text, { trim: true })

    if (!df) {
      return
    }

    if (filterMode.includes('Rows')) {
      df = filterRowsById(df, ids, {
        caseSensitive: filters.rows.caseSensitive,
        matchEntireCell: filters.rows.matchEntireCell,
        keepOrder: filters.rows.keepOrder,
      }).setName('Row Filter')
    } else {
      df = filterColsById(df, ids, {
        caseSensitive: filters.cols.caseSensitive,
        matchEntireCell: filters.cols.matchEntireCell,
        keepOrder: filters.cols.keepOrder,
      }).setName('Col Filter')
    }

    if (df.size > 0) {
      historyDispatch({
        type: 'add-step',
        description: df.name,
        sheets: [df],
      })

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
        onReponse={r => {
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

      <PropsPanel className="gap-y-2">
        {/* <h2 className={H2_CLS}>Filter</h2> */}
        {/* <VCenterRow className="gap-x-3">
          <h2 className={H2_CLS}>Filter</h2>

          <ToolbarTabPanel className="rounded-full bg-muted px-3 py-0.5">
            <ToolbarTabGroup>
              <ToolbarIconButton
                onClick={() => setOpen(true)}
                className="fill-foreground"
                tooltip="Open a filter list"
              >
                <OpenIcon fill="" />
              </ToolbarIconButton>
            </ToolbarTabGroup>
 
          </ToolbarTabPanel>
        </VCenterRow> */}

        <HCenterRow className="gap-x-2 shrink-0 py-2">
          <ToggleButtons
            value={filterMode}
            onTabChange={selectedTab => {
              if (selectedTab) {
                setFilterMode(selectedTab.tab.id)
              }
            }}
            tabs={[
              {
                //name: nanoid(),
                id: 'Rows',
              },
              {
                //name: nanoid(),
                id: 'Cols',
              },
            ]}
          >
            <ToggleButtonTriggers className="rounded-theme overflow-hidden" />
          </ToggleButtons>
        </HCenterRow>

        <VCenterRow className="justify-between gap-x-2 shrink-0">
          <VCenterRow className="gap-x-2">
            <Button
              variant="accent"
              size="icon"
              ripple={false}
              onClick={() =>
                setShowDialog({
                  id: makeRandId('open'),
                })
              }
              className="fill-foreground"
              title="Open a filter list"
            >
              <OpenIcon w="min-w-5" />
            </Button>
          </VCenterRow>

          <Button
            variant="link"
            pad="none"
            size="sm"
            ripple={false}
            onClick={() => setConfirmClear(true)}
          >
            {TEXT_CLEAR}
          </Button>
        </VCenterRow>

        <VScrollPanel innerClassName="gap-y-2">
          <FileDropPanel
            onFileDrop={files => {
              if (files.length > 0) {
                onTextFileChange('Open filter list', files, files => {
                  if (files.length > 0) {
                    setText(files[0]!.text)
                  }
                })
              }
            }}
          >
            <Textarea3
              id="filter"
              aria-label="Filter"
              value={text}
              onChange={e => setText(e.target.value)}
              //placeholder={`Filter ${filterMode}`}
              className="h-96"
            />
          </FileDropPanel>

          <BaseCol className="justify-between gap-y-1 py-2 shrink-0">
            <Checkbox
              checked={
                filterMode.includes('Rows')
                  ? filters.rows.caseSensitive
                  : filters.cols.caseSensitive
              }
              onCheckedChange={state => {
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
              onCheckedChange={state => {
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
              onCheckedChange={state => {
                if (filterMode.includes('Rows')) {
                  updateFilters({
                    ...filters,
                    rows: {
                      ...filters.rows,
                      keepOrder: state,
                      matchEntireCell: state
                        ? true
                        : filters.rows.matchEntireCell,
                    },
                  })
                } else {
                  updateFilters({
                    ...filters,
                    cols: {
                      ...filters.cols,
                      keepOrder: state,
                      matchEntireCell: state
                        ? true
                        : filters.cols.matchEntireCell,
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
              aria-label="Apply filter to current matrix"
              onClick={() => filterTable()}
            >
              Apply
            </Button>
          </VCenterRow>
        </VScrollPanel>
      </PropsPanel>
      {showDialog.id.includes('open') && (
        <OpenFiles
          open={showDialog.id}
          onFileChange={(message, files) =>
            onTextFileChange(message, files, files => {
              if (files.length > 0) {
                setText(files[0]!.text)
              }
            })
          }
        />
      )}
    </>
  )
})
