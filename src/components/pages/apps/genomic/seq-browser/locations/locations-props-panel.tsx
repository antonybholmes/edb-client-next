import { NO_DIALOG, TEXT_OK, type IDialogParams } from '@/consts'
import { FileDropZonePanel } from '@components/file-dropzone-panel'
import {
  onTextFileChange,
  OpenFiles,
  type ITextFileOpen,
} from '@components/pages/open-files'
import {
  DragHandle,
  SortableItem,
  SortableItemContext,
} from '@components/sortable-item'
import { VScrollPanel } from '@components/v-scroll-panel'
import { OKCancelDialog } from '@dialog/ok-cancel-dialog'
import { OpenIcon } from '@icons/open-icon'
import { PlusIcon } from '@icons/plus-icon'
import { SaveIcon } from '@icons/save-icon'
import { VCenterRow } from '@layout/v-center-row'
import { IconButton } from '@themed/icon-button'
import { ToolbarSeparator } from '@toolbar/toolbar-separator'
import { ToolbarTabGroup } from '@toolbar/toolbar-tab-group'

import { PropsPanel } from '@components/props-panel'
import { DndContext, DragOverlay } from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { downloadJson } from '@lib/download-utils'
import { GenomicLocation, parseLocation } from '@lib/genomic/genomic'
import { randID } from '@lib/id'
import { where } from '@lib/math/where'
import type { NullStr } from '@lib/text/text'
import { toast } from '@themed/crisp'
import { useContext, useState } from 'react'
import { GROUP_BG_CLS } from '../../../matcalc/groups/group-props-panel'
import { LocationAutocomplete } from '../location-autocomplete'
import MODULE_INFO from '../module.json'
import { TracksContext } from '../tracks-provider'
import { LocationDialog } from './locations-edit-dialog'

export function LocationsPropsPanel() {
  const { locations, setLocations } = useContext(TracksContext)

  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })
  const [activeId, setActiveId] = useState<string | null>(null)

  function TrackItem({
    index,
    location,
    active = null,
  }: {
    index: number
    location: GenomicLocation
    active?: NullStr
  }) {
    const { isDragging } = useContext(SortableItemContext)
    const [hover, setHover] = useState(false)

    const hoverMode = hover || isDragging || location.loc === active

    return (
      <div className={GROUP_BG_CLS}>
        <VCenterRow
          data-hover={hoverMode}
          className="flex flex-row items-center rounded-theme gap-x-1 py-1 pl-1 text-xs"
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          <DragHandle />

          <LocationAutocomplete
            value={location.loc}
            onTextChanged={(loc) => {
              if (loc.length > 0) {
                setLocations(locations.map((l, li) => (li === index ? loc : l)))
              } else {
                if (locations.length < 2) {
                  toast({
                    title: MODULE_INFO.name,
                    description:
                      'You must have at least one location in the display.',
                    variant: 'destructive',
                  })

                  // force refresh of all locations, i.e. no change
                  setLocations(locations.map((l) => l))
                } else {
                  // There is more than one location, so we allow
                  // this one to be deleted
                  setShowDialog({
                    id: randID('remove-location'),
                    params: { index },
                  })
                }
              }
            }}
            className="grow"
          />

          {/* <VCenterRow
            //data-drag={isDragging}
            data-hover={hoverMode}
            className="gap-y-1.5 opacity-0 data-[hover=true]:opacity-100 shrink-0"
          >
            <button
              title="Delete location"
              onClick={() => {
                if (locations.length < 2) {
                  toast({
                    title: MODULE_INFO.name,
                    description:
                      'You must have at least one location in the display.',
                    variant: 'destructive',
                  })
                } else {
                  setShowDialog({
                    id: randId('remove-location'),
                    params: { location },
                  })
                }
              }}
              className="stroke-foreground/50 hover:stroke-red-500 trans-color"
            >
              <TrashIcon stroke="" />
            </button>
          </VCenterRow> */}
        </VCenterRow>
      </div>
    )
  }

  function openLocationFiles(files: ITextFileOpen[]) {
    if (files.length === 0) {
      return
    }
    const file = files[0]!

    const locations: GenomicLocation[] = JSON.parse(file.text).map(
      (l: string) => parseLocation(l)
    )

    setLocations(locations)
  }

  return (
    <>
      {/* {delGroup !== null && (
        <OKCancelDialog
          //open={delGroup !== -1}
          onResponse={r => {
            if (r === TEXT_OK) {
              dispatch({ type: 'remove', ids: [delGroup.binCounts.track.name] })
            }
            setDelGroup(null)
          }}
        >
          {`Are you sure you want to remove the ${delGroup.motifName} motif?`}
        </OKCancelDialog>
      )} */}

      {showDialog.id.startsWith('remove-location') && (
        <OKCancelDialog
          showClose={true}
          title={MODULE_INFO.name}
          modalType="Warning"
          //contentVariant="glass"
          //bodyVariant="card"
          onResponse={(r) => {
            if (r === TEXT_OK) {
              // filter the locations to remove the one at the index
              const newLocations = locations.filter(
                (_, li) => li !== showDialog.params!.index
              )
              setLocations(newLocations)
            }
            setShowDialog({ ...NO_DIALOG })
          }}
        >
          Are you sure you want to remove the selected location?
        </OKCancelDialog>
      )}

      {showDialog.id.includes('edit-loc') && (
        <LocationDialog
          index={showDialog.params!.index as number}
          location={showDialog.params!.location as GenomicLocation}
          onCancel={() => setShowDialog({ ...NO_DIALOG })}
          callback={(index, location) => {
            if (index === -1) {
              setLocations([...locations, location])
            }

            setShowDialog({ ...NO_DIALOG })
          }}
        />
      )}

      <PropsPanel className="gap-y-2">
        <ToolbarTabGroup>
          <IconButton
            onClick={() => {
              setShowDialog({
                id: randID('open-locations'),
                params: {},
              })
            }}
            title="Open Locations"
          >
            <OpenIcon />
          </IconButton>

          <IconButton
            onClick={() => {
              downloadJson(
                locations.map((l) => l.loc),
                'locations.json'
              )
            }}
            title="Save Locations"
          >
            <SaveIcon />
          </IconButton>

          <ToolbarSeparator />
          <IconButton
            onClick={() => {
              // setShowDialog({
              //   id: randId('edit-loc'),
              //   params: { index: -1, location: DEFAULT_GENOMIC_LOCATION },
              // })

              setLocations([...locations, locations[locations.length - 1]!])
            }}
            title="New Location"
          >
            <PlusIcon withCircle={true} />
          </IconButton>
        </ToolbarTabGroup>

        <FileDropZonePanel
          onFileDrop={(files) => {
            if (files.length > 0) {
              onTextFileChange('Open dropped file', files, openLocationFiles)
            }
          }}
        >
          <VScrollPanel>
            <DndContext
              modifiers={[restrictToVerticalAxis]}
              onDragStart={(event) => setActiveId(event.active.id as string)}
              onDragEnd={(event) => {
                const { active, over } = event

                if (over && active.id !== over?.id) {
                  const oldIndex = where(
                    locations,
                    (l) => l.loc === active.id
                  )[0]! // locations.indexOf(active.id as string)
                  const newIndex = where(
                    locations,
                    (l) => l.loc === over.id
                  )[0]! //locations.indexOf(over.id as string)
                  const newOrder = arrayMove(
                    locations.map((l) => l.loc),
                    oldIndex,
                    newIndex
                  )

                  console.log(newOrder)

                  setLocations(newOrder.map((l) => parseLocation(l)))
                }

                setActiveId(null)
              }}
            >
              <SortableContext
                items={locations.map((l) => l.loc)}
                strategy={verticalListSortingStrategy}
              >
                <ul className="flex flex-col">
                  {locations.map((l, li) => {
                    return (
                      <SortableItem key={li} id={l.loc}>
                        <TrackItem index={li} location={l} key={li} />
                      </SortableItem>
                    )
                  })}
                </ul>
              </SortableContext>

              <DragOverlay>
                {activeId ? (
                  <TrackItem
                    index={-1}
                    location={locations.filter((l) => l.loc === activeId)[0]!}
                    key={activeId}
                    active={activeId}
                  />
                ) : null}
              </DragOverlay>
            </DndContext>

            {/* <Reorder.Group
              values={locations.map(l => l.loc)}
              onReorder={order => {
                setLocations(order.map(l => parseLocation(l)))
              }}
              className="flex flex-col"
            >
              {locations.map(l => {
                //const ts = tg.order.map(id => tg.tracks.get(id)!)

                return (
                  <Reorder.Item key={l.loc} value={l.loc}>
                    <TrackItem location={l} />
                  </Reorder.Item>
                )
              })}
            </Reorder.Group> */}
          </VScrollPanel>
        </FileDropZonePanel>
      </PropsPanel>

      {showDialog.id.includes('open-locations') && (
        <OpenFiles
          //onOpenChange={() => setOpen("")}
          onFileChange={(message, files) =>
            onTextFileChange(message, files, (files) => {
              openLocationFiles(files)
            })
          }
          fileTypes={['json']}
        />
      )}
    </>
  )
}
