import { VCenterRow } from '@layout/v-center-row'

import { useContext, useState, type Dispatch, type SetStateAction } from 'react'

import {
  NO_DIALOG,
  TEXT_CLEAR,
  TEXT_NAME,
  TEXT_OK,
  TEXT_UNLABELLED,
  type IDialogParams,
} from '@/consts'
import { TRANS_COLOR_CLS } from '@/theme'
import { PropsPanel } from '@components/props-panel'
import { OKCancelDialog } from '@dialog/ok-cancel-dialog'
import { PlusIcon } from '@icons/plus-icon'
import { SaveIcon } from '@icons/save-icon'
import { TrashIcon } from '@icons/trash-icon'
import { downloadJson } from '@lib/download-utils'
import { makeNanoIDLen12, randID } from '@lib/id'
import { cn } from '@lib/shadcn-utils'
import { Button } from '@themed/button'
import { Input } from '@themed/input'
import { Switch } from '@themed/switch'

import { PropRow } from '@/components/dialog/prop-row'
import { SwitchPropRow } from '@/components/dialog/switch-prop-row'
import { OpenIcon } from '@/components/icons/open-icon'
import { MenuSeparator } from '@/components/shadcn/ui/themed/dropdown-menu'
import { IconButton } from '@/components/shadcn/ui/themed/icon-button'
import { NumericalInput } from '@/components/shadcn/ui/themed/numerical-input'
import { PopoverTrigger } from '@/components/shadcn/ui/themed/popover'
import { DragHandle, SortableItem } from '@/components/sortable-item'
import { ThreeColorMenu } from '@/components/three-color-menu'
import type { IDivProps } from '@/interfaces/div-props'
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
import {
  onTextFileChange,
  OpenFiles,
  type ITextFileOpen,
} from '../../open-files'
import { LollipopContext } from './lollipop-provider'
import { useLollipopSettings } from './lollipop-settings-store'

import { type IProteinFeature } from './lollipop-utils'

function Trigger({ feature }: { feature: IProteinFeature }) {
  return (
    <PopoverTrigger
      title="Change colors"
      className="rounded-full shrink-0 aspect-square font-bold w-6 h-6 overflow-hidden border-2"
      style={{
        backgroundColor: feature.fill.color,
        borderColor: feature.border.color,
        color: feature.text.color,
      }}
    >
      A
    </PopoverTrigger>
  )
}

interface IFeatureProps {
  feature: IProteinFeature
  setDelFeature: Dispatch<SetStateAction<IProteinFeature | null>>
}

function FeatureElem({ feature, setDelFeature }: IFeatureProps) {
  const { protein, aaStats, setFeature } = useContext(LollipopContext)!
  const {
    feature: globalFeature,
    setFeature: setGlobalFeature,
    //protein,
  } = useLollipopSettings()

  const n = Math.max(aaStats.length, protein.sequence.length)

  console.log('FeatureElem', feature)

  return (
    <VCenterRow
      key={feature.id}
      className="gap-x-2 hover:bg-muted/50 rounded-theme px-2 py-1 overflow-hidden"
    >
      <DragHandle />

      <ThreeColorMenu
        tooltips={['Text', 'Border', 'Fill']}
        color1={feature.text.color}
        color2={feature.border.color}
        color3={feature.fill.color}
        showColor2={feature.border.show}
        onShowColor1={(show) => {
          setFeature(
            produce(feature, (draft) => {
              draft.text.show = show
            })
          )

          setGlobalFeature(
            produce(globalFeature, (draft) => {
              draft.text.show = show
            })
          )
        }}
        onShowColor2={(show) => {
          setFeature(
            produce(feature, (draft) => {
              draft.border.show = show
            })
          )

          setGlobalFeature(
            produce(globalFeature, (draft) => {
              draft.border.show = show
            })
          )
        }}
        onColor2Change={(color) => {
          setFeature(
            produce(feature, (draft) => {
              draft.border.color = color
            })
          )

          setGlobalFeature(
            produce(globalFeature, (draft) => {
              draft.border.color = color
            })
          )
        }}
        width2={feature.border.width}
        onWidthChange2={(width) => {
          setFeature(
            produce(feature, (draft) => {
              draft.border.width = width
            })
          )

          setGlobalFeature(
            produce(globalFeature, (draft) => {
              draft.border.width = width
            })
          )
        }}
        onShowColor3={(show) => {
          setFeature(
            produce(feature, (draft) => {
              draft.fill.show = show
            })
          )

          setGlobalFeature(
            produce(globalFeature, (draft) => {
              draft.fill.show = show
            })
          )
        }}
        onColor3Change={(color) => {
          setFeature(
            produce(feature, (draft) => {
              draft.fill.color = color
            })
          )

          setGlobalFeature(
            produce(globalFeature, (draft) => {
              draft.fill.color = color
            })
          )
        }}
        onColor1Change={(color) => {
          setFeature(
            produce(feature, (draft) => {
              draft.text.color = color
            })
          )

          setGlobalFeature(
            produce(globalFeature, (draft) => {
              draft.text.color = color
            })
          )
        }}
      >
        <Trigger feature={feature} />
      </ThreeColorMenu>

      <Input
        placeholder={TEXT_NAME}
        value={feature.name}
        className="grow min-w-0"
        onTextChange={(v) =>
          setFeature(
            produce(feature, (draft) => {
              draft.name = v
            })
          )
        }
      />

      <NumericalInput
        value={feature.start}
        limit={[1, n]}
        placeholder="Start"
        w="w-14"
        onNumChange={(v) => {
          setFeature(
            produce(feature, (draft) => {
              draft.start = Math.min(Math.max(1, v), n)
              draft.end = Math.min(Math.max(draft.start + 1, draft.end), n)
            })
          )
        }}
      />

      <NumericalInput
        value={feature.end}
        limit={[feature.start + 1, n]}
        placeholder="End"
        w="w-14"
        //className="w-12 shrink-0 text-center rounded-theme"
        onNumChange={(v) => {
          console.log('end', v, Math.min(Math.max(feature.start + 1, v)))

          setFeature(
            produce(feature, (draft) => {
              draft.end = Math.min(Math.max(feature.start + 1, v), n)
            })
          )
        }}
      />

      {/* <VCenterRow className="gap-x-1">
            <Label>Z</Label>
            <NumericalInput
              value={feature.z}
              limit={[1, 1000]}
              placeholder="Z-index"
              w="w-16"
              //className="w-12 shrink-0 text-center rounded-theme"
              onNumChange={v =>
                plotDispatch({
                  type: 'feature',
                  feature: produce(feature, draft => {
                    draft.z = Math.max(1, v)
                  }),
                })
              }
            />
          </VCenterRow> */}

      <Switch
        checked={feature.show}
        onCheckedChange={(state) =>
          setFeature(
            produce(feature, (draft) => {
              draft.show = state
            })
          )
        }
      />

      <button
        className={cn(
          TRANS_COLOR_CLS,
          'stroke-foreground/50 hover:stroke-red-400'
        )}
        onClick={() => setDelFeature(feature)}
        title="Delete feature"
      >
        <TrashIcon stroke="" />
      </button>
    </VCenterRow>
  )
}

export function FeaturePropsPanel({ ref }: IDivProps) {
  const { aaStats, features, setFeatures } = useContext(LollipopContext)!
  //const [delFeature, setDelFeature] = useState<IProteinFeature | null>(null)
  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })

  const {
    feature,
    setFeature: setGlobalFeature,
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
        setFeatures(features as IProteinFeature[])
      }
    }
  }

  return (
    <>
      {showDialog.id.includes('clear') && (
        <OKCancelDialog
          onResponse={(r) => {
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
          onResponse={(r) => {
            if (r === TEXT_OK) {
              setFeatures(
                features.filter(
                  (feature) =>
                    feature.id !==
                    (showDialog.params!.feature! as IProteinFeature).id
                )
              )
            }
            setShowDialog({ ...NO_DIALOG })
          }}
        >
          {`Are you sure you want to delete ${
            (showDialog.params!.feature! as IProteinFeature).name
              ? (showDialog.params!.feature! as IProteinFeature).name
              : TEXT_UNLABELLED
          }?`}
        </OKCancelDialog>
      )}

      <PropsPanel ref={ref} className="gap-y-2">
        {/* <h2 className={PROPS_TITLE_CLS}>Settings</h2> */}

        <VCenterRow className="justify-between gap-x-2">
          <VCenterRow>
            <IconButton
              onClick={() => setShowDialog({ id: randID('open'), params: {} })}
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

            <IconButton
              // ripple={false}
              onClick={() =>
                setFeatures(
                  produce(features, (draft) => {
                    draft.push({
                      ...feature,
                      id: makeNanoIDLen12(),
                      name: `Feature ${features.length + 1}`,
                      start: 1,
                      end: Math.min(10, aaStats.length),
                    })
                  })
                )
              }
              title="Add feature"
            >
              <PlusIcon fill="stroke-foreground" />
            </IconButton>
          </VCenterRow>

          {features.length > 0 && (
            <Button
              variant="link"
              size="sm"
              // ripple={false}
              onClick={() => setShowDialog({ id: randID('clear'), params: {} })}
              //aria-label="Clear All"
              title="Clear all groups"
            >
              {TEXT_CLEAR}
            </Button>
          )}
        </VCenterRow>

        <SwitchPropRow
          title="Show"
          checked={displayProps.features.show}
          onCheckedChange={(state) =>
            setDisplayProps(
              produce(displayProps, (draft) => {
                draft.features.show = state
              })
            )
          }
        />
        <SwitchPropRow
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
        {/* <Switch
            checked={displayProps.features.background.show}
            onCheckedChange={state =>
              plotDispatch({
                type: "display",
                displayProps: {
                  ...displayProps,
                  features: {
                    ...displayProps.features,

                    background: {
                      ...displayProps.features.background,
                      show: state,
                    },
                  },
                },
              })
            }
          >
            <SimpleColorPickerButton
              color={displayProps.features.background.color}
              onColorChange={color =>
                plotDispatch({
                  type: "display",
                  displayProps: {
                    ...displayProps,
                    features: {
                      ...displayProps.features,

                      background: {
                        ...displayProps.features.background,
                        color: color,
                      },
                    },
                  },
                })
              }
              className={SIMPLE_COLOR_EXT_CLS}
            />
            <span>Background</span>
          </Switch>

          <Switch
            checked={displayProps.features.border.show}
            onCheckedChange={state =>
              plotDispatch({
                type: "display",
                displayProps: {
                  ...displayProps,
                  features: {
                    ...displayProps.features,

                    border: {
                      ...displayProps.features.border,
                      show: state,
                    },
                  },
                },
              })
            }
          >
            <SimpleColorPickerButton
              color={displayProps.features.border.color}
              onColorChange={color =>
                plotDispatch({
                  type: "display",
                  displayProps: {
                    ...displayProps,
                    features: {
                      ...displayProps.features,

                      border: {
                        ...displayProps.features.border,
                        color,
                      },
                    },
                  },
                })
              }
              className={SIMPLE_COLOR_EXT_CLS}
            />
            <span>Border</span>
          </Switch> */}
        <PropRow title="All feature colors">
          <ThreeColorMenu
            tooltips={['Text', 'Border', 'Fill']}
            color2={feature.border.color}
            color3={feature.fill.color}
            color1={feature.text.color}
            showColor2={feature.border.show}
            onShowColor2={(show) => {
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
            }}
            onColor1Change={(color) => {
              setFeatures(
                produce(features, (draft) => {
                  for (const f of draft) {
                    f.text.color = color
                  }
                })
              )
              setGlobalFeature(
                produce(feature, (draft) => {
                  draft.text.color = color
                })
              )
            }}
            onColor2Change={(color) => {
              setFeatures(
                produce(features, (draft) => {
                  for (const f of draft) {
                    f.border.color = color
                  }
                })
              )
              setGlobalFeature(
                produce(feature, (draft) => {
                  draft.border.color = color
                })
              )
            }}
            onColor3Change={(color) => {
              setFeatures(
                produce(features, (draft) => {
                  for (const f of draft) {
                    f.fill.color = color
                  }
                })
              )
              setGlobalFeature(
                produce(feature, (draft) => {
                  draft.fill.color = color
                })
              )
            }}
          >
            <Trigger feature={feature} />
          </ThreeColorMenu>
        </PropRow>

        <MenuSeparator />

        {/* <BaseCol className="grow">
          {features.map((feature, fi) => {
            return (
              <FeatureElem
                key={fi}
                feature={feature}
                setDelFeature={feature =>
                  setShowDialog({
                    id: randId('delete'),
                    params: { feature },
                  })
                }
              />
            )
          })}
        </BaseCol> */}

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
            <ul className="flex flex-col">
              {features.map((feature) => {
                const id = feature.id
                return (
                  <SortableItem
                    key={id}
                    id={id}
                    className="flex flex-row items-center gap-x-2 grow"
                  >
                    <FeatureElem
                      key={id}
                      feature={feature}
                      setDelFeature={(feature) =>
                        setShowDialog({
                          id: randID('delete'),
                          params: { feature },
                        })
                      }
                    />
                  </SortableItem>
                )
              })}
            </ul>
          </SortableContext>
        </DndContext>
      </PropsPanel>

      {showDialog.id.includes('open') && (
        <OpenFiles
          //onOpenChange={() => setOpen("")}
          onFileChange={(message, files) =>
            onTextFileChange(message, files, (files) => {
              openFeatureFiles(files)
            })
          }
          fileTypes={['json']}
        />
      )}
    </>
  )
}
