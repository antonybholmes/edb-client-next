import { VCenterRow } from '@/components/layout/v-center-row'

import { CollapseBlock } from '@components/collapse-block'
import { Input } from '@components/shadcn/ui/themed/input'

import { forwardRef, useContext, type ForwardedRef } from 'react'

import {
  ColorPickerButton,
  SIMPLE_COLOR_EXT_CLS,
} from '@/components/color-picker-button'
import { COLOR_TRANSPARENT } from '@/consts'
import { DoubleInput } from '@components/double-input-2'
import { PropsPanel } from '@components/props-panel'
import { MenuSeparator } from '@components/shadcn/ui/themed/dropdown-menu'
import { Switch } from '@components/shadcn/ui/themed/switch'
import { DEFAULT_MUTATION_COLOR } from './lollipop-utils'
import { PlotContext } from './plot-context'

export const LollipopPropsPanel = forwardRef(function LollipopPropsPanel(
  {},
  ref: ForwardedRef<HTMLDivElement>
) {
  const { plotState, plotDispatch } = useContext(PlotContext)

  const displayProps = plotState.df.displayProps

  return (
    <PropsPanel ref={ref}>
      {/* <h2 className={PROPS_TITLE_CLS}>Settings</h2> */}

      <CollapseBlock name="Plot">
        <VCenterRow className="gap-x-2">
          <span className="w-16 shrink-0">Cell</span>

          <Input
            id="w"
            defaultValue={displayProps.grid.cell.w}
            className="w-12 rounded-theme"
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                const v = parseInt(event.currentTarget.value)
                if (Number.isInteger(v)) {
                  plotDispatch({
                    type: 'display',
                    displayProps: {
                      ...displayProps,
                      grid: {
                        ...displayProps.grid,
                        cell: {
                          ...displayProps.grid.cell,
                          w: v,
                          h: v,
                        },
                      },
                    },
                  })
                }
              }
            }}
          />
        </VCenterRow>

        <VCenterRow className="gap-x-2">
          <span className="w-16 shrink-0">Spacing</span>

          <DoubleInput
            text1={displayProps.grid.spacing.x}
            text2={displayProps.grid.spacing.y}
            onKeyDown1={(event) => {
              if (event.key === 'Enter') {
                const v = parseInt(event.currentTarget.value)
                if (Number.isInteger(v)) {
                  plotDispatch({
                    type: 'display',
                    displayProps: {
                      ...displayProps,
                      grid: {
                        ...displayProps.grid,
                        spacing: { x: v, y: displayProps.grid.spacing.y },
                      },
                    },
                  })
                }
              }
            }}
            onKeyDown2={(event) => {
              if (event.key === 'Enter') {
                const v = parseInt(event.currentTarget.value)
                if (Number.isInteger(v)) {
                  plotDispatch({
                    type: 'display',
                    displayProps: {
                      ...displayProps,

                      grid: {
                        ...displayProps.grid,
                        spacing: { x: displayProps.grid.spacing.x, y: v },
                      },
                    },
                  })
                }
              }
            }}
          />
        </VCenterRow>
      </CollapseBlock>

      <CollapseBlock
        name="Legend"
        headerChildren={
          <Switch
            checked={displayProps.legend.show}
            onCheckedChange={(state) =>
              plotDispatch({
                type: 'display',
                displayProps: {
                  ...displayProps,
                  legend: {
                    ...displayProps.legend,
                    show: state,
                  },
                },
              })
            }
          />
        }
      >
        <VCenterRow className="gap-x-2">
          <span className="w-16 shrink-0">Label</span>

          <Input
            id="w"
            defaultValue={displayProps.legend.mutations.label}
            className="w-full rounded-theme"
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                plotDispatch({
                  type: 'display',
                  displayProps: {
                    ...displayProps,
                    legend: {
                      ...displayProps.legend,
                      mutations: {
                        ...displayProps.legend.mutations,
                        label: event.currentTarget.value,
                      },
                    },
                  },
                })
              }
            }}
          />
        </VCenterRow>
      </CollapseBlock>

      {/* <CollapseBlock title="Mutations">
          <VCenterRow className="justify-between gap-x-2">
            <Label className="shrink-0">Multi-mode</Label>
            <Select
              defaultValue={displayProps.multi}
              onValueChange={value => {
                setDisplayProps({
                  ...displayProps,
                  multi: value as MultiMode,
                })
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Multi mode..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="multi">Multi</SelectItem>

                <SelectItem value="equalbar">Equal Bar</SelectItem>
                <SelectItem value="stackedbar">Stacked Bar</SelectItem>
              </SelectContent>
            </Select>
          </VCenterRow>
        </CollapseBlock> */}

      <CollapseBlock name="Mutations">
        {/* <Switch
            checked={displayProps.samples.removeEmpty}
            onCheckedChange={state =>
              setDisplayProps({
                ...displayProps,
                samples: { ...displayProps.samples, removeEmpty: state },
              })
            }
          >
            <Label>Remove empty</Label>
          </Switch> */}
        {/* <Switch
          checked={displayProps.samples.graphs.show}
          onCheckedChange={state =>
            setDisplayProps({
              ...displayProps,
              samples: {
                ...displayProps.samples,
                graphs: {
                  ...displayProps.samples.graphs,
                  show: state,
                },
              },
            })
          }
        >
          <span>TMB graph</span>
        </Switch> */}

        <VCenterRow className="gap-x-2">
          <ColorPickerButton
            color={displayProps.mutations.graph.border.color}
            allowNoColor={true}
            onColorChange={(color) =>
              plotDispatch({
                type: 'display',
                displayProps: {
                  ...displayProps,
                  mutations: {
                    ...displayProps.mutations,
                    graph: {
                      ...displayProps.mutations.graph,
                      border: {
                        ...displayProps.mutations.graph.border,
                        color,
                        show: color !== COLOR_TRANSPARENT,
                      },
                    },
                  },
                },
              })
            }
            className={SIMPLE_COLOR_EXT_CLS}
          />
          <span>Border</span>
        </VCenterRow>

        <MenuSeparator />

        {displayProps.legend.mutations.types.map(
          (mutation: string, mi: number) => (
            <VCenterRow key={mi} className="gap-x-2">
              <ColorPickerButton
                color={
                  displayProps.legend.mutations.colorMap.get(mutation) ??
                  DEFAULT_MUTATION_COLOR
                }
                onColorChange={(color) => {
                  plotDispatch({
                    type: 'display',
                    displayProps: {
                      ...displayProps,
                      legend: {
                        ...displayProps.legend,
                        mutations: {
                          ...displayProps.legend.mutations,
                          colorMap: new Map<string, string>([
                            ...displayProps.legend.mutations.colorMap.entries(),
                            [mutation, color],
                          ]),
                        },
                      },
                    },
                  })
                }}
                className={SIMPLE_COLOR_EXT_CLS}
              />

              <span>{mutation}</span>
            </VCenterRow>
          )
        )}
      </CollapseBlock>
    </PropsPanel>
  )
})
