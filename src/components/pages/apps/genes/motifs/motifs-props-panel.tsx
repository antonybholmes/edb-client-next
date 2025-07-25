import { TEXT_OK } from '@/consts'
import { OKCancelDialog } from '@dialog/ok-cancel-dialog'
import { VerticalGripIcon } from '@icons/vertical-grip-icon'
import { VCenterRow } from '@layout/v-center-row'
import { cn } from '@lib/shadcn-utils'
import { truncate } from '@lib/text/text'

import { PropsPanel } from '@components/props-panel'
import { DndContext } from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { TrashIcon } from '@icons/trash-icon'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@themed/accordion'
import { Checkbox } from '@themed/check-box'
import { Label } from '@themed/label'
import { useContext, useState } from 'react'
import { type IMotif, MotifsContext } from './motifs-provider'

export function MotifsPropsPanel() {
  const { state, datasets, datasetsInUse, setDatasetsInUse, dispatch } =
    useContext(MotifsContext)!

  const [delGroup, setDelGroup] = useState<IMotif | null>(null)
  //const [order, setOrder] = useState<number[]>([])

  // useEffect(() => {

  //   setOrder(range(ids.length))
  // }, [ids])

  // the items are initially built using the ids as they appear in the search
  // this is because the draggable list maintains its own internal state to
  // reflect reordering, which will be messed up if we also reorder the list
  // itself. We only regenerate this if the search changes or an item is
  // deleted. If an item is deleted, the list is automatically reordered to
  // match the last known order. This is so that when the drag list rerenders
  // it preserves the order of the items even though items were removed.
  // const items = useMemo(() => {
  //   return state.order.map(i => {
  //     const motif = state.motifs.get(i)!

  //     return (
  //       <VCenterRow
  //         key={motif.uuid}
  //         className={cn(
  //           'group justify-between px-2 font-medium hover:bg-muted grow rounded-theme h-8'
  //         )}
  //       >
  //         <VCenterRow className="gap-x-2">
  //           <VerticalGripIcon
  //             w="h-4"
  //             className="cursor-ns-resize group"
  //             lineClassName="bg-foreground/25 group-hover:bg-foreground/50 trans-color"
  //           />

  //           <span>{truncate(motif.motifName, { length: 24 })}</span>
  //         </VCenterRow>
  //         <button
  //           className="h-3 w-3 shrink-0 justify-center opacity-0 group-hover:opacity-100 fill-red-500"
  //           key={motif.uuid}
  //           data-id={motif.uuid}
  //           onClick={() => {
  //             //dispatch({ type: "remove", ids: [motif.uuid] })

  //             setDelGroup(motif)
  //           }}
  //         >
  //           <TrashIcon w="w-3" fill="" className="fill-red-500/50" />
  //         </button>
  //       </VCenterRow>
  //     )
  //   })
  // }, [state.motifs])

  function MotifItem({ motif }: { motif: IMotif }) {
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id: motif.publicId })

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    }

    return (
      <li
        ref={setNodeRef}
        key={motif.publicId}
        className={cn('flex flex-row items-center group gap-x-1')}
        style={style}
      >
        <VCenterRow className="gap-x-1 pl-0.5 pr-2 font-medium group-hover:bg-muted grow rounded-theme h-9">
          <VCenterRow
            className="cursor-ns-resize"
            {...listeners}
            {...attributes}
          >
            <VerticalGripIcon />
          </VCenterRow>

          <span className="grow">
            {truncate(motif.motifName, { length: 24 })}
          </span>
        </VCenterRow>
        <button
          title="Remove Motif"
          className="group shrink-0 opacity-0 group-hover:opacity-100 stroke-foreground/50 hover:stroke-red-400 cursor-pointer"
          key={motif.publicId}
          data-id={motif.publicId}
          onClick={() => {
            //dispatch({ type: "remove", ids: [motif.uuid] })

            setDelGroup(motif)
          }}
        >
          <TrashIcon stroke="" />
        </button>
      </li>
    )
  }

  return (
    <>
      {delGroup !== null && (
        <OKCancelDialog
          contentVariant="glass"
          bodyVariant="card"
          modalType="Warning"
          onResponse={r => {
            if (r === TEXT_OK) {
              dispatch({ type: 'remove', ids: [delGroup.publicId] })
            }
            setDelGroup(null)
          }}
        >
          {`Are you sure you want to remove the ${delGroup.motifName} motif?`}
        </OKCancelDialog>
      )}

      <PropsPanel>
        <ScrollAccordion value={['datasets', 'motifs']}>
          <AccordionItem value="datasets">
            <AccordionTrigger>Datasets</AccordionTrigger>
            <AccordionContent>
              {datasets.sort().map((dataset, dbi: number) => (
                <Checkbox
                  key={dbi}
                  checked={
                    datasetsInUse.has(dataset) && datasetsInUse.get(dataset)!
                  }
                  onCheckedChange={v => {
                    setDatasetsInUse(
                      new Map<string, boolean>([
                        ...datasetsInUse.entries(),
                        [dataset, v] as [string, boolean],
                      ])
                    )
                  }}
                >
                  <Label>{dataset}</Label>
                </Checkbox>
              ))}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="motifs">
            <AccordionTrigger>Motifs</AccordionTrigger>
            <AccordionContent>
              <DndContext
                modifiers={[restrictToVerticalAxis]}
                onDragEnd={event => {
                  const { active, over } = event

                  if (over && active.id !== over?.id) {
                    const oldIndex = state.order.indexOf(active.id as string)
                    const newIndex = state.order.indexOf(over.id as string)
                    const newOrder = arrayMove(state.order, oldIndex, newIndex)

                    dispatch({
                      type: 'order',
                      order: newOrder,
                    })
                  }
                }}
              >
                <SortableContext
                  items={state.order}
                  strategy={verticalListSortingStrategy}
                >
                  <ul className="flex flex-col">
                    {state.order.map(id => {
                      const geneset = state.motifs.get(id)!
                      //const cols = getColNamesFromGroup(df, group)
                      return <MotifItem motif={geneset} key={id} />
                    })}
                  </ul>
                </SortableContext>
              </DndContext>

              {/* <Reorder.Group
                values={state.order}
                onReorder={order => {
                  //setOrder(order)
                  dispatch({
                    type: 'order',
                    order: order,
                  })
                }}
                className="pr-2 gap-y-1 flex flex-col"
              >
                {state.order.map(id => {
                  //console.log(state.order)
                  const motif = state.motifs.get(id)!

                  return (
                    <Reorder.Item key={id} value={id}>
                      <VCenterRow
                        key={motif.uuid}
                        className={cn(
                          'group justify-between px-2 font-medium hover:bg-muted grow rounded-theme h-8'
                        )}
                      >
                        <VCenterRow className="gap-x-2">
                          <VerticalGripIcon className="cursor-ns-resize group bg-foreground" />

                          <span>
                            {truncate(motif.motifName, { length: 24 })}
                          </span>
                        </VCenterRow>
                        <button
                          className="h-3 w-3 shrink-0 justify-center opacity-0 group-hover:opacity-100 fill-red-500"
                          key={motif.uuid}
                          data-id={motif.uuid}
                          onClick={() => {
                            //dispatch({ type: "remove", ids: [motif.uuid] })

                            setDelGroup(motif)
                          }}
                        >
                          <TrashIcon
                            w="w-3"
                            fill=""
                            className="fill-red-500/50"
                          />
                        </button>
                      </VCenterRow>
                    </Reorder.Item>
                  )
                })}
              </Reorder.Group> */}
            </AccordionContent>
          </AccordionItem>
        </ScrollAccordion>
      </PropsPanel>
    </>
  )
}
