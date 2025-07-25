import { SwitchPropRow } from '@/components/dialog/switch-prop-row'
import { VCenterRow } from '@/components/layout/v-center-row'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@/components/shadcn/ui/themed/accordion'
import { LinkButton } from '@/components/shadcn/ui/themed/link-button'
import { DragHandle, SortableItem } from '@/components/sortable-item'
import { TEXT_RESET } from '@/consts'
import type { IDivProps } from '@/interfaces/div-props'
import {
  ColorPickerButton,
  SIMPLE_COLOR_EXT_CLS,
} from '@components/color/color-picker-button'
import { PropsPanel } from '@components/props-panel'
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
import { COLOR_TRANSPARENT } from '@lib/color/color'
import { produce } from 'immer'
import { useContext } from 'react'
import { LollipopContext } from './lollipop-provider'
import { useLollipopSettings } from './lollipop-settings-store'
import {
  DEFAULT_COLOR_MAP,
  DEFAULT_MUTATION_COLOR,
  DEFAULT_VARIANT_LEGEND_ORDER,
} from './lollipop-utils'

export function DatabasPropsPanel({ ref }: IDivProps) {
  const {
    databases,
    databasesForUse,
    mutationsForUse,
    setDatabasesForUse,
    setMutationsForUse,
  } = useContext(LollipopContext)!

  const { displayProps, setDisplayProps } = useLollipopSettings()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  return (
    <PropsPanel ref={ref}>
      {/* <h2 className={PROPS_TITLE_CLS}>Settings</h2> */}

      <ScrollAccordion value={['databases', 'mutations']}>
        <AccordionItem value="databases">
          <AccordionTrigger>Databases</AccordionTrigger>

          <AccordionContent>
            <ul className="flex flex-col gap-y-1">
              {databases.map((db, di) => {
                return (
                  <li key={di}>
                    <SwitchPropRow
                      title={db}
                      checked={databasesForUse[db] ?? false}
                      onCheckedChange={v =>
                        setDatabasesForUse({
                          ...databasesForUse,
                          [db]: v,
                        })
                      }
                    />
                  </li>
                )
              })}
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="mutations">
          <AccordionTrigger>Mutations</AccordionTrigger>

          <AccordionContent>
            {/* <Switch
            checked={displayProps.samples.removeEmpty}
            onCheckedChange={state =>
              setDisplayProps({
                ...displayProps,
                samples: { ...displayProps.samples, removeEmpty: state },
              })
            }
          >
            <Label>Remove empty</Label>
          </Switch> */}
            {/* <Switch
          checked={displayProps.samples.graphs.show}
          onCheckedChange={state =>
            setDisplayProps({
              ...displayProps,
              samples: {
                ...displayProps.samples,
                graphs: {
                  ...displayProps.samples.graphs,
                  show: state,
                },
              },
            })
          }
        >
          <span>TMB graph</span>
        </Switch> */}
            <VCenterRow className="justify-end my-1">
              <LinkButton
                onClick={() => {
                  setDisplayProps(
                    produce(displayProps, draft => {
                      draft.mutations.types = [...DEFAULT_VARIANT_LEGEND_ORDER]
                      draft.mutations.colorMap = { ...DEFAULT_COLOR_MAP }
                    })
                  )
                }}
                title="Reset colors and order to default"
              >
                {TEXT_RESET}
              </LinkButton>
            </VCenterRow>

            <SwitchPropRow
              title="Border"
              checked={displayProps.mutations.plot.border.show}
              onCheckedChange={v =>
                setDisplayProps(
                  produce(displayProps, draft => {
                    draft.mutations.plot.border.show = v
                  })
                )
              }
              className="mt-2"
            >
              <ColorPickerButton
                color={displayProps.mutations.plot.border.color}
                allowNoColor={true}
                onColorChange={color =>
                  setDisplayProps(
                    produce(displayProps, draft => {
                      draft.mutations.plot.border.color = color
                      draft.mutations.plot.border.show =
                        color !== COLOR_TRANSPARENT
                    })
                  )
                }
                className={SIMPLE_COLOR_EXT_CLS}
              />
            </SwitchPropRow>

            {/* <MenuSeparator /> */}

            <DndContext
              sensors={sensors}
              modifiers={[restrictToVerticalAxis]}
              //onDragStart={event => setActiveId(event.active.id as string)}
              onDragEnd={event => {
                const { active, over } = event

                if (over && active.id !== over?.id) {
                  const oldIndex = displayProps.mutations.types.findIndex(
                    t => t === (active.id as string)
                  )
                  const newIndex = displayProps.mutations.types.findIndex(
                    t => t === (over.id as string)
                  )
                  const newOrder = arrayMove(
                    displayProps.mutations.types,
                    oldIndex,
                    newIndex
                  )

                  setDisplayProps(
                    produce(displayProps, draft => {
                      draft.mutations.types = newOrder
                    })
                  )
                }
              }}
            >
              <SortableContext
                items={displayProps.mutations.types}
                strategy={verticalListSortingStrategy}
              >
                <ul className="flex flex-col">
                  {displayProps.mutations.types.map(mutation => {
                    const id = mutation
                    return (
                      <SortableItem
                        key={id}
                        id={id}
                        className="flex flex-row items-center gap-x-2 grow pb-1"
                      >
                        <DragHandle />
                        <SwitchPropRow
                          className="grow"
                          title={mutation}
                          checked={mutationsForUse[mutation] ?? false}
                          onCheckedChange={v =>
                            setMutationsForUse({
                              ...mutationsForUse,
                              [mutation]: v,
                            })
                          }
                        >
                          <ColorPickerButton
                            color={
                              displayProps.mutations.colorMap[mutation] ??
                              DEFAULT_MUTATION_COLOR
                            }
                            onColorChange={color => {
                              setDisplayProps(
                                produce(displayProps, draft => {
                                  draft.mutations.colorMap = {
                                    ...draft.mutations.colorMap,
                                    [mutation]: color,
                                  }
                                })
                              )
                            }}
                            className={SIMPLE_COLOR_EXT_CLS}
                          />
                        </SwitchPropRow>
                      </SortableItem>
                    )
                  })}
                </ul>
              </SortableContext>
            </DndContext>

            {/* <ul>
              {displayProps.legend.mutations.types.map(
                (mutation: string, mi: number) => (
                  <li key={mi}>
                    <SwitchPropRow
                      title={mutation}
                      key={mi}
                      checked={
                        plotState.df.mutationsForUse.get(mutation) ?? false
                      }
                      onCheckedChange={v =>
                        plotDispatch({
                          type: 'set',
                          df: produce(plotState.df, draft => {
                            draft.mutationsForUse = new Map(
                              plotState.df.mutationsForUse
                            ).set(mutation, v)
                          }),
                        })
                      }
                    >
                      <ColorPickerButton
                        color={
                          displayProps.legend.mutations.colorMap.get(
                            mutation
                          ) ?? DEFAULT_MUTATION_COLOR
                        }
                        onColorChange={color => {
                          plotDispatch({
                            type: 'display',

                            displayProps: produce(displayProps, draft => {
                              draft.legend.mutations.colorMap = new Map(
                                displayProps.legend.mutations.colorMap
                              ).set(mutation, color)
                            }),
                          })
                        }}
                        className={SIMPLE_COLOR_EXT_CLS}
                      />
                    </SwitchPropRow>
                  </li>
                )
              )}
            </ul> */}
          </AccordionContent>
        </AccordionItem>
      </ScrollAccordion>
    </PropsPanel>
  )
}
