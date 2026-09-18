import { PropRow } from '@/dialogs/prop-row'

import { CheckPropRow } from '@/dialogs/check-prop-row'

import { FillButton } from '@/components/plot/fill-dropdown-menu'
import { NumSlider } from '@/components/shadcn/ui/themed/v2/num-slider'
import { PercentSlider } from '@/components/shadcn/ui/themed/v2/percent-slider'
import { produce } from 'immer'

import { useEdbSettings } from '@/components/edb/edb-settings'
import { VCenterRow } from '@/components/layout/v-center-row'
import { ColorMapMenu } from '@/components/pages/apps/matcalc/color-map-menu'
import { FontPopover } from '@/components/plot/font/font-popover'
import { StrokeButton } from '@/components/plot/stroke-dropdown-menu'
import { SelectItem, SelectList } from '@/components/shadcn/ui/themed/v2/select'
import { getCmapFromColorMap, getColorMap } from '@/lib/color/colormap'
import { useGseaSettings } from '../gsea-settings-store'

export function GeneProps() {
  const { settings, updateSettings } = useGseaSettings()
  const { settings: edbSettings, updateSettings: updateEdbSettings } =
    useEdbSettings()

  return (
    <>
      <PropRow title="Height">
        <NumSlider
          value={settings.genes.height}
          disabled={!settings.genes.show}

          min={1}
          max={100}
          step={1}
          onNumChanged={(v) => {
            updateSettings(
              produce(settings, (draft) => {
                draft.genes.height = v
              })
            )
          }}
        />
      </PropRow>

      <PropRow title="Stroke">
        <StrokeButton
          colors={[
            {
              width: settings.genes.stroke.width,
              onColorChange: ({ width }) => {
                updateSettings(
                  produce(settings, (draft) => {
                    draft.genes.stroke.width = width ?? draft.genes.stroke.width
                  })
                )
              },
            },
          ]}
          title="Stroke"
        />
      </PropRow>

      <CheckPropRow
        title="Color"
        checked={settings.genes.color.on}
        onCheckedChange={(state) => {
          updateSettings(
            produce(settings, (draft) => {
              draft.genes.color.on = state
            })
          )
        }}
      >
        {/* <VCenterRow>
                <FillButton
                  colors={[
                    {
                      color: settings.genes.pos.value,
                      opacity: settings.genes.pos.opacity,
                      onColorChange: ({ color, opacity }) => {
                        updateSettings(
                          produce(settings, (draft) => {
                            draft.genes.pos.value = color
                            draft.genes.pos.opacity = opacity ?? 1
                          })
                        )
                      },
                    },
                  ]}
                  title="Positive Gene Color"
                />

                <FillButton
                  colors={[
                    {
                      color: settings.genes.neg.value,
                      opacity: settings.genes.neg.opacity,
                      onColorChange: ({ color, opacity }) => {
                        updateSettings(
                          produce(settings, (draft) => {
                            draft.genes.neg.value = color
                            draft.genes.neg.opacity = opacity ?? 1
                          })
                        )
                      },
                    },
                  ]}

                  title="Negative Gene Color"
                />
              </VCenterRow> */}

        <SelectList
          items={[
            { label: 'Score', value: 'score' },
            { label: 'Rank', value: 'rank' },
          ]}
          value={settings.genes.color.mode}
          onValueChange={(value) => {
            updateSettings(
              produce(settings, (draft) => {
                draft.genes.color.mode = value as 'score' | 'rank'
              })
            )
          }}
          w="xs"
        >
          <SelectItem value="score">Score</SelectItem>
          <SelectItem value="rank">Rank</SelectItem>
        </SelectList>

        {/* <ColorPickerButton
                disabled={!settings.genes.show}
                colors={[
                  {
                    title: 'Positive color',
                    color: settings.genes.pos.value,
                    opacity: settings.genes.pos.opacity,
                    onColorChange: ({ color, opacity }) => {
                      updateSettings(
                        produce(settings, (draft) => {
                          draft.genes.pos.value = color
                          draft.genes.pos.opacity = opacity ?? 1
                        })
                      )
                    },
                  },

                  {
                    title: 'Negative color',
                    color: settings.genes.neg.value,
                    opacity: settings.genes.neg.opacity,
                    onColorChange: ({ color, opacity }) => {
                      updateSettings(
                        produce(settings, (draft) => {
                          draft.genes.neg.value = color
                          draft.genes.neg.opacity = opacity ?? 1
                        })
                      )
                    },
                  },
                ]}
                className={SIMPLE_COLOR_EXT_CLS}
                title="Positive/negative color"
              /> */}
      </CheckPropRow>

      <CheckPropRow
        title="Colormap"
        checked={settings.genes.color.gradient.mode === 'cmap'}
        onCheckedChange={() => {
          updateSettings(
            produce(settings, (draft) => {
              draft.genes.color.gradient.mode = 'cmap'
            })
          )
        }}
      >
        <ColorMapMenu
          cmap={getColorMap(edbSettings.plots.cmap)}
          onChange={(cmap) => {
            updateSettings(
              produce(settings, (draft) => {
                draft.genes.color.gradient.mode = 'cmap'
              })
            )
            updateEdbSettings(
              produce(edbSettings, (draft) => {
                draft.plots.cmap = getCmapFromColorMap(cmap)
              })
            )
          }}
        />
      </CheckPropRow>

      <CheckPropRow
        title="Custom colors"
        checked={settings.genes.color.gradient.mode === 'user'}
        onCheckedChange={() => {
          updateSettings(
            produce(settings, (draft) => {
              draft.genes.color.gradient.mode = 'user'
            })
          )
        }}
      >
        <VCenterRow>
          <FillButton
            colors={[
              {
                color: settings.genes.pos.value,
                opacity: settings.genes.pos.opacity,
                onColorChange: ({ color, opacity }) => {
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.genes.pos.value = color
                      draft.genes.pos.opacity = opacity ?? 1
                      draft.genes.color.gradient.mode = 'user'
                    })
                  )
                },
              },
            ]}
            title="Positive Gene Color"
          />

          <FillButton
            colors={[
              {
                color: settings.genes.neg.value,
                opacity: settings.genes.neg.opacity,
                onColorChange: ({ color, opacity }) => {
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.genes.neg.value = color
                      draft.genes.neg.opacity = opacity ?? 1
                      draft.genes.color.gradient.mode = 'user'
                    })
                  )
                },
              },
            ]}

            title="Negative Gene Color"
          />
        </VCenterRow>
      </CheckPropRow>

      <PropRow title="Opacity">
        <PercentSlider
          value={settings.genes.color.gradient.opacity}
          min={0}
          max={1}
          onNumChanged={(v) => {
            updateSettings(
              produce(settings, (draft) => {
                draft.genes.color.gradient.opacity = v
              })
            )
          }}
          step={0.05}
        />
      </PropRow>

      <PropRow title="Weight">
        <PercentSlider
          value={settings.genes.color.gradient.weight}
          min={0}
          max={1}
          onNumChanged={(v) => {
            updateSettings(
              produce(settings, (draft) => {
                draft.genes.color.gradient.weight = v
              })
            )
          }}
          step={0.05}
        />
      </PropRow>

      <PropRow title="Labels">
        <FontPopover
          fonts={[
            {
              title: 'Font',
              textProps: settings.genes.labels,
              update: (textProps) =>
                updateSettings(
                  produce(settings, (draft) => {
                    draft.genes.labels = Object.assign(
                      { ...settings.genes.labels },
                      textProps
                    )
                  })
                ),
              ext: (
                <CheckPropRow
                  title="Use colors"
                  className="ml-0.5 mt-1"

                  checked={settings.genes.labels.color.on}
                  onCheckedChange={(state) =>
                    updateSettings(
                      produce(settings, (draft) => {
                        draft.genes.labels.color.on = state
                      })
                    )
                  }
                />
              ),
            },
          ]}
        />
      </PropRow>
    </>
  )
}
