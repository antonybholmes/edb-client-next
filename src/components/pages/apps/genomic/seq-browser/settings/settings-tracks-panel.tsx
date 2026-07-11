import { VCenterRow } from '@/components/layout/v-center-row'
import { FillButton } from '@/components/plot/fill-dropdown-menu'
import { OutlineButton } from '@/components/plot/outline-dropdown-menu'
import { BasicHoverCard } from '@/components/shadcn/ui/themed/v2/hover-card'
import { Switch } from '@/components/shadcn/ui/themed/v2/switch'
import {
  GroupToggle,
  ToggleGroup,
} from '@/components/shadcn/ui/themed/v2/toggle-group'
import { PropRow } from '@/dialogs/prop-row'
import { SwitchPropRow } from '@/dialogs/switch-prop-row'
import { capitalCase } from '@/lib/text/capital-case'
import { NumericalInput } from '@/themed/numerical-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectList,
  SelectTrigger,
  SelectValue,
} from '@/themed/v2/select'
import { produce } from 'immer'
import { Circle, Square } from 'lucide-react'
import {
  useSeqBrowserSettings,
  type BinSize,
  type ReadScaleMode,
} from '../seq-browser-settings'
import type { BandStyle, GeneArrowStyle } from '../tracks-provider'

export function SettingsTracksPanel() {
  const { settings, updateSettings } = useSeqBrowserSettings()

  return (
    <>
      <SwitchPropRow
        title="Global Y"
        checked={settings.tracks.seqs.globalY.on}
        onCheckedChange={(v) => {
          const newOptions = produce(settings, (draft) => {
            draft.tracks.seqs.globalY.on = v
          })

          updateSettings(newOptions)
        }}
      />

      <SwitchPropRow
        title="Auto"
        checked={settings.tracks.seqs.globalY.auto}
        onCheckedChange={(v) => {
          const newOptions = produce(settings, (draft) => {
            draft.tracks.seqs.globalY.auto = v
          })

          updateSettings(newOptions)
        }}
        className="ml-4"
      >
        <NumericalInput
          w="xs"
          value={settings.tracks.seqs.globalY.ymax}
          disabled={settings.tracks.seqs.globalY.auto}
          placeholder="Y-max"
          limit={[1, 1000]}
          onNumChange={(v) => {
            const newOptions = produce(settings, (draft) => {
              draft.tracks.seqs.globalY.ymax = v
            })

            updateSettings(newOptions)
          }}
        />
      </SwitchPropRow>

      <PropRow
        title="Read Scale Mode"
        info="Determines the unit for the Y axis of signal tracks."
      >
        <SelectList
          w="sm"
          value={settings.tracks.seqs.scale.mode}
          onValueChange={(v) => {
            const newOptions = produce(settings, (draft) => {
              draft.tracks.seqs.scale.mode = v as ReadScaleMode
            })

            updateSettings(newOptions)
          }}
        >
          <SelectItem value="Count">Count</SelectItem>
          <SelectItem value="BPM">BPM</SelectItem>
          <SelectItem value="CPM">CPM</SelectItem>
        </SelectList>
      </PropRow>
      <SwitchPropRow
        title="Smooth lines"
        checked={settings.tracks.seqs.smoothing.on}
        onCheckedChange={(v) => {
          const newOptions = produce(settings, (draft) => {
            draft.tracks.seqs.smoothing.on = v
          })

          updateSettings(newOptions)
        }}
      >
        <NumericalInput
          value={settings.tracks.seqs.smoothing.factor}
          placeholder="Smoothing factor"
          limit={[0, 1]}
          step={0.01}
          dp={2}
          onNumChange={(v) => {
            const newOptions = produce(settings, (draft) => {
              draft.tracks.seqs.smoothing.factor = v
            })

            updateSettings(newOptions)
          }}
        />
        <BasicHoverCard>
          Smooth lines to improve them visually. The smoothing factor controls
          the effect of this.
        </BasicHoverCard>
      </SwitchPropRow>

      <PropRow title="Bin size">
        <Switch
          checked={settings.tracks.seqs.bins.autoSize}
          onCheckedChange={(v) => {
            const newOptions = produce(settings, (draft) => {
              draft.tracks.seqs.bins.autoSize = v
            })

            updateSettings(newOptions)
          }}
        >
          Auto
        </Switch>
        <SelectList
          w="sm"
          value={settings.tracks.seqs.bins.size.toString()}
          disabled={settings.tracks.seqs.bins.autoSize}
          onValueChange={(v) => {
            const newOptions = produce(settings, (draft) => {
              draft.tracks.seqs.bins.size = Number(v) as BinSize
            })

            updateSettings(newOptions)
          }}
        >
          <SelectItem value="50">50</SelectItem>
          <SelectItem value="100">100</SelectItem>
          <SelectItem value="1000">1000</SelectItem>
          <SelectItem value="10000">10000</SelectItem>
        </SelectList>
      </PropRow>

      <PropRow title="Style">
        <ToggleGroup
          direction="row"

          value={[settings.tracks.beds.style]}
          onValueChange={(v) => {
            const newOptions = produce(settings, (draft) => {
              draft.tracks.beds.style = v[0] as BandStyle
            })

            updateSettings(newOptions)
          }}
          variant="outline"
        >
          <GroupToggle value="rounded" title="Rounded">
            <Circle size={16} />
          </GroupToggle>

          <GroupToggle value="square" title="Square">
            <Square size={16} />
          </GroupToggle>
        </ToggleGroup>

        {/* <SelectList
              value={settings.tracks.beds.style}
              onValueChange={v => {
                const newOptions = produce(settings, draft => {
                  draft.tracks.beds.style = v as BandStyle
                })

                updateSettings(newOptions)
              }}
            >
              <SelectItem value="rounded-theme">Rounded</SelectItem>
              <SelectItem value="Square">Square</SelectItem>
            </SelectList> */}
      </PropRow>
      <PropRow title="Height">
        <NumericalInput
          value={settings.tracks.beds.band.height}
          placeholder="height"
          limit={[1, 1000]}
          onNumChange={(v) => {
            const newOptions = produce(settings, (draft) => {
              draft.tracks.beds.band.height = v
            })

            updateSettings(newOptions)
          }}
          w="xs"
        />
      </PropRow>

      <SwitchPropRow
        title={
          <VCenterRow className="gap-x-1">
            <span>Collapse</span>
            <BasicHoverCard>
              Collapses peaks to reduce space. The height of collapsed peaks can
              be adjusted with the "Height" option.
            </BasicHoverCard>
          </VCenterRow>
        }
        checked={settings.tracks.beds.collapsed}
        onCheckedChange={(v) => {
          const newOptions = produce(settings, (draft) => {
            draft.tracks.beds.collapsed = v
          })

          updateSettings(newOptions)
        }}
      />

      <SwitchPropRow
        title="Arrows"
        checked={settings.tracks.genes.arrows.show}
        onCheckedChange={(v) => {
          const newOptions = produce(settings, (draft) => {
            draft.tracks.genes.arrows.show = v
          })

          updateSettings(newOptions)
        }}
      >
        <Select
          value={settings.tracks.genes.arrows.style}
          disabled={!settings.tracks.genes.arrows.show}
          onValueChange={(v) => {
            const newOptions = produce(settings, (draft) => {
              draft.tracks.genes.arrows.style = v as GeneArrowStyle
            })

            updateSettings(newOptions)
          }}
        >
          <SelectTrigger>
            <SelectValue data-placeholder="Choose arrow style">
              {capitalCase(settings.tracks.genes.arrows.style)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="lines">Lines</SelectItem>
            <SelectItem value="filled">Filled</SelectItem>
          </SelectContent>
        </Select>
      </SwitchPropRow>

      <SwitchPropRow
        title="End arrows"
        checked={settings.tracks.genes.endArrows.show}
        onCheckedChange={(v) => {
          const newOptions = produce(settings, (draft) => {
            draft.tracks.genes.endArrows.show = v
          })

          updateSettings(newOptions)
        }}
      >
        <Switch
          checked={settings.tracks.genes.endArrows.firstTranscriptOnly}
          disabled={!settings.tracks.genes.endArrows.show}
          onCheckedChange={(v) => {
            const newOptions = produce(settings, (draft) => {
              draft.tracks.genes.endArrows.firstTranscriptOnly = v
            })

            updateSettings(newOptions)
          }}
        >
          First transcript only
        </Switch>

        <OutlineButton
          colors={[
            {
              color: settings.tracks.genes.endArrows.stroke.value,
              onColorChange: ({ color }) => {
                const newOptions = produce(settings, (draft) => {
                  draft.tracks.genes.endArrows.stroke.value = color
                  draft.tracks.genes.endArrows.fill.value = color
                })

                updateSettings(newOptions)
              },
            },
          ]}

          title="End Arrow Outline"
        />
      </SwitchPropRow>

      <SwitchPropRow
        title="Exons"
        checked={settings.tracks.genes.exons.show}
        onCheckedChange={(v) => {
          const newOptions = produce(settings, (draft) => {
            draft.tracks.genes.exons.show = v
          })

          updateSettings(newOptions)
        }}
      />

      <SwitchPropRow
        title="Canonical Transcripts Only"
        info="Shows only the primary, canonical transcript to reduce space."
        checked={settings.tracks.genes.canonical.only}
        onCheckedChange={(v) => {
          const newOptions = produce(settings, (draft) => {
            draft.tracks.genes.canonical.only = v
          })

          updateSettings(newOptions)
        }}
      />

      <SwitchPropRow
        title="Canonical Transcript Color"
        info="Canonical transcripts can be colored separately to highlight them."
        checked={settings.tracks.genes.canonical.isColored}
        onCheckedChange={(v) => {
          const newOptions = produce(settings, (draft) => {
            draft.tracks.genes.canonical.isColored = v
          })

          updateSettings(newOptions)
        }}
      >
        <FillButton
          colors={[
            {
              color: settings.tracks.genes.canonical.fill.value,
              allowNoColor: false,
              onColorChange: ({ color }) => {
                const newOptions = produce(settings, (draft) => {
                  draft.tracks.genes.canonical.fill.value = color
                })

                updateSettings(newOptions)
              },
            },
          ]}

          title="Canonical Fill"
        />
      </SwitchPropRow>

      <SwitchPropRow
        title="Scale auto size (bp)"
        checked={settings.tracks.scale.autoSize}
        onCheckedChange={(v) => {
          const newOptions = produce(settings, (draft) => {
            draft.tracks.scale.autoSize = v
          })

          updateSettings(newOptions)
        }}
      >
        <NumericalInput
          limit={[1, 1000000]}
          step={1000}
          value={settings.tracks.scale.bp}
          disabled={settings.tracks.scale.autoSize}
          placeholder="BP"
          w="sm"
          onNumChanged={(v) => {
            const newOptions = produce(settings, (draft) => {
              draft.tracks.scale.bp = v
            })

            updateSettings(newOptions)
          }}
        />
      </SwitchPropRow>
    </>
  )
}
