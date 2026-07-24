import { VCenterRow } from '@/layout/v-center-row'

import { PropsPanel } from '@/components/props-panel'
import { TEXT_NAME, TEXT_OK, TEXT_RESET, TEXT_UNLABELLED } from '@/consts'
import { PlusIcon } from '@/icons/plus-icon'
import { TrashIcon } from '@/icons/trash-icon'
import { downloadJson } from '@/lib/download-utils'
import { makeUuid } from '@/lib/id'
import { cn } from '@/lib/shadcn-utils'
import { TRANS_COLOR_CLS } from '@/theme'
import { Button } from '@/themed/v2/button'
import { Input } from '@/themed/v2/input'

import {
  DRAG_HANDLE_APPEAR_CLS,
  SortableItem,
} from '@/components/sortable-item'
import type { IDivProps } from '@/interfaces/div-props'
import { IconButton } from '@/themed/icon-button'

import { produce } from 'immer'

import { useDialogs } from '@/components/dialogs/dialogs'
import { DownloadIcon } from '@/components/icons/download-icon'
import { UploadIcon } from '@/components/icons/upload-icon'
import {
  onTextFileChange,
  openFilesDialog,
  type ITextFileOpen,
} from '@/components/pages/open-files'
import { FillButton } from '@/components/plot/fill-dropdown-menu'
import { VScrollPanel } from '@/components/v-scroll-panel'
import { randomHexColor } from '@/lib/color/color'
import { move } from '@dnd-kit/helpers'
import { DragDropProvider } from '@dnd-kit/react'
import { useOncoplotSettings } from './oncoplot-settings-store'
import { DEFAULT_MUTATIONS, type IMutation } from './oncoplot-utils'

interface IMutationElemProps {
  mutation: IMutation
  setDelMutation?: (mutation: IMutation) => void
}

function MutationElem({
  mutation,
  setDelMutation,
  index,
}: IMutationElemProps & { index: number }) {
  const { mutations, setMutations } = useOncoplotSettings()

  return (
    <SortableItem key={mutation.id} id={mutation.id} index={index}>
      <FillButton
        colors={[
          {
            color: mutation.color,
            allowNoColor: false,
            onColorChange: ({ color }) => {
              setMutations(
                produce(mutations, (draft) => {
                  const mut = draft.find((m) => m.id === mutation.id)
                  if (mut) {
                    mut.color = color
                  }
                })
              )
            },
          },
        ]}
      />

      <Input
        placeholder={TEXT_NAME}
        value={mutation.name}
        className="grow min-w-0"
        onTextChange={(v) =>
          setMutations(
            produce(mutations, (draft) => {
              const mut = draft.find((m) => m.id === mutation.id)
              if (mut) {
                mut.name = v
              }
            })
          )
        }
      />

      <VCenterRow className={DRAG_HANDLE_APPEAR_CLS}>
        <button
          className={cn(
            TRANS_COLOR_CLS,
            'stroke-foreground/50 hover:stroke-red-400'
          )}
          onClick={() => setDelMutation?.(mutation)}
          title="Delete feature"
        >
          <TrashIcon stroke="" />
        </button>
      </VCenterRow>
    </SortableItem>
  )
}

export function VariantPropsPanel({ ref }: IDivProps) {
  const { open: openDialog } = useDialogs()

  const { mutations, setMutations } = useOncoplotSettings()

  function openFeatureFiles(files: ITextFileOpen[]) {
    if (files.length === 0) {
      return
    }
    const file = files[0]!

    if (file.ext === 'json') {
      const mutations = JSON.parse(file.text)

      if (Array.isArray(mutations)) {
        setMutations(mutations as IMutation[])
      }
    }
  }

  return (
    <>
      <PropsPanel ref={ref} className="gap-y-2 pr-1">
        <VCenterRow className="justify-between gap-x-2">
          <VCenterRow>
            <IconButton
              onClick={() =>
                openFilesDialog({
                  message: 'Select mutation file to open',
                  fileTypes: ['json'],
                  onFileChange: (message, files) => {
                    onTextFileChange(message, files, (files) => {
                      openFeatureFiles(files)
                    })
                  },
                })
              }
              title="Open mutations"
            >
              <UploadIcon />
            </IconButton>

            <IconButton
              onClick={() => downloadJson(mutations, 'variants.json')}
              title="Save variants"
            >
              <DownloadIcon />
            </IconButton>

            <IconButton
              onClick={() =>
                setMutations(
                  produce(mutations, (draft) => {
                    draft.push({
                      id: makeUuid(),
                      name: 'New mutation',
                      color: randomHexColor(),
                      aliases: [],
                      show: true,
                    })
                  })
                )
              }
              title="Add Mutation"
            >
              <PlusIcon fill="stroke-foreground" />
            </IconButton>
          </VCenterRow>

          <Button
            variant="link"

            onClick={() => {
              openDialog({
                type: 'warning',
                payload: {
                  content: 'Are you sure you want to reset all mutations?',
                  callback: (response) => {
                    if (response === TEXT_OK) {
                      setMutations([...DEFAULT_MUTATIONS])
                    }
                  },
                },
              })
            }}
            //aria-label="Clear All"
            title="Reset mutations"
          >
            {TEXT_RESET}
          </Button>
        </VCenterRow>

        <VScrollPanel>
          <DragDropProvider
            onDragEnd={(event) => {
              const newOrder = move(mutations, event)
              setMutations(newOrder)
            }}
          >
            <ul className="flex flex-col  ">
              {mutations.map((mutation, mi) => {
                return (
                  <MutationElem
                    key={mutation.id}
                    index={mi}
                    mutation={mutation}
                    setDelMutation={(mutation) => {
                      openDialog({
                        type: 'warning',
                        payload: {
                          content: `Are you sure you want to delete the ${
                            mutation.name ? mutation.name : TEXT_UNLABELLED
                          } mutation?`,
                          callback: (response) => {
                            if (response === TEXT_OK) {
                              setMutations(
                                mutations.filter((m) => m.id !== mutation.id)
                              )
                            }
                          },
                        },
                      })
                    }}
                  />
                )
              })}
            </ul>
          </DragDropProvider>
        </VScrollPanel>
      </PropsPanel>
    </>
  )
}
