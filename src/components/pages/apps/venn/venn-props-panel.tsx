'use client'

import { BaseCol } from '@layout/base-col'

import { PropsPanel } from '@components/props-panel'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@themed/accordion'
import { NumericalInput } from '@themed/numerical-input'

import { useVennSettings } from '@/components/pages/apps/venn/venn-settings-store'
import {
  ColorPickerButton,
  SIMPLE_COLOR_EXT_CLS,
} from '@components/color/color-picker-button'
import { PropRow } from '@dialog/prop-row'
import { SwitchPropRow } from '@dialog/switch-prop-row'
import { COLOR_BLACK, COLOR_WHITE } from '@lib/color/color'
import { LinkButton } from '@themed/link-button'
import { produce } from 'immer'

export function VennPropsPanel() {
  const {
    settings,
    updateSettings,
    resetSettings,
    circles,
    updateCircles,
    resetCircles,
    updateRadius,
  } = useVennSettings()

  return (
    <PropsPanel>
      <ScrollAccordion
        value={['plot', 'circles', 'titles', 'counts', 'percentages']}
      >
        <AccordionItem value="plot">
          <AccordionTrigger>Plot</AccordionTrigger>
          <AccordionContent>
            <PropRow title="Plot width">
              <NumericalInput
                id="w"
                limit={[200, 10000]}
                value={settings.w}
                placeholder="Cell width..."
                onNumChanged={(w) => {
                  updateSettings({
                    w,
                  })
                }}
              />
            </PropRow>

            <PropRow title="Radius">
              <NumericalInput
                id="r"
                limit={[10, 1000]}
                value={settings.radius}
                placeholder="Circle radius..."
                onNumChanged={(r) => {
                  updateSettings({
                    radius: r,
                  })
                }}
              />
            </PropRow>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="circles">
          <AccordionTrigger>Circles</AccordionTrigger>
          <AccordionContent>
            <SwitchPropRow
              title="Fill"
              checked={settings.isFilled}
              onCheckedChange={(state) => {
                updateSettings(
                  produce(settings, (draft) => {
                    for (let i = 1; i < 5; i++) {
                      draft.circles[i].fill.show = state
                      draft.circles[i].text.color = state
                        ? draft.circles[i].stroke.color
                        : draft.circles[i].fill.color
                    }

                    draft.isFilled = state
                    draft.isOutlined = state ? settings.isOutlined : true
                    if (settings.autoColorText) {
                      draft.intersectionColor = state
                        ? COLOR_WHITE
                        : COLOR_BLACK
                    }
                  })
                )
              }}
            />

            <SwitchPropRow
              title="Outline"
              checked={settings.isOutlined}
              onCheckedChange={(state) =>
                updateSettings({
                  isOutlined: state,
                })
              }
            />
            {/* <SwitchPropRow
              title="Proportional"
              checked={settings.isProportional}
              onCheckedChange={(state) =>
                updateSettings({
                  isProportional: state,
                })
              }
            />
            <SwitchPropRow
              title="Normalize"
              checked={settings.normalize}
              onCheckedChange={(state) =>
                updateSettings({
                  normalize: state,
                })
              }
            /> */}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="titles">
          <AccordionTrigger>Titles</AccordionTrigger>
          <AccordionContent>
            <SwitchPropRow
              title="Show"
              checked={settings.fonts.title.show}
              onCheckedChange={(state) =>
                updateSettings(
                  produce(settings, (draft) => {
                    draft.fonts.title.show = state
                  })
                )
              }
            />
            <SwitchPropRow
              title="Colored"
              checked={settings.fonts.title.colored}
              onCheckedChange={(state) =>
                updateSettings(
                  produce(settings, (draft) => {
                    draft.fonts.title.colored = state
                  })
                )
              }
            />
            <SwitchPropRow
              title="Counts"
              checked={settings.fonts.counts.show}
              disabled={!settings.fonts.title.show}
              onCheckedChange={(state) =>
                updateSettings(
                  produce(settings, (draft) => {
                    draft.fonts.counts.show = state
                  })
                )
              }
            />
            <PropRow title="Font size">
              <NumericalInput
                limit={[1, 128]}
                value={settings.fonts.title.size}
                placeholder="Cell width..."
                onNumChanged={(w) => {
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.fonts.title.size = w
                    })
                  )
                }}
              />
            </PropRow>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="counts">
          <AccordionTrigger>Counts</AccordionTrigger>
          <AccordionContent>
            <SwitchPropRow
              title="Auto-color"
              checked={settings.autoColorText}
              onCheckedChange={(state) =>
                updateSettings({
                  ...settings,
                  autoColorText: state,
                })
              }
            />
            <PropRow title="Intersection">
              <ColorPickerButton
                color={settings.intersectionColor}
                onColorChange={(color) =>
                  updateSettings({
                    intersectionColor: color,
                  })
                }
                className={SIMPLE_COLOR_EXT_CLS}
              />
            </PropRow>

            <PropRow title="Font size">
              <NumericalInput
                limit={[1, 128]}
                value={settings.fonts.counts.size}
                placeholder="Font size..."
                onNumChanged={(w) => {
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.fonts.counts.size = w
                    })
                  )
                }}
              />
            </PropRow>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="percentages">
          <AccordionTrigger>Percentages</AccordionTrigger>
          <AccordionContent>
            <SwitchPropRow
              title="Show"
              checked={settings.fonts.percentages.show}
              onCheckedChange={(state) =>
                updateSettings(
                  produce(settings, (draft) => {
                    draft.fonts.percentages.show = state
                  })
                )
              }
            />
            <PropRow title="Font Size">
              <NumericalInput
                limit={[1, 128]}
                value={settings.fonts.percentages.size}
                placeholder="Font size..."
                onNumChanged={(w) => {
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.fonts.percentages.size = w
                    })
                  )
                }}
              />
            </PropRow>
          </AccordionContent>
        </AccordionItem>
      </ScrollAccordion>

      <BaseCol className="justify-start gap-y-2 pt-4">
        <LinkButton onClick={() => resetSettings()}>
          Default settings
        </LinkButton>

        <LinkButton onClick={() => resetCircles()}>Default colors</LinkButton>
      </BaseCol>
    </PropsPanel>
  )
}
