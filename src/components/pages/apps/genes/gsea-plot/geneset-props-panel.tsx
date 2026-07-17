import { PropsPanel } from '@/components/props-panel'

import { MultiSelectIcon } from '@/components/icons/multi-select-icon'
import { IconButton } from '@/components/shadcn/ui/themed/icon-button'
import { Checkbox } from '@/components/shadcn/ui/themed/v2/check-box'
import { SideBarHeader } from '@/components/sidebar/resizable-sidebar'
import { SortableItem } from '@/components/sortable-item'
import { TruncateSpan } from '@/components/truncate-span'
import { VScrollPanel } from '@/components/v-scroll-panel'
import { TEXT_SELECT, TEXT_SELECT_ALL } from '@/consts'
import { VCenterRow } from '@/layout/v-center-row'
import { DndContext } from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { produce } from 'immer'
import { useState } from 'react'
import { useGsea, type IGseaPathway } from './gsea-plot-store'

function GseaReportItem({ report }: { report: IGseaPathway }) {
  const { datasetsForUse, allowSelectAll, setDatasetsForUse } = useGsea()

  return (
    <SortableItem
      id={report.id}
      key={report.id}
      dragHandle={
        allowSelectAll ? (
          <Checkbox
            checked={datasetsForUse[report.id] ?? false}
            onCheckedChange={(checked) => {
              setDatasetsForUse(
                produce(datasetsForUse, (draft) => {
                  draft[report.id] = checked ?? false
                })
              )
            }}
          />
        ) : undefined
      }
    >
      {/* {allowSelectAll && (
        <Checkbox
          checked={datasetsForUse[report.id] ?? false}
          onCheckedChange={(checked) => {
            setDatasetsForUse(
              produce(datasetsForUse, (draft) => {
                draft[report.id] = checked ?? false
              })
            )
          }}
        />
      )} */}

      <TruncateSpan className="h-8 grow">{report.name}</TruncateSpan>
    </SortableItem>
  )
}

export function GeneSetsPropsPanel() {
  const [selectAllDatasets, setSelectAllDatasets] = useState(true)

  const {
    reports,
    setReports,
    setDatasetsForUse,
    allowSelectAll,
    setAllowSelectAll,
  } = useGsea()

  return (
    <PropsPanel className="gap-y-1 text-xs">
      <SideBarHeader className="gap-x-2 justify-between">
        <VCenterRow
          data-visible={allowSelectAll}
          className="data-[visible=false]:invisible ml-1"
        >
          <Checkbox
            aria-label="Select all gene sets"
            checked={selectAllDatasets}
            onCheckedChange={() => {
              const selected = !selectAllDatasets

              setDatasetsForUse(
                Object.fromEntries(
                  reports.map(
                    (pathway) => [pathway.id, selected] as [string, boolean]
                  )
                )
              )

              setSelectAllDatasets(selected)
            }}
            title={TEXT_SELECT_ALL}
          />
        </VCenterRow>

        <IconButton
          checked={allowSelectAll}
          onClick={() => setAllowSelectAll(!allowSelectAll)}
          title={TEXT_SELECT}
        >
          <MultiSelectIcon checked={allowSelectAll} />
        </IconButton>
      </SideBarHeader>

      <VScrollPanel className="mb-2">
        <DndContext
          modifiers={[restrictToVerticalAxis]}

          //for the moment do not allow to be re-arranged as it messes up
          //cluster color rendering
          onDragEnd={(event) => {
            const { active, over } = event

            if (over && active.id !== over?.id) {
              const oldIndex = reports.findIndex(
                (report) => report.id === active.id
              )

              const newIndex = reports.findIndex(
                (report) => report.id === over.id
              )

              const newOrder = arrayMove(reports, oldIndex, newIndex)

              // setPlots(
              //   newOrder.map(id => plots.find(plot => plot.id === id)!)
              // )

              setReports(newOrder)
            }

            //setActiveId(null)
          }}
        >
          <SortableContext
            items={reports.map((p) => p.id)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="flex flex-col">
              {reports.map((report) => {
                return <GseaReportItem key={report.id} report={report} />
              })}
            </ul>
          </SortableContext>

          {/* <DragOverlay>
                      {activeId ? (
                        <TrackItem
                          index={-1}
                          location={locations.filter(l => l.loc === activeId)[0]!}
                          key={activeId}
                          active={activeId}
                        />
                      ) : null}
                    </DragOverlay> */}
        </DndContext>
      </VScrollPanel>
    </PropsPanel>
  )
}
