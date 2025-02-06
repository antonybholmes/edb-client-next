import { VCenterRow } from '@/components/layout/v-center-row'
import { TEXT_OK } from '@/consts'
import { OKCancelDialog } from '@components/dialog/ok-cancel-dialog'
import { VerticalGripIcon } from '@components/icons/vertical-grip-icon'
import { cn } from '@lib/class-names'
import { truncate } from '@lib/text/text'

import { TrashIcon } from '@components/icons/trash-icon'
import { PropsPanel } from '@components/props-panel'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@components/shadcn/ui/themed/accordion'
import { Checkbox } from '@components/shadcn/ui/themed/check-box'
import { Label } from '@components/shadcn/ui/themed/label'
import { Reorder } from 'motion/react'
import { useContext, useState } from 'react'
import { type IMotif, MotifsContext } from './motifs-provider'

export function MotifsPropsPanel() {
  const { state, datasets, setDatasets, dispatch } = useContext(MotifsContext)!

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

  return (
    <>
      {delGroup !== null && (
        <OKCancelDialog
          //open={delGroup !== -1}
          onReponse={(r) => {
            if (r === TEXT_OK) {
              dispatch({ type: 'remove', ids: [delGroup.uuid] })
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
              {[...datasets.keys()].sort().map((dataset, dbi: number) => (
                <Checkbox
                  key={dbi}
                  checked={datasets.get(dataset)!}
                  onCheckedChange={(v) => {
                    setDatasets(
                      new Map<string, boolean>([
                        ...datasets.entries(),
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
              <Reorder.Group
                values={state.order}
                onReorder={(order) => {
                  //setOrder(order)
                  dispatch({
                    type: 'order',
                    order: order,
                  })
                }}
                className="pr-2 gap-y-1 flex flex-col"
              >
                {state.order.map((id) => {
                  //console.log(state.order)
                  const motif = state.motifs.get(id)!

                  return (
                    <Reorder.Item key={id} value={id}>
                      <VCenterRow
                        key={motif.uuid}
                        className={cn(
                          'group justify-between px-2 font-medium hover:bg-accent grow rounded-theme h-8'
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
              </Reorder.Group>
            </AccordionContent>
          </AccordionItem>
        </ScrollAccordion>
      </PropsPanel>
    </>
  )
}
