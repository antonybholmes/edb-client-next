import { PropsPanel } from '@/components/props-panel'

import { Checkbox } from '@/components/shadcn/ui/themed/v2/check-box'
import { SortableItem } from '@/components/sortable-item'
import { TruncateSpan } from '@/components/truncate-span'
import { VScrollPanel } from '@/components/v-scroll-panel'

import { SelectAll } from '@/components/select-all'
import { LineSeparator } from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import { move } from '@dnd-kit/helpers'
import { DragDropProvider } from '@dnd-kit/react'
import { produce } from 'immer'
import { useState } from 'react'
import { GeneSetFilter } from './gene-set-filter'
import { useGsea, type IGseaGeneSet } from './gsea-plot-store'

function GseaReportItem({
  index,
  report,
}: {
  index: number
  report: IGseaGeneSet
}) {
  const { geneSetsInUse, setGeneSetsInUse } = useGsea()

  return (
    <SortableItem index={index} id={report.id} key={report.id}>
      <Checkbox
        checked={geneSetsInUse[report.id] ?? false}
        onCheckedChange={(checked) => {
          setGeneSetsInUse(
            produce(geneSetsInUse, (draft) => {
              draft[report.id] = checked ?? false
            })
          )
        }}
      />

      <TruncateSpan className="h-8 grow">{report.name}</TruncateSpan>
    </SortableItem>
  )
}

export function GeneSetsPropsPanel() {
  const [selectAllGeneSets, setSelectAllGeneSets] = useState(true)

  const { filteredReports, setFilteredReports, setGeneSetsInUse } = useGsea()

  return (
    <PropsPanel className="text-xs">
      <SelectAll
        setSelectAll={(v) => {
          setGeneSetsInUse(
            Object.fromEntries(
              filteredReports.map(
                (pathway) => [pathway.id, v] as [string, boolean]
              )
            )
          )

          setSelectAllGeneSets(v)
        }}
        rightChildren={<GeneSetFilter />}
        className="pl-6.5"
      />

      <LineSeparator />

      <VScrollPanel className="mb-2">
        <DragDropProvider
          //modifiers={[restrictToVerticalAxis]}

          //for the moment do not allow to be re-arranged as it messes up
          //cluster color rendering
          onDragEnd={(event) => {
            const newOrder = move(filteredReports, event)

            // const { active, over } = event

            // if (over && active.id !== over?.id) {
            //   const oldIndex = reports.findIndex(
            //     (report) => report.id === active.id
            //   )

            //   const newIndex = reports.findIndex(
            //     (report) => report.id === over.id
            //   )

            //   const newOrder = move(reports, oldIndex, newIndex)

            //   // setPlots(
            //   //   newOrder.map(id => plots.find(plot => plot.id === id)!)
            //   // )

            setFilteredReports(newOrder)
            //}

            //setActiveId(null)
          }}
        >
          <ul className="flex flex-col">
            {filteredReports.map((report, ri) => {
              return (
                <GseaReportItem key={report.id} index={ri} report={report} />
              )
            })}
          </ul>

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
        </DragDropProvider>
      </VScrollPanel>
    </PropsPanel>
  )
}
