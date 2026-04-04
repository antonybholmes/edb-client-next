import {
  ColorPickerButton,
  SIMPLE_COLOR_EXT_CLS,
} from '@/components/color/color-picker-button'
import { VCenterRow } from '@/components/layout/v-center-row'
import { BasicHoverCard } from '@/components/shadcn/ui/themed/v2/hover-card'
import { Switch } from '@/components/shadcn/ui/themed/v2/switch'
import { PropRow } from '@/dialog/prop-row'
import { SettingsAccordionItem } from '@/dialog/settings/settings-dialog'
import { SwitchPropRow } from '@/dialog/switch-prop-row'
import { capitalCase } from '@/lib/text/capital-case'
import { NumericalInput } from '@/themed/numerical-input'
import { Accordion } from '@/themed/v2/accordion'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectList,
  SelectTrigger,
  SelectValue,
} from '@/themed/v2/select'
import { produce } from 'immer'
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
      <Accordion
        defaultValue={[
          'signals',
          'peaks',
          'genes',
          'cytobands',
          'scale',
          'ruler',
        ]}
        multiple={true}
        variant="settings"
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
          ></SwitchPropRow>

          <SwitchPropRow
            title="Auto"
            checked={settings.seqs.globalY.auto}
            onCheckedChange={v => {
              const newOptions = produce(settings, draft => {
                draft.seqs.globalY.auto = v
              })

              updateSettings(newOptions)
            }}
            className="ml-4"
          >
            <NumericalInput
              w="xs"
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
            />
          </SwitchPropRow>

          <PropRow
            title={
              <VCenterRow className="gap-x-1">
                <span>Read scale mode</span>
                <BasicHoverCard>
                  Determines the unit for the Y axis of signal tracks.
                </BasicHoverCard>
              </VCenterRow>
            }
          >
            <SelectList
              w="sm"
              value={settings.seqs.scale.mode}
              onValueChange={v => {
                const newOptions = produce(settings, draft => {
                  draft.seqs.scale.mode = v as ReadScaleMode
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
            checked={settings.seqs.smoothing.on}
            onCheckedChange={v => {
              const newOptions = produce(settings, draft => {
                draft.seqs.smoothing.on = v
              })

              updateSettings(newOptions)
            }}
          >
            <NumericalInput
              value={settings.seqs.smoothing.factor}
              placeholder="Smoothing factor"
              limit={[0, 1]}
              step={0.01}
              dp={2}
              onNumChange={v => {
                const newOptions = produce(settings, draft => {
                  draft.seqs.smoothing.factor = v
                })

                updateSettings(newOptions)
              }}
            />
            <BasicHoverCard>
              Smooth lines to improve them visually. The smoothing factor
              controls the effect of this.
            </BasicHoverCard>
          </SwitchPropRow>

          <PropRow title="Bin size">
            <Switch
              checked={settings.seqs.bins.autoSize}
              onCheckedChange={v => {
                const newOptions = produce(settings, draft => {
                  draft.seqs.bins.autoSize = v
                })

                updateSettings(newOptions)
              }}
            >
              Auto
            </Switch>
            <SelectList
              w="sm"
              value={settings.seqs.bins.size.toString()}
              disabled={settings.seqs.bins.autoSize}
              onValueChange={v => {
                const newOptions = produce(settings, draft => {
                  draft.seqs.bins.size = Number(v) as BinSize
                })

                updateSettings(newOptions)
              }}
            >
              {/* <SelectItem value="16">16</SelectItem>
                <SelectItem value="64">64</SelectItem>
                <SelectItem value="256">256</SelectItem>
                <SelectItem value="1024">1024</SelectItem>
                <SelectItem value="4096">4096</SelectItem>
                <SelectItem value="16384">16384</SelectItem> */}
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
              <SelectItem value="1000">1000</SelectItem>
              <SelectItem value="10000">10000</SelectItem>
            </SelectList>
          </PropRow>
        </SettingsAccordionItem>

        <SettingsAccordionItem title="Peaks">
          <PropRow title="Style">
            <SelectList
              value={settings.beds.style}
              onValueChange={v => {
                const newOptions = produce(settings, draft => {
                  draft.beds.style = v as BandStyle
                })

                updateSettings(newOptions)
              }}
            >
              <SelectItem value="rounded-theme">Rounded</SelectItem>
              <SelectItem value="Square">Square</SelectItem>
            </SelectList>
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
              w="xs"
            />
          </PropRow>

          <SwitchPropRow
            title={
              <VCenterRow className="gap-x-1">
                <span>Collapse</span>
                <BasicHoverCard>
                  Collapses peaks to reduce space. The height of collapsed peaks
                  can be adjusted with the "Height" option.
                </BasicHoverCard>
              </VCenterRow>
            }
            checked={settings.beds.collapsed}
            onCheckedChange={v => {
              const newOptions = produce(settings, draft => {
                draft.beds.collapsed = v
              })

              updateSettings(newOptions)
            }}
          ></SwitchPropRow>
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
              <SelectTrigger>
                <SelectValue data-placeholder="Choose arrow style">
                  {capitalCase(settings.genes.arrows.style)}
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
            checked={settings.genes.endArrows.show}
            onCheckedChange={v => {
              const newOptions = produce(settings, draft => {
                draft.genes.endArrows.show = v
              })

              updateSettings(newOptions)
            }}
          >
            <Switch
              checked={settings.genes.endArrows.firstTranscriptOnly}
              disabled={!settings.genes.endArrows.show}
              onCheckedChange={v => {
                const newOptions = produce(settings, draft => {
                  draft.genes.endArrows.firstTranscriptOnly = v
                })

                updateSettings(newOptions)
              }}
            >
              First transcript only
            </Switch>

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
            title={
              <VCenterRow className="gap-x-1">
                <span>Canonical transcripts</span>

                <BasicHoverCard>
                  Shows only the primary, canonical transcript to reduce space.
                </BasicHoverCard>
              </VCenterRow>
            }
            checked={settings.genes.canonical.only}
            onCheckedChange={v => {
              const newOptions = produce(settings, draft => {
                draft.genes.canonical.only = v
              })

              updateSettings(newOptions)
            }}
          ></SwitchPropRow>

          <SwitchPropRow
            title={
              <VCenterRow className="gap-x-1">
                <span>Canonical transcript color</span>
                <BasicHoverCard>
                  Canonical transcripts can be colored separately to highlight
                  them.
                </BasicHoverCard>
              </VCenterRow>
            }
            checked={settings.genes.canonical.isColored}
            onCheckedChange={v => {
              const newOptions = produce(settings, draft => {
                draft.genes.canonical.isColored = v
              })

              updateSettings(newOptions)
            }}
          >
            <ColorPickerButton
              color={settings.genes.canonical.fill.color}
              disabled={!settings.genes.canonical.isColored}
              onColorChange={v => {
                const newOptions = produce(settings, draft => {
                  draft.genes.canonical.fill.color = v
                })

                updateSettings(newOptions)
              }}
              className={SIMPLE_COLOR_EXT_CLS}
              title="Canonical color"
            />
          </SwitchPropRow>
        </SettingsAccordionItem>

        <SettingsAccordionItem title="Cytobands">
          <PropRow title="Style">
            <SelectList
              value={settings.cytobands.style}
              onValueChange={v => {
                const newOptions = produce(settings, draft => {
                  draft.cytobands.style = v as BandStyle
                })

                updateSettings(newOptions)
              }}
            >
              <SelectItem value="Rounded">Rounded</SelectItem>
              <SelectItem value="Square">Square</SelectItem>
            </SelectList>
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
              w="xs"
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
          />
          <SwitchPropRow
            title={
              <VCenterRow className="gap-x-1">
                <span>Reduce labels</span>
                <BasicHoverCard>
                  Reduces the number of labels shown to make figures look less
                  clustered.
                </BasicHoverCard>
              </VCenterRow>
            }
            className="ml-4"
            disabled={!settings.cytobands.labels.show}
            checked={settings.cytobands.labels.skip.on}
            onCheckedChange={v => {
              const newOptions = produce(settings, draft => {
                draft.cytobands.labels.skip.on = v
              })

              updateSettings(newOptions)
            }}
          ></SwitchPropRow>
        </SettingsAccordionItem>

        <SettingsAccordionItem title="Scale">
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
              step={1000}
              value={settings.scale.bp}
              disabled={settings.scale.autoSize}
              placeholder="BP"
              w="sm"
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
