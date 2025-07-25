import { DoubleNumericalInput } from '@components/double-numerical-input'
import { PropsPanel } from '@components/props-panel'
import { PropRow } from '@dialog/prop-row'
import { SwitchPropRow } from '@dialog/switch-prop-row'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@themed/accordion'
import { NumericalInput } from '@themed/numerical-input'
import { produce } from 'immer'
import { useHistory, usePlot } from '../../history/history-store'
import type { IBoxPlotDisplayOptions } from './boxplot-plot-svg'

export interface IProps {
  plotAddr: string
}

export function BoxPlotPropsPanel({ plotAddr }: IProps) {
  //const { plotsState, historyDispatch } = useContext(PlotsContext)

  const { updateProps } = useHistory()

  const plot = usePlot(plotAddr)!

  const displayOptions: IBoxPlotDisplayOptions = plot!.customProps
    .displayOptions as IBoxPlotDisplayOptions

  return (
    <PropsPanel>
      <ScrollAccordion value={['plot']}>
        <AccordionItem value="plot">
          <AccordionTrigger>Plot</AccordionTrigger>
          <AccordionContent>
            <PropRow title="Plot size">
              <DoubleNumericalInput
                v1={displayOptions.plot!.w}
                v2={displayOptions.plot!.h}
                inputCls="w-16 rounded-theme"
                dp={0}
                limit={[0, 1000]}
                onNumChanged1={v => {
                  updateProps(
                    plotAddr,
                    'displayOptions',
                    produce(displayOptions, draft => {
                      draft.plot!.w = v
                    })
                  )
                }}
                onNumChanged2={v => {
                  updateProps(
                    plotAddr,
                    'displayOptions',
                    produce(displayOptions, draft => {
                      draft.plot!.h = v
                    })
                  )
                }}
              />
            </PropRow>

            <PropRow title="X gap">
              <NumericalInput
                value={displayOptions.padding.plot}
                className="w-16 rounded-theme"
                dp={0}
                limit={[0, 1000]}
                onNumChanged={v => {
                  updateProps(
                    plotAddr,
                    'displayOptions',
                    produce(displayOptions, draft => {
                      draft.padding.plot = v
                    })
                  )
                }}
              />
            </PropRow>
            <PropRow title="Hue gap">
              <NumericalInput
                value={displayOptions.padding.hue}
                className="w-16 rounded-theme"
                dp={0}
                limit={[0, 1000]}
                onNumChanged={v => {
                  updateProps(
                    plotAddr,
                    'displayOptions',
                    produce(displayOptions, draft => {
                      draft.padding.hue = v
                    })
                  )
                }}
              />
            </PropRow>

            <SwitchPropRow
              title="Split"
              checked={displayOptions.split}
              onCheckedChange={v => {
                updateProps(
                  plotAddr,
                  'displayOptions',
                  produce(displayOptions, draft => {
                    draft.split = v
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
              checked={displayOptions.violin.show}
              onCheckedChange={state => {
                updateProps(plotAddr, 'displayOptions', {
                  ...displayOptions,
                  violin: { ...displayOptions.violin, show: state },
                })
              }}
            />

            <PropRow title="Stroke">
              <NumericalInput
                value={displayOptions.violin.stroke.width}
                placeholder="Stroke..."
                className="w-14 rounded-theme"
                onNumChanged={v => {
                  updateProps(
                    plotAddr,
                    'displayOptions',
                    produce(displayOptions, draft => {
                      draft.violin.stroke.width = v
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
              checked={displayOptions.box.show}
              onCheckedChange={v => {
                updateProps(
                  plotAddr,
                  'displayOptions',
                  produce(displayOptions, draft => {
                    draft.box.show = v
                  })
                )
              }}
            />

            <PropRow title="Stroke">
              <NumericalInput
                value={displayOptions.box.stroke.width}
                placeholder="Stroke..."
                className="w-14 rounded-theme"
                onNumChanged={v => {
                  updateProps(
                    plotAddr,
                    'displayOptions',
                    produce(displayOptions, draft => {
                      draft.box.stroke.width = v
                    })
                  )
                }}
              />
            </PropRow>
            <PropRow title="Width">
              <NumericalInput
                value={displayOptions.box.width}
                placeholder="Width..."
                className="w-14 rounded-theme"
                onNumChanged={v => {
                  updateProps(
                    plotAddr,
                    'displayOptions',
                    produce(displayOptions, draft => {
                      draft.box.width = v
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
              checked={displayOptions.swarm.show}
              onCheckedChange={v => {
                updateProps(
                  plotAddr,
                  'displayOptions',
                  produce(displayOptions, draft => {
                    draft.swarm.show = v
                  })
                )
              }}
            />
          </AccordionContent>
        </AccordionItem>

        {/* <AccordionItem value="x">
          <AccordionTrigger>X</AccordionTrigger>

          <AccordionContent>
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
                    <VerticalGripIcon w="h-5" className="bg-foreground/50" />
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

            <AccordionContent>
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
                      <VerticalGripIcon w="h-5" className="bg-foreground/50" />
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
