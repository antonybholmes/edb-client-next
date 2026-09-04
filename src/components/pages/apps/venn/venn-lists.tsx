'use client'

import { PlusIcon } from '@/components/icons/plus-icon'
import { VCenterRow } from '@/components/layout/v-center-row'
import { PropsPanel } from '@/components/props-panel'
import { IconButton } from '@/components/shadcn/ui/themed/icon-button'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@/components/shadcn/ui/themed/v2/accordion'

import { useDialogs } from '@/components/dialogs/dialogs'
import { TrashIcon } from '@/components/icons/trash-icon'
import { TEXT_OK } from '@/consts'
import { VennList } from './venn-list'
import { useVenn } from './venn-store'

export function VennLists() {
  const { vennLists, addList: addGroup, removeList } = useVenn()
  const { open: openDialog } = useDialogs()
  return (
    <PropsPanel>
      <VCenterRow className="border-b border-border/50 mb-2 pb-1">
        <IconButton
          onClick={() => {
            addGroup()
          }}
          title="New List"
        >
          <PlusIcon />
        </IconButton>
      </VCenterRow>
      <ScrollAccordion value={vennLists.map((vl) => `List ${vl.name}`)}>
        {vennLists.map((vennList, vi) => {
          return (
            <AccordionItem
              value={`List ${vennList.name}`}
              key={vennList.listId}
            >
              <AccordionTrigger
                rightChildren={
                  <button
                    className="hover:text-red-500 trans-color"
                    onClick={() => {
                      openDialog({
                        type: 'warning',
                        payload: {
                          content: `Are you sure you want to remove '${vennList.name}'?`,
                          callback: (response) => {
                            if (response === TEXT_OK) {
                              removeList(vennList.id)
                            }
                          },
                        },
                      })
                    }}
                  >
                    <TrashIcon />
                  </button>
                }
              >
                {vennList.name}
              </AccordionTrigger>
              <AccordionContent>
                <VennList vennList={vennList} />
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </ScrollAccordion>
    </PropsPanel>
  )
}
