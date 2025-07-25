import { FOCUS_RING_CLS, PILL_BUTTON_CLS } from '@/theme'
import { ColorPickerButton } from '@components/color/color-picker-button'
import { BASE_IDS } from '@components/pages/apps/genes/motifs/motif-svg'
import { PropsPanel } from '@components/props-panel'
import { PropRow } from '@dialog/prop-row'
import { VCenterRow } from '@layout/v-center-row'
import { cn } from '@lib/shadcn-utils'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@themed/accordion'
import { NumericalInput } from '@themed/numerical-input'
import { produce } from 'immer'
import { useMotifSettings, type DNABase } from './motifs-settings'

export function DisplayPropsPanel() {
  const { settings, updateSettings } = useMotifSettings()
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
                value={settings.letterWidth}
                placeholder="Letter width..."
                onNumChanged={v => {
                  updateSettings(
                    produce(settings, draft => {
                      draft.letterWidth = v
                    })
                  )
                }}
              />
            </PropRow>
            <PropRow title="Plot height">
              <NumericalInput
                id="h"
                limit={[1, 200]}
                value={settings.plotHeight}
                placeholder="Plot height..."
                onNumChanged={v => {
                  updateSettings(
                    produce(settings, draft => {
                      draft.plotHeight = v
                    })
                  )
                }}
              />
            </PropRow>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="colors">
          <AccordionTrigger>Colors</AccordionTrigger>
          <AccordionContent>
            <VCenterRow className="gap-x-3">
              {BASE_IDS.map(base => (
                <ColorPickerButton
                  key={base}
                  color={
                    settings.baseColors[base.toLowerCase() as DNABase] as string
                  }
                  onColorChange={color =>
                    updateSettings(
                      produce(settings, draft => {
                        draft.baseColors[base.toLowerCase() as DNABase] = color
                      })
                    )
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
