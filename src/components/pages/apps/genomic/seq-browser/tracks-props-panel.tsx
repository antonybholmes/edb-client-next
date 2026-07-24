import {
  onTextFileChange,
  readFile,
  type ITextFileOpen,
} from '@/components/pages/open-files'
import { VScrollPanel } from '@/components/v-scroll-panel'
import { TEXT_OK } from '@/consts'
import { VCenterRow } from '@/layout/v-center-row'
import { downloadJson } from '@/lib/download-utils'
import { IconButton } from '@/themed/icon-button'
import { ToolbarSeparator } from '@/toolbar/toolbar-separator'

import { FileDropZonePanel } from '@/components/file-dropzone-panel'
import { PropsPanel } from '@/components/props-panel'
import { TrashIcon } from '@/icons/trash-icon'
import { indexBed } from '@/lib/genomic/bed'
import { makeUuid } from '@/lib/id'
import { textToLines } from '@/lib/text/lines'

import { useDialogs } from '@/components/dialogs/dialogs'
import { DownloadIcon } from '@/components/icons/download-icon'
import { SelectAll } from '@/components/select-all'
import { move } from '@dnd-kit/helpers'
import { DragDropProvider } from '@dnd-kit/react'
import { BigBed, BigWig } from '@gmod/bbi'
import { BlobFile } from 'generic-filehandle2'
import { useState } from 'react'
import APP_INFO from './manifest.json'
import { BigBedReader } from './readers/bed/bigbed-reader'
import { LocalBedReader } from './readers/bed/local-bed-reader'
import { BigWigReader } from './readers/seq/bigwig-reader'
import { BasicTrackItem } from './track-items/basic-track-item'
import { BedTrackItem } from './track-items/bed-track-item'
import { CytobandsTrackItem } from './track-items/cytobands-track-item'
import { GenesTrackItem } from './track-items/genes-track-item'
import { ScaleTrackItem } from './track-items/scale-track-item'
import { SeqTrackItem } from './track-items/seq-track-item'
import { NewTrackMenu } from './tracks-menu'
import {
  DEFAULT_BED_TRACK_DISPLAY_OPTIONS,
  DEFAULT_SEQ_TRACK_DISPLAY_OPTIONS,
  newTrackGroup,
  type ILocalBedTrack,
  type ILocalBigBedTrack,
  type ILocalBigWigTrack,
  type ITrackGroup,
} from './tracks-provider'
import { useTracks } from './tracks-store'

function TrackItem({
  multiselect,
  group,
  active = null,
}: {
  multiselect: boolean
  group: ITrackGroup
  active?: string | null
}) {
  const track = group.tracks[0]! //group.order[0]!]!

  switch (track.type) {
    case 'Seq':
    case 'BigWig':
    case 'RemoteBigWig':
    case 'LocalBigWig':
      return (
        <SeqTrackItem group={group} active={active} multiselect={multiselect} />
      )
    case 'BED':
    case 'LocalBED':
    case 'RemoteBigBed':
    case 'LocalBigBed':
      return (
        <BedTrackItem group={group} active={active} multiselect={multiselect} />
      )
    case 'Gene':
      return (
        <GenesTrackItem
          group={group}
          active={active}
          multiselect={multiselect}
        />
      )
    case 'Cytobands':
      return (
        <CytobandsTrackItem
          multiselect={multiselect}
          group={group}
          active={active}
        />
      )
    case 'Scale':
      return (
        <ScaleTrackItem
          multiselect={multiselect}
          group={group}
          active={active}
        />
      )
    default:
      return (
        <BasicTrackItem
          multiselect={multiselect}
          group={group}
          active={active}
        />
      )
  }
}

export function TracksPropsPanel() {
  const { groups, selectedGroups, dispatch } = useTracks()

  const [multiselect, setMultiselect] = useState(false)

  const { open: openDialog } = useDialogs()

  function openTrackFiles(files: ITextFileOpen[]) {
    if (files.length === 0) {
      return
    }
    const file = files[0]!

    const tracks: ITrackGroup[] = JSON.parse(file.text)

    if (Array.isArray(tracks)) {
      dispatch({ type: 'set', tracks })
    }
  }

  return (
    <PropsPanel className="gap-y-2 pr-1">
      <SelectAll
        className="pl-1"
        selectAll={false}
        setSelectAll={(v) => {
          dispatch({
            type: 'select',
            ids: groups.map((g) => g.id),
            selected: v,
          })
        }}
        multiselect={multiselect}
        setMultiselect={setMultiselect}
        selectedChildren={
          <>
            <ToolbarSeparator />

            <button
              title="Delete selected groups"
              onClick={() => {
                openDialog({
                  type: 'warning',
                  payload: {
                    title: APP_INFO.name,
                    content:
                      'Are you sure you want to delete the selected groups?',
                    callback: (response) => {
                      if (response === TEXT_OK) {
                        dispatch({
                          type: 'remove-groups',
                          ids: groups
                            .map((g) => g.id)
                            .filter((id) => selectedGroups[id] ?? false),
                        })
                      }
                    },
                  },
                })
              }}
              className="stroke-foreground/50 hover:stroke-destructive trans-color"
            >
              <TrashIcon stroke="" />
            </button>
          </>
        }
      >
        <VCenterRow className="gap-x-0.5">
          <NewTrackMenu />

          <IconButton
            onClick={() => {
              // make tracks without local files since we cannot
              // serialize those
              const saveTracks = groups

                .map((g) => {
                  const tracks = g.tracks.filter(
                    (t) => !t.type.includes('Local')
                  )

                  return {
                    ...g,
                    tracks,
                  }
                })
                // remove groups with no tracks left
                .filter((g) => g.tracks.length > 0)

              downloadJson(saveTracks, 'tracks.json')
            }}
            title="Save Tracks"
          >
            <DownloadIcon />
          </IconButton>
        </VCenterRow>
      </SelectAll>

      <FileDropZonePanel
        className="grow h-full"
        fileTypes={{
          'text/plain': ['.bed'],
          'application/octet-stream': ['.bw', '.bigWig', '.bb', '.bigBed'],
          'application/json': ['.json'],
        }}
        onFileDrop={async (files) => {
          if (files.length > 0) {
            // first bed files

            let filteredFiles = files.filter((file) =>
              file.name.endsWith('.bed')
            )

            for (const file of filteredFiles) {
              const textFile = await readFile(file)
              const lines = textToLines(textFile)
              const index = indexBed(file.name, lines)

              if (index) {
                const bed: ILocalBedTrack = {
                  type: 'LocalBED',
                  name: file.name,
                  id: makeUuid(),
                  displayOptions: {
                    ...DEFAULT_BED_TRACK_DISPLAY_OPTIONS,
                  },
                  reader: new LocalBedReader(index),
                }

                dispatch({
                  type: 'add',
                  tracks: [newTrackGroup([bed])],
                })
              }
            }

            // Next bigwigs

            filteredFiles = files.filter(
              (file) =>
                file.name.endsWith('.bw') || file.name.endsWith('.bigWig')
            )

            for (const file of filteredFiles) {
              const bw = new BigWig({
                filehandle: new BlobFile(file),
              })
              const displayBigWig: ILocalBigWigTrack = {
                type: 'LocalBigWig',
                name: file.name,
                id: makeUuid(),
                scale: 'Count',

                reader: new BigWigReader(bw),
                displayOptions: {
                  ...DEFAULT_SEQ_TRACK_DISPLAY_OPTIONS,
                },
              }

              dispatch({
                type: 'add',
                tracks: [newTrackGroup([displayBigWig])],
              })
            }

            // finally bigbeds

            filteredFiles = files.filter(
              (file) =>
                file.name.endsWith('.bb') || file.name.endsWith('.bigBed')
            )

            for (const file of filteredFiles) {
              const bb = new BigBed({
                filehandle: new BlobFile(file),
              })

              const bed: ILocalBigBedTrack = {
                type: 'LocalBigBed',
                name: file.name,
                id: makeUuid(),
                displayOptions: {
                  ...DEFAULT_BED_TRACK_DISPLAY_OPTIONS,
                },
                reader: new BigBedReader(bb),
              }

              dispatch({
                type: 'add',
                tracks: [newTrackGroup([bed])],
              })
            }

            onTextFileChange(
              'Open dropped file',
              files.filter((file) => file.name.endsWith('.json')),
              openTrackFiles
            )
          }
        }}
      >
        <VScrollPanel>
          <DragDropProvider
            onDragEnd={(event) => {
              const newOrder = move(groups, event)

              dispatch({
                type: 'set',
                tracks: newOrder,
              })
            }}
          >
            <ul className="flex flex-col">
              {groups.map((tg) => {
                return (
                  <TrackItem multiselect={multiselect} group={tg} key={tg.id} />
                )
              })}
            </ul>
          </DragDropProvider>
        </VScrollPanel>
      </FileDropZonePanel>
    </PropsPanel>
  )
}
