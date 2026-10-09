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
import { CollapseIcon } from '@/components/icons/collapse-icon'
import { TrashIcon } from '@/components/icons/trash-icon'
import { TEXT_OK } from '@/consts'
import { useEffect, useState } from 'react'
import { VennList } from './venn-list'
import { useVenn } from './venn-store'

const MAX_VISIBLE_LISTS = 50

export function VennLists() {
  const { vennLists, addList, removeList, removeLists } = useVenn()
  const { open: openDialog } = useDialogs()
  const [values, setValues] = useState<string[]>([])
  const visibleVennLists = vennLists.slice(0, MAX_VISIBLE_LISTS)
  const [collapsed, setCollapsed] = useState<boolean>(false)

  useEffect(() => {
    setValues(vennLists.map((vl) => vl.listId))
  }, [vennLists])

  return (
    <PropsPanel className="gap-y-1">
      <VCenterRow className="justify-end">
        <IconButton
          size="icon-xs"
          onClick={() => {
            addList()
          }}
          title="New List"
        >
          <PlusIcon size={16} />
        </IconButton>
        <IconButton
          size="icon-xs"
          onClick={() => {
            if (!collapsed) {
              setValues([])
            } else {
              setValues(vennLists.map((vl) => vl.listId))
            }

            setCollapsed(!collapsed)
          }}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          <CollapseIcon collapsed={collapsed} />
        </IconButton>
        <IconButton
          size="xs"
          onClick={() => {
            openDialog({
              type: 'warning',
              payload: {
                content: `Are you sure you want to remove all lists?`,
                callback: (response) => {
                  if (response === TEXT_OK) {
                    removeLists()
                  }
                },
              },
            })
          }}
          title="Remove All Lists"
        >
          <TrashIcon size={16} />
        </IconButton>
      </VCenterRow>
      <ScrollAccordion value={values} onValueChange={setValues}>
        {visibleVennLists.map((vennList, vi) => {
          return (
            <AccordionItem value={vennList.listId} key={vennList.listId}>
              <AccordionTrigger
                rightChildren={
                  <button
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
