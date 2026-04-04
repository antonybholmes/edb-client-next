import {
  onTextFileChange,
  OpenFiles,
  type ITextFileOpen,
} from '@/components/pages/open-files'
import { NO_DIALOG, TEXT_OK, type IDialogParams } from '@/consts'
import { OKCancelDialog } from '@/dialog/ok-cancel-dialog'
import { OpenIcon } from '@/icons/open-icon'
import { PlusIcon } from '@/icons/plus-icon'
import { SaveIcon } from '@/icons/save-icon'
import { IconButton } from '@/themed/icon-button'
import { ToolbarSeparator } from '@/toolbar/toolbar-separator'

import { PropsPanel } from '@/components/props-panel'
import { downloadJson } from '@/lib/download-utils'
import { GenLoc, parseGenLoc } from '@/lib/genomic/genomic'
import { makeUuid, randId } from '@/lib/id'

import { FileDropZonePanel } from '@/components/file-dropzone-panel'
import { TrashIcon } from '@/components/icons/trash-icon'
import { VCenterRow } from '@/components/layout/v-center-row'
import { SortableItem } from '@/components/sortable-item'
import { VScrollPanel } from '@/components/v-scroll-panel'
import { where } from '@/lib/math/where'
import { Toast } from '@base-ui/react/toast'
import { DndContext } from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useState } from 'react'
import { LocationAutocomplete } from '../location-autocomplete'
import MODULE_INFO from '../module.json'
import { TRACK_ITEM_BUTTONS_CLS } from '../track-items/seq-track-item'
import { useTracks } from '../tracks-store'
import { LocationDialog } from './locations-edit-dialog'

function TrackItem({
  location,
  index,
  deleteCallBack,
}: {
  index: number
  location: GenLoc
  deleteCallBack?: (index: number) => void
}) {
  const { locations, setLocations } = useTracks()
  //const { isDragging } = useContext(SortableItemContext)
  const { add: addToast } = Toast.useToastManager()

  return (
    <SortableItem
      id={location.id}
      extChildren={
        <VCenterRow className={TRACK_ITEM_BUTTONS_CLS}>
          <button
            onClick={() => deleteCallBack?.(index)}
            className="stroke-foreground/50 hover:stroke-red-500"
            title="Delete location"
          >
            <TrashIcon stroke="" w="w-4" />
          </button>
        </VCenterRow>
      }
    >
      <LocationAutocomplete
        value={location.loc}
        onTextChanged={loc => {
          console.log('loc changed to ', loc)
          if (loc.length > 0) {
            setLocations(locations.map((l, li) => (li === index ? loc : l)))
          } else {
            if (locations.length < 2) {
              addToast({
                id: makeUuid(),
                title: MODULE_INFO.name,
                description:
                  'You must have at least one location in the display.',
                type: 'destructive',
              })

              // force refresh of all locations, i.e. no change
              setLocations(locations.map(l => l))
            } else {
              deleteCallBack?.(index)
              // There is more than one location, so we allow
              // this one to be deleted
              // setShowDialog({
              //   id: randId('remove-location'),
              //   params: { index },
              // })
            }
          }
        }}
        onLocationChanged={l => {
          // replace the location at index
          setLocations(locations.map((loc, li) => (li === index ? l : loc)))
        }}
        //clear={() => deleteCallBack?.(index)}
        className="grow"
      />
    </SortableItem>
  )
}

export function LocationsPropsPanel() {
  const { locations, setLocations } = useTracks()

  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })
  //const [activeId, setActiveId] = useState<string | null>(null)

  //const { add: addToast } = Toast.useToastManager()

  function openLocationFiles(files: ITextFileOpen[]) {
    if (files.length === 0) {
      return
    }
    const file = files[0]!

    const locations: GenLoc[] = JSON.parse(file.text).map((l: string) =>
      parseGenLoc(l)
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
          onResponse={r => {
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
          location={showDialog.params!.location as GenLoc}
          onCancel={() => setShowDialog({ ...NO_DIALOG })}
          callback={(index, location) => {
            if (index === -1) {
              setLocations([...locations, location])
            }

            setShowDialog({ ...NO_DIALOG })
          }}
        />
      )}

      {showDialog.id.includes('open-locations') && (
        <OpenFiles
          //onOpenChange={() => setOpen("")}
          onFileChange={(message, files) =>
            onTextFileChange(message, files, files => {
              openLocationFiles(files)
            })
          }
          fileTypes={['json']}
        />
      )}

      <PropsPanel className="gap-y-2">
        <VCenterRow className="items-stretch">
          <IconButton
            onClick={() => {
              setShowDialog({
                id: randId('open-locations'),
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
                locations.map(l => l.loc),
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
        </VCenterRow>

        <FileDropZonePanel
          onFileDrop={files => {
            if (files.length > 0) {
              onTextFileChange('Open dropped file', files, openLocationFiles)
            }
          }}
        >
          <VScrollPanel>
            <DndContext
              modifiers={[restrictToVerticalAxis]}
              onDragEnd={event => {
                const { active, over } = event

                if (over && active.id !== over?.id) {
                  const oldIndex = where(locations, l => l.id === active.id)[0]! // locations.indexOf(active.id as string)
                  const newIndex = where(locations, l => l.id === over.id)[0]! //locations.indexOf(over.id as string)
                  const newOrder = arrayMove(locations, oldIndex, newIndex)

                  console.log(newOrder)

                  setLocations(newOrder) //newOrder.map(l => parseLocation(l)))
                }
              }}
            >
              <SortableContext
                items={locations.map(l => l.id)}
                strategy={verticalListSortingStrategy}
              >
                <ul className="flex flex-col">
                  {locations.map((l, li) => {
                    return (
                      <TrackItem
                        location={l}
                        index={li}
                        key={l.id}
                        deleteCallBack={index => {
                          setShowDialog({
                            id: randId('remove-location'),
                            params: { index },
                          })
                        }}
                      />
                    )
                  })}
                </ul>
              </SortableContext>

              {/* <DragOverlay>
                {activeId ? (
                  <TrackItem
                    index={-1}
                    location={locations.filter(l => l.loc === activeId)[0]!}
                    key={activeId}
                  />
                ) : null}
              </DragOverlay> */}
            </DndContext>
          </VScrollPanel>
        </FileDropZonePanel>
      </PropsPanel>
    </>
  )
}
