import { DownloadIcon } from '@/components/icons/download-icon'
import { ToolbarIconButton } from '@/components/toolbar/toolbar-icon-button'
import { ToolbarOpenFile } from '@/components/toolbar/toolbar-open-files'
import { ToolbarTabGroup } from '@/components/toolbar/toolbar-tab-group'

import { useDialogs } from '@/components/dialogs/dialogs'
import { ToolbarButton } from '@/components/toolbar/toolbar-button'
import { ToolbarCol } from '@/components/toolbar/toolbar-col'
import { useSVG } from '@/providers/svg-provider'
import { produce } from 'immer'
import { LollipopCountIcon } from '../lollipop-count-icon'
import { useLollipopSettings } from '../lollipop-settings-store'
import { LollipopSingleIcon } from '../lollipop-single-icon'
import { LollipopStackIcon } from '../lollipop-stack-icon'
import { useOpen } from '../use-open'

export function HomeToolbar() {
  const { open: openDialog } = useDialogs()
  const { open } = useOpen()
  const { svgRef } = useSVG()
  const {
    plotStyle,
    setPlotStyle,
    showMaxVariantOnly,
    setShowMaxVariantOnly,

    displayProps,
    setDisplayProps,
  } = useLollipopSettings()

  return (
    <>
      <ToolbarTabGroup title="File">
        <ToolbarOpenFile
          onClick={() => {
            console.log('open file menu')
            open('variants')
          }}
        />

        <ToolbarIconButton
          aria-label="Save image"
          onClick={() => {
            openDialog({
              type: 'save-image',
              payload: {
                name: 'lollipop',
                svgRef,
              },
            })
          }}
        >
          <DownloadIcon />
        </ToolbarIconButton>
      </ToolbarTabGroup>

      <ToolbarTabGroup title="View" className="gap-x-1 items-start">
        <ToolbarCol>
          <ToolbarIconButton
            title="Create a stacked lollipop plot"
            //className="rounded-r-none"
            checked={plotStyle === 'stack'}
            onClick={() => {
              setPlotStyle('stack')
            }}
          >
            <LollipopStackIcon />
          </ToolbarIconButton>
          <ToolbarIconButton
            title="Create a single lollipop plot"
            //className="rounded-l-none"
            checked={plotStyle === 'single'}
            onClick={() => {
              setPlotStyle('single')
            }}
          >
            <LollipopSingleIcon />
          </ToolbarIconButton>
        </ToolbarCol>

        <ToolbarCol>
          <ToolbarButton
            title="Show only maximum variant"
            checked={showMaxVariantOnly}
            onClick={() => {
              setShowMaxVariantOnly(!showMaxVariantOnly)
            }}
          >
            Max variant
          </ToolbarButton>

          <ToolbarButton
            title="Lollipop sizes are proportional to the number of variants"
            checked={displayProps.variants.plot.proportional}
            onClick={() => {
              setDisplayProps(
                produce(displayProps, (draft) => {
                  draft.variants.plot.proportional =
                    !draft.variants.plot.proportional
                })
              )
            }}
          >
            Proportional
          </ToolbarButton>
        </ToolbarCol>

        <ToolbarIconButton
          title="Show mutation counts on single lollipop plot"
          checked={displayProps.variants.plot.showCounts}
          onClick={() => {
            setDisplayProps(
              produce(displayProps, (draft) => {
                draft.variants.plot.showCounts = !draft.variants.plot.showCounts
              })
            )
          }}
        >
          <LollipopCountIcon />
        </ToolbarIconButton>
      </ToolbarTabGroup>
    </>
  )
}
