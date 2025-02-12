import { OKCancelDialog } from '@/components/dialog/ok-cancel-dialog'
import { FileDropPanel } from '@/components/file-drop-panel'
import { LinkIcon } from '@/components/icons/link-icon'
import { MultiSelectIcon } from '@/components/icons/multi-select-icon'
import { OpenIcon } from '@/components/icons/open-icon'
import { PlusIcon } from '@/components/icons/plus-icon'
import { SaveIcon } from '@/components/icons/save-icon'
import { TrashIcon } from '@/components/icons/trash-icon'
import { VCenterRow } from '@/components/layout/v-center-row'
import {
  onTextFileChange,
  OpenFiles,
  type ITextFileOpen,
} from '@/components/pages/open-files'
import { DEFAULT_PALETTE } from '@/components/plot/palette'
import { DEFAULT_FILL_PROPS } from '@/components/plot/svg-props'
import { Checkbox } from '@/components/shadcn/ui/themed/check-box'
import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  MenuSeparator,
} from '@/components/shadcn/ui/themed/dropdown-menu'
import { IconButton } from '@/components/shadcn/ui/themed/icon-button'
import { OptionalDropdownButton } from '@/components/toolbar/optional-dropdown-button'
import { ToolbarSeparator } from '@/components/toolbar/toolbar-separator'
import { ToolbarTabGroup } from '@/components/toolbar/toolbar-tab-group'
import { VScrollPanel } from '@/components/v-scroll-panel'
import { NO_DIALOG, TEXT_OK, type IDialogParams } from '@/consts'
import { downloadJson } from '@/lib/download-utils'
import { where } from '@/lib/math/math'
import { makeRandId, nanoid } from '@/lib/utils'
import { PropsPanel } from '@components/props-panel'
import { Reorder } from 'motion/react'
import { useContext, useState, type RefObject } from 'react'
import { AddLocalBedDialog } from './add-local-bed-dialog'
import { BedEditDialog } from './edit-dialogs/bed-edit-dialog'
import { CytobandsEditDialog } from './edit-dialogs/cytobands-edit-dialog'
import { GenesEditDialog } from './edit-dialogs/genes-edit-dialog'
import { ScaleEditDialog } from './edit-dialogs/scale-edit-dialog'
import { SeqEditDialog } from './edit-dialogs/seq-edit-dialog'
import MODULE_INFO from './module.json'
import { PeaksDialog } from './peaks-dialog'
import { SeqBrowserSettingsContext } from './seq-browser-settings-provider'
import { SeqsDialog } from './seqs-dialog'
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
  IDBBedTrack,
  ISeqTrack,
  newTrackGroup,
  TracksContext,
  type IBedTrack,
  type ICytobandsTrack,
  type IGeneTrack,
  type ILocalBedTrack,
  type ILocationTrack,
  type IRulerTrack,
  type IScaleTrack,
  type ITrackGroup,
  type TrackPlot,
} from './tracks-provider'

export function TracksPropsPanel({
  downloadRef,
}: {
  downloadRef: RefObject<HTMLAnchorElement | null>
}) {
  const { state, dispatch } = useContext(TracksContext)
  const { settings } = useContext(SeqBrowserSettingsContext)
  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })
  const [multiselect, setMultiselect] = useState(false)
  const [selectAll, setSelectAll] = useState(false)

  function TrackItem({
    multiselect,
    group,
  }: {
    multiselect: boolean
    group: ITrackGroup
  }) {
    const track = group.tracks[group.order[0]!]!

    switch (track.type) {
      case 'Seq':
        return (
          <SeqTrackItem
            group={group}
            multiselect={multiselect}
            setShowDialog={setShowDialog}
          />
        )
      case 'BED':
      case 'Local BED':
        return (
          <BedTrackItem
            group={group}
            multiselect={multiselect}
            setShowDialog={setShowDialog}
          />
        )
      case 'Gene':
        return (
          <GenesTrackItem
            group={group}
            multiselect={multiselect}
            setShowDialog={setShowDialog}
          />
        )
      case 'Cytobands':
        return (
          <CytobandsTrackItem
            multiselect={multiselect}
            group={group}
            setShowDialog={setShowDialog}
          />
        )
      case 'Scale':
        return (
          <ScaleTrackItem
            multiselect={multiselect}
            group={group}
            setShowDialog={setShowDialog}
          />
        )
      default:
        return <BasicTrackItem multiselect={multiselect} group={group} />
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

      {showDialog.id.includes('edit-seq') && (
        <SeqEditDialog
          group={showDialog.params!.group as ITrackGroup}
          track={showDialog.params!.track as ISeqTrack}
          onCancel={() => setShowDialog({ ...NO_DIALOG })}
          callback={(group, track) => {
            dispatch({ type: 'update', group, track })

            //setShowDialog({ ...NO_DIALOG })
          }}
        />
      )}

      {showDialog.id.includes('add-chipseq') && (
        <SeqsDialog
          platform="ChIP-seq"
          onReponse={() => setShowDialog({ ...NO_DIALOG })}
          callback={(tracks, combine) => {
            const signals: TrackPlot[] = tracks.map((track, ti) => ({
              ...track,
              type: 'Seq',
              id: nanoid(),
              displayOptions: {
                ...DEFAULT_SEQ_TRACK_DISPLAY_OPTIONS,
                stroke: {
                  ...DEFAULT_SEQ_TRACK_DISPLAY_OPTIONS.stroke,
                  color: DEFAULT_PALETTE[ti % DEFAULT_PALETTE.length]!,
                },
                fill: {
                  ...DEFAULT_SEQ_TRACK_DISPLAY_OPTIONS.fill,
                  color: DEFAULT_PALETTE[ti % DEFAULT_PALETTE.length]!,
                },
              },
            }))

            let displayTracks: ITrackGroup[] = []

            if (combine) {
              displayTracks = [newTrackGroup(signals)]
            } else {
              displayTracks = signals.map((s) => newTrackGroup([s]))
            }

            dispatch({ type: 'add', tracks: displayTracks })

            setShowDialog({ ...NO_DIALOG })
          }}
        />
      )}

      {showDialog.id.includes('add-rnaseq') && (
        <SeqsDialog
          platform="RNA-seq"
          onReponse={() => setShowDialog({ ...NO_DIALOG })}
          callback={(tracks, combine) => {
            const signals: TrackPlot[] = tracks.map((track, ti) => ({
              ...track,
              type: 'Seq',
              id: nanoid(),
              displayOptions: {
                ...DEFAULT_SEQ_TRACK_DISPLAY_OPTIONS,
                stroke: {
                  ...DEFAULT_SEQ_TRACK_DISPLAY_OPTIONS.stroke,
                  color: DEFAULT_PALETTE[ti % DEFAULT_PALETTE.length]!,
                },
                fill: {
                  ...DEFAULT_SEQ_TRACK_DISPLAY_OPTIONS.fill,
                  color: DEFAULT_PALETTE[ti % DEFAULT_PALETTE.length]!,
                },
              },
            }))

            let displayTracks: ITrackGroup[] = []

            if (combine) {
              displayTracks = [newTrackGroup(signals)]
            } else {
              displayTracks = signals.map((s) => newTrackGroup([s]))
            }

            dispatch({ type: 'add', tracks: displayTracks })

            setShowDialog({ ...NO_DIALOG })
          }}
        />
      )}

      {showDialog.id.includes('add-cutandrun') && (
        <SeqsDialog
          platform="Cut_And_Run"
          onReponse={() => setShowDialog({ ...NO_DIALOG })}
          callback={(tracks, combine) => {
            const signals: TrackPlot[] = tracks.map((track, ti) => ({
              ...track,
              type: 'Seq',
              id: nanoid(),
              displayOptions: {
                ...DEFAULT_SEQ_TRACK_DISPLAY_OPTIONS,
                stroke: {
                  ...DEFAULT_SEQ_TRACK_DISPLAY_OPTIONS.stroke,
                  color: DEFAULT_PALETTE[ti % DEFAULT_PALETTE.length]!,
                },
                fill: {
                  ...DEFAULT_SEQ_TRACK_DISPLAY_OPTIONS.fill,
                  color: DEFAULT_PALETTE[ti % DEFAULT_PALETTE.length]!,
                },
              },
            }))

            let displayTracks: ITrackGroup[] = []

            if (combine) {
              displayTracks = [newTrackGroup(signals)]
            } else {
              displayTracks = signals.map((s) => newTrackGroup([s]))
            }

            dispatch({ type: 'add', tracks: displayTracks })

            setShowDialog({ ...NO_DIALOG })
          }}
        />
      )}

      {showDialog.id.includes('add-peaks') && (
        <PeaksDialog
          genome={settings.genome}
          platform="ChIP-seq"
          onReponse={() => setShowDialog({ ...NO_DIALOG })}
          callback={(beds, combine) => {
            // we make copies so user can edit each independently
            // even if they duplicate tracks
            const signals: IBedTrack[] = beds.map(
              (b: IDBBedTrack) =>
                ({
                  ...b,
                  type: 'BED',
                  id: nanoid(),
                  displayOptions: { ...DEFAULT_BED_TRACK_DISPLAY_OPTIONS },
                }) as IBedTrack
            )

            let displayTracks: ITrackGroup[] = []

            if (combine) {
              displayTracks = [newTrackGroup(signals)]
            } else {
              displayTracks = signals.map((s) => newTrackGroup([s]))
            }

            dispatch({ type: 'add', tracks: displayTracks })

            setShowDialog({ ...NO_DIALOG })
          }}
        />
      )}

      {showDialog.id.includes('add-bed') && (
        <AddLocalBedDialog
          onCancel={() => setShowDialog({ ...NO_DIALOG })}
          callback={(color, index) => {
            // we make copies so user can edit each independently
            // even if they duplicate tracks
            const displayBed: ILocalBedTrack = {
              type: 'Local BED',
              name: index.name,
              id: nanoid(),
              displayOptions: {
                ...DEFAULT_BED_TRACK_DISPLAY_OPTIONS,
                fill: { ...DEFAULT_FILL_PROPS, color },
              },
              index,
            }

            dispatch({ type: 'add', tracks: [newTrackGroup([displayBed])] })

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
          showClose={true}
          title={MODULE_INFO.name}
          onReponse={(r) => {
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
          showClose={true}
          title={MODULE_INFO.name}
          onReponse={(r) => {
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
          onReponse={(r) => {
            if (r === TEXT_OK) {
              dispatch({
                type: 'remove-groups',
                ids: state.order.filter(
                  (id) => state.selected.get(id) ?? false
                ),
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
          open={showDialog.id.startsWith('join-seqs:')}
          title={MODULE_INFO.name}
          onReponse={(r) => {
            if (r === TEXT_OK) {
              let seqsByGroup = state.order.map((gid) =>
                state.selected.has(gid)
                  ? where(
                      state.groups[gid]!.order,
                      (tid) => state.groups[gid]!.tracks[tid]!.type === 'Seq'
                    ).map(
                      (ti) =>
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
                  (id) => id === groupIds[0]!
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
                      .map((id) => state.groups[id]!),

                    // replace first seq in join with this new group
                    newGroup,
                    // add what comes after the group that is not part of the
                    // groups we are merging
                    ...state.order
                      .slice(replaceIdx + 1)
                      .filter((id) => !groupIdSet.has(id))
                      .map((id) => state.groups[id]!),
                  ],
                })
              }

              // now do the same for beds

              seqsByGroup = state.order.map((gid) =>
                state.selected.has(gid)
                  ? where(
                      state.groups[gid]!.order,
                      (tid) =>
                        state.groups[gid]!.tracks[tid]!.type === 'BED' ||
                        state.groups[gid]!.tracks[tid]!.type === 'Local BED'
                    ).map(
                      (ti) =>
                        state.groups[gid]!.tracks[
                          state.groups[gid]!.order[ti]!
                        ]!
                    )
                  : []
              )

              console.log(seqsByGroup)

              groupIds = state.order.filter(
                (_, gi) => seqsByGroup[gi]!.length > 0
              )

              if (groupIds.length > 0) {
                // get index of first seq we want to merge, we shall
                // replace this entry with the merge
                const replaceIdx = where(
                  state.order,
                  (id) => id === groupIds[0]!
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
                      .map((id) => state.groups[id]!),

                    // replace first seq in join with this new group
                    newGroup,
                    // add what comes after the group that is not part of the
                    // groups we are merging
                    ...state.order
                      .slice(replaceIdx + 1)
                      .filter((id) => !groupIdSet.has(id))
                      .map((id) => state.groups[id]!),
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
          <ToolbarTabGroup className="ml-7.5 gap-x-1">
            {multiselect && state.order.length > 0 && (
              <>
                <Checkbox
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
                <ToolbarTabGroup>
                  <IconButton
                    onClick={() => {
                      setShowDialog({
                        id: makeRandId('join-seqs'),
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
                        id: makeRandId('remove-groups'),
                        params: {},
                      })
                    }}
                  >
                    <TrashIcon />
                  </IconButton>
                </ToolbarTabGroup>
              </>
            )}
          </ToolbarTabGroup>

          <ToolbarTabGroup className="gap-x-1">
            {/* <DropdownMenu>
              <DropdownMenuTrigger>
                <Button
                  variant="accent"
                  //pad="sm"
                  //rounded="full"
                  ripple={false}
                  onClick={() => {
                    setShowDialog({
                      id: makeRandId('add-chipseq'),
                      params: {},
                    })
                  }}
                  aria-label="Add Group"
                >
                  Add tracks
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='start'>
                <DropdownMenuItem
                  aria-label="Add tracks"
                  onClick={() =>
                    setShowDialog({
                      id: makeRandId('add-chipseq'),
                      params: {},
                    })
                  }
                >
                  Add tracks
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu> */}
            <ToolbarTabGroup>
              <IconButton
                onClick={() => {
                  setShowDialog({
                    id: makeRandId('open-tracks'),
                    params: {},
                  })
                }}
                title="Open tracks"
              >
                <OpenIcon />
              </IconButton>

              <IconButton
                onClick={() => {
                  downloadJson(
                    state.order.map((id) => state.groups[id]!),
                    downloadRef,
                    'tracks.json'
                  )
                }}
                title="Save tracks"
              >
                <SaveIcon />
              </IconButton>

              <OptionalDropdownButton
                icon={<PlusIcon />}
                title="Add track"
                onMainClick={() =>
                  setShowDialog({
                    id: makeRandId('add-chipseq'),
                    params: {},
                  })
                }
                align="end"
              >
                <DropdownMenuLabel>Platform</DropdownMenuLabel>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>ChIP-seq</DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem
                        aria-label="ChIP-seq"
                        onClick={() =>
                          setShowDialog({
                            id: makeRandId('add-chipseq'),
                            params: {},
                          })
                        }
                      >
                        Signals
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        aria-label="Peaks"
                        onClick={() => {
                          setShowDialog({
                            id: makeRandId('add-peaks'),
                            params: {},
                          })
                        }}
                      >
                        Peaks
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>

                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>RNA-seq</DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem
                        aria-label="RNA-seq"
                        onClick={() =>
                          setShowDialog({
                            id: makeRandId('add-rnaseq'),
                            params: {},
                          })
                        }
                      >
                        Signals
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>Cut&Run</DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem
                        aria-label="Cut&Run"
                        onClick={() =>
                          setShowDialog({
                            id: makeRandId('add-cutandrun'),
                            params: {},
                          })
                        }
                      >
                        Signals
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>

                <MenuSeparator />

                <DropdownMenuItem
                  aria-label="BED"
                  onClick={() => {
                    setShowDialog({
                      id: makeRandId('add-bed'),
                      params: {},
                    })
                  }}
                >
                  BED file
                </DropdownMenuItem>

                <MenuSeparator />

                <DropdownMenuGroup>
                  <DropdownMenuItem
                    aria-label="Ruler"
                    onClick={() => {
                      const track: IRulerTrack = {
                        type: 'Ruler',
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
                    Ruler
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    aria-label="Scale"
                    onClick={() => {
                      const track: IScaleTrack = {
                        type: 'Scale',
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
                    Scale
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    aria-label="Genes"
                    onClick={() => {
                      const track: IGeneTrack = {
                        type: 'Gene',
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
                    Genes
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    aria-label="Location"
                    onClick={() => {
                      const track: ILocationTrack = {
                        type: 'Location',
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
                    Location
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    aria-label="Cytobands track"
                    onClick={() => {
                      const track: ICytobandsTrack = {
                        type: 'Cytobands',
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
                    Cytobands
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </OptionalDropdownButton>
            </ToolbarTabGroup>
            <ToolbarSeparator />
            <IconButton
              title="Select multiple tracks"
              onClick={() => setMultiselect(!multiselect)}
              selected={multiselect}
            >
              <MultiSelectIcon />
            </IconButton>
          </ToolbarTabGroup>
        </VCenterRow>

        <FileDropPanel
          onFileDrop={(files) => {
            if (files.length > 0) {
              //setDroppedFile(files[0]);
              //console.log('Dropped file:', files[0])

              onTextFileChange('Open dropped file', files, openTrackFiles)
            }
          }}
        >
          <VScrollPanel>
            <Reorder.Group
              axis="y"
              values={state.order}
              onReorder={(order) => {
                console.log('tracj order', state.order)
                //setOrder(order)
                dispatch({
                  type: 'order',
                  order: order,
                })
              }}
              className="flex flex-col gap-y-1"
            >
              {state.order
                .map((gid) => state.groups[gid]!)
                .map((tg) => {
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
            </Reorder.Group>
          </VScrollPanel>
        </FileDropPanel>
      </PropsPanel>

      {showDialog.id.includes('open-tracks') && (
        <OpenFiles
          //onOpenChange={() => setOpen("")}
          onFileChange={(message, files) =>
            onTextFileChange(message, files, (files) => {
              openTrackFiles(files)
            })
          }
          fileTypes={['json']}
        />
      )}
    </>
  )
}
