import { SlidersIcon } from '@icons/sliders-icon'

import { useEffect, useRef, useState } from 'react'

import { TabSlideBar } from '@components/slide-bar/tab-slide-bar'
import { type ITab } from '@components/tabs/tab-provider'
import { getFormattedShape } from '@lib/dataframe/dataframe-utils'
import { downloadSvgAutoFormat } from '@lib/image-utils'
import { ToolbarFooterPortal } from '@toolbar/toolbar-footer-portal'
import { ZoomSlider } from '@toolbar/zoom-slider'
import { useHistory, usePlot } from '../../history/history-store'

import { TEXT_CANCEL, TEXT_DISPLAY } from '@/consts'
import { SaveImageDialog } from '@components/pages/save-image-dialog'
import {
  DEFAULT_HEATMAP_PROPS,
  type IHeatMapDisplayOptions,
} from '@components/plot/heatmap/heatmap-svg-props'
import {
  DEFAULT_EXT_GSEA_PROPS,
  type IExtGseaDisplayOptions,
} from '../../../genes/gsea/ext-gsea-store'

import {
  messageImageFileFormat,
  useMessages,
} from '@/providers/message-provider'
import { useZoom } from '@/providers/zoom-provider'
import type { AnnotationDataFrame } from '@lib/dataframe/annotation-dataframe'
import { Card } from '@themed/card'
import { produce } from 'immer'

import { useMatcalcSettings } from '../../settings/matcalc-settings'
import { PLOT_CLS } from '../heatmap/heatmap-panel'
import { ExtGseaPropsPanel } from './ext-gsea-props-panel'
import { ExtGseaSvg } from './ext-gsea-svg'

export function makeDefaultHeatmapProps(mode: string): IHeatMapDisplayOptions {
  return {
    ...DEFAULT_HEATMAP_PROPS,
    mode: mode.toLowerCase().includes('dot') ? 'dot' : 'heatmap',
  }
}

interface IExtGseaPanelProps {
  //plotId: string
  plotAddr: string
}

function ExtGseaPanel({ plotAddr }: IExtGseaPanelProps) {
  // const { plotsState, plotsDispatch } = useContext(PlotsContext)

  // const plot = plotsState.plotMap[plotId]

  // if (!plot) {
  //   return null
  // }

  const { updateProps } = useHistory()

  const plot = usePlot(plotAddr)!

  const sheet = plot!.dataframes['main']! as AnnotationDataFrame

  const displayOptions: IExtGseaDisplayOptions =
    (plot?.customProps.displayOptions as IExtGseaDisplayOptions) ??
    DEFAULT_EXT_GSEA_PROPS

  const { zoom } = useZoom()

  const svgRef = useRef<SVGSVGElement>(null)

  const [showSave, setShowSave] = useState(false)
  const { messages, removeMessage } = useMessages() //'ext-gsea')
  const { settings, updateSettings } = useMatcalcSettings()

  useEffect(() => {
    const filteredMessages = messages.filter(
      message => message.target === plot?.id
    )

    for (const message of filteredMessages) {
      if (message.text.includes('save')) {
        if (message.text.includes(':')) {
          downloadSvgAutoFormat(
            svgRef,
            `extgsea.${messageImageFileFormat(message)}`
          )
        } else {
          setShowSave(true)
        }
      }

      removeMessage(message.id)
    }
  }, [messages])

  useEffect(() => {
    const newOptions = produce(displayOptions, draft => {
      draft.page.scale = zoom
    })

    updateProps(plotAddr, 'displayOptions', newOptions)
  }, [zoom])

  const plotRightTabs: ITab[] = [
    {
      //id: nanoid(),
      id: TEXT_DISPLAY,
      icon: <SlidersIcon />,
      content: <ExtGseaPropsPanel plotAddr={plotAddr} />,
    },
  ]

  return (
    <>
      {showSave && (
        <SaveImageDialog
          name="ext-gsea"
          onResponse={(response, data) => {
            if (response !== TEXT_CANCEL) {
              downloadSvgAutoFormat(svgRef, data!.name as string)
            }

            setShowSave(false)
          }}
        />
      )}

      {/* <ResizablePanelGroup
          direction="horizontal"
          id="plot-resizable-panels"
          //autoSaveId="plot-resizable-panels"
          className="grow"
        >
          <ResizablePanel
            id="plot-svg"
            order={1}
            defaultSize={75}
            minSize={50}
            className="flex flex-col pl-2 pt-2 pb-2"
          >
            <div className="custom-scrollbar relative grow overflow-scroll rounded-lg border bg-white">
              <HeatMapSvg
                ref={svgRef}
                cf={plot!.cf}
                groups={groups}
                displayOptions={displayOptions}
              />
            </div>
          </ResizablePanel>
          <ThinHResizeHandle />
          <ResizablePanel
            id="plot-svg-right"
            order={2}
            className="flex flex-col"
            defaultSize={25}
            minSize={15}
            collapsible={true}
            collapsedSize={0}
          >
            <SideBarTextTabs tabs={plotRightTabs} />
          </ResizablePanel>
        </ResizablePanelGroup> */}

      <TabSlideBar
        id="ext-gsea-panel"
        tabs={plotRightTabs}
        side="right"
        //tabs={plotRightTabs}
        //onValueChange={setSelectedTab}
        //value={selectedTab}
        open={settings.sidebar.show}
        onOpenChange={v => {
          const newSettings = produce(settings, draft => {
            draft.sidebar.show = v
          })

          updateSettings(newSettings)
        }}
      >
        <Card variant="content" className="mx-2 mb-2 grow">
          <div className={PLOT_CLS}>
            <ExtGseaSvg
              ref={svgRef}
              plotAddr={plotAddr}
              //extGsea={extGsea}
              //displayOptions={displayOptions}
            />
          </div>
        </Card>
      </TabSlideBar>

      <ToolbarFooterPortal className="shrink-0 grow-0 ">
        <span>{getFormattedShape(sheet)} </span>
        <></>
        <>
          <ZoomSlider />
        </>
      </ToolbarFooterPortal>
    </>
  )
}

export function ExtGseaPanelQuery({ plotAddr }: IExtGseaPanelProps) {
  return <ExtGseaPanel plotAddr={plotAddr} />
}
