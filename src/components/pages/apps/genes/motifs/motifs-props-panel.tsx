import { PropsPanel } from '@/components/props-panel'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@/themed/v2/accordion'
import { DndContext } from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'

import { Checkbox } from '@/components/shadcn/ui/themed/v2/check-box'
import { SortableItem } from '@/components/sortable-item'
import { TruncateSpan } from '@/components/truncate-span'
import { produce } from 'immer'
import { useMotifs, type IDataset, type IMotif } from './motifs-store'

function DatasetItem({ dataset }: { dataset: IDataset }) {
  const { datasetsInUse, setDatasetsInUse } = useMotifs()

  return (
    <SortableItem key={dataset.id} id={dataset.id} className="h-8 gap-x-2">
      <Checkbox
        checked={datasetsInUse[dataset.id] ?? true}
        onCheckedChange={v => {
          setDatasetsInUse(
            produce(datasetsInUse, draft => {
              draft[dataset.id] = v
            })
          )
        }}
      />

      <TruncateSpan className="grow h-full">{dataset.name}</TruncateSpan>
    </SortableItem>
  )
}

function MotifItem({ motif }: { motif: IMotif }) {
  const { motifsInUse, setMotifsInUse } = useMotifs()

  const name =
    motif.motifId === motif.name
      ? motif.motifId
      : `${motif.name} (${motif.motifId})`

  return (
    <SortableItem key={motif.id} id={motif.id} className="h-8 gap-x-2">
      <Checkbox
        checked={motifsInUse[motif.id] ?? true}
        onCheckedChange={v => {
          setMotifsInUse(
            produce(motifsInUse, draft => {
              draft[motif.id] = v
            })
          )
        }}
      />

      <TruncateSpan className="grow h-full">{name}</TruncateSpan>

      {/* <button
          title="Remove Motif"
          className="group shrink-0 opacity-0 group-hover:opacity-100 stroke-foreground/50 hover:stroke-red-400 cursor-pointer"
          key={motif.id}
          data-id={motif.id}
          onClick={() => {
            //dispatch({ type: "remove", ids: [motif.uuid] })

            setDelGroup(motif)
          }}
        >
          <TrashIcon stroke="" w="w-4" />
        </button> */}
    </SortableItem>
  )
}

export function MotifsPropsPanel() {
  const {
    searchResult,
    datasets,

    setSearchResult,
  } = useMotifs()

  return (
    <>
      {/* {delGroup !== null && (
        <OKCancelDialog
          //contentVariant="glass"
          //bodyVariant="card"
          modalType="Warning"
          onResponse={r => {
            if (r === TEXT_OK) {
              dispatch({ type: 'remove', ids: [delGroup.id] })
            }
            setDelGroup(null)
          }}
        >
          {`Are you sure you want to remove the ${delGroup.motifName} motif?`}
        </OKCancelDialog>
      )} */}

      <PropsPanel className="pr-2">
        <ScrollAccordion
          value={['datasets', 'motifs']}
          variant="sidebar"
          multiple={true}
        >
          <AccordionItem value="datasets">
            <AccordionTrigger variant="sidebar">Datasets</AccordionTrigger>
            <AccordionContent variant="sidebar">
              <DndContext
                modifiers={[restrictToVerticalAxis]}
                // onDragEnd={event => {
                //   const { active, over } = event

                //   if (over && active.id !== over?.id) {
                //     const oldIndex = datasets.findIndex(m => m.id === active.id)
                //     const newIndex = datasets.findIndex(m => m.id === over.id)
                //     const newOrder = arrayMove(datasets, oldIndex, newIndex)

                //     setDatasets(newOrder)
                //   }
                // }}
              >
                <SortableContext
                  items={datasets.map(dataset => dataset.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <ul className="flex flex-col">
                    {datasets.map(dataset => {
                      //const cols = getColNamesFromGroup(df, group)
                      return <DatasetItem dataset={dataset} key={dataset.id} />
                    })}
                  </ul>
                </SortableContext>
              </DndContext>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="motifs">
            <AccordionTrigger variant="sidebar">Motifs</AccordionTrigger>
            <AccordionContent variant="sidebar">
              <DndContext
                modifiers={[restrictToVerticalAxis]}
                onDragEnd={event => {
                  const { active, over } = event

                  if (over && active.id !== over?.id) {
                    const oldIndex = searchResult.motifs.findIndex(
                      m => m.id === active.id
                    )
                    const newIndex = searchResult.motifs.findIndex(
                      m => m.id === over.id
                    )
                    const newOrder = arrayMove(
                      searchResult.motifs,
                      oldIndex,
                      newIndex
                    )

                    setSearchResult(
                      produce(searchResult, draft => {
                        draft.motifs = newOrder
                      })
                    )
                  }
                }}
              >
                <SortableContext
                  items={searchResult.motifs.map(motif => motif.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <ul className="flex flex-col">
                    {searchResult.motifs.map(motif => {
                      //const cols = getColNamesFromGroup(df, group)
                      return <MotifItem motif={motif} key={motif.id} />
                    })}
                  </ul>
                </SortableContext>
              </DndContext>
            </AccordionContent>
          </AccordionItem>
        </ScrollAccordion>
      </PropsPanel>
    </>
  )
}
