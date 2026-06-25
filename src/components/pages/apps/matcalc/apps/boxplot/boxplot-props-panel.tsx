import { DoubleNumericalInput } from '@/components/double-numerical-input'
import { PropsPanel } from '@/components/props-panel'
import { PropRow } from '@/dialogs/prop-row'
import { SwitchPropRow } from '@/dialogs/switch-prop-row'
import { NumericalInput } from '@/themed/numerical-input'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@/themed/v2/accordion'
import { produce } from 'immer'

import { useHistory } from '../../history/history-provider/history-provider'
import { useBoxPlotContext } from './boxplot-provider'

export function BoxPlotPropsPanel() {
  //const { plotsState, historyDispatch } = useContext(PlotsContext)

  const { updatePlot } = useHistory()
  const { plot, displayProps } = useBoxPlotContext()

  return (
    <PropsPanel>
      <ScrollAccordion value={['plot']}>
        <AccordionItem value="plot">
          <AccordionTrigger>Plot</AccordionTrigger>
          <AccordionContent>
            <PropRow title="Plot size">
              <DoubleNumericalInput
                v1={displayProps.plot!.w}
                v2={displayProps.plot!.h}
                inputCls="w-16 rounded-theme"
                dp={0}
                limit={[0, 1000]}
                onNumChanged1={(v) => {
                  updatePlot(
                    produce(plot, (draft) => {
                      draft.props.plot.w = v
                    })
                  )
                }}
                onNumChanged2={(v) => {
                  updatePlot(
                    produce(plot, (draft) => {
                      draft.props.plot.h = v
                    })
                  )
                }}
              />
            </PropRow>

            <PropRow title="X gap">
              <NumericalInput
                value={displayProps.padding.plot}
                className="w-16 rounded-theme"
                dp={0}
                limit={[0, 1000]}
                onNumChanged={(v) => {
                  updatePlot(
                    produce(plot, (draft) => {
                      draft.props.padding.plot = v
                    })
                  )
                }}
              />
            </PropRow>
            <PropRow title="Hue gap">
              <NumericalInput
                value={displayProps.padding.hue}
                className="w-16 rounded-theme"
                dp={0}
                limit={[0, 1000]}
                onNumChanged={(v) => {
                  updatePlot(
                    produce(plot, (draft) => {
                      draft.props.padding.hue = v
                    })
                  )
                }}
              />
            </PropRow>

            <SwitchPropRow
              title="Split"
              checked={displayProps.split}
              onCheckedChange={(v) => {
                updatePlot(
                  produce(plot, (draft) => {
                    draft.props.split = v
                  })
                )
              }}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="violin">
          <AccordionTrigger>Violin</AccordionTrigger>

          <AccordionContent>
            <SwitchPropRow
              title="Show"
              checked={displayProps.violin.show}
              onCheckedChange={(state) => {
                updatePlot(
                  produce(plot, (draft) => {
                    draft.props.violin.show = state
                  })
                )
              }}
            />

            <PropRow title="Stroke">
              <NumericalInput
                value={displayProps.violin.stroke.width}
                placeholder="Stroke..."
                className="w-14 rounded-theme"
                onNumChanged={(v) => {
                  updatePlot(
                    produce(plot, (draft) => {
                      draft.props.violin.stroke.width = v
                    })
                  )
                }}
              />
            </PropRow>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="box">
          <AccordionTrigger>Box</AccordionTrigger>

          <AccordionContent>
            <SwitchPropRow
              title="Show"
              checked={displayProps.box.show}
              onCheckedChange={(v) => {
                updatePlot(
                  produce(plot, (draft) => {
                    draft.props.box.show = v
                  })
                )
              }}
            />

            <PropRow title="Stroke">
              <NumericalInput
                value={displayProps.box.stroke.width}
                placeholder="Stroke..."
                className="w-14 rounded-theme"
                onNumChanged={(v) => {
                  updatePlot(
                    produce(plot, (draft) => {
                      draft.props.box.stroke.width = v
                    })
                  )
                }}
              />
            </PropRow>
            <PropRow title="Width">
              <NumericalInput
                value={displayProps.box.width}
                placeholder="Width..."
                className="w-14 rounded-theme"
                onNumChanged={(v) => {
                  updatePlot(
                    produce(plot, (draft) => {
                      draft.props.box.width = v
                    })
                  )
                }}
              />
            </PropRow>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="swarm">
          <AccordionTrigger>Swarm</AccordionTrigger>

          <AccordionContent>
            <SwitchPropRow
              title="Show"
              checked={displayProps.swarm.show}
              onCheckedChange={(v) => {
                updatePlot(
                  produce(plot, (draft) => {
                    draft.props.swarm.show = v
                  })
                )
              }}
            />
          </AccordionContent>
        </AccordionItem>

        {/* <AccordionItem value="x">
          <AccordionTrigger>X</AccordionTrigger>

          <AccordionContent >
            <Reorder.Group
              axis="y"
              values={plot!.customProps.xOrder}
              onReorder={(order:unknown) => {
                historyDispatch({
                  type: 'update-custom-prop',
                  id: plotId,
                  'xOrder',
                  order,
                })
              }}
            >
              {plot!.customProps.xOrder.map((item: string) => (
                <Reorder.Item
                  key={item}
                  value={item}
                  className="flex flex-row items-center gap-x-4 px-2 py-2 rounded-theme trans-color hover:bg-muted"
                >
                  <VCenterRow className="cursor-ns-resize">
                    <VerticalGripIcon  className="bg-foreground/50" />
                  </VCenterRow>

                  <span>{item}</span>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </AccordionContent>
        </AccordionItem>

        {plot!.customProps.hueOrder.length > 1 && (
          <AccordionItem value="hue">
            <AccordionTrigger>Hue</AccordionTrigger>

            <AccordionContent >
              <Reorder.Group
                axis="y"
                values={plot!.customProps.hueOrder}
                onReorder={(order:unknown) => {
                  historyDispatch({
                    type: 'update-custom-prop',
                    id: plotId,
                    'hueOrder',
                    order,
                  })
                }}
              >
                {plot!.customProps.hueOrder.map((item: string) => (
                  <Reorder.Item
                    key={item}
                    value={item}
                    className="flex flex-row items-center gap-x-4 px-2 py-2 rounded-theme trans-color hover:bg-muted"
                  >
                    <VCenterRow className="cursor-ns-resize">
                      <VerticalGripIcon   className="bg-foreground/50" />
                    </VCenterRow>

                    <span className="grow">{item}</span>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            </AccordionContent>
          </AccordionItem> 
        )} */}
      </ScrollAccordion>
    </PropsPanel>
  )
}
