import { VCenterRow } from '@/layout/v-center-row'

import { PropsPanel } from '@/components/props-panel'
import {
  TEXT_CLEAR,
  TEXT_NAME,
  TEXT_OK,
  TEXT_SHOW,
  TEXT_UNLABELLED,
} from '@/consts'
import { PlusIcon } from '@/icons/plus-icon'
import { TrashIcon } from '@/icons/trash-icon'
import { downloadJson } from '@/lib/download-utils'
import { makeUuid } from '@/lib/id'
import { cn } from '@/lib/shadcn-utils'
import { TRANS_COLOR_CLS } from '@/theme'
import { Button } from '@/themed/v2/button'
import { Input } from '@/themed/v2/input'

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

import { useDialogs } from '@/components/dialogs/dialogs'
import { DownloadIcon } from '@/components/icons/download-icon'
import { UploadIcon } from '@/components/icons/upload-icon'
import { BaseCol } from '@/components/layout/base-col'
import {
  onTextFileChange,
  openFilesDialog,
  type ITextFileOpen,
} from '@/components/pages/open-files'
import { Checkbox } from '@/components/shadcn/ui/themed/v2/check-box'
import { LineSeparator } from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import { ToolbarSeparator } from '@/components/toolbar/toolbar-separator'
import { VScrollPanel } from '@/components/v-scroll-panel'
import { CheckPropRow } from '@/dialogs/check-prop-row'
import { PropRow } from '@/dialogs/prop-row'
import { TRACK_ITEM_BUTTONS_CLS } from '../../genomic/seq-browser/track-items/seq-track-item'
import { useLollipopStore } from './lollipop-store'
import { type IDomain } from './lollipop-utils'

function Trigger({ domain }: { domain: IDomain }) {
  return (
    <PopoverTrigger
      title="Change colors"
      className="rounded-full shrink-0 aspect-square font-bold w-6 h-6 overflow-hidden border-2"
      style={{
        backgroundColor: domain.fill.value,
        borderColor: domain.border.value,
        color: domain.text.font.fill.value,
      }}
    >
      A
    </PopoverTrigger>
  )
}

interface IDomainProps {
  domain: IDomain
  setDelDomain: (domain: IDomain | null) => void
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
              'stroke-foreground/50 hover:text-destructive hover:stroke-destructive'
            )}
            onClick={() => setDelDomain(domain)}
            title="Delete domain"
            //className="hover:text-destructive focus-visible:text-destructive trans-color"
          >
            <TrashIcon stroke="" />
          </button>
        </VCenterRow>
      }
    >
      <Checkbox
        checked={domain.show}
        onCheckedChange={(state) =>
          setDomain(
            produce(domain, (draft) => {
              draft.show = state
            })
          )
        }
      />
      <ThreeColorMenu
        colors={[
          {
            tooltip: 'Text',
            color: domain.text.font.fill.value,
            font: domain.text,
            onColorChange: (color, opacity) => {
              setDomain(
                produce(domain, (draft) => {
                  draft.text.font.fill.value = color
                  draft.text.font.fill.opacity = opacity
                })
              )

              setGlobalDomain(
                produce(globalDomain, (draft) => {
                  draft.text.font.fill.value = color
                  draft.text.font.fill.opacity = opacity
                })
              )
            },
            onShowColor: (show) => {
              setDomain(
                produce(domain, (draft) => {
                  draft.text.show = show
                })
              )

              setGlobalDomain(
                produce(globalDomain, (draft) => {
                  draft.text.show = show
                })
              )
            },
            onFontChange: (font) => {
              setDomain(
                produce(domain, (draft) => {
                  draft.text = font
                })
              )

              setGlobalDomain(
                produce(globalDomain, (draft) => {
                  draft.text = font
                })
              )
            },
          },
          {
            tooltip: 'Border',
            color: domain.border.value,

            onShowColor: (show) => {
              setDomain(
                produce(domain, (draft) => {
                  draft.border.show = show
                })
              )

              setGlobalDomain(
                produce(globalDomain, (draft) => {
                  draft.border.show = show
                })
              )
            },
            onColorChange: (color, opacity, width) => {
              setDomain(
                produce(domain, (draft) => {
                  draft.border.value = color
                  draft.border.opacity = opacity
                  draft.border.width = width
                })
              )

              setGlobalDomain(
                produce(globalDomain, (draft) => {
                  draft.border.value = color
                  draft.border.opacity = opacity
                  draft.border.width = width
                })
              )
            },
            width: domain.border.width,
          },
          {
            tooltip: 'Fill',
            color: domain.fill.value,

            onShowColor: (show) => {
              setDomain(
                produce(domain, (draft) => {
                  draft.fill.show = show
                })
              )

              setGlobalDomain(
                produce(globalDomain, (draft) => {
                  draft.fill.show = show
                })
              )
            },
            onColorChange: (color, opacity) => {
              setDomain(
                produce(domain, (draft) => {
                  draft.fill.value = color
                  draft.fill.opacity = opacity
                })
              )

              setGlobalDomain(
                produce(globalDomain, (draft) => {
                  draft.fill.value = color
                  draft.fill.opacity = opacity
                })
              )

              setGlobalDomain(
                produce(globalDomain, (draft) => {
                  draft.fill.value = color
                  draft.fill.opacity = opacity
                })
              )
            },
          },
        ]}
      >
        <Trigger domain={domain} />
      </ThreeColorMenu>

      <BaseCol className="gap-y-1 grow">
        <Input
          placeholder={TEXT_NAME}
          value={domain.name}
          onTextChange={(v) =>
            setDomain(
              produce(domain, (draft) => {
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
            onNumChange={(v) => {
              setDomain(
                produce(domain, (draft) => {
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
            onNumChange={(v) => {
              console.log('end', v, Math.min(Math.max(domain.start + 1, v)))
              setDomain(
                produce(domain, (draft) => {
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

  const { open: openDialog } = useDialogs()

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

  console.log('features', feature)

  return (
    <>
      <PropsPanel ref={ref} className="pr-1 gap-y-2">
        <h2 className="font-semibold text-lg">Domains</h2>
        <VCenterRow className="justify-between gap-x-2">
          <VCenterRow className="items-stretch">
            <IconButton
              onClick={() =>
                openFilesDialog({
                  fileTypes: ['json'],
                  onFileChange: (message, files) =>
                    onTextFileChange(message, files, openFeatureFiles),
                })
              }
              title="Open features"
            >
              <UploadIcon />
            </IconButton>

            <IconButton
              // ripple={false}
              onClick={() => downloadJson(features, 'features.json')}
              title="Save features"
            >
              <DownloadIcon />
            </IconButton>

            <ToolbarSeparator />

            <IconButton
              // ripple={false}
              onClick={() =>
                setFeatures(
                  produce(features, (draft) => {
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
              //size="sm"
              // ripple={false}
              onClick={() => {
                openDialog({
                  type: 'warning',
                  payload: {
                    content: 'Are you sure you want to clear all features?',
                    callback: (response) => {
                      if (response === TEXT_OK) {
                        setFeatures([])
                      }
                    },
                  },
                })
              }}
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
            onCheckedChange={(state) =>
              setDisplayProps(
                produce(displayProps, (draft) => {
                  draft.features.show = state
                })
              )
            }
          />

          <CheckPropRow
            title="Positions"
            disabled={!displayProps.features.show}
            checked={displayProps.features.positions.show}
            onCheckedChange={(state) =>
              setDisplayProps(
                produce(displayProps, (draft) => {
                  draft.features.positions.show = state
                })
              )
            }
          />

          <PropRow title="All feature colors">
            <ThreeColorMenu
              colors={[
                {
                  tooltip: 'Text',
                  color: feature.text.font.fill.value,
                  onColorChange: (color, opacity) => {
                    setFeatures(
                      produce(features, (draft) => {
                        for (const f of draft) {
                          f.text.font.fill.value = color
                          f.text.font.fill.opacity = opacity
                        }
                      })
                    )
                    setGlobalFeature(
                      produce(feature, (draft) => {
                        draft.text.font.fill.value = color
                        draft.text.font.fill.opacity = opacity
                      })
                    )
                  },
                },
                {
                  tooltip: 'Border',
                  color: feature.border.value,

                  onShowColor: (show) => {
                    setFeatures(
                      produce(features, (draft) => {
                        for (const f of draft) {
                          f.border.show = show
                        }
                      })
                    )

                    setGlobalFeature(
                      produce(feature, (draft) => {
                        draft.border.show = show
                      })
                    )
                  },
                  onColorChange: (color, opacity) => {
                    setFeatures(
                      produce(features, (draft) => {
                        for (const f of draft) {
                          f.border.value = color
                          f.border.opacity = opacity
                        }
                      })
                    )
                    setGlobalFeature(
                      produce(feature, (draft) => {
                        draft.border.value = color
                        draft.border.opacity = opacity
                      })
                    )
                  },
                },
                {
                  tooltip: 'Fill',
                  color: feature.fill.value,

                  onColorChange: (color, opacity) => {
                    setFeatures(
                      produce(features, (draft) => {
                        for (const f of draft) {
                          f.fill.value = color
                          f.fill.opacity = opacity
                        }
                      })
                    )
                    setGlobalFeature(
                      produce(feature, (draft) => {
                        draft.fill.value = color
                        draft.fill.opacity = opacity
                      })
                    )
                  },
                },
              ]}
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
          onDragEnd={(event) => {
            const { active, over } = event

            if (over && active.id !== over?.id) {
              const oldIndex = features.findIndex((t) => t.id === active.id)
              const newIndex = features.findIndex((t) => t.id === over.id)
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
                {features.map((feature) => {
                  return (
                    <DomainElem
                      key={feature.id}
                      domain={feature}
                      setDelDomain={(fd) => {
                        if (!fd) {
                          return
                        }
                        openDialog({
                          type: 'warning',
                          payload: {
                            content: `Are you sure you want to delete the ${
                              fd.name ? fd.name : TEXT_UNLABELLED
                            } domain?`,
                            callback: (response) => {
                              if (response === TEXT_OK) {
                                setFeatures(
                                  features.filter((f) => f.id !== fd.id)
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
            </VScrollPanel>
          </SortableContext>
        </DndContext>
      </PropsPanel>
    </>
  )
}
