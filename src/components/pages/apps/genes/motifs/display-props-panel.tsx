import { ColorPickerPopover } from '@/components/color/color-picker-button'
import { OKCancelDialog } from '@/components/dialog/ok-cancel-dialog'
import { BASE_IDS } from '@/components/pages/apps/genes/motifs/motif-svg'
import { PropsPanel } from '@/components/props-panel'
import { NO_DIALOG, TEXT_OK, TEXT_RESET, type IDialogParams } from '@/consts'
import { PropRow } from '@/dialog/prop-row'
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

import { PopoverTrigger } from '@/components/shadcn/ui/themed/v2/popover'
import { produce } from 'immer'
import { useState } from 'react'
import { useMotifSettings, type DNABase } from './motifs-settings'

export function DisplayPropsPanel() {
  const { settings, updateSettings, resetSettings } = useMotifSettings()

  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })

  return (
    <>
      {showDialog.id.startsWith('reset') && (
        <OKCancelDialog
          //open={delGroup !== -1}
          onResponse={r => {
            if (r === TEXT_OK) {
              resetSettings()
            }
            setShowDialog({ ...NO_DIALOG })
          }}
        >
          Are you sure you want to reset all settings?
        </OKCancelDialog>
      )}

      <PropsPanel className="gap-y-2 pr-1">
        <VCenterRow className="justify-end">
          <LinkButton
            onClick={() => {
              setShowDialog({ id: 'reset', params: {} })
            }}
            title="Reset settings to default"
          >
            {TEXT_RESET}
          </LinkButton>
        </VCenterRow>
        <ScrollAccordion value={['plot', 'colors']} variant="sidebar">
          <AccordionItem value="plot">
            <AccordionTrigger variant="sidebar">Plot</AccordionTrigger>
            <AccordionContent variant="sidebar">
              <PropRow title="Base width">
                <NumericalInput
                  limit={[1, 100]}
                  value={settings.letterWidth}
                  placeholder="Base width..."
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
              <PropRow title="Cols">
                <NumericalInput
                  id="cols"
                  limit={[1, 100]}
                  value={settings.cols}
                  placeholder="Cols..."
                  onNumChanged={v => {
                    updateSettings(
                      produce(settings, draft => {
                        draft.cols = v
                      })
                    )
                  }}
                />
              </PropRow>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="colors">
            <AccordionTrigger variant="sidebar">Base Colors</AccordionTrigger>
            <AccordionContent variant="sidebar">
              <VCenterRow className="gap-x-2">
                {BASE_IDS.map(base => (
                  <ColorPickerPopover
                    key={base}
                    color={
                      settings.baseColors[base.toLowerCase() as DNABase]!.color
                    }
                    opacity={
                      settings.baseColors[base.toLowerCase() as DNABase]!
                        .opacity
                    }
                    onColorChange={(color, alpha) =>
                      updateSettings(
                        produce(settings, draft => {
                          draft.baseColors[
                            base.toLowerCase() as DNABase
                          ]!.color = color
                          draft.baseColors[
                            base.toLowerCase() as DNABase
                          ]!.opacity = alpha
                        })
                      )
                    }
                    //keepAlphaChannel={true}
                    allowAlpha={true}
                    className={cn(PILL_BUTTON_CLS, FOCUS_RING_CLS)}
                    align="end"
                  >
                    <PopoverTrigger className="bg-background rounded-full aspect-square w-8 flex flex-row justify-center items-center border border-border/50 hover:border-border data-popup-open:border-border trans-color">
                      <span
                        className="font-bold text-xl"
                        style={{
                          color:
                            settings.baseColors[base.toLowerCase() as DNABase]!
                              .color,
                          opacity:
                            settings.baseColors[base.toLowerCase() as DNABase]!
                              .opacity,
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
