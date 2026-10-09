'use client'

import { PlusIcon } from '@/components/icons/plus-icon'
import { VCenterRow } from '@/components/layout/v-center-row'
import { PropsPanel } from '@/components/props-panel'
import { IconButton } from '@/components/shadcn/ui/themed/icon-button'

import { useDialogs } from '@/components/dialogs/dialogs'
import { VScrollPanel } from '@/components/v-scroll-panel'
import { VennList } from './venn-list'
import { useVenn } from './venn-store'

const MAX_VISIBLE_LISTS = 100

export function VennLists() {
  const { vennLists, addList, removeList } = useVenn()
  const { open: openDialog } = useDialogs()

  const visibleVennLists = vennLists.slice(0, MAX_VISIBLE_LISTS)

  return (
    <PropsPanel>
      <VCenterRow className="border-b border-border/50 mb-2 pb-1">
        <IconButton
          onClick={() => {
            addList()
          }}
          title="New List"
        >
          <PlusIcon />
        </IconButton>
      </VCenterRow>
      <VScrollPanel>
        {visibleVennLists.map((vennList, vi) => {
          return (
            <VennList
              key={vennList.listId}
              vennList={vennList}
              className={vi > 0 ? 'pt-2 border-t border-border/50' : ''}
            />
          )
        })}
      </VScrollPanel>
    </PropsPanel>
  )
}
