import { DoubleNumericalInput } from '@components/double-numerical-input'
import { PropsPanel } from '@components/props-panel'
import { PropRow } from '@dialog/prop-row'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@themed/accordion'
import { forwardRef, type ForwardedRef } from 'react'

import { TEXT_RESET } from '@/consts'
import {
  ColorPickerButton,
  SIMPLE_COLOR_EXT_CLS,
} from '@components/color/color-picker-button'
import { SwitchPropRow } from '@dialog/switch-prop-row'
import { VCenterRow } from '@layout/v-center-row'
import { LinkButton } from '@themed/link-button'
import { NumericalInput } from '@themed/numerical-input'
import { produce } from 'immer'
import { useGsea } from './gsea-store'

export const GseaPropsPanel = forwardRef(function GseaPropsPanel(
  {},
  ref: ForwardedRef<HTMLDivElement>
) {
  const { settings, updateSettings, reset } = useGsea()

  // const [text, setText] = useState<string>(
  //   process.env.NODE_ENV === 'development' ? 'BCL6\nPRDM1\nKMT2D' : ''
  // )

  // function setProps(dataset: IGexDataset, props: IGexPlotDisplayProps) {
  //   updateGexPlotSettings(
  //     Object.fromEntries([
  //       ...Object.entries(gexPlotSettings).filter(
  //         ([id, _]) => id !== dataset.id.toString()
  //       ),
  //       [dataset.id.toString(), props],
  //     ])
  //   )
  // }

  return (
    <>
      {/* <OKCancelDialog
        open={confirmClear}
        title={INFO.name}
        onResponse={() => {
          setConfirmClear(false)
        }}
      >
        Are you sure you want to clear all the genes?
      </OKCancelDialog> */}

      <PropsPanel ref={ref} className="px-1 h-full">
        <VCenterRow className="justify-end">
          <LinkButton
            onClick={() => reset()}
            title="Reset Properties to Defaults"
          >
            {TEXT_RESET}
          </LinkButton>
        </VCenterRow>
        <ScrollAccordion
          value={['page', 'enrichment-plot', 'genes-plot', 'rank-plot']}
        >
          <AccordionItem value="page">
            <AccordionTrigger>Page</AccordionTrigger>
            <AccordionContent>
              <PropRow title="Columns">
                <NumericalInput
                  value={settings.page.columns}
                  placeholder="Opacity"
                  limit={[1, 100]}
                  step={1}
                  onNumChanged={(v) => {
                    updateSettings(
                      produce(settings, (draft) => {
                        draft.page.columns = v
                      })
                    )
                  }}
                  className="w-16 rounded-theme"
                />
              </PropRow>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="padding">
            <AccordionTrigger>Padding</AccordionTrigger>
            <AccordionContent>
              <PropRow title="Top">
                <NumericalInput
                  value={settings.plot.margin.top}
                  placeholder="Opacity"
                  limit={[1, 1000]}
                  step={1}
                  onNumChanged={(v) => {
                    updateSettings(
                      produce(settings, (draft) => {
                        draft.plot.margin.top = v
                      })
                    )
                  }}
                  className="w-16 rounded-theme"
                />
              </PropRow>
              <PropRow title="Left">
                <NumericalInput
                  value={settings.plot.margin.left}
                  placeholder="Opacity"
                  limit={[1, 1000]}
                  step={1}
                  onNumChanged={(v) => {
                    updateSettings(
                      produce(settings, (draft) => {
                        draft.plot.margin.left = v
                      })
                    )
                  }}
                  className="w-16 rounded-theme"
                />
              </PropRow>
              <PropRow title="Bottom">
                <NumericalInput
                  value={settings.plot.margin.bottom}
                  placeholder="Opacity"
                  limit={[1, 1000]}
                  step={1}
                  onNumChanged={(v) => {
                    updateSettings(
                      produce(settings, (draft) => {
                        draft.plot.margin.bottom = v
                      })
                    )
                  }}
                  className="w-16 rounded-theme"
                />
              </PropRow>
              <PropRow title="Right">
                <NumericalInput
                  value={settings.plot.margin.right}
                  placeholder="Opacity"
                  limit={[1, 1000]}
                  step={1}
                  onNumChanged={(v) => {
                    updateSettings(
                      produce(settings, (draft) => {
                        draft.plot.margin.right = v
                      })
                    )
                  }}
                  className="w-16 rounded-theme"
                />
              </PropRow>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="enrichment-plot">
            <AccordionTrigger>Enrichment</AccordionTrigger>
            <AccordionContent>
              <PropRow title="Size">
                <DoubleNumericalInput
                  v1={settings.axes.x.length}
                  placeholder="Width"
                  limit={[1, 1000]}
                  dp={0}
                  onNumChanged1={(v) => {
                    updateSettings(
                      produce(settings, (draft) => {
                        draft.axes.x.length = v
                      })
                    )
                  }}
                  v2={settings.es.axes.y.length}
                  onNumChanged2={(v) => {
                    updateSettings(
                      produce(settings, (draft) => {
                        draft.es.axes.y.length = v
                      })
                    )
                  }}
                />
              </PropRow>
              <PropRow title="Line color">
                <ColorPickerButton
                  color={settings.es.line.color}
                  onColorChange={(color) => {
                    updateSettings(
                      produce(settings, (draft) => {
                        draft.es.line.color = color
                      })
                    )
                  }}
                  className={SIMPLE_COLOR_EXT_CLS}
                  title="Line color"
                />
              </PropRow>

              <PropRow title="Line stroke">
                <NumericalInput
                  value={settings.es.line.width}
                  disabled={!settings.genes.show}
                  placeholder="Stroke"
                  limit={[1, 100]}
                  step={1}
                  onNumChanged={(v) => {
                    updateSettings(
                      produce(settings, (draft) => {
                        draft.es.line.width = v
                      })
                    )
                  }}
                  className="w-16 rounded-theme"
                />
              </PropRow>

              <SwitchPropRow
                title="Leading Edge"
                checked={settings.es.leadingEdge.show}
                onCheckedChange={(state) => {
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.es.leadingEdge.show = state
                    })
                  )
                }}
              />

              <PropRow title="Color" className="ml-2">
                <ColorPickerButton
                  color={settings.es.leadingEdge.fill.color}
                  onColorChange={(color) => {
                    updateSettings(
                      produce(settings, (draft) => {
                        draft.es.leadingEdge.fill.color = color
                      })
                    )
                  }}
                  className={SIMPLE_COLOR_EXT_CLS}
                  title="Line color"
                />
              </PropRow>

              <PropRow title="Opacity" className="ml-2">
                <NumericalInput
                  disabled={!settings.es.leadingEdge.show}
                  value={settings.es.leadingEdge.fill.alpha}
                  placeholder="Opacity"
                  limit={[0, 1]}
                  step={0.1}
                  dp={1}
                  onNumChanged={(v) => {
                    updateSettings(
                      produce(settings, (draft) => {
                        draft.es.leadingEdge.fill.alpha = v
                      })
                    )
                  }}
                  className="w-16 rounded-theme"
                />
              </PropRow>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="genes-plot">
            <AccordionTrigger>Genes</AccordionTrigger>
            <AccordionContent>
              <SwitchPropRow
                title="Show"
                checked={settings.genes.show}
                onCheckedChange={(state) => {
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.genes.show = state
                    })
                  )
                }}
              />
              <PropRow title="Height" className="ml-2">
                <NumericalInput
                  value={settings.genes.height}
                  disabled={!settings.genes.show}
                  placeholder="Height"
                  limit={[1, 100]}
                  step={1}
                  onNumChanged={(v) => {
                    updateSettings(
                      produce(settings, (draft) => {
                        draft.genes.height = v
                      })
                    )
                  }}
                  className="w-16 rounded-theme"
                />
              </PropRow>
              <PropRow title="Stroke" className="ml-2">
                <NumericalInput
                  value={settings.genes.line.width}
                  disabled={!settings.genes.show}
                  placeholder="Stroke"
                  limit={[1, 100]}
                  step={1}
                  onNumChanged={(v) => {
                    updateSettings(
                      produce(settings, (draft) => {
                        draft.genes.line.width = v
                      })
                    )
                  }}
                  className="w-16 rounded-theme"
                />
              </PropRow>

              <PropRow title="Positive color" className="ml-2">
                <ColorPickerButton
                  disabled={!settings.genes.show}
                  color={settings.genes.pos.color}
                  onColorChange={(color) => {
                    updateSettings(
                      produce(settings, (draft) => {
                        draft.genes.pos.color = color
                      })
                    )
                  }}
                  className={SIMPLE_COLOR_EXT_CLS}
                  title="Positive color"
                />
              </PropRow>
              <PropRow title="Negative color" className="ml-2">
                <ColorPickerButton
                  disabled={!settings.genes.show}
                  color={settings.genes.neg.color}
                  onColorChange={(color) => {
                    updateSettings(
                      produce(settings, (draft) => {
                        draft.genes.neg.color = color
                      })
                    )
                  }}
                  className={SIMPLE_COLOR_EXT_CLS}
                  title="Negative color"
                />
              </PropRow>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="rank-plot">
            <AccordionTrigger>Ranked Genes</AccordionTrigger>
            <AccordionContent>
              <SwitchPropRow
                title="Show"
                checked={settings.ranking.show}
                onCheckedChange={(state) => {
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.ranking.show = state
                    })
                  )
                }}
              />

              <PropRow title="Color" className="ml-2">
                <ColorPickerButton
                  color={settings.ranking.fill.color}
                  disabled={!settings.ranking.show}
                  onColorChange={(color) => {
                    updateSettings(
                      produce(settings, (draft) => {
                        draft.ranking.fill.color = color
                      })
                    )
                  }}
                  className={SIMPLE_COLOR_EXT_CLS}
                  title="Positive color"
                />
              </PropRow>

              <PropRow title="Opacity" className="ml-2">
                <NumericalInput
                  value={settings.ranking.fill.alpha}
                  disabled={!settings.ranking.show}
                  placeholder="Opacity"
                  limit={[0, 1]}
                  step={0.1}
                  dp={1}
                  onNumChanged={(v) => {
                    updateSettings(
                      produce(settings, (draft) => {
                        draft.ranking.fill.alpha = v
                      })
                    )
                  }}
                  className="w-16 rounded-theme"
                />
              </PropRow>

              <SwitchPropRow
                className="ml-2"
                title="Zero crossing"
                checked={settings.ranking.zeroCross.show}
                disabled={!settings.ranking.show}
                onCheckedChange={(state) =>
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.ranking.zeroCross.show = state
                    })
                  )
                }
              />
            </AccordionContent>
          </AccordionItem>
        </ScrollAccordion>
      </PropsPanel>
    </>
  )
})
