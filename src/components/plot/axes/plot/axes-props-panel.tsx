import { BaseCol } from '@/components/layout/base-col'
import { VCenterRow } from '@/components/layout/v-center-row'
import { AxisPlotPropsPopover } from '@/components/plot/axes/plot/axis-plot-props-popover'
import { PropsPanel } from '@/components/props-panel'
import { SortableItem } from '@/components/sortable-item'
import { VScrollPanel } from '@/components/v-scroll-panel'
import { DragDropProvider } from '@dnd-kit/react'
import { IDisplayPlot } from './axes-groups-popover'

export function AxesDisplayPropsPanel({ plots }: { plots: IDisplayPlot[] }) {
  return (
    <PropsPanel>
      <VScrollPanel className="mb-2">
        <DragDropProvider>
          <ul className="flex flex-col">
            {plots.map(({ id: plotId, title, groups }, pi) => {
              return (
                <SortableItem key={plotId} index={pi} id={plotId}>
                  <BaseCol className="grow">
                    <span>{title}</span>

                    {groups.map(({ id: groupId, title: groupTitle, axes }) => (
                      <VCenterRow key={groupId} className="justify-between">
                        <strong>{groupTitle}</strong>
                        <VCenterRow>
                          {axes.map(({ id: axisId, title }) => (
                            <AxisPlotPropsPopover
                              key={axisId}
                              //axis={axis}
                              title={title}
                              plotAddress={{ plotId, groupId, axisId }}
                            />
                          ))}
                        </VCenterRow>
                      </VCenterRow>
                    ))}
                  </BaseCol>
                </SortableItem>
              )
            })}
          </ul>
        </DragDropProvider>
      </VScrollPanel>
    </PropsPanel>
  )
}
