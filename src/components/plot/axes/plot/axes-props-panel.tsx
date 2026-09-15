import { BaseCol } from '@/components/layout/base-col'
import { VCenterRow } from '@/components/layout/v-center-row'
import { AxisPlotPropsPopover } from '@/components/plot/axes/plot/axis-plot-props-popover'
import { PropsPanel } from '@/components/props-panel'
import { SortableItem } from '@/components/sortable-item'
import { ToolbarSeparator } from '@/components/toolbar/toolbar-separator'
import { VScrollPanel } from '@/components/v-scroll-panel'
import { DragDropProvider } from '@dnd-kit/react'
import { Fragment } from 'react/jsx-runtime'
import { IDisplayPlot } from './axes-groups-popover'

export function AxesDisplayPropsPanel({ plots }: { plots: IDisplayPlot[] }) {
  return (
    <PropsPanel>
      <VScrollPanel className="mb-2 mr-8">
        <DragDropProvider>
          <ul className="flex flex-col">
            {plots.map(({ id: plotId, title, groups }, pi) => {
              return (
                <SortableItem key={plotId} index={pi} id={plotId}>
                  <BaseCol className="grow">
                    <strong>{title}</strong>
                    <VCenterRow className="gap-x-1">
                      {groups.map(
                        ({ id: groupId, title: groupTitle, axes }, gi) => (
                          <Fragment key={groupId}>
                            {gi > 0 && <ToolbarSeparator />}
                            <VCenterRow key={groupId} className="gap-x-1">
                              <span>{groupTitle}</span>
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
                          </Fragment>
                        )
                      )}
                    </VCenterRow>
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
