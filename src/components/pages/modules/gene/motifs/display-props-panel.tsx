import { ColorPickerButton } from '@/components/color-picker-button'
import { VCenterRow } from '@/components/layout/v-center-row'
import { FOCUS_RING_CLS, PILL_BUTTON_CLS } from '@/theme'
import {
  BASE_IDS,
  type DNABase,
  type IDisplayProps,
} from '@components/pages/modules/gene/motifs/motif-svg'
import { PropRow } from '@components/prop-row'
import { PropsPanel } from '@components/props-panel'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@components/shadcn/ui/themed/accordion'
import { NumericalInput } from '@components/shadcn/ui/themed/numerical-input'
import { cn } from '@lib/class-names'

export interface IProps {
  displayProps: IDisplayProps
  onChange: (props: IDisplayProps) => void
}

export function DisplayPropsPanel({ displayProps, onChange }: IProps) {
  return (
    <PropsPanel>
      <ScrollAccordion value={['plot', 'colors']}>
        <AccordionItem value="plot">
          <AccordionTrigger>Plot</AccordionTrigger>
          <AccordionContent>
            <PropRow title="Letter width">
              <NumericalInput
                id="w"
                limit={[1, 100]}
                value={displayProps.letterWidth}
                placeholder="Letter width..."
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    const v = parseInt(event.currentTarget.value)
                    if (Number.isInteger(v)) {
                      onChange({
                        ...displayProps,
                        letterWidth: v,
                      })
                    }
                  }
                }}
              />
            </PropRow>
            <PropRow title="Plot height">
              <NumericalInput
                id="h"
                limit={[1, 200]}
                value={displayProps.plotHeight}
                placeholder="Plot height..."
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    const v = parseInt(event.currentTarget.value)
                    if (Number.isInteger(v)) {
                      onChange({
                        ...displayProps,
                        plotHeight: v,
                      })
                    }
                  }
                }}
              />
            </PropRow>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="colors">
          <AccordionTrigger>Colors</AccordionTrigger>
          <AccordionContent>
            <VCenterRow className="gap-x-3">
              {BASE_IDS.map((base) => (
                <ColorPickerButton
                  key={base}
                  color={
                    displayProps.baseColors[
                      base.toLowerCase() as DNABase
                    ] as string
                  }
                  onColorChange={(color) =>
                    onChange({
                      ...displayProps,
                      baseColors: {
                        ...displayProps.baseColors,
                        [base.toLowerCase()]: color,
                      },
                    })
                  }
                  className={cn(
                    PILL_BUTTON_CLS,
                    'aspect-square w-7',
                    FOCUS_RING_CLS
                  )}
                >
                  <span className="text-white font-semibold">{base}</span>
                </ColorPickerButton>
              ))}
            </VCenterRow>
          </AccordionContent>
        </AccordionItem>
      </ScrollAccordion>
    </PropsPanel>
  )
}
