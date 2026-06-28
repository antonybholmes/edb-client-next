import { TabbedDataFrames } from '@/components/pages/apps/matcalc/tabbed-dataframes'

//import { ZoomSlider } from "@/toolbar/zoom-slider"

import { useEffect } from 'react'

import { TEXT_DELETE, TEXT_OK } from '@/consts'

import { DeleteIcon } from '@/icons/delete-icon'

import {
  filesToDataFrames,
  onTextFileChange,
  type IParseOptions,
  type ITextFileOpen,
} from '@/components/pages/open-files'
import { replaceFileExt } from '@/lib/path'
import {
  messageTextFileFormat,
  useMessages,
} from '@/providers/message-provider'
import { useZoom } from '@/providers/zoom-provider'

import { FooterPortal } from '@/components/toolbar/footer-portal'
import { ZoomSlider } from '@/toolbar/zoom-slider'

import { useDialogs } from '@/components/dialogs/dialogs'
import { ResizableSidebar } from '@/components/slide-bar/resizable-sidebar'

import { makeUuid } from '@/lib/id'
import { useFooter } from '@/providers/footer-provider'
import {
  useCurrentSheets,
  useFiles,
} from '../history/history-provider/history-contexts'
import { useHistory } from '../history/history-provider/history-provider'
import { useSave } from '../hooks/save'
import { useMatcalcDialogs } from '../matcalc-dialogs'
import { useMatcalcSettings } from '../settings/matcalc-settings'
import { DataPropsPanel } from './data-props-panel'
import { FooterDFSize } from './footer-df-size'

export const DEFAULT_PANEL_ID = 'Table 1'

export const SHEET_PANEL_CLS = 'overflow-hidden relative' //cn(DATA_PANEL_CLS, 'px-3 pt-3')

export const DATA_ZOOM_CHANNEL = 'matcalc-data'

export const MESSAGE_CHANNEL = 'matcalc'

export function DataPanel() {
  const { openFile, remove } = useHistory()

  const { file } = useFiles()

  const { sheets } = useCurrentSheets()
  const { settings } = useMatcalcSettings()

  const { zoom } = useZoom(DATA_ZOOM_CHANNEL)
  const { open: openDialog } = useDialogs()
  const { open: openMatcalcDialog } = useMatcalcDialogs()

  const { set: setFooter } = useFooter()

  const { messages, removeMessage } = useMessages(MESSAGE_CHANNEL) //)//'data-panel' + nanoid())

  const { save } = useSave()

  // useEffect(() => {
  //   reorderSheets(dfTabs.map((t) => t.id))
  // }, [dfTabs])

  useEffect(() => {
    setFooter('left', { id: makeUuid(), component: FooterDFSize })
  }, [setFooter])

  useEffect(() => {
    //const filteredMessages = messages.filter(m => m.target === branch?.id)

    for (const message of messages) {
      if (typeof message.data === 'string') {
        if (message.data.includes('save:') && sheets.length > 0) {
          const ext = messageTextFileFormat(message)
          save(
            sheets[0].name
              ? replaceFileExt(sheets[0].name, ext)
              : replaceFileExt('table', ext),
            ext
          )
        } else if (message.data === 'save') {
          openDialog({
            type: 'save-table',
            payload: {
              callback: (data) => {
                save(data.name, data.format.ext)
              },
            },
          })
        } else {
          // do nothing
        }
      }

      // clear unknown messages so they are not repeatedly reused
      removeMessage(message.id)
    }
  }, [messages])

  // const rightTabs: ITab[] = [
  //   {
  //     id: 'Labels',
  //     icon: <LayersIcon />,
  //     content: ()=> <DataPropsPanel />,
  //   },
  //   {
  //     id: 'Filter',
  //     icon: <FilterIcon />,

  //     content: ()=>(
  //       <PropsPanel className="gap-y-2">
  //         <FilterPropsPanel />
  //       </PropsPanel>
  //     ),
  //   },
  // ]

  function openFiles(files: ITextFileOpen[], options: IParseOptions) {
    filesToDataFrames(files, {
      parseOpts: options,
      onSuccess: (tables) => {
        if (tables.length > 0) {
          openFile(tables[0]!.name, { sheets: tables })
        }
      },
      onError: () => {
        openDialog({
          type: 'alert',
          payload: {
            title: 'Error opening file',
            content:
              'Your files could not be opened. Check they are formatted correctly.',
            type: 'error',
          },
        })
      },
    })
  }

  return (
    <>
      <ResizableSidebar side="right">
        <TabbedDataFrames
          //selectedSheet={sheet?.id ?? ''}
          ////dataFrames=sheets as AnnotationDataFrame[]}
          // onTabChange={(selectedTab: ISelectedTab) => {
          //   goto({ file, sheet: selectedTab.tab }) //, 'sheet')
          // }}
          onFileDrop={(files) => {
            if (files.length > 0) {
              onTextFileChange('Open from drag', files, (files) => {
                openMatcalcDialog({
                  type: 'open-table-file',
                  payload: {
                    files,
                    callback: openFiles,
                  },
                })
              })
            }
          }}
          className="relative"

          allowReorder={true}
          menuActions={[
            { action: TEXT_DELETE, icon: <DeleteIcon stroke="" /> },
          ]}
          menuCallback={(tab, action) => {
            if (action === TEXT_DELETE) {
              openDialog({
                type: 'warning',
                payload: {
                  title: 'Delete sheet',
                  content: `Are you sure you want to delete ${tab.name}?`,
                  callback: (response) => {
                    if (response === TEXT_OK) {
                      if (sheets.length > 1) {
                        //remove(tab.id, 'sheet')
                        remove([{ file: file.id, sheet: tab.id }])
                      } else {
                        // if user is removing the only remaining sheet, load an empty
                        // sheet into the UI
                        openDialog({
                          type: 'alert',
                          payload: {
                            title: 'Cannot delete sheet',
                            content:
                              'You cannot delete the only remaining sheet. Please add another sheet before deleting this one.',
                            type: 'error',
                          },
                        })
                      }
                    }
                  },
                },
              })
            }
          }}
          zoom={zoom}
          dp={settings.view.dp}
          commas={settings.view.commas}
        />

        <DataPropsPanel />
      </ResizableSidebar>
      <FooterPortal>
        <></>
        <></>
        <ZoomSlider channel={DATA_ZOOM_CHANNEL} />
      </FooterPortal>
    </>
  )
}
