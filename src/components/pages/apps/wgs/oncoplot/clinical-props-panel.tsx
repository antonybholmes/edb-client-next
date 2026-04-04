import {
  ColorPickerButton,
  SIMPLE_COLOR_EXT_CLS,
} from '@/components/color/color-picker-button'
import { CheckPropRow } from '@/components/dialog/check-prop-row'
import { BaseCol } from '@/components/layout/base-col'
import { PropsPanel } from '@/components/props-panel'
import { Checkbox } from '@/components/shadcn/ui/themed/v2/check-box'
import { LineSeparator } from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import {
  DRAG_HANDLE_APPEAR_CLS,
  SortableItem,
} from '@/components/sortable-item'
import { TruncateSpan } from '@/components/truncate-span'
import { VScrollPanel } from '@/components/v-scroll-panel'
import { NO_DIALOG, type IDialogParams } from '@/consts'
import type { IDivProps } from '@/interfaces/div-props'
import { NumericalInput } from '@/themed/numerical-input'
import { DndContext } from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { produce } from 'immer'
import { Settings2 } from 'lucide-react'
import { useState } from 'react'
import { ClinicalDialog } from './clinical-dialog'
import type { ClinicalDataTrack } from './clinical-utils'
import { useOncoplotSettings } from './oncoplot-settings-store'
import { useOncoplot } from './oncoplot-store'

export function ClinicalPropsPanel({ ref }: IDivProps) {
  const { displayProps, setDisplayProps } = useOncoplotSettings()
  const { clinicalTracks, setClinicalTracks } = useOncoplot()
  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })

  //const [tabs, setTabs] = useState<string[]>(['tracks', 'coo'])

  return (
    <>
      {showDialog.id.startsWith('track') && (
        <ClinicalDialog
          track={showDialog.params!.track as ClinicalDataTrack}
          onResponse={() => setShowDialog({ ...NO_DIALOG })}
        />
      )}

      <PropsPanel ref={ref} className="pr-1">
        <BaseCol>
          <CheckPropRow
            title="Show"
            checked={displayProps.clinical.show}
            onCheckedChange={state =>
              setDisplayProps(
                produce(displayProps, draft => {
                  draft.clinical.show = state
                })
              )
            }
          />

          <CheckPropRow
            title="Border"
            checked={displayProps.clinical.border.show}
            onCheckedChange={v =>
              setDisplayProps(
                produce(displayProps, draft => {
                  draft.clinical.border.show = v
                })
              )
            }
          >
            <ColorPickerButton
              color={displayProps.clinical.border.color}
              onColorChange={v =>
                setDisplayProps(
                  produce(displayProps, draft => {
                    draft.clinical.border.color = v
                  })
                )
              }
              className={SIMPLE_COLOR_EXT_CLS}
            />
          </CheckPropRow>

          <CheckPropRow title="Height">
            <NumericalInput
              id="y"
              value={displayProps.clinical.height}
              className="w-16 rounded-theme"
              onNumChanged={v => {
                setDisplayProps(
                  produce(displayProps, draft => {
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
          onDragEnd={event => {
            const { active, over } = event

            if (over && active.id !== over?.id) {
              const oldIndex = clinicalTracks.findIndex(
                c => c.name === active.id
              )
              const newIndex = clinicalTracks.findIndex(c => c.name === over.id) //clinicalTracks.findIndex(c=>c.name === over.id)
              const newOrder = arrayMove(clinicalTracks, oldIndex, newIndex)

              console.log(newOrder)

              setClinicalTracks(newOrder)
            }

            //setActiveId(null)
          }}
        >
          <SortableContext
            items={clinicalTracks.map(track => track.name)}
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
                        onCheckedChange={state => {
                          const newTracksProps = produce(
                            displayProps.legend.clinical.tracks,
                            draft => {
                              draft[track.name]!.show = state
                            }
                          )

                          setDisplayProps(
                            produce(displayProps, draft => {
                              draft.legend.clinical.tracks = newTracksProps
                            })
                          )
                        }}
                      />

                      <TruncateSpan className="w-full h-8">
                        {track.name}
                      </TruncateSpan>

                      {/* <BaseCol className="grow gap-y-1">
                      <span className="font-semibold">{track.name}</span>
                      {track.categoriesInUse.length > 0 && (
                        <AutoRowCol className="flex-wrap gap-2">
                          {track.categoriesInUse.map((category, ci) => (
                            <VCenterRow className="gap-x-1" key={ci}>
                              <ColorPickerButton
                                color={
                                  trackProps.categoryColors[
                                    category.toLowerCase()
                                  ] ?? NO_ALTERATION_COLOR
                                }
                                onColorChange={color => {
                                  const newTracksProps = produce(
                                    displayProps.legend.clinical.tracks,
                                    draft => {
                                      draft[track.name]!.categoryColors[
                                        category.toLowerCase()
                                      ] = color
                                    }
                                  )

                                  setDisplayProps(
                                    produce(displayProps, draft => {
                                      draft.legend.clinical.tracks =
                                        newTracksProps
                                    })
                                  )
                                }}
                                className={SIMPLE_COLOR_EXT_CLS}
                              />
                              <Label>{category}</Label>
                            </VCenterRow>
                          ))}
                        </AutoRowCol>
                      )}
                    </BaseCol> */}

                      {(track.type === 'category' || track.type === 'dist') && (
                        <button
                          title={`Edit ${track.name}`}
                          className="opacity-50 hover:opacity-100 focus-visible:opacity-100 shrink-0"
                          onClick={() =>
                            setShowDialog({ id: 'track', params: { track } })
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
    </>
  )
}
