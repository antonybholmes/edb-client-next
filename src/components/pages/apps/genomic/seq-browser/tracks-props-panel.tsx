import {
  NO_DIALOG,
  TEXT_OK,
  TEXT_SELECT_ALL,
  TEXT_UNSELECT_ALL,
  type IDialogParams,
} from '@/consts'
import {
  onTextFileChange,
  OpenFiles,
  readFile,
  type ITextFileOpen,
} from '@components/pages/open-files'
import {
  DEFAULT_FILL_PROPS,
  DEFAULT_STROKE_PROPS,
  OPAQUE_FILL_PROPS,
} from '@components/plot/svg-props'
import { VScrollPanel } from '@components/v-scroll-panel'
import { OKCancelDialog } from '@dialog/ok-cancel-dialog'
import { MultiSelectIcon } from '@icons/multi-select-icon'
import { SaveIcon } from '@icons/save-icon'
import { VCenterRow } from '@layout/v-center-row'
import { DEFAULT_PALETTE } from '@lib/color/palette'
import { downloadJson } from '@lib/download-utils'
import { Checkbox } from '@themed/check-box'
import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  MenuSeparator,
} from '@themed/dropdown-menu'
import { IconButton } from '@themed/icon-button'
import { OptionalDropdownButton } from '@toolbar/optional-dropdown-button'
import { ToolbarSeparator } from '@toolbar/toolbar-separator'
import { ToolbarTabGroup } from '@toolbar/toolbar-tab-group'

import { FileDropZonePanel } from '@components/file-dropzone-panel'
import { PropsPanel } from '@components/props-panel'
import { SortableItem } from '@components/sortable-item'
import { DndContext, DragOverlay } from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { BigBed, BigWig } from '@gmod/bbi'
import { LinkIcon } from '@icons/link-icon'
import { OpenIcon } from '@icons/open-icon'
import { PlusIcon } from '@icons/plus-icon'
import { TrashIcon } from '@icons/trash-icon'
import { indexBed } from '@lib/genomic/bed'
import type { IGenomicLocation } from '@lib/genomic/genomic'
import type { GenomicFeatureIndex } from '@lib/genomic/genomic-index'
import { where } from '@lib/math/where'
import { textToLines } from '@lib/text/lines'
import { nanoid, randId } from '@lib/utils'
import { BlobFile } from 'generic-filehandle2'
import {
  Columns3,
  Dna,
  Navigation,
  Ruler,
  RulerDimensionLine,
} from 'lucide-react'
import { useContext, useState } from 'react'
import { BedEditDialog } from './dialogs/edit/bed-edit-dialog'
import { CytobandsEditDialog } from './dialogs/edit/cytobands-edit-dialog'
import { GenesEditDialog } from './dialogs/edit/genes-edit-dialog'
import { ScaleEditDialog } from './dialogs/edit/scale-edit-dialog'
import { SeqEditDialog } from './dialogs/edit/seq-edit-dialog'
import {
  AddLocalFilesDialog,
  type ILocalFile,
} from './dialogs/local/add-local-files-dialog'
import { PeaksDialog } from './dialogs/peaks-dialog'
import { SeqsDialog } from './dialogs/seqs-dialog'
import { TrackInfoDialog } from './dialogs/track-info-dialog'
import MODULE_INFO from './module.json'
import { BigBedReader } from './readers/bed/bigbed-reader'
import { LocalBedReader } from './readers/bed/local-bed-reader'
import { BigWigReader } from './readers/seq/bigwig-reader'
import { useSeqBrowserSettings } from './seq-browser-settings'
import { BED_TRACK_TYPES, SEQ_TRACK_TYPES } from './svg/tracks-view'
import { BasicTrackItem } from './track-items/basic-track-item'
import { BedTrackItem } from './track-items/bed-track-item'
import { CytobandsTrackItem } from './track-items/cytobands-track-item'
import { GenesTrackItem } from './track-items/genes-track-item'
import { ScaleTrackItem } from './track-items/scale-track-item'
import { SeqTrackItem } from './track-items/seq-track-item'
import {
  DEFAULT_BED_TRACK_DISPLAY_OPTIONS,
  DEFAULT_CYTOBANDS_TRACK_DISPLAY_OPTIONS,
  DEFAULT_GENE_TRACK_DISPLAY_OPTIONS,
  DEFAULT_LOCATION_TRACK_DISPLAY_OPTIONS,
  DEFAULT_RULER_TRACK_DISPLAY_OPTIONS,
  DEFAULT_SCALE_TRACK_DISPLAY_OPTIONS,
  DEFAULT_SEQ_TRACK_DISPLAY_OPTIONS,
  newTrackGroup,
  TracksContext,
  type AllDBBedTrackTypes,
  type AllSignalTrackTypes,
  type IBedTrack,
  type ICytobandsTrack,
  type IGeneTrack,
  type ILocalBedTrack,
  type ILocalBigBedTrack,
  type ILocalBigWigTrack,
  type ILocationTrack,
  type IRulerTrack,
  type IScaleTrack,
  type ISignalTrack,
  type ITrackGroup,
  type TrackPlot,
} from './tracks-provider'

export function TracksPropsPanel() {
  const { state, dispatch } = useContext(TracksContext)
  const { settings } = useSeqBrowserSettings()
  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })
  const [multiselect, setMultiselect] = useState(false)
  const [selectAll, setSelectAll] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)

  function TrackItem({
    multiselect,
    group,
    active = null,
  }: {
    multiselect: boolean
    group: ITrackGroup
    active?: string | null
  }) {
    const track = group.tracks[group.order[0]!]!

    switch (track.trackType) {
      case 'Seq':
      case 'Remote BigWig':
      case 'Local BigWig':
        return (
          <SeqTrackItem
            group={group}
            active={active}
            multiselect={multiselect}
            setShowDialog={setShowDialog}
          />
        )
      case 'BED':
      case 'Local BED':
      case 'Remote BigBed':
      case 'Local BigBed':
        return (
          <BedTrackItem
            group={group}
            active={active}
            multiselect={multiselect}
            setShowDialog={setShowDialog}
          />
        )
      case 'Gene':
        return (
          <GenesTrackItem
            group={group}
            active={active}
            multiselect={multiselect}
            setShowDialog={setShowDialog}
          />
        )
      case 'Cytobands':
        return (
          <CytobandsTrackItem
            multiselect={multiselect}
            group={group}
            active={active}
            setShowDialog={setShowDialog}
          />
        )
      case 'Scale':
        return (
          <ScaleTrackItem
            multiselect={multiselect}
            group={group}
            active={active}
            setShowDialog={setShowDialog}
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

  function openTrackFiles(files: ITextFileOpen[]) {
    if (files.length === 0) {
      return
    }
    const file = files[0]!

    const tracks: ITrackGroup[] = JSON.parse(file.text)

    //console.log(tracks)

    if (Array.isArray(tracks)) {
      dispatch({ type: 'set', tracks })
    }
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

      {showDialog.id.includes('edit-seq') && (
        <SeqEditDialog
          group={showDialog.params!.group as ITrackGroup}
          track={showDialog.params!.track as ISignalTrack}
          onCancel={() => setShowDialog({ ...NO_DIALOG })}
          callback={(group, track) => {
            dispatch({ type: 'update', group, track })

            //setShowDialog({ ...NO_DIALOG })
          }}
        />
      )}

      {(showDialog.id.includes('add-chipseq') ||
        showDialog.id.includes('add-rnaseq') ||
        showDialog.id.includes('add-cutandrun')) && (
        <SeqsDialog
          platform={
            showDialog.id.includes('chipseq')
              ? 'ChIP-seq'
              : showDialog.id.includes('rnaseq')
                ? 'RNA-seq'
                : 'Cut_And_Run'
          }
          onResponse={() => setShowDialog({ ...NO_DIALOG })}
          callback={(tracks, combine) => {
            const signals: AllSignalTrackTypes[] = tracks.map((track, ti) => {
              const id = nanoid()
              const displayOptions = {
                ...DEFAULT_SEQ_TRACK_DISPLAY_OPTIONS,
                stroke: {
                  ...DEFAULT_SEQ_TRACK_DISPLAY_OPTIONS.stroke,
                  color: DEFAULT_PALETTE[ti % DEFAULT_PALETTE.length]!,
                },
                fill: {
                  ...DEFAULT_SEQ_TRACK_DISPLAY_OPTIONS.fill,
                  color: DEFAULT_PALETTE[ti % DEFAULT_PALETTE.length]!,
                },
              }

              switch (track.trackType) {
                case 'Remote BigWig':
                  // const bw = new BigWig({
                  //   filehandle: new RemoteFile(track.url),
                  // })
                  return {
                    ...track,
                    id,
                    trackType: 'Remote BigWig',
                    scale: track.tags.some(x => x.includes('BPM'))
                      ? 'BPM'
                      : 'Count',
                    displayOptions,
                  }
                default:
                  return {
                    ...track,
                    id,
                    trackType: 'Seq',
                    displayOptions,
                  }
              }
            })

            let displayTracks: ITrackGroup[] = []

            if (combine) {
              displayTracks = [newTrackGroup(signals)]
            } else {
              displayTracks = signals.map(s => newTrackGroup([s]))
            }

            dispatch({ type: 'add', tracks: displayTracks })

            setShowDialog({ ...NO_DIALOG })
          }}
        />
      )}

      {showDialog.id.startsWith('track-info') && (
        <TrackInfoDialog
          group={showDialog.params!.group as ITrackGroup}
          track={showDialog.params!.track as ISignalTrack}
          onCancel={() => setShowDialog({ ...NO_DIALOG })}
        />
      )}

      {showDialog.id.includes('add-peaks') && (
        <PeaksDialog
          genome={settings.genome}
          platform="ChIP-seq"
          onResponse={() => setShowDialog({ ...NO_DIALOG })}
          callback={(beds, combine) => {
            // we make copies so user can edit each independently
            // even if they duplicate tracks
            const peaks: AllDBBedTrackTypes[] = beds.map(
              (track: AllDBBedTrackTypes) => {
                const id = nanoid()
                const displayOptions = { ...DEFAULT_BED_TRACK_DISPLAY_OPTIONS }

                switch (track.trackType) {
                  case 'Remote BigBed':
                    return {
                      ...track,
                      id,
                      trackType: 'Remote BigBed',
                      displayOptions,
                    }
                  default:
                    return {
                      ...track,
                      id,
                      trackType: 'BED',
                      displayOptions,
                    }
                }
              }
            )

            let displayTracks: ITrackGroup[] = []

            if (combine) {
              displayTracks = [newTrackGroup(peaks)]
            } else {
              displayTracks = peaks.map(s => newTrackGroup([s]))
            }

            dispatch({ type: 'add', tracks: displayTracks })

            setShowDialog({ ...NO_DIALOG })
          }}
        />
      )}

      {showDialog.id.includes('add-local-files') && (
        <AddLocalFilesDialog
          onCancel={() => setShowDialog({ ...NO_DIALOG })}
          callback={(name: string, color: string, files: ILocalFile[]) => {
            // we make copies so user can edit each independently
            // even if they duplicate tracks
            for (const file of files) {
              if (file.name.includes('.bigWig') || file.name.includes('.bw')) {
                // index the bigwig file
                const displayBigWig: ILocalBigWigTrack = {
                  trackType: 'Local BigWig',
                  name,
                  id: nanoid(),
                  scale: 'Count',
                  reader: new BigWigReader(file.data as BigWig),
                  displayOptions: {
                    ...DEFAULT_SEQ_TRACK_DISPLAY_OPTIONS,
                    stroke: { ...DEFAULT_STROKE_PROPS, color },
                    fill: { ...DEFAULT_FILL_PROPS, color },
                  },
                }

                dispatch({
                  type: 'add',
                  tracks: [newTrackGroup([displayBigWig])],
                })
              } else if (
                file.name.includes('.bigBed') ||
                file.name.includes('.bb')
              ) {
                const displayBigBed: ILocalBigBedTrack = {
                  trackType: 'Local BigBed',
                  name,
                  id: nanoid(),
                  reader: new BigBedReader(file.data as BigBed),
                  displayOptions: {
                    ...DEFAULT_BED_TRACK_DISPLAY_OPTIONS,
                    fill: { ...OPAQUE_FILL_PROPS, color },
                  },
                }

                dispatch({
                  type: 'add',
                  tracks: [newTrackGroup([displayBigBed])],
                })
              } else {
                const displayBed: ILocalBedTrack = {
                  trackType: 'Local BED',
                  name: file.name,
                  id: nanoid(),
                  displayOptions: {
                    ...DEFAULT_BED_TRACK_DISPLAY_OPTIONS,
                    fill: { ...OPAQUE_FILL_PROPS, color },
                  },
                  reader: new LocalBedReader(
                    file.data as GenomicFeatureIndex<IGenomicLocation>
                  ),
                }

                dispatch({ type: 'add', tracks: [newTrackGroup([displayBed])] })
              }
            }
            setShowDialog({ ...NO_DIALOG })
          }}
        />
      )}

      {showDialog.id.includes('edit-bed') && (
        <BedEditDialog
          group={showDialog.params!.group as ITrackGroup}
          track={showDialog.params!.track as IBedTrack}
          onCancel={() => setShowDialog({ ...NO_DIALOG })}
          callback={(group, track) => {
            dispatch({ type: 'update', group, track })

            //setShowDialog({ ...NO_DIALOG })
          }}
        />
      )}

      {showDialog.id.includes('edit-genes') && (
        <GenesEditDialog
          group={showDialog.params!.group as ITrackGroup}
          track={showDialog.params!.track as IGeneTrack}
          onCancel={() => setShowDialog({ ...NO_DIALOG })}
          callback={(group, track) => {
            dispatch({ type: 'update', group, track })

            //setShowDialog({ ...NO_DIALOG })
          }}
        />
      )}

      {showDialog.id.includes('edit-scale') && (
        <ScaleEditDialog
          group={showDialog.params!.group as ITrackGroup}
          track={showDialog.params!.track as IScaleTrack}
          onCancel={() => setShowDialog({ ...NO_DIALOG })}
          callback={(group, track) => {
            dispatch({ type: 'update', group, track })

            //setShowDialog({ ...NO_DIALOG })
          }}
        />
      )}

      {showDialog.id.includes('edit-cytobands') && (
        <CytobandsEditDialog
          group={showDialog.params!.group as ITrackGroup}
          track={showDialog.params!.track as ICytobandsTrack}
          onCancel={() => setShowDialog({ ...NO_DIALOG })}
          callback={(group, track) => {
            dispatch({ type: 'update', group, track })

            //setShowDialog({ ...NO_DIALOG })
          }}
        />
      )}

      {showDialog.id.startsWith('remove-group:') && (
        <OKCancelDialog
          modalType="Warning"
          contentVariant="glass"
          bodyVariant="card"
          showClose={true}
          title={MODULE_INFO.name}
          onResponse={r => {
            if (r === TEXT_OK) {
              dispatch({
                type: 'remove-groups',
                ids: [(showDialog.params!.group as ITrackGroup).id as string],
              })
              // onGroupsChange &&
              //   onGroupsChange([
              //     ...groups.slice(0, delId),
              //     ...groups.slice(delId + 1),
              //   ])
            }
            setShowDialog({ ...NO_DIALOG })
          }}
        >
          {`Are you sure you want to remove the ${
            (showDialog.params!.group as ITrackGroup).name
          } track?`}
        </OKCancelDialog>
      )}

      {showDialog.id.startsWith('remove-track') && (
        <OKCancelDialog
          modalType="Warning"
          contentVariant="glass"
          bodyVariant="card"
          showClose={true}
          title={MODULE_INFO.name}
          onResponse={r => {
            if (r === TEXT_OK) {
              dispatch({
                type: 'remove-tracks',
                group: showDialog.params!.group as ITrackGroup,
                ids: [(showDialog.params!.track as TrackPlot).id],
              })
              // onGroupsChange &&
              //   onGroupsChange([
              //     ...groups.slice(0, delId),
              //     ...groups.slice(delId + 1),
              //   ])
            }
            setShowDialog({ ...NO_DIALOG })
          }}
        >
          {`Are you sure you want to remove the ${
            (showDialog.params!.group as ITrackGroup).name
          } track?`}
        </OKCancelDialog>
      )}

      {showDialog.id.startsWith('remove-groups:') && (
        <OKCancelDialog
          open={showDialog.id.startsWith('remove-groups:')}
          title={MODULE_INFO.name}
          modalType="Warning"
          //contentVariant="glass"
          //bodyVariant="card"
          onResponse={r => {
            if (r === TEXT_OK) {
              dispatch({
                type: 'remove-groups',
                ids: state.order.filter(id => state.selected.get(id) ?? false),
              })
            }
            setShowDialog({ ...NO_DIALOG })
          }}
        >
          Are you sure you want to remove the selected tracks?
        </OKCancelDialog>
      )}

      {showDialog.id.startsWith('join-seqs:') && (
        <OKCancelDialog
          modalType="Warning"
          //contentVariant="glass"
          //bodyVariant="card"
          open={showDialog.id.startsWith('join-seqs:')}
          title={MODULE_INFO.name}
          onResponse={r => {
            if (r === TEXT_OK) {
              // we can join seqs together
              let seqsByGroup = state.order.map(gid =>
                state.selected.has(gid)
                  ? where(state.groups[gid]!.order, tid =>
                      SEQ_TRACK_TYPES.has(
                        state.groups[gid]!.tracks[tid]!.trackType
                      )
                    ).map(
                      ti =>
                        state.groups[gid]!.tracks[
                          state.groups[gid]!.order[ti]!
                        ]!
                    )
                  : []
              )

              let groupIds = state.order.filter(
                (_, gi) => seqsByGroup[gi]!.length > 0
              )

              // Check these is something to merge
              if (groupIds.length > 0) {
                // get index of first seq we want to merge, we shall
                // replace this entry with the merge
                const replaceIdx = where(
                  state.order,
                  id => id === groupIds[0]!
                )[0]!

                // get the groups involved
                const groupIdSet = new Set<string>(groupIds)

                // make new group
                const newGroup = newTrackGroup(seqsByGroup.flat())

                dispatch({
                  type: 'set',
                  tracks: [
                    // what comes before our group is left intact
                    ...state.order
                      .slice(0, replaceIdx)
                      .map(id => state.groups[id]!),

                    // replace first seq in join with this new group
                    newGroup,
                    // add what comes after the group that is not part of the
                    // groups we are merging
                    ...state.order
                      .slice(replaceIdx + 1)
                      .filter(id => !groupIdSet.has(id))
                      .map(id => state.groups[id]!),
                  ],
                })
              }

              // now do the same for beds

              seqsByGroup = state.order.map(gid =>
                state.selected.has(gid)
                  ? where(state.groups[gid]!.order, tid =>
                      BED_TRACK_TYPES.has(
                        state.groups[gid]!.tracks[tid]!.trackType
                      )
                    ).map(
                      ti =>
                        state.groups[gid]!.tracks[
                          state.groups[gid]!.order[ti]!
                        ]!
                    )
                  : []
              )

              groupIds = state.order.filter(
                (_, gi) => seqsByGroup[gi]!.length > 0
              )

              if (groupIds.length > 0) {
                // get index of first seq we want to merge, we shall
                // replace this entry with the merge
                const replaceIdx = where(
                  state.order,
                  id => id === groupIds[0]!
                )[0]!

                // get the groups involved
                const groupIdSet = new Set<string>(groupIds)

                // make new group
                const newGroup = newTrackGroup(seqsByGroup.flat())

                dispatch({
                  type: 'set',
                  tracks: [
                    // what comes before our group is left intact
                    ...state.order
                      .slice(0, replaceIdx)
                      .map(id => state.groups[id]!),

                    // replace first seq in join with this new group
                    newGroup,
                    // add what comes after the group that is not part of the
                    // groups we are merging
                    ...state.order
                      .slice(replaceIdx + 1)
                      .filter(id => !groupIdSet.has(id))
                      .map(id => state.groups[id]!),
                  ],
                })
              }
            }
            setShowDialog({ ...NO_DIALOG })
          }}
        >
          Are you sure you want to overlay the selected tracks?
        </OKCancelDialog>
      )}

      <PropsPanel className="gap-y-2">
        <VCenterRow className="justify-between">
          <ToolbarTabGroup>
            {multiselect && state.order.length > 0 && (
              <Checkbox
                title={selectAll ? TEXT_UNSELECT_ALL : TEXT_SELECT_ALL}
                className="ml-6.5 mr-2"
                checked={selectAll}
                onCheckedChange={() => {
                  dispatch({
                    type: 'select',
                    ids: state.order,
                    selected: !selectAll,
                  })
                  setSelectAll(!selectAll)
                }}
              />
            )}

            <OptionalDropdownButton
              icon={<PlusIcon withCircle={true} />}
              title="Add Track"
              onMainClick={() =>
                setShowDialog({
                  id: randId('add-chipseq'),
                  params: {},
                })
              }
              //align="end"
            >
              <DropdownMenuLabel>Samples</DropdownMenuLabel>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Signal</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    {/* <DropdownMenuLabel>Platform</DropdownMenuLabel> */}
                    <DropdownMenuItem
                      aria-label="ChIP-seq"
                      onClick={() =>
                        setShowDialog({
                          id: randId('add-chipseq'),
                          params: {},
                        })
                      }
                    >
                      ChIP-seq
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      aria-label="RNA-seq"
                      onClick={() =>
                        setShowDialog({
                          id: randId('add-rnaseq'),
                          params: {},
                        })
                      }
                    >
                      RNA-seq
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      aria-label="Cut & Run"
                      onClick={() =>
                        setShowDialog({
                          id: randId('add-cutandrun'),
                          params: {},
                        })
                      }
                    >
                      Cut & Run
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Peaks</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem
                      aria-label="ChIP-seq"
                      onClick={() => {
                        setShowDialog({
                          id: randId('add-peaks'),
                          params: {},
                        })
                      }}
                    >
                      ChIP-seq
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>

              <MenuSeparator />
              {/* <DropdownMenuLabel>Local Files</DropdownMenuLabel> */}

              <DropdownMenuItem
                aria-label="Local Files"
                onClick={() => {
                  setShowDialog({
                    id: randId('add-local-files'),
                    params: {},
                  })
                }}
              >
                <OpenIcon stroke="" />
                <span>Files From Device</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  setShowDialog({
                    id: randId('open-tracks'),
                    params: {},
                  })
                }}
              >
                <span>Saved Tracks</span>
              </DropdownMenuItem>

              {/* <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  File From Device
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem
                      aria-label="BED"
                      onClick={() => {
                        setShowDialog({
                          id: randId('add-bed'),
                          params: {},
                        })
                      }}
                    >
                      BED
                    </DropdownMenuItem>
                    <MenuSeparator />
                    <DropdownMenuItem
                      aria-label="BigWig"
                      onClick={() => {
                        setShowDialog({
                          id: randId('add-bigwig'),
                          params: {},
                        })
                      }}
                    >
                      BigWig
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      aria-label="BigBed"
                      onClick={() => {
                        setShowDialog({
                          id: randId('add-bigbed'),
                          params: {},
                        })
                      }}
                    >
                      BigBed
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub> */}

              <MenuSeparator />

              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Utility</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuGroup>
                      <DropdownMenuItem
                        aria-label="Ruler"
                        //className="h-14 flex-col justify-center items-center gap-2"
                        onClick={() => {
                          const track: IRulerTrack = {
                            trackType: 'Ruler',
                            name: 'Ruler',
                            id: nanoid(),
                            displayOptions: {
                              ...DEFAULT_RULER_TRACK_DISPLAY_OPTIONS,
                            },
                          }

                          dispatch({
                            type: 'add',
                            tracks: [newTrackGroup([track])],
                          })
                        }}
                      >
                        <Ruler className="w-4 h-4 shrink-0" />
                        <span>Ruler</span>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        //className="h-14 flex-col justify-center items-center gap-2"
                        aria-label="Scale"
                        onClick={() => {
                          const track: IScaleTrack = {
                            trackType: 'Scale',
                            name: 'Scale',
                            id: nanoid(),
                            displayOptions: {
                              ...DEFAULT_SCALE_TRACK_DISPLAY_OPTIONS,
                            },
                          }

                          dispatch({
                            type: 'add',
                            tracks: [newTrackGroup([track])],
                          })
                        }}
                      >
                        <RulerDimensionLine className="w-4" />
                        <span>Scale</span>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        //className="h-14 flex-col justify-center items-center gap-2"
                        aria-label="Genes"
                        onClick={() => {
                          const track: IGeneTrack = {
                            trackType: 'Gene',
                            name: 'Genes',
                            id: nanoid(),
                            displayOptions: {
                              ...DEFAULT_GENE_TRACK_DISPLAY_OPTIONS,
                            },
                          }

                          dispatch({
                            type: 'add',
                            tracks: [newTrackGroup([track])],
                          })
                        }}
                      >
                        <Dna className="w-4" />
                        <span>Genes</span>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        //className="h-14 flex-col justify-center items-center gap-2"
                        aria-label="Location"
                        onClick={() => {
                          const track: ILocationTrack = {
                            trackType: 'Location',
                            name: 'Location',
                            id: nanoid(),
                            displayOptions: {
                              ...DEFAULT_LOCATION_TRACK_DISPLAY_OPTIONS,
                            },
                          }

                          dispatch({
                            type: 'add',
                            tracks: [newTrackGroup([track])],
                          })
                        }}
                      >
                        <Navigation className="w-4" />
                        <span>Location</span>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        //className="h-14 flex-col justify-center items-center gap-2"
                        aria-label="Cytobands track"
                        onClick={() => {
                          const track: ICytobandsTrack = {
                            trackType: 'Cytobands',
                            name: 'Cytobands',
                            id: nanoid(),
                            displayOptions: {
                              ...DEFAULT_CYTOBANDS_TRACK_DISPLAY_OPTIONS,
                            },
                          }

                          dispatch({
                            type: 'add',
                            tracks: [newTrackGroup([track])],
                          })
                        }}
                      >
                        <Columns3 className="w-4" />
                        <span>Cytobands</span>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </OptionalDropdownButton>

            <IconButton
              onClick={() => {
                // make tracks without local files since we cannot
                // serialize those
                const saveTracks = state.order
                  .map(id => state.groups[id]!)
                  .map(g => {
                    const order = g.order
                      .map(id => [id, g.tracks[id]!] as [string, TrackPlot])
                      .filter(([, track]) => !track.trackType.includes('Local'))
                      .map(([id]) => id)
                    return {
                      ...g,
                      order,
                      tracks: Object.fromEntries(
                        order.map(id => [id, g.tracks[id]])
                      ),
                    }
                  })
                  // remove groups with no tracks left
                  .filter(g => g.order.length > 0)

                downloadJson(saveTracks, 'tracks.json')
              }}
              title="Save Tracks"
            >
              <SaveIcon />
            </IconButton>

            {multiselect && state.order.length > 0 && (
              <>
                <ToolbarSeparator />

                <IconButton
                  onClick={() => {
                    setShowDialog({
                      id: randId('join-seqs'),
                      params: {},
                    })
                  }}
                  title="Overlay tracks"
                >
                  <LinkIcon />
                </IconButton>

                <IconButton
                  title="Delete selected tracks"
                  onClick={() => {
                    setShowDialog({
                      id: randId('remove-groups'),
                      params: {},
                    })
                  }}
                >
                  <TrashIcon />
                </IconButton>
              </>
            )}
          </ToolbarTabGroup>

          <IconButton
            title="Select Multiple Tracks"
            onClick={() => setMultiselect(!multiselect)}
            checked={multiselect}
          >
            <MultiSelectIcon checked={multiselect} />
          </IconButton>
        </VCenterRow>

        <FileDropZonePanel
          fileTypes={{
            'text/plain': ['.bed'],
            'application/octet-stream': ['.bw', '.bigWig', '.bb', '.bigBed'],
            'application/json': ['.json'],
          }}
          onFileDrop={async files => {
            if (files.length > 0) {
              // first bed files

              let filteredFiles = files.filter(file =>
                file.name.endsWith('.bed')
              )

              for (const file of filteredFiles) {
                const textFile = await readFile(file)
                const lines = textToLines(textFile)
                const index = indexBed(file.name, lines)

                if (index) {
                  const bed: ILocalBedTrack = {
                    trackType: 'Local BED',
                    name: file.name,
                    id: nanoid(),
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
                file =>
                  file.name.endsWith('.bw') || file.name.endsWith('.bigWig')
              )

              for (const file of filteredFiles) {
                const bw = new BigWig({
                  filehandle: new BlobFile(file),
                })
                const displayBigWig: ILocalBigWigTrack = {
                  trackType: 'Local BigWig',
                  name: file.name,
                  id: nanoid(),
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
                file =>
                  file.name.endsWith('.bb') || file.name.endsWith('.bigBed')
              )

              for (const file of filteredFiles) {
                const bb = new BigBed({
                  filehandle: new BlobFile(file),
                })

                const bed: ILocalBigBedTrack = {
                  trackType: 'Local BigBed',
                  name: file.name,
                  id: nanoid(),
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
                files.filter(file => file.name.endsWith('.json')),
                openTrackFiles
              )
            }
          }}
        >
          <VScrollPanel>
            <DndContext
              modifiers={[restrictToVerticalAxis]}
              onDragStart={event => setActiveId(event.active.id as string)}
              onDragEnd={event => {
                const { active, over } = event

                if (over && active.id !== over?.id) {
                  const oldIndex = state.order.indexOf(active.id as string)
                  const newIndex = state.order.indexOf(over.id as string)
                  const newOrder = arrayMove(state.order, oldIndex, newIndex)

                  dispatch({
                    type: 'order',
                    order: newOrder,
                  })
                }

                setActiveId(null)
              }}
            >
              <SortableContext
                items={state.order}
                strategy={verticalListSortingStrategy}
              >
                <ul className="flex flex-col">
                  {state.order.map(gid => {
                    const tg = state.groups[gid]!

                    return (
                      <SortableItem id={tg.id} key={tg.id}>
                        <TrackItem
                          multiselect={multiselect}
                          group={tg}
                          key={tg.id}
                        />
                      </SortableItem>
                    )
                  })}
                </ul>
              </SortableContext>

              <DragOverlay>
                {activeId ? (
                  <TrackItem
                    multiselect={multiselect}
                    group={state.groups[activeId]!}
                    active={activeId}
                  />
                ) : null}
              </DragOverlay>
            </DndContext>

            {/* <Reorder.Group
              axis="y"
              values={state.order}
              onReorder={order => {
                //setOrder(order)
                dispatch({
                  type: 'order',
                  order: order,
                })
              }}
              className="flex flex-col gap-y-1"
            >
              {state.order
                .map(gid => state.groups[gid]!)
                .map(tg => {
                  //const ts = tg.order.map(id => tg.tracks.get(id)!)

                  return (
                    <Reorder.Item key={tg.id} value={tg.id}>
                      <TrackItem
                        multiselect={multiselect}
                        group={tg}
                        key={tg.id}
                      />
                    </Reorder.Item>
                  )
                })}
            </Reorder.Group> */}
          </VScrollPanel>
        </FileDropZonePanel>
      </PropsPanel>

      {showDialog.id.includes('open-tracks') && (
        <OpenFiles
          open={showDialog.id}
          //onOpenChange={() => setOpen("")}
          onFileChange={(message, files) =>
            onTextFileChange(message, files, files => {
              openTrackFiles(files)
            })
          }
          fileTypes={['json']}
        />
      )}
    </>
  )
}
