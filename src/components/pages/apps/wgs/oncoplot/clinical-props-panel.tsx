import { BaseCol } from '@/components/layout/base-col'
import { OutlineButton } from '@/components/plot/outline-dropdown-menu'
import { PropsPanel } from '@/components/props-panel'
import { Checkbox } from '@/components/shadcn/ui/themed/v2/check-box'
import { LineSeparator } from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import { NumSlider } from '@/components/shadcn/ui/themed/v2/num-slider'
import {
  DRAG_HANDLE_APPEAR_CLS,
  SortableItem,
} from '@/components/sortable-item'
import { TruncateSpan } from '@/components/truncate-span'
import { VScrollPanel } from '@/components/v-scroll-panel'
import { CheckPropRow } from '@/dialogs/check-prop-row'
import type { IDivProps } from '@/interfaces/div-props'
import { DndContext } from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { produce } from 'immer'
import { Settings2 } from 'lucide-react'
import { useOncoplotDialogs } from './oncoplot-dialogs'
import { useOncoplotSettings } from './oncoplot-settings-store'
import { useOncoplot } from './oncoplot-store'

export function ClinicalPropsPanel({ ref }: IDivProps) {
  const { displayProps, setDisplayProps } = useOncoplotSettings()
  const { clinicalTracks, setClinicalTracks } = useOncoplot()

  const { open: openOncoDialog } = useOncoplotDialogs()

  return (
    <PropsPanel ref={ref} className="pr-1">
      <BaseCol>
        <CheckPropRow
          title="Show"
          checked={displayProps.clinical.show}
          onCheckedChange={(state) =>
            setDisplayProps(
              produce(displayProps, (draft) => {
                draft.clinical.show = state
              })
            )
          }
        />

        <CheckPropRow
          title="Border"
          checked={displayProps.clinical.border.show}
          onCheckedChange={(v) =>
            setDisplayProps(
              produce(displayProps, (draft) => {
                draft.clinical.border.show = v
              })
            )
          }
        >
          <OutlineButton
            colors={[
              {
                color: displayProps.clinical.border.value,
                opacity: displayProps.clinical.border.opacity,
                show: displayProps.clinical.border.show,
                onColorChange: ({ color, opacity, width, dasharray, show }) =>
                  setDisplayProps(
                    produce(displayProps, (draft) => {
                      draft.clinical.border.value = color
                      draft.clinical.border.opacity = opacity
                      draft.clinical.border.show = show
                      draft.clinical.border.width = width
                      draft.clinical.border.dasharray = dasharray
                    })
                  ),
              },
            ]}
          />
        </CheckPropRow>

        <CheckPropRow title="Height">
          <NumSlider
            id="y"
            value={displayProps.clinical.height}
            className="w-16 rounded-theme"
            min={1}
            max={100}
            step={1}
            onNumChanged={(v) => {
              setDisplayProps(
                produce(displayProps, (draft) => {
                  draft.clinical.height = v
                })
              )
            }}
          />
        </CheckPropRow>
      </BaseCol>

      <LineSeparator />

      <DndContext
        modifiers={[restrictToVerticalAxis]}
        //onDragStart={(event) => setActiveId(event.active.id as string)}
        onDragEnd={(event) => {
          const { active, over } = event

          if (over && active.id !== over?.id) {
            const oldIndex = clinicalTracks.findIndex(
              (c) => c.name === active.id
            )
            const newIndex = clinicalTracks.findIndex((c) => c.name === over.id) //clinicalTracks.findIndex(c=>c.name === over.id)
            const newOrder = arrayMove(clinicalTracks, oldIndex, newIndex)

            setClinicalTracks(newOrder)
          }
        }}
      >
        <SortableContext
          items={clinicalTracks.map((track) => track.name)}
          strategy={verticalListSortingStrategy}
        >
          <VScrollPanel>
            <ul>
              {clinicalTracks.map((track, ti) => {
                //const track = clinicalTracks[name]!
                const trackProps =
                  displayProps.legend.clinical.tracks[track.name]!

                return (
                  <SortableItem key={track.name} id={track.name}>
                    <Checkbox
                      title={track.name}
                      key={ti}
                      checked={trackProps.show}
                      onCheckedChange={(state) => {
                        const newTracksProps = produce(
                          displayProps.legend.clinical.tracks,
                          (draft) => {
                            draft[track.name]!.show = state
                          }
                        )

                        setDisplayProps(
                          produce(displayProps, (draft) => {
                            draft.legend.clinical.tracks = newTracksProps
                          })
                        )
                      }}
                    />

                    <TruncateSpan className="w-full h-8">
                      {track.name}
                    </TruncateSpan>

                    {(track.type === 'category' || track.type === 'dist') && (
                      <button
                        title={`Edit ${track.name}`}
                        className="opacity-50 hover:opacity-100 focus-visible:opacity-100 shrink-0"
                        onClick={() =>
                          openOncoDialog({
                            type: 'track',
                            payload: {
                              track,
                            },
                          })
                        }
                      >
                        <Settings2
                          size={20}
                          strokeWidth={1.5}
                          className={DRAG_HANDLE_APPEAR_CLS}
                        />
                      </button>
                    )}
                  </SortableItem>
                )
              })}
            </ul>
          </VScrollPanel>
        </SortableContext>

        {/* <DragOverlay>
          {activeId ? (
            <TrackItem
              index={-1}
              location={locations.filter(l => l.loc === activeId)[0]!}
              key={activeId}
              active={activeId}
            />
          ) : null}
        </DragOverlay> */}
      </DndContext>
    </PropsPanel>
  )
}
