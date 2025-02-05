import { OKCancelDialog } from '@/components/dialog/ok-cancel-dialog'
import { FileDropPanel } from '@/components/file-drop-panel'
import { OpenIcon } from '@/components/icons/open-icon'
import { PlusIcon } from '@/components/icons/plus-icon'
import { SaveIcon } from '@/components/icons/save-icon'
import { TrashIcon } from '@/components/icons/trash-icon'
import { VerticalGripIcon } from '@/components/icons/vertical-grip-icon'
import { VCenterRow } from '@/components/layout/v-center-row'
import {
  onTextFileChange,
  OpenFiles,
  type ITextFileOpen,
} from '@/components/pages/open-files'
import { IconButton } from '@/components/shadcn/ui/themed/icon-button'
import { Input } from '@/components/shadcn/ui/themed/input'
import { ToolbarSeparator } from '@/components/toolbar/toolbar-separator'
import { ToolbarTabGroup } from '@/components/toolbar/toolbar-tab-group'
import { VScrollPanel } from '@/components/v-scroll-panel'
import { NO_DIALOG, TEXT_OK, type IDialogParams } from '@/consts'
import { useMouseUpListener } from '@/hooks/use-mouseup-listener'
import { useToast } from '@/hooks/use-toast'
import { downloadJson } from '@/lib/download-utils'
import { GenomicLocation, parseLocation } from '@/lib/genomic/genomic'
import { makeRandId } from '@/lib/utils'
import { PropsPanel } from '@components/props-panel'
import { Reorder } from 'motion/react'
import { useContext, useState, type RefObject } from 'react'
import MODULE_INFO from '../module.json'
import { DEFAULT_GENOMIC_LOCATION, TracksContext } from '../tracks-provider'
import { LocationDialog } from './locations-edit-dialog'
export function LocationsPropsPanel({
  downloadRef,
}: {
  downloadRef: RefObject<HTMLAnchorElement | null>
}) {
  const { locations, setLocations } = useContext(TracksContext)
  const { toast } = useToast()
  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })

  function TrackItem({ location }: { location: GenomicLocation }) {
    const [drag, setDrag] = useState(false)

    useMouseUpListener(() => setDrag(false))

    return (
      <VCenterRow
        data-drag={drag}
        className="rounded-theme gap-x-1 py-1 pr-2 data-[drag=false]:hover:bg-accent/30 data-[drag=true]:bg-accent/30"
        onMouseDown={() => setDrag(true)}
      >
        <VCenterRow className="cursor-ns-resize shrink-0 pl-1">
          <VerticalGripIcon />
        </VCenterRow>

        <Input defaultValue={location.loc} className="grow" />
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
                id: makeRandId('remove-location'),
                params: { location },
              })
            }
          }}
          className="stroke-foreground hover:stroke-red-500"
        >
          <TrashIcon stroke="" />
        </button>
      </VCenterRow>
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
          onReponse={r => {
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
          onReponse={r => {
            if (r === TEXT_OK) {
              const newLocations = locations.filter(
                l => l.loc !== showDialog.params!.location.loc
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
          index={showDialog.params!.index}
          location={showDialog.params!.location}
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
        <VCenterRow className="justify-between">
          <ToolbarTabGroup className="gap-x-1">
            <ToolbarTabGroup>
              <IconButton
                onClick={() => {
                  setShowDialog({
                    id: makeRandId('open-locations'),
                    params: {},
                  })
                }}
                title="Open locations"
              >
                <OpenIcon />
              </IconButton>

              <IconButton
                onClick={() => {
                  downloadJson(
                    locations.map(l => l.loc),
                    downloadRef,
                    'locations.json'
                  )
                }}
                title="Save locations"
              >
                <SaveIcon />
              </IconButton>
            </ToolbarTabGroup>
            <ToolbarSeparator />
            <IconButton
              onClick={() => {
                setShowDialog({
                  id: makeRandId('edit-loc'),
                  params: { index: -1, location: DEFAULT_GENOMIC_LOCATION },
                })
              }}
              title="Add location"
            >
              <PlusIcon />
            </IconButton>
          </ToolbarTabGroup>
        </VCenterRow>

        <FileDropPanel
          onFileDrop={files => {
            if (files.length > 0) {
              onTextFileChange('Open dropped file', files, openLocationFiles)
            }
          }}
        >
          <VScrollPanel>
            <Reorder.Group
              values={locations.map(l => l.loc)}
              onReorder={order => {
                console.log(order)
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
            </Reorder.Group>
          </VScrollPanel>
        </FileDropPanel>
      </PropsPanel>

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
    </>
  )
}
