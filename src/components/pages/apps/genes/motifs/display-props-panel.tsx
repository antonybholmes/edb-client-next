import { BASE_IDS } from '@/components/pages/apps/genes/motifs/motifs-svg'
import { ColorPickerPopover } from '@/components/plot/color-picker-popover'
import { PropsPanel } from '@/components/props-panel'
import { TEXT_OK, TEXT_RESET } from '@/consts'
import { PropRow } from '@/dialogs/prop-row'
import { VCenterRow } from '@/layout/v-center-row'
import { cn } from '@/lib/shadcn-utils'
import { FOCUS_RING_CLS, PILL_BUTTON_CLS } from '@/theme'
import { LinkButton } from '@/themed/link-button'
import { NumericalInput } from '@/themed/numerical-input'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@/themed/v2/accordion'

import { useDialogs } from '@/components/dialogs/dialogs'
import { FontPopover } from '@/components/plot/font/font-popover'
import { PopoverTrigger } from '@/components/shadcn/ui/themed/v2/popover'
import { ResizableSidebarHeaderPortal } from '@/components/sidebar/resizable-sidebar'
import { SwitchPropRow } from '@/dialogs/switch-prop-row'
import { DNABase } from '@/lib/genomic/dna'
import { produce } from 'immer'
import { useMotifSettings } from './motifs-settings'

export function DisplayPropsPanel() {
  const { settings, updateSettings, resetSettings } = useMotifSettings()

  const { open: openDialog } = useDialogs()

  return (
    <>
      <ResizableSidebarHeaderPortal side="right">
        <LinkButton
          onClick={() => {
            openDialog({
              type: 'warning',
              payload: {
                title: 'Reset to default',
                content: 'Are you sure you want to reset all settings?',
                callback: (response) => {
                  if (response === TEXT_OK) {
                    resetSettings()
                  }
                },
              },
            })
          }}
          title="Reset settings to default"
          className="text-xs"
        >
          {TEXT_RESET}
        </LinkButton>
      </ResizableSidebarHeaderPortal>

      <PropsPanel className="gap-y-2 pr-1">
        <VCenterRow className="justify-end"></VCenterRow>
        <ScrollAccordion value={['plot', 'colors']}>
          <AccordionItem value="plot">
            <AccordionTrigger
              rightChildren={
                <FontPopover
                  fonts={[
                    {
                      title: 'Title',
                      textProps: settings.title.text,
                      update: (font) =>
                        updateSettings(
                          produce(settings, (draft) => {
                            draft.title.text = font
                          })
                        ),
                    },
                  ]}
                />
              }
            >
              Plot
            </AccordionTrigger>
            <AccordionContent>
              <PropRow title="Base width">
                <NumericalInput
                  limit={[1, 100]}
                  value={settings.letterWidth}
                  placeholder="Base width..."
                  onNumChanged={(v) => {
                    updateSettings(
                      produce(settings, (draft) => {
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
                  onNumChanged={(v) => {
                    updateSettings(
                      produce(settings, (draft) => {
                        draft.plotHeight = v
                      })
                    )
                  }}
                />
              </PropRow>
              <PropRow title="Cols">
                <NumericalInput
                  id="cols"
                  limit={[1, 100]}
                  value={settings.cols}
                  placeholder="Cols..."
                  onNumChanged={(v) => {
                    updateSettings(
                      produce(settings, (draft) => {
                        draft.cols = v
                      })
                    )
                  }}
                />
              </PropRow>
              <SwitchPropRow
                title="Axes"
                checked={settings.axes.show}
                onCheckedChange={(checked) =>
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.axes.show = checked
                    })
                  )
                }
              >
                <FontPopover
                  fonts={[
                    {
                      title: 'Axes Title',
                      textProps: settings.axes.title,
                      update: (font) =>
                        updateSettings(
                          produce(settings, (draft) => {
                            draft.axes.title = font
                          })
                        ),
                    },

                    {
                      title: 'Axes Labels',
                      textProps: settings.axes.labels,
                      update: (font) =>
                        updateSettings(
                          produce(settings, (draft) => {
                            draft.axes.labels = font
                            draft.axes.ticks.show = font.show
                          })
                        ),
                    },
                  ]}
                />
              </SwitchPropRow>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="colors">
            <AccordionTrigger>Base Colors</AccordionTrigger>
            <AccordionContent>
              <VCenterRow className="gap-x-2">
                {BASE_IDS.map((base) => (
                  <ColorPickerPopover
                    key={base}
                    colors={[
                      {
                        color:
                          settings.bases[base.toLowerCase() as DNABase]!.font
                            .fill.value,
                        opacity:
                          settings.bases[base.toLowerCase() as DNABase]!.font
                            .fill.opacity,
                        onColorChange: ({ color, opacity }) =>
                          updateSettings(
                            produce(settings, (draft) => {
                              draft.bases[
                                base.toLowerCase() as DNABase
                              ]!.font.fill.value = color
                              draft.bases[
                                base.toLowerCase() as DNABase
                              ]!.font.fill.opacity =
                                opacity ??
                                draft.bases[base.toLowerCase() as DNABase]!.font
                                  .fill.opacity
                            })
                          ),
                      },
                    ]}
                    //keepAlphaChannel={true}
                    //allowAlpha={true}
                    className={cn(PILL_BUTTON_CLS, FOCUS_RING_CLS)}
                    align="end"
                  >
                    <PopoverTrigger className="bg-background rounded-full aspect-square w-button-md flex flex-row justify-center items-center border border-border/30 shadow-lg trans-color">
                      <span
                        className="font-bold text-xl"
                        style={{
                          color:
                            settings.bases[base.toLowerCase() as DNABase]!.font
                              .fill.value,
                          opacity:
                            settings.bases[base.toLowerCase() as DNABase]!.font
                              .fill.opacity,
                        }}
                      >
                        {base}
                      </span>
                    </PopoverTrigger>
                  </ColorPickerPopover>
                ))}
              </VCenterRow>
            </AccordionContent>
          </AccordionItem>
        </ScrollAccordion>
      </PropsPanel>
    </>
  )
}
