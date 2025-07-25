import { VCenterRow } from '@layout/v-center-row'

import {
  ColorPickerButton,
  SIMPLE_COLOR_EXT_CLS,
} from '@components/color/color-picker-button'
import type {
  IMotifPattern,
  IPileupProps,
} from '@components/pages/apps/wgs/mutations/pileup-plot-svg'
import { PropsPanel } from '@components/props-panel'
import { SwitchPropRow } from '@dialog/switch-prop-row'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@themed/accordion'
import { Label } from '@themed/label'
import { RadioGroup, RadioGroupItem } from '@themed/radio-group'
import { forwardRef, type ForwardedRef } from 'react'

export interface IProps {
  motifPatterns: IMotifPattern[]

  displayProps: IPileupProps
  onDisplayPropsChange: (props: IPileupProps) => void
  onMotifPatternsChange: (patterns: IMotifPattern[]) => void
  onDBChange?: (index: number) => void
}

export const PileupPropsPanel = forwardRef(function PileupPropsPanel(
  {
    motifPatterns,

    displayProps,
    onDisplayPropsChange,
    onMotifPatternsChange,
  }: IProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  return (
    <PropsPanel ref={ref}>
      <ScrollAccordion value={['plot', 'motif-patterns', 'colormap']}>
        <AccordionItem value="plot">
          <AccordionTrigger>Plot</AccordionTrigger>
          <AccordionContent>
            <SwitchPropRow
              title="Index"
              checked={displayProps.index.show}
              onCheckedChange={state =>
                onDisplayPropsChange({
                  ...displayProps,
                  index: { ...displayProps.index, show: state },
                })
              }
            />

            <SwitchPropRow
              title="Border"
              checked={displayProps.border.show}
              onCheckedChange={state =>
                onDisplayPropsChange({
                  ...displayProps,
                  border: { ...displayProps.border, show: state },
                })
              }
            >
              <ColorPickerButton
                color={displayProps.border.color}
                onColorChange={color =>
                  onDisplayPropsChange({
                    ...displayProps,
                    border: { ...displayProps.border, color },
                  })
                }
                className={SIMPLE_COLOR_EXT_CLS}
              />
            </SwitchPropRow>

            <SwitchPropRow
              title="Add chr prefix"
              checked={displayProps.chrPrefix.show}
              onCheckedChange={state =>
                onDisplayPropsChange({
                  ...displayProps,
                  chrPrefix: { ...displayProps.chrPrefix, show: state },
                })
              }
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="motif-patterns">
          <AccordionTrigger>Motif Patterns</AccordionTrigger>
          <AccordionContent>
            {motifPatterns.map((pattern, pi) => {
              return (
                <SwitchPropRow
                  title={pattern.name}
                  key={pi}
                  checked={pattern.show}
                  onCheckedChange={state =>
                    onMotifPatternsChange([
                      ...motifPatterns.filter(x => x.name !== pattern.name),
                      {
                        ...pattern,
                        show: state,
                      },
                    ])
                  }
                />
              )
            })}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="colormap">
          <AccordionTrigger>Colormap</AccordionTrigger>
          <AccordionContent>
            <RadioGroup
              value={displayProps.cmap}
              onValueChange={value =>
                onDisplayPropsChange({
                  ...displayProps,
                  cmap: value,
                })
              }
              className="flex flex-col gap-y-1"
            >
              <VCenterRow className="gap-x-1">
                <RadioGroupItem value="None" id="None" />
                <Label htmlFor="None">None</Label>
              </VCenterRow>

              {Object.keys(displayProps.cmaps)
                .sort()
                .filter(cmap => cmap !== 'None')
                .map((cmap, pi) => {
                  return (
                    <VCenterRow className="gap-x-1" key={pi}>
                      <RadioGroupItem value={cmap} id={cmap} />
                      <Label htmlFor={cmap}>{cmap}</Label>
                    </VCenterRow>
                  )
                })}
            </RadioGroup>
          </AccordionContent>
        </AccordionItem>
      </ScrollAccordion>
    </PropsPanel>
  )
})
