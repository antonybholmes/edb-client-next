'use client'

import { PropsPanel } from '@/components/props-panel'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@/components/shadcn/ui/themed/v2/accordion'
import { VennList } from './venn-list'
import { useVenn, VENN_LIST_IDS } from './venn-store'

export function VennLists() {
  const { vennLists } = useVenn()
  return (
    <PropsPanel>
      <ScrollAccordion value={VENN_LIST_IDS.map((vl) => `List ${vl}`)}>
        {VENN_LIST_IDS.map((vi) => {
          const name = `List ${vi}`
          const vennList = vennLists[vi]!
          return (
            <AccordionItem value={name} key={name}>
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
