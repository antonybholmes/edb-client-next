import { VCenterRow } from '@layout/v-center-row'

import { IDivProps } from '@/interfaces/div-props'
import {
  ColorPickerButton,
  SIMPLE_COLOR_EXT_CLS,
} from '@components/color/color-picker-button'
import type { IMotifPattern } from '@components/pages/apps/wgs/mutations/pileup-plot-svg'
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
import { produce } from 'immer'
import { useMutations } from './mutation-store'

export interface IProps extends IDivProps {
  motifPatterns: IMotifPattern[]

  onMotifPatternsChange: (patterns: IMotifPattern[]) => void
  onDBChange?: (index: number) => void
}

export function PileupPropsPanel({
  ref,
  motifPatterns,
  onMotifPatternsChange,
}: IProps) {
  const { settings, updateSettings } = useMutations()

  return (
    <PropsPanel ref={ref}>
      <ScrollAccordion value={['plot', 'motif-patterns', 'colormap']}>
        <AccordionItem value="plot">
          <AccordionTrigger>Plot</AccordionTrigger>
          <AccordionContent>
            <SwitchPropRow
              title="Index"
              checked={settings.index.show}
              onCheckedChange={(state) => {
                updateSettings(
                  produce(settings, (draft) => {
                    draft.index.show = state
                  })
                )
              }}
            />

            <SwitchPropRow
              title="Border"
              checked={settings.border.show}
              onCheckedChange={(v) =>
                updateSettings(
                  produce(settings, (draft) => {
                    draft.border.show = v
                  })
                )
              }
            >
              <ColorPickerButton
                color={settings.border.color}
                onColorChange={(color) =>
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.border.color = color
                    })
                  )
                }
                className={SIMPLE_COLOR_EXT_CLS}
              />
            </SwitchPropRow>

            <SwitchPropRow
              title="Add chr prefix"
              checked={settings.chrPrefix.show}
              onCheckedChange={(state) =>
                updateSettings(
                  produce(settings, (draft) => {
                    draft.chrPrefix.show = state
                  })
                )
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
                  onCheckedChange={(state) =>
                    onMotifPatternsChange([
                      ...motifPatterns.filter((x) => x.name !== pattern.name),
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
              value={settings.cmap}
              onValueChange={(value) =>
                updateSettings(
                  produce(settings, (draft) => {
                    draft.cmap = value
                  })
                )
              }
              className="flex flex-col gap-y-1"
            >
              <VCenterRow className="gap-x-1">
                <RadioGroupItem value="None" id="None" />
                <Label htmlFor="None">None</Label>
              </VCenterRow>

              {Object.keys(settings.cmaps)
                .sort()
                .filter((cmap) => cmap !== 'None')
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
}
