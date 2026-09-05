import { BaseCol } from '@/components/layout/base-col'
import { VCenterRow } from '@/components/layout/v-center-row'
import { AxisPlotPropsPopover } from '@/components/plot/axes/plot/axis-plot-props-popover'
import { PropsPanel } from '@/components/props-panel'
import { SortableItem } from '@/components/sortable-item'
import { VScrollPanel } from '@/components/v-scroll-panel'
import { DragDropProvider } from '@dnd-kit/react'

export function AxesDisplayPropsPanel({
  plotIds,
  axesGroups,
}: {
  plotIds: { id: string; title: string }[]
  axesGroups: {
    id: string
    title: string
    axesIds: { id: string; axis: 'x' | 'y'; title: string }[]
  }[]
}) {
  return (
    <PropsPanel>
      <VScrollPanel className="mb-2">
        <DragDropProvider>
          <ul className="flex flex-col">
            {plotIds.map(({ id: plotId, title }, pi) => {
              return (
                <SortableItem key={plotId} index={pi} id={plotId}>
                  <BaseCol className="grow">
                    <span>{title}</span>

                    {axesGroups.map(
                      ({ id: groupId, title: groupTitle, axesIds }) => (
                        <VCenterRow key={groupId} className="justify-between">
                          <strong>{groupTitle}</strong>
                          <VCenterRow>
                            {axesIds.map(({ id: axisId, axis, title }) => (
                              <AxisPlotPropsPopover
                                key={axisId}
                                //axis={axis}
                                title={title}
                                plotAddress={{ plotId, groupId, axisId }}
                              />
                            ))}
                          </VCenterRow>
                        </VCenterRow>
                      )
                    )}
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
