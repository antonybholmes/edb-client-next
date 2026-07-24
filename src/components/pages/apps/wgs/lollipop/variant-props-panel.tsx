import { useDialogs } from '@/components/dialogs/dialogs'
import { FillButton } from '@/components/plot/fill-dropdown-menu'
import { OutlineButton } from '@/components/plot/outline-dropdown-menu'
import { PropsPanel } from '@/components/props-panel'
import { Checkbox } from '@/components/shadcn/ui/themed/v2/check-box'
import { LineSeparator } from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import { SortableItem } from '@/components/sortable-item'
import { TruncateSpan } from '@/components/truncate-span'
import { VScrollPanel } from '@/components/v-scroll-panel'
import { TEXT_BORDER, TEXT_OK, TEXT_RESET } from '@/consts'
import { PropRow } from '@/dialogs/prop-row'
import type { IDivProps } from '@/interfaces/div-props'
import { LinkButton } from '@/themed/link-button'

import { move } from '@dnd-kit/helpers'
import { DragDropProvider } from '@dnd-kit/react'
import { produce } from 'immer'
import { useLollipopSettings } from './lollipop-settings-store'
import { useLollipopStore } from './lollipop-store'
import {
  DEFAULT_COLOR_MAP,
  DEFAULT_MUTATION_COLOR,
  DEFAULT_VARIANT_LEGEND_ORDER,
} from './lollipop-utils'
import APP_INFO from './manifest.json'

export function VariantPropsPanel({ ref }: IDivProps) {
  const {
    mutationsForUse,

    setMutationsForUse,
  } = useLollipopStore()

  const { displayProps, setDisplayProps } = useLollipopSettings()

  // const sensors = useSensors(
  //   useSensor(PointerSensor),
  //   useSensor(KeyboardSensor, {
  //     coordinateGetter: sortableKeyboardCoordinates,
  //   })
  // )

  const { open: openDialog } = useDialogs()

  return (
    <PropsPanel ref={ref} className="gap-y-2 text-xs">
      <PropRow title="">
        <LinkButton
          onClick={() => {
            openDialog({
              type: 'alert',
              payload: {
                title: APP_INFO.name,
                content:
                  'Are you sure you want to reset colors and order to default?',
                callback: (r) => {
                  if (r === TEXT_OK) {
                    setDisplayProps(
                      produce(displayProps, (draft) => {
                        draft.variants.types = [...DEFAULT_VARIANT_LEGEND_ORDER]
                        draft.variants.colorMap = { ...DEFAULT_COLOR_MAP }
                      })
                    )
                  }
                },
              },
            })
          }}
          title="Reset colors and order to default"
        >
          {TEXT_RESET}
        </LinkButton>
      </PropRow>

      <PropRow title={TEXT_BORDER}>
        <OutlineButton
          colors={[
            {
              color: displayProps.variants.plot.border.value,
              opacity: displayProps.variants.plot.border.opacity,
              show: displayProps.variants.plot.border.show,
              onColorChange: ({ color, opacity, width, dasharray, show }) =>
                setDisplayProps(
                  produce(displayProps, (draft) => {
                    draft.variants.plot.border.value = color
                    draft.variants.plot.border.opacity =
                      opacity ?? draft.variants.plot.border.opacity
                    draft.variants.plot.border.width =
                      width ?? draft.variants.plot.border.width
                    draft.variants.plot.border.dasharray =
                      dasharray ?? draft.variants.plot.border.dasharray
                    draft.variants.plot.border.show =
                      show ?? draft.variants.plot.border.show
                  })
                ),
            },
          ]}
        />
      </PropRow>

      <LineSeparator />
      <VScrollPanel className="grow h-full">
        <DragDropProvider
          onDragEnd={(event) => {
            const newOrder = move(displayProps.variants.types, event)

            setDisplayProps(
              produce(displayProps, (draft) => {
                draft.variants.types = newOrder
              })
            )
          }}
        >
          <ul className="flex flex-col">
            {displayProps.variants.types.map((mutation, mi) => {
              const id = mutation
              return (
                <SortableItem key={id} id={id} index={mi}>
                  <Checkbox
                    checked={mutationsForUse[mutation] ?? false}
                    onCheckedChange={(v) =>
                      setMutationsForUse({
                        ...mutationsForUse,
                        [mutation]: v,
                      })
                    }
                  />
                  <FillButton
                    colors={[
                      {
                        color:
                          displayProps.variants.colorMap[mutation] ??
                          DEFAULT_MUTATION_COLOR,
                        allowNoColor: false,
                        onColorChange: ({ color }) =>
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
                  />
                  <TruncateSpan className="grow h-8">{mutation}</TruncateSpan>
                </SortableItem>
              )
            })}
          </ul>
        </DragDropProvider>
      </VScrollPanel>
    </PropsPanel>
  )
}
