import {
  onTextFileChange,
  openFilesDialog,
  type ITextFileOpen,
} from '@/components/pages/open-files'
import { TEXT_OK } from '@/consts'
import { OpenIcon } from '@/icons/open-icon'
import { PlusIcon } from '@/icons/plus-icon'
import { IconButton } from '@/themed/icon-button'
import { ToolbarSeparator } from '@/toolbar/toolbar-separator'

import { PropsPanel } from '@/components/props-panel'
import { downloadJson } from '@/lib/download-utils'

import { useDialogs } from '@/components/dialogs/dialogs'
import { FileDropZonePanel } from '@/components/file-dropzone-panel'
import { DownloadIcon } from '@/components/icons/download-icon'
import { TrashIcon } from '@/components/icons/trash-icon'
import { VCenterRow } from '@/components/layout/v-center-row'
import { SortableItem } from '@/components/sortable-item'
import { VScrollPanel } from '@/components/v-scroll-panel'
import { locStr } from '@/lib/genomic/genomic'
import {
  parseGenomicLocation,
  type IGenomicLocation,
} from '@/lib/genomic/genomic-location'
import { where } from '@/lib/math/where'
import { DndContext } from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { LocationAutocomplete } from '../location-autocomplete'
import APP_INFO from '../manifest.json'
import { TRACK_ITEM_BUTTONS_CLS } from '../track-items/seq-track-item'
import { useTracks, type ISeqLocation } from '../tracks-store'

function TrackItem({
  location,
  index,
}: {
  index: number
  location: ISeqLocation
}) {
  const { locations, setLocations } = useTracks()

  const { open: openDialog } = useDialogs()

  function deleteLocation() {
    openDialog({
      type: 'warning',
      payload: {
        content: 'Are you sure you want to remove this location?',
        callback: (response) => {
          if (response === TEXT_OK) {
            setLocations(locations.filter((_, i) => i !== index))
          }
        },
      },
    })
  }

  function cannotDelete() {
    openDialog({
      type: 'alert',
      payload: {
        title: APP_INFO.name,
        content:
          'This location cannot be deleted. You must have at least one location in the display.',
      },
    })
  }

  return (
    <SortableItem
      id={location.id}
      extChildren={
        <VCenterRow className={TRACK_ITEM_BUTTONS_CLS}>
          <button
            onClick={() => {
              if (locations.length < 2) {
                cannotDelete()
                return
              }
              deleteLocation()
            }}
            className="stroke-foreground/50 hover:stroke-destructive"
            title="Delete location"
          >
            <TrashIcon stroke="" />
          </button>
        </VCenterRow>
      }
    >
      <LocationAutocomplete
        value={locStr(location)}
        onTextChanged={(loc) => {
          if (loc.length > 0) {
            setLocations(locations.map((l, li) => (li === index ? loc : l)))
          } else {
            if (locations.length < 2) {
              cannotDelete()
              // force refresh of all locations, i.e. no change
              //setLocations(locations.map(l => l))
            } else {
              deleteLocation()
            }
          }
        }}
        onLocationChanged={(l) => {
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

  const { open: openDialog } = useDialogs()
  //const [activeId, setActiveId] = useState<string | null>(null)

  //const { add: addToast } = Toast.useToastManager()

  function openLocationFiles(files: ITextFileOpen[]) {
    if (files.length === 0) {
      return
    }
    const file = files[0]!

    const locations: IGenomicLocation[] = JSON.parse(file.text).map(
      (l: string) => parseGenomicLocation(l)
    )

    setLocations(locations)
  }

  return (
    <PropsPanel className="gap-y-2">
      <VCenterRow className="items-stretch">
        <IconButton
          onClick={() => {
            openFilesDialog({
              fileTypes: ['json'],
              onFileChange: (message, files) =>
                onTextFileChange(message, files, openLocationFiles),
            })
          }}
          title="Open Locations"
        >
          <OpenIcon />
        </IconButton>

        <IconButton
          onClick={() => {
            downloadJson(locations, 'locations.json')
          }}
          title="Save Locations"
        >
          <DownloadIcon />
        </IconButton>

        <ToolbarSeparator />
        <IconButton
          onClick={() => {
            setLocations([...locations, locations[locations.length - 1]!])
          }}
          title="New Location"
        >
          <PlusIcon withCircle={true} />
        </IconButton>
      </VCenterRow>

      <FileDropZonePanel
        className="grow h-full"
        onFileDrop={(files) => {
          if (files.length > 0) {
            onTextFileChange('Open dropped file', files, openLocationFiles)
          }
        }}
      >
        <DndContext
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={(event) => {
            const { active, over } = event

            if (over && active.id !== over?.id) {
              const oldIndex = where(locations, (l) => l.id === active.id)[0]! // locations.indexOf(active.id as string)
              const newIndex = where(locations, (l) => l.id === over.id)[0]! //locations.indexOf(over.id as string)
              const newOrder = arrayMove(locations, oldIndex, newIndex)

              setLocations(newOrder) //newOrder.map(l => parseLocation(l)))
            }
          }}
        >
          <SortableContext
            items={locations.map((l) => l.id)}
            strategy={verticalListSortingStrategy}
          >
            <VScrollPanel className="grow h-full">
              <ul className="flex flex-col">
                {locations.map((l, li) => {
                  return <TrackItem location={l} index={li} key={l.id} />
                })}
              </ul>
            </VScrollPanel>
          </SortableContext>

          {/* <DragOverlay>
                {activeId ? (
                  <TrackItem
                    index={-1}
                    location={locations.filter(l => l.id === activeId)[0]!}
                    key={activeId}
                  />
                ) : null}
              </DragOverlay> */}
        </DndContext>
      </FileDropZonePanel>
    </PropsPanel>
  )
}
