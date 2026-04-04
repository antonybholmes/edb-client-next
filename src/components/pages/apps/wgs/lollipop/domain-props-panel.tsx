import { VCenterRow } from '@/layout/v-center-row'

import { useState, type Dispatch, type SetStateAction } from 'react'

import { PropsPanel } from '@/components/props-panel'
import {
  NO_DIALOG,
  TEXT_CLEAR,
  TEXT_NAME,
  TEXT_OK,
  TEXT_SHOW,
  TEXT_UNLABELLED,
  type IDialogParams,
} from '@/consts'
import { OKCancelDialog } from '@/dialog/ok-cancel-dialog'
import { PlusIcon } from '@/icons/plus-icon'
import { SaveIcon } from '@/icons/save-icon'
import { TrashIcon } from '@/icons/trash-icon'
import { downloadJson } from '@/lib/download-utils'
import { makeUuid, randId } from '@/lib/id'
import { cn } from '@/lib/shadcn-utils'
import { TRANS_COLOR_CLS } from '@/theme'
import { Button } from '@/themed/v2/button'
import { Input } from '@/themed/v2/input'

import { OpenIcon } from '@/components/icons/open-icon'
import { PopoverTrigger } from '@/components/shadcn/ui/themed/v2/popover'
import { SortableItem } from '@/components/sortable-item'
import { ThreeColorMenu } from '@/components/three-color-menu'
import type { IDivProps } from '@/interfaces/div-props'
import { IconButton } from '@/themed/icon-button'
import { NumericalInput } from '@/themed/numerical-input'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { produce } from 'immer'

import { useLollipopSettings } from './lollipop-settings-store'

import { CheckPropRow } from '@/components/dialog/check-prop-row'
import { PropRow } from '@/components/dialog/prop-row'
import { BaseCol } from '@/components/layout/base-col'
import {
  onTextFileChange,
  OpenFiles,
  type ITextFileOpen,
} from '@/components/pages/open-files'
import { Checkbox } from '@/components/shadcn/ui/themed/v2/check-box'
import { LineSeparator } from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import { ToolbarSeparator } from '@/components/toolbar/toolbar-separator'
import { VScrollPanel } from '@/components/v-scroll-panel'
import { TRACK_ITEM_BUTTONS_CLS } from '../../genomic/seq-browser/track-items/seq-track-item'
import { useLollipopStore } from './lollipop-store'
import { type IDomain } from './lollipop-utils'

function Trigger({ domain }: { domain: IDomain }) {
  return (
    <PopoverTrigger
      title="Change colors"
      className="rounded-full shrink-0 aspect-square font-bold w-6 h-6 overflow-hidden border-2"
      style={{
        backgroundColor: domain.fill.color,
        borderColor: domain.border.color,
        color: domain.text.color,
      }}
    >
      A
    </PopoverTrigger>
  )
}

interface IDomainProps {
  domain: IDomain
  setDelDomain: Dispatch<SetStateAction<IDomain | null>>
}

function DomainElem({ domain, setDelDomain }: IDomainProps) {
  const { aaStats, setDomain: setDomain } = useLollipopStore()
  const {
    protein,
    domain: globalDomain,
    setDomain: setGlobalDomain,
    //protein,
  } = useLollipopSettings()

  const n = Math.max(aaStats.length, protein?.sequence.length ?? 0)

  return (
    <SortableItem
      key={domain.id}
      id={domain.id}
      extChildren={
        <VCenterRow className={TRACK_ITEM_BUTTONS_CLS}>
          <button
            className={cn(
              TRANS_COLOR_CLS,
              'stroke-foreground/50 hover:stroke-red-400'
            )}
            onClick={() => setDelDomain(domain)}
            title="Delete domain"
          >
            <TrashIcon stroke="" w="w-4" />
          </button>
        </VCenterRow>
      }
    >
      <Checkbox
        checked={domain.show}
        onCheckedChange={state =>
          setDomain(
            produce(domain, draft => {
              draft.show = state
            })
          )
        }
      />
      <ThreeColorMenu
        tooltips={['Text', 'Border', 'Fill']}
        color1={domain.text.color}
        color2={domain.border.color}
        color3={domain.fill.color}
        showColor2={domain.border.show}
        onShowColor1={show => {
          setDomain(
            produce(domain, draft => {
              draft.text.show = show
            })
          )

          setGlobalDomain(
            produce(globalDomain, draft => {
              draft.text.show = show
            })
          )
        }}
        onShowColor2={show => {
          setDomain(
            produce(domain, draft => {
              draft.border.show = show
            })
          )

          setGlobalDomain(
            produce(globalDomain, draft => {
              draft.border.show = show
            })
          )
        }}
        onColor2Change={color => {
          setDomain(
            produce(domain, draft => {
              draft.border.color = color
            })
          )

          setGlobalDomain(
            produce(globalDomain, draft => {
              draft.border.color = color
            })
          )
        }}
        width2={domain.border.width}
        onWidthChange2={width => {
          setDomain(
            produce(domain, draft => {
              draft.border.width = width
            })
          )

          setGlobalDomain(
            produce(globalDomain, draft => {
              draft.border.width = width
            })
          )
        }}
        onShowColor3={show => {
          setDomain(
            produce(domain, draft => {
              draft.fill.show = show
            })
          )

          setGlobalDomain(
            produce(globalDomain, draft => {
              draft.fill.show = show
            })
          )
        }}
        onColor3Change={color => {
          setDomain(
            produce(domain, draft => {
              draft.fill.color = color
            })
          )

          setGlobalDomain(
            produce(globalDomain, draft => {
              draft.fill.color = color
            })
          )
        }}
        onColor1Change={color => {
          setDomain(
            produce(domain, draft => {
              draft.text.color = color
            })
          )

          setGlobalDomain(
            produce(globalDomain, draft => {
              draft.text.color = color
            })
          )
        }}
      >
        <Trigger domain={domain} />
      </ThreeColorMenu>

      <BaseCol className="gap-y-1 grow">
        <Input
          placeholder={TEXT_NAME}
          value={domain.name}
          onTextChange={v =>
            setDomain(
              produce(domain, draft => {
                draft.name = v
              })
            )
          }
        />

        <VCenterRow className="gap-x-2">
          <NumericalInput
            value={domain.start}
            limit={[1, n]}
            placeholder="Start"
            onNumChange={v => {
              setDomain(
                produce(domain, draft => {
                  draft.start = Math.min(Math.max(1, v), n)
                  draft.end = Math.min(Math.max(draft.start + 1, draft.end), n)
                })
              )
            }}
          />

          <NumericalInput
            value={domain.end}
            limit={[domain.start + 1, n]}
            placeholder="End"
            onNumChange={v => {
              console.log('end', v, Math.min(Math.max(domain.start + 1, v)))
              setDomain(
                produce(domain, draft => {
                  draft.end = Math.min(Math.max(domain.start + 1, v), n)
                })
              )
            }}
          />
        </VCenterRow>
      </BaseCol>
    </SortableItem>
  )
}

export function DomainPropsPanel({ ref }: IDivProps) {
  const {
    aaStats,
    domains: features,
    setDomains: setFeatures,
  } = useLollipopStore()
  //const [delFeature, setDelFeature] = useState<IProteinFeature | null>(null)
  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })

  const {
    domain: feature,
    setDomain: setGlobalFeature,
    displayProps,
    setDisplayProps,
  } = useLollipopSettings()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function openFeatureFiles(files: ITextFileOpen[]) {
    if (files.length === 0) {
      return
    }
    const file = files[0]!

    if (file.ext === 'json') {
      const features = JSON.parse(file.text)

      if (Array.isArray(features)) {
        setFeatures(features as IDomain[])
      }
    }
  }

  return (
    <>
      {showDialog.id.startsWith('open') && (
        <OpenFiles
          //onOpenChange={() => setOpen("")}
          onFileChange={(message, files) =>
            onTextFileChange(message, files, files => {
              openFeatureFiles(files)
            })
          }
          fileTypes={['json']}
        />
      )}

      {showDialog.id.includes('clear') && (
        <OKCancelDialog
          onResponse={r => {
            if (r === TEXT_OK) {
              //onGroupsChange?.([])
              setFeatures([])
            }

            setShowDialog({ ...NO_DIALOG })
          }}
        >
          Are you sure you want to clear all features?
        </OKCancelDialog>
      )}

      {showDialog.id.includes('delete') && (
        <OKCancelDialog
          //open={delFeature !== null}
          showClose={true}
          onResponse={r => {
            if (r === TEXT_OK) {
              setFeatures(
                features.filter(
                  feature =>
                    feature.id !== (showDialog.params!.feature! as IDomain).id
                )
              )
            }
            setShowDialog({ ...NO_DIALOG })
          }}
        >
          {`Are you sure you want to delete ${
            (showDialog.params!.feature! as IDomain).name
              ? (showDialog.params!.feature! as IDomain).name
              : TEXT_UNLABELLED
          }?`}
        </OKCancelDialog>
      )}

      <PropsPanel ref={ref} className="pr-1 gap-y-2">
        <h2 className="font-semibold text-lg">Domains</h2>
        <VCenterRow className="justify-between gap-x-2">
          <VCenterRow className="items-stretch">
            <IconButton
              onClick={() => setShowDialog({ id: randId('open'), params: {} })}
              title="Open features"
            >
              <OpenIcon />
            </IconButton>

            <IconButton
              // ripple={false}
              onClick={() => downloadJson(features, 'features.json')}
              title="Save features"
            >
              <SaveIcon />
            </IconButton>

            <ToolbarSeparator />

            <IconButton
              // ripple={false}
              onClick={() =>
                setFeatures(
                  produce(features, draft => {
                    draft.push({
                      ...feature,
                      id: makeUuid(),
                      name: `Feature ${features.length + 1}`,
                      start: 1,
                      end: Math.min(10, aaStats.length),
                    })
                  })
                )
              }
              title="Add Feature"
            >
              <PlusIcon fill="stroke-foreground" />
            </IconButton>
          </VCenterRow>

          {features.length > 0 && (
            <Button
              variant="link"
              size="sm"
              // ripple={false}
              onClick={() => setShowDialog({ id: randId('clear'), params: {} })}
              //aria-label="Clear All"
              title="Clear all groups"
            >
              {TEXT_CLEAR}
            </Button>
          )}
        </VCenterRow>

        <BaseCol>
          <CheckPropRow
            title={TEXT_SHOW}
            checked={displayProps.features.show}
            onCheckedChange={state =>
              setDisplayProps(
                produce(displayProps, draft => {
                  draft.features.show = state
                })
              )
            }
          />

          <CheckPropRow
            title="Positions"
            disabled={!displayProps.features.show}
            checked={displayProps.features.positions.show}
            onCheckedChange={state =>
              setDisplayProps(
                produce(displayProps, draft => {
                  draft.features.positions.show = state
                })
              )
            }
          />

          <PropRow title="All feature colors">
            <ThreeColorMenu
              tooltips={['Text', 'Border', 'Fill']}
              color2={feature.border.color}
              color3={feature.fill.color}
              color1={feature.text.color}
              showColor2={feature.border.show}
              onShowColor2={show => {
                setFeatures(
                  produce(features, draft => {
                    for (const f of draft) {
                      f.border.show = show
                    }
                  })
                )

                setGlobalFeature(
                  produce(feature, draft => {
                    draft.border.show = show
                  })
                )
              }}
              onColor1Change={color => {
                setFeatures(
                  produce(features, draft => {
                    for (const f of draft) {
                      f.text.color = color
                    }
                  })
                )
                setGlobalFeature(
                  produce(feature, draft => {
                    draft.text.color = color
                  })
                )
              }}
              onColor2Change={color => {
                setFeatures(
                  produce(features, draft => {
                    for (const f of draft) {
                      f.border.color = color
                    }
                  })
                )
                setGlobalFeature(
                  produce(feature, draft => {
                    draft.border.color = color
                  })
                )
              }}
              onColor3Change={color => {
                setFeatures(
                  produce(features, draft => {
                    for (const f of draft) {
                      f.fill.color = color
                    }
                  })
                )
                setGlobalFeature(
                  produce(feature, draft => {
                    draft.fill.color = color
                  })
                )
              }}
            >
              <Trigger domain={feature} />
            </ThreeColorMenu>
          </PropRow>
        </BaseCol>
        <LineSeparator />

        <DndContext
          sensors={sensors}
          modifiers={[restrictToVerticalAxis]}
          //onDragStart={event => setActiveId(event.active.id as string)}
          onDragEnd={event => {
            const { active, over } = event

            if (over && active.id !== over?.id) {
              const oldIndex = features.findIndex(t => t.id === active.id)
              const newIndex = features.findIndex(t => t.id === over.id)
              const newOrder = arrayMove(features, oldIndex, newIndex)

              setFeatures(newOrder)
            }
          }}
        >
          <SortableContext
            items={features}
            strategy={verticalListSortingStrategy}
          >
            <VScrollPanel className="grow h-full">
              <ul className="flex flex-col">
                {features.map(feature => {
                  return (
                    <DomainElem
                      key={feature.id}
                      domain={feature}
                      setDelDomain={feature =>
                        setShowDialog({
                          id: randId('delete'),
                          params: { feature },
                        })
                      }
                    />
                  )
                })}
              </ul>
            </VScrollPanel>
          </SortableContext>
        </DndContext>
      </PropsPanel>
    </>
  )
}
