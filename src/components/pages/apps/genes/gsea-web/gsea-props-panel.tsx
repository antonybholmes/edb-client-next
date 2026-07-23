import { PropsPanel } from '@/components/props-panel'

import { MultiSelectIcon } from '@/components/icons/multi-select-icon'
import { IconButton } from '@/components/shadcn/ui/themed/icon-button'
import { Checkbox } from '@/components/shadcn/ui/themed/v2/check-box'
import { LineSeparator } from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import { SortableItem } from '@/components/sortable-item'
import { TruncateSpan } from '@/components/truncate-span'
import { VScrollPanel } from '@/components/v-scroll-panel'
import { TEXT_SELECT, TEXT_SELECT_ALL } from '@/consts'
import { VCenterRow } from '@/layout/v-center-row'
import { present } from '@/lib/dom-utils'
import { DndContext } from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { produce } from 'immer'
import { useState } from 'react'
import { IGseaPathway } from '../gsea-plot/gsea-plot-store'
import { useGsea } from './gsea-web-store'

function PlotItem({ report }: { report: IGseaPathway }) {
  const { datasetsForUse, allowSelectAll, setDatasetsForUse } = useGsea()

  return (
    <SortableItem id={report.id} key={report.id}>
      {allowSelectAll && (
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
      )}

      <TruncateSpan className="h-8 grow">{report.name}</TruncateSpan>
    </SortableItem>
  )
}

export function GseaPropsPanel() {
  const [selectAllDatasets, setSelectAllDatasets] = useState(true)

  const {
    reports,
    setReports,
    setDatasetsForUse,
    allowSelectAll,
    setAllowSelectAll,
  } = useGsea()

  return (
    <PropsPanel className="grow gap-y-1 pr-2 text-xs">
      {/* <PropRow title="Columns">
        <NumericalInput
          value={settings.page.columns}
          placeholder="Opacity"
          limit={[1, 100]}
          step={1}
          onNumChanged={v => {
            updateSettings(
              produce(settings, draft => {
                draft.page.columns = v
              })
            )
          }}
          className="w-16 rounded-theme"
        />
      </PropRow> */}
      {/* <PropRow title="Size">
        <DoubleNumericalInput
          v1={settings.axes.x.length}
          placeholder="Width"
          limit={[1, 1000]}
          dp={0}
          onNumChange1={v => {
            updateSettings(
              produce(settings, draft => {
                draft.axes.x.length = v
              })
            )
          }}
          v2={settings.es.axes.y.length}
          onNumChange2={v => {
            updateSettings(
              produce(settings, draft => {
                draft.es.axes.y.length = v
              })
            )
          }}
        />
      </PropRow> */}
      <VCenterRow className="justify-between px-1">
        <VCenterRow
          data-invisible={present(!allowSelectAll)}
          className="data-invisible:invisible px-6"
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
      </VCenterRow>
      <LineSeparator />

      <VScrollPanel>
        <DndContext
          modifiers={[restrictToVerticalAxis]}
          //onDragStart={event => setActiveId(event.active.id as string)}
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
                return (
                  // <BaseSortableItem key={gs.id} id={gs.id}>
                  <PlotItem key={report.id} report={report} />
                  // </BaseSortableItem>
                )
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
