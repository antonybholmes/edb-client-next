import { Input } from '@/themed/v2/input'

import { DoubleNumericalInput } from '@/components/double-numerical-input'
import { PropsPanel } from '@/components/props-panel'
import { PropRow } from '@/dialog/prop-row'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@/themed/v2/accordion'

import {
  ColorPickerButton,
  SIMPLE_COLOR_EXT_CLS,
} from '@/components/color/color-picker-button'
import { CheckPropRow } from '@/components/dialog/check-prop-row'
import type { IDivProps } from '@/interfaces/div-props'
import { produce } from 'immer'
import { useState } from 'react'
import { useOncoplotSettings } from './oncoplot-settings-store'

export function DisplayPropsPanel({ ref }: IDivProps) {
  const { displayProps, setDisplayProps } = useOncoplotSettings()

  const [tabs, setTabs] = useState<string[]>(['grid', 'samples', 'features'])

  return (
    <PropsPanel ref={ref} className="pr-1">
      <ScrollAccordion
        value={tabs}
        onValueChange={v => setTabs(v as string[])}
        variant="sidebar"
      >
        <AccordionItem value="grid" variant="sidebar">
          <AccordionTrigger variant="sidebar">Grid</AccordionTrigger>
          <AccordionContent variant="sidebar">
            <PropRow title="Label">
              <Input
                id="w"
                value={displayProps.legend.variants.label}
                className="w-full rounded-theme"
                onTextChange={v => {
                  setDisplayProps(
                    produce(displayProps, draft => {
                      draft.legend.variants.label = v
                    })
                  )
                }}
              />
            </PropRow>

            <PropRow title="Cell">
              <DoubleNumericalInput
                v1={displayProps.grid.cell.w}
                v2={displayProps.grid.cell.h}
                dp={0}
                onNumChanged1={v => {
                  setDisplayProps(
                    produce(displayProps, draft => {
                      draft.grid.cell.w = v
                    })
                  )
                }}
                onNumChanged2={v => {
                  setDisplayProps(
                    produce(displayProps, draft => {
                      draft.grid.cell.h = v
                    })
                  )
                }}
              />
            </PropRow>
            <PropRow title="Spacing">
              <DoubleNumericalInput
                v1={displayProps.grid.spacing.x}
                v2={displayProps.grid.spacing.y}
                dp={0}
                onNumChanged1={v => {
                  setDisplayProps(
                    produce(displayProps, draft => {
                      draft.grid.spacing.x = v
                    })
                  )
                }}
                onNumChanged2={v => {
                  setDisplayProps(
                    produce(displayProps, draft => {
                      draft.grid.spacing.y = v
                    })
                  )
                }}
              />
            </PropRow>
            <CheckPropRow
              title="Border"
              checked={displayProps.border.show}
              onCheckedChange={v =>
                setDisplayProps(
                  produce(displayProps, draft => {
                    draft.border.show = v
                  })
                )
              }
            >
              <ColorPickerButton
                color={displayProps.border.color}
                onColorChange={color =>
                  setDisplayProps(
                    produce(displayProps, draft => {
                      draft.border.color = color
                    })
                  )
                }
                className={SIMPLE_COLOR_EXT_CLS}
              />
            </CheckPropRow>
            <CheckPropRow
              title="Outline"
              checked={displayProps.grid.show}
              onCheckedChange={v =>
                setDisplayProps(
                  produce(displayProps, draft => {
                    draft.grid.show = v
                  })
                )
              }
            >
              <ColorPickerButton
                color={displayProps.grid.color}
                onColorChange={color =>
                  setDisplayProps(
                    produce(displayProps, draft => {
                      draft.grid.color = color
                    })
                  )
                }
                className={SIMPLE_COLOR_EXT_CLS}
              />
            </CheckPropRow>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="samples" variant="sidebar">
          <AccordionTrigger variant="sidebar">Samples</AccordionTrigger>
          <AccordionContent variant="sidebar">
            <CheckPropRow
              title="Mutation graph"
              checked={displayProps.samples.graphs.show}
              onCheckedChange={v =>
                setDisplayProps(
                  produce(displayProps, draft => {
                    draft.samples.graphs.show = v
                  })
                )
              }
            />
            <PropRow title="Y-axis">
              <Input
                id="w"
                value={displayProps.samples.graphs.yaxis.label}
                className="w-full rounded-theme"
                onTextChange={v => {
                  setDisplayProps(
                    produce(displayProps, draft => {
                      draft.samples.graphs.yaxis.label = v
                    })
                  )
                }}
              />
            </PropRow>

            <CheckPropRow
              title="Border"
              disabled={!displayProps.samples.graphs.show}
              checked={displayProps.samples.graphs.border.show}
              onCheckedChange={v =>
                setDisplayProps(
                  produce(displayProps, draft => {
                    draft.samples.graphs.border.show = v
                  })
                )
              }
            >
              <ColorPickerButton
                color={displayProps.samples.graphs.border.color}
                onColorChange={color =>
                  setDisplayProps(
                    produce(displayProps, draft => {
                      draft.samples.graphs.border.color = color
                    })
                  )
                }
                className={SIMPLE_COLOR_EXT_CLS}
              />
            </CheckPropRow>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="features" variant="sidebar">
          <AccordionTrigger variant="sidebar">Features</AccordionTrigger>
          <AccordionContent variant="sidebar">
            <CheckPropRow
              title="Sample distribution graph"
              checked={displayProps.features.graphs.show}
              onCheckedChange={v =>
                setDisplayProps(
                  produce(displayProps, draft => {
                    draft.features.graphs.show = v
                  })
                )
              }
            />

            <CheckPropRow
              title="Border"
              disabled={!displayProps.features.graphs.show}
              checked={displayProps.features.graphs.border.show}
              onCheckedChange={v =>
                setDisplayProps(
                  produce(displayProps, draft => {
                    draft.features.graphs.border.show = v
                  })
                )
              }
            >
              <ColorPickerButton
                color={displayProps.features.graphs.border.color}
                onColorChange={color =>
                  setDisplayProps(
                    produce(displayProps, draft => {
                      draft.features.graphs.border.color = color
                    })
                  )
                }
                className={SIMPLE_COLOR_EXT_CLS}
              />
            </CheckPropRow>

            <CheckPropRow
              title="Percentages"
              disabled={!displayProps.features.graphs.show}
              checked={displayProps.features.graphs.percentages.show}
              onCheckedChange={v =>
                setDisplayProps(
                  produce(displayProps, draft => {
                    draft.features.graphs.percentages.show = v
                  })
                )
              }
            />
          </AccordionContent>
        </AccordionItem>

        {/* <AccordionItem value="variants">
          <AccordionTrigger>Variants</AccordionTrigger>
          <AccordionContent variant="sidebar">
            {displayProps.legend.variants.names.map(
              (variant: string, vi: number) => (
                <VCenterRow key={vi} className="gap-x-2">
                  <ColorPickerButton
                    color={
                      displayProps.legend.mutations.colorMap[mutation] ??
                      displayProps.legend.mutations.noAlterationColor
                    }
                    onColorChange={color => {
                      setDisplayProps(
                        produce(displayProps, draft => {
                          draft.legend.mutations.colorMap[mutation] = color
                        })
                      )
                    }}
                    className={SIMPLE_COLOR_EXT_CLS}
                  />

                  <span>{mutation}</span>
                </VCenterRow>
              )
            )}

            <VCenterRow className="gap-x-2">
              <ColorPickerButton
                color={displayProps.legend.mutations.noAlterationColor}
                defaultColor={NO_ALTERATION_COLOR}
                onColorChange={color => {
                  setDisplayProps(
                    produce(displayProps, draft => {
                      draft.legend.mutations.noAlterationColor = color
                    })
                  )
                }}
                className={SIMPLE_COLOR_EXT_CLS}
              />

              <span>{NO_ALTERATIONS_TEXT}</span>
            </VCenterRow>
          </AccordionContent>
        </AccordionItem> */}
      </ScrollAccordion>
    </PropsPanel>
  )
}
