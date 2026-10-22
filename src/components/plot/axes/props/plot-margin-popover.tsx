import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/shadcn/ui/themed/baseui/popover'

import { PropRow } from '@/components/dialogs/prop-row'
import { MarginIcon } from '@/components/icons/margin-icon'
import { NumSlider } from '@/components/shadcn/ui/themed/baseui/num-slider'
import { ToolbarIconButton } from '@/components/toolbar/toolbar-icon-button'
import { produce } from 'immer'
import { ReactNode } from 'react'
import { ButtonStyle, SIMPLE_BUTTON_CLS } from '../../stroke-dropdown-menu'
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
      <PopoverTrigger title={title} className={SIMPLE_BUTTON_CLS}>
        <MarginIcon />
      </PopoverTrigger>
    )

  return (
    <Popover>
      {trigger}

      <PopoverContent className="gap-y-1 flex-col w-56" variant="content">
        <PropRow title="Top">
          <NumSlider
            value={margin.top}
            min={0}
            max={1000}
            onNumChange={(v) =>
              updateMargin(
                produce(margin, (draft) => {
                  draft.top = v
                })
              )
            }
          />
        </PropRow>
        <PropRow title="Left">
          <NumSlider
            value={margin.left}
            min={0}
            max={1000}
            onNumChange={(v) =>
              updateMargin(
                produce(margin, (draft) => {
                  draft.left = v
                })
              )
            }
          />
        </PropRow>
        <PropRow title="Bottom">
          <NumSlider
            value={margin.bottom}
            min={0}
            max={1000}
            onNumChange={(v) =>
              updateMargin(
                produce(margin, (draft) => {
                  draft.bottom = v
                })
              )
            }
          />
        </PropRow>
        <PropRow title="Right">
          <NumSlider
            value={margin.right}
            min={0}
            max={1000}
            onNumChange={(v) =>
              updateMargin(
                produce(margin, (draft) => {
                  draft.right = v
                })
              )
            }
          />
        </PropRow>

        {/* <VCenterRow className="gap-x-1 justify-center">
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
        </VCenterRow> */}
      </PopoverContent>
    </Popover>
  )
}
