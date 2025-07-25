import { VCenterRow } from '@layout/v-center-row'
import { forwardRef, useContext, type ForwardedRef } from 'react'

import {
  ColorPickerButton,
  SIMPLE_COLOR_EXT_CLS,
} from '@components/color/color-picker-button'
import { PropsPanel } from '@components/props-panel'
import { SwitchPropRow } from '@dialog/switch-prop-row'
import { HeightIcon } from '@icons/height-icon'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@themed/accordion'
import { Label } from '@themed/label'
import { NumericalInput } from '@themed/numerical-input'
import { PlotContext } from './plot-provider'

export const ClinicalPropsPanel = forwardRef(function ClinicalPropsPanel(
  {},
  ref: ForwardedRef<HTMLDivElement>
) {
  const { plotState, plotDispatch } = useContext(PlotContext)
  const displayProps = plotState.displayProps
  const tracks = plotState.clinicalTracks

  return (
    <PropsPanel ref={ref}>
      <ScrollAccordion value={['tracks', 'coo']}>
        <AccordionItem value="tracks">
          <AccordionTrigger>Tracks</AccordionTrigger>
          <AccordionContent>
            <SwitchPropRow
              title="Show"
              checked={displayProps.clinical.show}
              onCheckedChange={state =>
                plotDispatch({
                  type: 'display',
                  displayProps: {
                    ...displayProps,
                    clinical: { ...displayProps.clinical, show: state },
                  },
                })
              }
            />

            <SwitchPropRow title="Height">
              <HeightIcon />
              <NumericalInput
                id="y"
                value={displayProps.clinical.height}
                className="w-16 rounded-theme"
                onNumChanged={v => {
                  plotDispatch({
                    type: 'display',
                    displayProps: {
                      ...displayProps,
                      clinical: {
                        ...displayProps.clinical,
                        height: v,
                      },
                    },
                  })
                }}
              />
            </SwitchPropRow>

            <SwitchPropRow
              title="Border"
              checked={displayProps.clinical.border.show}
              onCheckedChange={state =>
                plotDispatch({
                  type: 'display',
                  displayProps: {
                    ...displayProps,
                    clinical: {
                      ...displayProps.clinical,
                      border: {
                        ...displayProps.clinical.border,
                        show: state,
                      },
                    },
                  },
                })
              }
            >
              <ColorPickerButton
                color={displayProps.clinical.border.color}
                onColorChange={color =>
                  plotDispatch({
                    type: 'display',
                    displayProps: {
                      ...displayProps,
                      clinical: {
                        ...displayProps.clinical,
                        border: { ...displayProps.clinical.border, color },
                      },
                    },
                  })
                }
                className={SIMPLE_COLOR_EXT_CLS}
              />
            </SwitchPropRow>
          </AccordionContent>
        </AccordionItem>

        {tracks.map((track, ti) => (
          <AccordionItem value={track.name} key={ti}>
            <AccordionTrigger>{track.name}</AccordionTrigger>
            <AccordionContent>
              <SwitchPropRow
                title="Show"
                checked={displayProps.legend.clinical.tracks[ti]!.show}
                onCheckedChange={state => {
                  const tracksProps = [...displayProps.legend.clinical.tracks]
                  tracksProps[ti]!.show = state

                  plotDispatch({
                    type: 'display',
                    displayProps: {
                      ...displayProps,
                      legend: {
                        ...displayProps.legend,
                        clinical: {
                          ...displayProps.legend.clinical,
                          tracks: tracksProps,
                        },
                      },
                    },
                  })
                }}
              />
              <VCenterRow className="flex-wrap gap-2">
                {track.categoriesInUse.map((category, ci) => (
                  <VCenterRow className="gap-x-1" key={ci}>
                    <ColorPickerButton
                      color={
                        displayProps.legend.clinical.tracks[ti]!.colorMap.get(
                          category
                        ) ?? displayProps.legend.mutations.noAlterationColor
                      }
                      onColorChange={color => {
                        const newColors = new Map<string, string>([
                          ...displayProps.legend.clinical.tracks[ti]!.colorMap,
                          [category, color],
                        ])

                        const tracksProps = [
                          ...displayProps.legend.clinical.tracks,
                        ]
                        tracksProps[ti]!.colorMap = newColors

                        plotDispatch({
                          type: 'display',
                          displayProps: {
                            ...displayProps,
                            legend: {
                              ...displayProps.legend,
                              clinical: {
                                ...displayProps.legend.clinical,
                                tracks: tracksProps,
                              },
                            },
                          },
                        })
                      }}
                      className={SIMPLE_COLOR_EXT_CLS}
                    />
                    <Label>{category}</Label>
                  </VCenterRow>
                ))}
              </VCenterRow>
            </AccordionContent>
          </AccordionItem>
        ))}
      </ScrollAccordion>
    </PropsPanel>
  )
})
