import { PropsPanel } from '@/components/props-panel'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@/themed/v2/accordion'

import { useState } from 'react'

import { TEXT_RESET } from '@/consts'
import { PropRow } from '@/dialog/prop-row'
import { SwitchPropRow } from '@/dialog/switch-prop-row'
import type { IDivProps } from '@/interfaces/div-props'
import { VCenterRow } from '@/layout/v-center-row'
import { LinkButton } from '@/themed/link-button'
import { NumericalInput } from '@/themed/numerical-input'
import { produce } from 'immer'
import {
  ColorPickerButton,
  SIMPLE_COLOR_EXT_CLS,
} from '../../../../../color/color-picker-button'
import { DEFAULT_EXT_GSEA_PROPS } from '../../../genes/gsea/ext-gsea-store'
import {
  useHistory,
  usePlot,
  type ExtGseaPlot,
} from '../../history/history-store'

export interface IProps extends IDivProps {
  plotAddr: string
}

export function ExtGseaPropsPanel({ ref, plotAddr }: IProps) {
  // const { plotsState, historyDispatch } = useContext(PlotsContext)

  // const plot = plotsState.plotMap[plotId]

  // if (!plot) {
  //   return null
  // }

  // const IExtGseaDisplayOptions =
  //   plot!.displayOptions as IExtGseaDisplayOptions

  const { updatePlot } = useHistory()

  const plot = usePlot(plotAddr)! as ExtGseaPlot

  const displayOptions = plot!.props

  const [openTabs, setOpenTabs] = useState<string[]>([
    'plot',
    'enrichment',
    'genes-in-genesets',
    'ranked-genes',
  ])

  return (
    <PropsPanel ref={ref}>
      <VCenterRow className="justify-end pb-2">
        <LinkButton
          onClick={() =>
            updatePlot(
              produce(plot, draft => {
                draft.props = { ...DEFAULT_EXT_GSEA_PROPS }
              }),
              { file: plotAddr }
            )
          }
          title="Reset Properties to Defaults"
        >
          {TEXT_RESET}
        </LinkButton>
      </VCenterRow>
      <ScrollAccordion
        value={openTabs}
        onValueChange={v => setOpenTabs(v as string[])}
      >
        <AccordionItem value="plot">
          <AccordionTrigger>Plot</AccordionTrigger>
          <AccordionContent variant="sidebar">
            <PropRow title="Width">
              <NumericalInput
                id="width"
                value={displayOptions.axes.x.length}
                limit={[1, 1000]}
                placeholder="Width..."
                className="w-16 rounded-theme"
                onNumChanged={v => {
                  updatePlot(
                    produce(plot, draft => {
                      draft.props.axes.x.length = v
                    }),
                    { file: plotAddr }
                  )
                }}
              />
            </PropRow>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="enrichment">
          <AccordionTrigger>Enrichment</AccordionTrigger>
          <AccordionContent variant="sidebar">
            <PropRow title="Height">
              <NumericalInput
                id="height"
                value={displayOptions.es.axes.y.length}
                limit={[1, 1000]}
                placeholder="Height..."
                className="w-16 rounded-theme"
                onNumChanged={v => {
                  updatePlot(
                    produce(plot, draft => {
                      draft.props.es.axes.y.length = v
                    }),
                    { file: plotAddr }
                  )
                }}
              />
            </PropRow>

            <SwitchPropRow
              title="Line"
              checked={displayOptions.es.gs1.line.show}
              onCheckedChange={state =>
                updatePlot(
                  produce(plot, draft => {
                    draft.props.es.gs1.line.show = state
                    draft.props.es.gs2.line.show = state
                  }),
                  { file: plotAddr }
                )
              }
            />
            <PropRow title="Stroke width" className="ml-2">
              <NumericalInput
                id="line1-stroke-width"
                value={displayOptions.es.gs1.line.width}
                disabled={!displayOptions.es.gs1.line.show}
                placeholder="Stroke..."
                className="w-16 rounded-theme"
                onNumChanged={v => {
                  updatePlot(
                    produce(plot, draft => {
                      draft.props.es.gs1.line.width = v
                      draft.props.es.gs2.line.width = v
                    }),
                    { file: plotAddr }
                  )
                }}
              />
            </PropRow>

            <SwitchPropRow
              title="Leading edge"
              checked={displayOptions.es.gs1.leadingEdge.show}
              onCheckedChange={v =>
                updatePlot(
                  produce(plot, draft => {
                    draft.props.es.gs1.leadingEdge.show = v
                    draft.props.es.gs2.leadingEdge.show = v
                  }),
                  { file: plotAddr }
                )
              }
            ></SwitchPropRow>
            <PropRow title="Opacity" className="ml-2">
              <NumericalInput
                id="line1-leading-opacity"
                disabled={!displayOptions.es.gs1.leadingEdge.show}
                value={displayOptions.es.gs1.leadingEdge.fill.opacity}
                dp={1}
                step={0.1}
                limit={[0, 1]}
                placeholder="Opacity..."
                className="w-16 rounded-theme"
                onNumChanged={v => {
                  updatePlot(
                    produce(plot, draft => {
                      draft.props.es.gs1.leadingEdge.fill.opacity = v
                      draft.props.es.gs2.leadingEdge.fill.opacity = v
                    }),
                    { file: plotAddr }
                  )
                }}
              />
            </PropRow>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="genes-in-genesets">
          <AccordionTrigger>Genes In Gene Sets</AccordionTrigger>
          <AccordionContent variant="sidebar">
            <SwitchPropRow
              title="Bars"
              checked={displayOptions.genes.line.show}
              onCheckedChange={v =>
                updatePlot(
                  produce(plot, draft => {
                    draft.props.genes.line.show = v
                  }),
                  { file: plotAddr }
                )
              }
            />
            <PropRow title="Stroke width" className="ml-2">
              <NumericalInput
                id="genes-stroke-width"
                value={displayOptions.genes.line.width}
                placeholder="Stroke..."
                className="w-16 rounded-theme"
                onNumChanged={v => {
                  updatePlot(
                    produce(plot, draft => {
                      draft.props.genes.line.width = v
                    }),
                    { file: plotAddr }
                  )
                }}
              />
            </PropRow>
            <SwitchPropRow
              title="Labels"
              className="ml-2"
              disabled={!displayOptions.genes.line.show}
              checked={displayOptions.genes.labels.show}
              onCheckedChange={state =>
                updatePlot(
                  produce(plot, draft => {
                    draft.props.genes.labels.show = state
                  }),
                  { file: plotAddr }
                )
              }
            />
            <SwitchPropRow
              title="Color labels"
              className="ml-2"
              disabled={
                !displayOptions.genes.line.show ||
                !displayOptions.genes.labels.show
              }
              checked={displayOptions.genes.labels.isColored}
              onCheckedChange={state =>
                updatePlot(
                  produce(plot, draft => {
                    draft.props.genes.labels.isColored = state
                  }),
                  { file: plotAddr }
                )
              }
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="ranked-genes">
          <AccordionTrigger>Ranked Genes</AccordionTrigger>
          <AccordionContent variant="sidebar">
            <SwitchPropRow
              title="Show"
              checked={displayOptions.ranking.show}
              onCheckedChange={v =>
                updatePlot(
                  produce(plot, draft => {
                    draft.props.ranking.show = v
                  }),
                  { file: plotAddr }
                )
              }
            />

            <PropRow title="Color" className="ml-2">
              <ColorPickerButton
                color={displayOptions.ranking.fill.color}
                disabled={!displayOptions.ranking.show}
                onColorChange={color =>
                  produce(plot, draft => {
                    draft.props.ranking.fill.color = color
                  })
                }
                className={SIMPLE_COLOR_EXT_CLS}
                title="Positive color"
              />
            </PropRow>

            <PropRow title="Opacity" className="ml-2">
              <NumericalInput
                value={displayOptions.ranking.fill.opacity}
                disabled={!displayOptions.ranking.show}
                placeholder="Opacity"
                limit={[0, 1]}
                step={0.1}
                dp={1}
                onNumChanged={v =>
                  updatePlot(
                    produce(plot, draft => {
                      draft.props.ranking.fill.opacity = v
                    }),
                    { file: plotAddr }
                  )
                }
                className="w-16 rounded-theme"
              />
            </PropRow>

            <SwitchPropRow
              className="ml-2"
              title="Zero crossing"
              checked={displayOptions.ranking.zeroCross.show}
              disabled={!displayOptions.ranking.show}
              onCheckedChange={v =>
                updatePlot(
                  produce(plot, draft => {
                    draft.props.ranking.zeroCross.show = v
                  }),
                  { file: plotAddr }
                )
              }
            />
          </AccordionContent>
        </AccordionItem>
      </ScrollAccordion>
    </PropsPanel>
  )
}
