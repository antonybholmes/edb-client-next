import {
  ColorPickerButton,
  SIMPLE_COLOR_EXT_CLS,
} from '@/components/color-picker-button'
import { SettingsAccordionItem } from '@/components/dialog/settings/settings-dialog'
import { PropRow } from '@/components/prop-row'
import { Accordion } from '@/components/shadcn/ui/themed/accordion'
import { BasicHoverCard } from '@/components/shadcn/ui/themed/hover-card'
import { NumericalInput } from '@/components/shadcn/ui/themed/numerical-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shadcn/ui/themed/select'
import { SwitchPropRow } from '@/components/switch-prop-row'
import { produce } from 'immer'
import { useContext } from 'react'
import {
  SeqBrowserSettingsContext,
  type BinSize,
  type ReadScaleMode,
} from '../seq-browser-settings-provider'
import type { BandStyle, GeneArrowStyle } from '../tracks-provider'

export function SettingsTracksPanel() {
  const { settings, updateSettings } = useContext(SeqBrowserSettingsContext)

  return (
    <>
      <Accordion
        defaultValue={[
          'signals',
          'peaks',
          'genes',
          'cytobands',
          'scale',
          'ruler',
        ]}
        type="multiple"
      >
        <SettingsAccordionItem title="Signals">
          <SwitchPropRow
            title="Global Y"
            checked={settings.seqs.globalY.on}
            onCheckedChange={v => {
              const newOptions = produce(settings, draft => {
                draft.seqs.globalY.on = v
              })

              updateSettings(newOptions)
            }}
          >
            <SwitchPropRow
              title="Auto"
              checked={settings.seqs.globalY.auto}
              onCheckedChange={v => {
                const newOptions = produce(settings, draft => {
                  draft.seqs.globalY.auto = v
                })

                updateSettings(newOptions)
              }}
            >
              <NumericalInput
                value={settings.seqs.globalY.ymax}
                disabled={settings.seqs.globalY.auto}
                placeholder="Y-max"
                limit={[1, 1000]}
                onNumChange={v => {
                  const newOptions = produce(settings, draft => {
                    draft.seqs.globalY.ymax = v
                  })

                  updateSettings(newOptions)
                }}
                className="w-16 rounded-theme"
              />
            </SwitchPropRow>
          </SwitchPropRow>

          <PropRow title="Read scale mode">
            <Select
              value={settings.seqs.scale.mode}
              onValueChange={v => {
                const newOptions = produce(settings, draft => {
                  draft.seqs.scale.mode = v as ReadScaleMode
                })

                updateSettings(newOptions)
              }}
            >
              <SelectTrigger className="w-20">
                <SelectValue placeholder="Scale mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Count">Count</SelectItem>
                <SelectItem value="BPM">BPM</SelectItem>
                <SelectItem value="CPM">CPM</SelectItem>
              </SelectContent>
            </Select>

            <BasicHoverCard>
              Mode to scale read counts by. Count is unscaled.
            </BasicHoverCard>
          </PropRow>
          <SwitchPropRow
            title="Smooth lines"
            checked={settings.seqs.smooth}
            onCheckedChange={v => {
              const newOptions = produce(settings, draft => {
                draft.seqs.smooth = v
              })

              updateSettings(newOptions)
            }}
          >
            <BasicHoverCard>
              Smooth lines to improve them visually, but with a small loss in
              accuracy.
            </BasicHoverCard>
          </SwitchPropRow>

          <PropRow title="Bin size">
            <SwitchPropRow
              title="Auto"
              checked={settings.seqs.bins.autoSize}
              onCheckedChange={v => {
                const newOptions = produce(settings, draft => {
                  draft.seqs.bins.autoSize = v
                })

                updateSettings(newOptions)
              }}
            />
            <Select
              value={settings.seqs.bins.size.toString()}
              disabled={settings.seqs.bins.autoSize}
              onValueChange={v => {
                const newOptions = produce(settings, draft => {
                  draft.seqs.bins.size = Number(v) as BinSize
                })

                updateSettings(newOptions)
              }}
            >
              <SelectTrigger className="w-20">
                <SelectValue placeholder="Bin size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="16">16</SelectItem>
                <SelectItem value="64">64</SelectItem>
                <SelectItem value="256">256</SelectItem>
                <SelectItem value="1024">1024</SelectItem>
                <SelectItem value="4096">4096</SelectItem>
                <SelectItem value="16384">16384</SelectItem>
              </SelectContent>
            </Select>
          </PropRow>
        </SettingsAccordionItem>

        <SettingsAccordionItem title="Peaks">
          <PropRow title="Style">
            <Select
              value={settings.beds.style}
              onValueChange={v => {
                const newOptions = produce(settings, draft => {
                  draft.beds.style = v as BandStyle
                })

                updateSettings(newOptions)
              }}
            >
              <SelectTrigger className="w-24">
                <SelectValue placeholder="Choose peak style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rounded-theme">Rounded</SelectItem>
                <SelectItem value="Square">Square</SelectItem>
              </SelectContent>
            </Select>
          </PropRow>
          <PropRow title="Height">
            <NumericalInput
              value={settings.beds.band.height}
              placeholder="height"
              limit={[1, 1000]}
              onNumChange={v => {
                const newOptions = produce(settings, draft => {
                  draft.beds.band.height = v
                })

                updateSettings(newOptions)
              }}
              className="w-16 rounded-theme"
            />
          </PropRow>

          <SwitchPropRow
            title="Collapsed"
            checked={settings.beds.collapsed}
            onCheckedChange={v => {
              const newOptions = produce(settings, draft => {
                draft.beds.collapsed = v
              })

              updateSettings(newOptions)
            }}
          >
            <BasicHoverCard>
              Collapse overlaid BED tracks into a single track to save space.
            </BasicHoverCard>
          </SwitchPropRow>
        </SettingsAccordionItem>

        <SettingsAccordionItem title="Genes">
          <SwitchPropRow
            title="Arrows"
            checked={settings.genes.arrows.show}
            onCheckedChange={v => {
              const newOptions = produce(settings, draft => {
                draft.genes.arrows.show = v
              })

              updateSettings(newOptions)
            }}
          >
            <PropRow title="Style">
              <Select
                value={settings.genes.arrows.style}
                disabled={!settings.genes.arrows.show}
                onValueChange={v => {
                  const newOptions = produce(settings, draft => {
                    draft.genes.arrows.style = v as GeneArrowStyle
                  })

                  updateSettings(newOptions)
                }}
              >
                <SelectTrigger className="w-20">
                  <SelectValue placeholder="Choose arrow style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Lines">Lines</SelectItem>
                  <SelectItem value="Filled">Filled</SelectItem>
                </SelectContent>
              </Select>
            </PropRow>
          </SwitchPropRow>

          <SwitchPropRow
            title="End arrows"
            checked={settings.genes.endArrows.show}
            onCheckedChange={v => {
              const newOptions = produce(settings, draft => {
                draft.genes.endArrows.show = v
              })

              updateSettings(newOptions)
            }}
          >
            <SwitchPropRow
              title="First transcript only"
              checked={settings.genes.endArrows.firstTranscriptOnly}
              disabled={!settings.genes.endArrows.show}
              onCheckedChange={v => {
                const newOptions = produce(settings, draft => {
                  draft.genes.endArrows.firstTranscriptOnly = v
                })

                updateSettings(newOptions)
              }}
            />

            <ColorPickerButton
              color={settings.genes.endArrows.stroke.color}
              disabled={!settings.genes.endArrows.show}
              onColorChange={v => {
                const newOptions = produce(settings, draft => {
                  draft.genes.endArrows.stroke.color = v
                  draft.genes.endArrows.fill.color = v
                })

                updateSettings(newOptions)
              }}
              className={SIMPLE_COLOR_EXT_CLS}
              title="Stroke color"
            />
          </SwitchPropRow>

          <SwitchPropRow
            title="Exons"
            checked={settings.genes.exons.show}
            onCheckedChange={v => {
              const newOptions = produce(settings, draft => {
                draft.genes.exons.show = v
              })

              updateSettings(newOptions)
            }}
          />

          <SwitchPropRow
            title="Canonical transcripts only"
            checked={settings.genes.canonical.only}
            onCheckedChange={v => {
              const newOptions = produce(settings, draft => {
                draft.genes.canonical.only = v
              })

              updateSettings(newOptions)
            }}
          >
            <BasicHoverCard>
              Shows only the primary, canonical transcript to reduce space.
            </BasicHoverCard>
          </SwitchPropRow>

          <SwitchPropRow
            title="Canonical transcript color"
            checked={settings.genes.canonical.isColored}
            onCheckedChange={v => {
              const newOptions = produce(settings, draft => {
                draft.genes.canonical.isColored = v
              })

              updateSettings(newOptions)
            }}
          >
            <ColorPickerButton
              color={settings.genes.canonical.stroke.color}
              disabled={!settings.genes.canonical.isColored}
              onColorChange={v => {
                const newOptions = produce(settings, draft => {
                  draft.genes.canonical.stroke.color = v
                })

                updateSettings(newOptions)
              }}
              className={SIMPLE_COLOR_EXT_CLS}
              title="Canonical color"
            />
            <BasicHoverCard>
              Canonical transcripts can be colored separately to highlight them.
            </BasicHoverCard>
          </SwitchPropRow>
        </SettingsAccordionItem>

        <SettingsAccordionItem title="Cytobands">
          <PropRow title="Style">
            <Select
              value={settings.cytobands.style}
              onValueChange={v => {
                const newOptions = produce(settings, draft => {
                  draft.cytobands.style = v as BandStyle
                })

                updateSettings(newOptions)
              }}
            >
              <SelectTrigger className="w-24">
                <SelectValue placeholder="Choose cytoband style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Rounded">Rounded</SelectItem>
                <SelectItem value="Square">Square</SelectItem>
              </SelectContent>
            </Select>
          </PropRow>

          <PropRow title="Height">
            <NumericalInput
              value={settings.cytobands.band.height}
              placeholder="height"
              limit={[1, 1000]}
              onNumChange={v => {
                const newOptions = produce(settings, draft => {
                  draft.cytobands.band.height = v
                })

                updateSettings(newOptions)
              }}
              className="w-16 rounded-theme"
            />
          </PropRow>

          <SwitchPropRow
            title="Labels"
            checked={settings.cytobands.labels.show}
            onCheckedChange={v => {
              const newOptions = produce(settings, draft => {
                draft.cytobands.labels.show = v
              })

              updateSettings(newOptions)
            }}
          >
            <SwitchPropRow
              title="Reduce labels"
              disabled={!settings.cytobands.labels.show}
              checked={settings.cytobands.labels.skip.on}
              onCheckedChange={v => {
                const newOptions = produce(settings, draft => {
                  draft.cytobands.labels.skip.on = v
                })

                updateSettings(newOptions)
              }}
            >
              <BasicHoverCard>
                Reduces the number of labels shown to make figures look less
                clustered.
              </BasicHoverCard>
            </SwitchPropRow>
          </SwitchPropRow>
        </SettingsAccordionItem>

        <SettingsAccordionItem title="Ruler">
          <SwitchPropRow
            title="Auto size (bp)"
            checked={settings.scale.autoSize}
            onCheckedChange={v => {
              const newOptions = produce(settings, draft => {
                draft.scale.autoSize = v
              })

              updateSettings(newOptions)
            }}
          >
            <NumericalInput
              limit={[1, 1000000]}
              inc={1000}
              value={settings.scale.bp}
              disabled={settings.scale.autoSize}
              placeholder="BP"
              className="rounded-theme"
              w="w-20"
              onNumChanged={v => {
                const newOptions = produce(settings, draft => {
                  draft.scale.bp = v
                })

                updateSettings(newOptions)
              }}
            />
          </SwitchPropRow>
        </SettingsAccordionItem>
      </Accordion>
    </>
  )
}
