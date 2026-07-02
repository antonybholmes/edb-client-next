import {
  ColorPickerButton,
  SIMPLE_COLOR_EXT_CLS,
} from '@/components/plot/color-picker-popover'
import { PropsPanel } from '@/components/props-panel'
import {
  ResizablePanel,
  ResizablePanelGroup,
  ThinVResizeHandle,
} from '@/components/shadcn/ui/themed/resizable'
import { Checkbox } from '@/components/shadcn/ui/themed/v2/check-box'
import { LineSeparator } from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import { SortableItem } from '@/components/sortable-item'
import { TruncateSpan } from '@/components/truncate-span'
import { VScrollPanel } from '@/components/v-scroll-panel'
import { TEXT_BORDER, TEXT_RESET } from '@/consts'
import { CheckPropRow } from '@/dialogs/check-prop-row'
import { PropRow } from '@/dialogs/prop-row'
import type { IDivProps } from '@/interfaces/div-props'
import { COLOR_TRANSPARENT } from '@/lib/color/color'
import { LinkButton } from '@/themed/link-button'
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
import { useLollipopStore } from './lollipop-store'
import {
  DEFAULT_COLOR_MAP,
  DEFAULT_MUTATION_COLOR,
  DEFAULT_VARIANT_LEGEND_ORDER,
} from './lollipop-utils'

export function VariantPropsPanel({ ref }: IDivProps) {
  const {
    datasets,
    datasetsForUse,
    mutationsForUse,
    setDatasetsForUse,
    setMutationsForUse,
  } = useLollipopStore()

  const { displayProps, setDisplayProps } = useLollipopSettings()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  return (
    <PropsPanel ref={ref} className="pr-1 gap-y-2">
      {/* <h2 className="font-semibold text-lg">Variants</h2> */}

      <ResizablePanelGroup
        orientation="vertical"
        className="px-2"
        //autoSaveId="rev-comp-vert"
      >
        <ResizablePanel
          defaultSize="30%"
          minSize="5%"
          className="flex flex-col text-sm gap-y-2"
        >
          <h3 className="font-semibold">Datasets</h3>
          <ul className="flex flex-col gap-y-1">
            {datasets.map((db, di) => {
              return (
                <li key={di}>
                  <CheckPropRow
                    title={db}
                    checked={datasetsForUse[db] ?? false}
                    onCheckedChange={(v) =>
                      setDatasetsForUse({
                        ...datasetsForUse,
                        [db]: v,
                      })
                    }
                  />
                </li>
              )
            })}
          </ul>
        </ResizablePanel>
        <ThinVResizeHandle />
        <ResizablePanel
          defaultSize="70%"
          minSize="5%"
          className="flex flex-col text-sm"
        >
          <h3 className="font-semibold">Variants</h3>
          <PropRow title="">
            <LinkButton
              onClick={() => {
                setDisplayProps(
                  produce(displayProps, (draft) => {
                    draft.variants.types = [...DEFAULT_VARIANT_LEGEND_ORDER]
                    draft.variants.colorMap = { ...DEFAULT_COLOR_MAP }
                  })
                )
              }}
              title="Reset colors and order to default"
            >
              {TEXT_RESET}
            </LinkButton>
          </PropRow>

          <CheckPropRow
            checked={displayProps.variants.plot.border.show}
            onCheckedChange={(v) =>
              setDisplayProps(
                produce(displayProps, (draft) => {
                  draft.variants.plot.border.show = v
                })
              )
            }
            title={TEXT_BORDER}
          >
            <ColorPickerButton
              colors={[
                {
                  color: displayProps.variants.plot.border.value,
                  allowNoColor: true,
                  onColorChange: (color) =>
                    setDisplayProps(
                      produce(displayProps, (draft) => {
                        draft.variants.plot.border.value = color
                        draft.variants.plot.border.show =
                          color !== COLOR_TRANSPARENT
                      })
                    ),
                },
              ]}
              className={SIMPLE_COLOR_EXT_CLS}
            />
          </CheckPropRow>

          <LineSeparator />

          <DndContext
            sensors={sensors}
            modifiers={[restrictToVerticalAxis]}
            //onDragStart={event => setActiveId(event.active.id as string)}
            onDragEnd={(event) => {
              const { active, over } = event

              if (over && active.id !== over?.id) {
                const oldIndex = displayProps.variants.types.findIndex(
                  (t) => t === (active.id as string)
                )
                const newIndex = displayProps.variants.types.findIndex(
                  (t) => t === (over.id as string)
                )
                const newOrder = arrayMove(
                  displayProps.variants.types,
                  oldIndex,
                  newIndex
                )

                setDisplayProps(
                  produce(displayProps, (draft) => {
                    draft.variants.types = newOrder
                  })
                )
              }
            }}
          >
            <SortableContext
              items={displayProps.variants.types}
              strategy={verticalListSortingStrategy}
            >
              <VScrollPanel className="grow h-full">
                <ul className="flex flex-col">
                  {displayProps.variants.types.map((mutation) => {
                    const id = mutation
                    return (
                      <SortableItem key={id} id={id}>
                        <Checkbox
                          checked={mutationsForUse[mutation] ?? false}
                          onCheckedChange={(v) =>
                            setMutationsForUse({
                              ...mutationsForUse,
                              [mutation]: v,
                            })
                          }
                        />
                        <ColorPickerButton
                          colors={[
                            {
                              color:
                                displayProps.variants.colorMap[mutation] ??
                                DEFAULT_MUTATION_COLOR,
                              onColorChange: (color) =>
                                setDisplayProps(
                                  produce(displayProps, (draft) => {
                                    draft.variants.colorMap = {
                                      ...draft.variants.colorMap,
                                      [mutation]: color,
                                    }
                                  })
                                ),
                            },
                          ]}
                          className={SIMPLE_COLOR_EXT_CLS}
                        />
                        <TruncateSpan className="grow h-8">
                          {mutation}
                        </TruncateSpan>
                      </SortableItem>
                    )
                  })}
                </ul>
              </VScrollPanel>
            </SortableContext>
          </DndContext>
        </ResizablePanel>
      </ResizablePanelGroup>
    </PropsPanel>
  )
}
