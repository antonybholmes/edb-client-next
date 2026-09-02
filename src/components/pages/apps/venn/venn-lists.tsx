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
import { VennList } from './venn-list'
import { useVenn } from './venn-store'

export function VennLists() {
  const { vennLists, addGroup } = useVenn()
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
              <AccordionTrigger>{vennList.name}</AccordionTrigger>
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
