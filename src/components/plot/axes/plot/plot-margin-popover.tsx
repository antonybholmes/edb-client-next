import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/shadcn/ui/themed/v2/popover'

import { MarginIcon } from '@/components/icons/margin-icon'
import { VCenterRow } from '@/components/layout/v-center-row'
import { NumericalInput } from '@/components/shadcn/ui/themed/numerical-input'
import { ToolbarIconButton } from '@/components/toolbar/toolbar-icon-button'
import { produce } from 'immer'
import { ReactNode } from 'react'
import { ButtonStyle } from '../../stroke-dropdown-menu'
import { IMarginProps } from '../../svg-props'

export function PlotMarginPopover({
  margin,
  updateMargin,
  button = 'simple',
  title = 'Margins',
}: {
  margin: IMarginProps
  updateMargin: (margin: IMarginProps) => void
  button?: ButtonStyle
  title?: string
}) {
  //const title = `Top:${settings.plot.margin.top}, Left:${settings.plot.margin.left}, Bottom:${settings.plot.margin.bottom}, Right:${settings.plot.margin.right}`

  const trigger: ReactNode =
    button === 'flat' ? (
      <PopoverTrigger
        render={
          <ToolbarIconButton title={title}>
            <MarginIcon />
          </ToolbarIconButton>
        }
      />
    ) : (
      <PopoverTrigger
        title={title}
        className="opacity-60 hover:opacity-80 data-popup-open:opacity-100 trans-opacity"
      >
        <MarginIcon />
      </PopoverTrigger>
    )

  return (
    <Popover>
      {trigger}

      <PopoverContent className="gap-y-1 flex-col w-42" variant="content">
        <VCenterRow className="gap-x-1 justify-center">
          {/* <span>Top</span> */}
          <NumericalInput
            title="Top"
            h="toolbar"
            limit={[0, 1000]}
            value={margin.top}
            onNumChanged={(v) =>
              updateMargin(
                produce(margin, (draft) => {
                  draft.top = v
                })
              )
            }
          />
        </VCenterRow>
        <VCenterRow className="gap-x-1 justify-between">
          <VCenterRow className="gap-x-1">
            {/* <span>Left</span> */}
            <NumericalInput
              title="Left"
              h="toolbar"
              limit={[0, 1000]}
              value={margin.left}
              onNumChanged={(v) =>
                updateMargin(
                  produce(margin, (draft) => {
                    draft.left = v
                  })
                )
              }
            />
          </VCenterRow>
          <VCenterRow className="gap-x-1">
            <NumericalInput
              title="Right"
              h="toolbar"
              limit={[0, 1000]}
              value={margin.right}
              onNumChanged={(v) =>
                updateMargin(
                  produce(margin, (draft) => {
                    draft.right = v
                  })
                )
              }
            />
            {/* <span>Right</span> */}
          </VCenterRow>
        </VCenterRow>
        <VCenterRow className="justify-center gap-x-1">
          <NumericalInput
            title="Bottom"
            h="toolbar"
            limit={[0, 1000]}
            value={margin.bottom}
            onNumChanged={(v) =>
              updateMargin(
                produce(margin, (draft) => {
                  draft.bottom = v
                })
              )
            }
          />
        </VCenterRow>
      </PopoverContent>
    </Popover>
  )
}
