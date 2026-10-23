import { ToolbarIconButton } from '@/components/toolbar/toolbar-icon-button'
import { ToolbarOpenFile } from '@/components/toolbar/toolbar-open-files'
import { ToolbarTabGroup } from '@/components/toolbar/toolbar-tab-group'

import { DownloadImageIcon } from '@/components/icons/computer/download-image-icon'
import { ToolbarButton } from '@/components/toolbar/toolbar-button'
import { ToolbarCol } from '@/components/toolbar/toolbar-col'
import { TEXT_SAVE_IMAGE } from '@/consts'
import { useSVG } from '@/providers/svg-provider'
import { produce } from 'immer'
import { LollipopCountIcon } from '../lollipop-count-icon'
import { useLollipopSettings } from '../lollipop-settings-store'
import { LollipopSingleIcon } from '../lollipop-single-icon'
import { LollipopStackIcon } from '../lollipop-stack-icon'
import { useOpen } from '../use-open'

export function HomeToolbar() {
  const { open } = useOpen()
  const { saveAs } = useSVG()
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
            open('variants')
          }}
        />

        <ToolbarIconButton
          aria-label={TEXT_SAVE_IMAGE}
          onClick={() => {
            saveAs('lollipop')
          }}
        >
          <DownloadImageIcon />
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
