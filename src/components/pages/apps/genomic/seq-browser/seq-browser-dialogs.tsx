import {
  MAX_DIALOGS,
  type ApplyToDialog,
  type IDialogCloser,
} from '@/components/dialogs/dialogs'
import { DEFAULT_COLOR_PROPS } from '@/components/plot/svg-props'
import { TEXT_OK } from '@/consts'
import { DEFAULT_PALETTE } from '@/lib/color/palette'

import type { GenomicFeatureIndex } from '@/lib/genomic/genomic-index'
import { IGenomicLocation } from '@/lib/genomic/genomic-location'
import { makeUuid } from '@/lib/id'
import { BigBed, BigWig } from '@gmod/bbi'
import { produce } from 'immer'
import { create } from 'zustand'
import { BedEditDialog } from './dialogs/edit/bed-edit-dialog'
import { CytobandsEditDialog } from './dialogs/edit/cytobands-edit-dialog'
import { GenesEditDialog } from './dialogs/edit/genes-edit-dialog'
import { RulerEditDialog } from './dialogs/edit/ruler-edit-dialog'
import { ScaleEditDialog } from './dialogs/edit/scale-edit-dialog'
import {
  SeqEditDialog,
  type ITrackEditCallBack,
} from './dialogs/edit/seq-edit-dialog'
import { AddLocalFilesDialog } from './dialogs/local/add-local-files-dialog'
import { PeaksDialog } from './dialogs/peaks-dialog'
import { SeqsDialog } from './dialogs/seqs-dialog'
import { TrackInfoDialog } from './dialogs/track-info-dialog'
import { BigBedReader } from './readers/bed/bigbed-reader'
import { LocalBedReader } from './readers/bed/local-bed-reader'
import { BigWigReader } from './readers/seq/bigwig-reader'
import {
  DEFAULT_BED_TRACK_DISPLAY_OPTIONS,
  DEFAULT_SEQ_TRACK_DISPLAY_OPTIONS,
  newTrackGroup,
  type IBedDBDataTrack,
  type IBedDBTrack,
  type IBigWigTrack,
  type IGeneTrack,
  type ILocalBedTrack,
  type IRemoteBigWigTrack,
  type IScaleTrack,
  type ISeqDBTrack,
  type ISeqTrack,
  type ISeqTrackDisplayOptions,
  type ITrackGroup,
} from './tracks-provider'
import { useTracks } from './tracks-store'

type DialogTypeMap = {
  'edit-seq': {
    group: ITrackGroup
    track: ISeqTrack | IBigWigTrack | IRemoteBigWigTrack

    callback?: (data: ITrackEditCallBack) => void
  }
  'edit-bed': {
    group: ITrackGroup
    track: IBedDBDataTrack | ILocalBedTrack

    callback?: (data: {
      group: ITrackGroup
      track: IBedDBDataTrack | ILocalBedTrack
    }) => void
  }
  'edit-genes': {
    group: ITrackGroup
    track: IGeneTrack

    callback?: (data: { group: ITrackGroup; track: IGeneTrack }) => void
  }
  'edit-scale': {
    group: ITrackGroup
    track: IScaleTrack

    callback?: (data: { group: ITrackGroup; track: IScaleTrack }) => void
  }
  'edit-cytobands': {}
  'edit-ruler': {}
  'track-info': {
    track: ISeqTrack | IBigWigTrack | IRemoteBigWigTrack
  }
  'add-seqs': {
    technology: string
  }
  'add-peaks': {}
  'add-local-files': {}
  gex: {}
}

type DialogType = keyof DialogTypeMap

type Dialog = {
  [T in DialogType]: IDialog<T>
}[DialogType]

// user can open a dialog by providing the type and payload,
// with other properties being automatically added by the store (id, time)
type InputDialog = {
  [T in DialogType]: Omit<IDialog<T>, 'id' | 'time'>
}[DialogType]

interface IDialog<T extends DialogType> {
  id: string
  time: number
  type: T
  payload: DialogTypeMap[T]
}

interface ISeqBrowserDialogStore {
  stack: Dialog[]
  open: (d: InputDialog) => IDialogCloser
  bringToFront: ApplyToDialog
  close: ApplyToDialog
  clear: () => void
}

export const useSeqBrowserDialogStore = create<ISeqBrowserDialogStore>(
  (set) => ({
    stack: [],

    open: (d) => {
      const id = makeUuid()
      const dialog = { ...d, id, time: Date.now() }

      set((state) => ({
        stack: [...state.stack.slice(-MAX_DIALOGS + 1), dialog],
      }))

      return {
        id,
        close: () =>
          set((state) => ({
            stack: state.stack.filter((d) => d.id !== id),
          })),
      }
    },
    bringToFront: (id: string) =>
      set((state) => {
        const dialog = state.stack.find((d) => d.id === id)

        if (!dialog) {
          return state
        }

        return {
          stack: [
            ...state.stack.filter((d) => d.id !== id),
            { ...dialog, time: Date.now() },
          ],
        }
      }),
    close: (id: string) =>
      set((state) => ({
        stack: state.stack.filter((d) => d.id !== id),
      })),
    clear: () => set({ stack: [] }),
  })
)

export function useSeqBrowserDialogs() {
  const open = useSeqBrowserDialogStore((s) => s.open)
  const close = useSeqBrowserDialogStore((s) => s.close)

  return { open, close }
}

interface IDialogRenderer<T extends keyof DialogTypeMap> {
  dialog: IDialog<T>
  close: ApplyToDialog
}

function EditSeqDialogRenderer({ dialog, close }: IDialogRenderer<'edit-seq'>) {
  const { group, track, callback } = dialog.payload
  return (
    <SeqEditDialog
      group={group}
      track={track}
      onResponse={(response, data) => {
        if (response === TEXT_OK && data) {
          callback?.(data)
        }
        close(dialog.id)
      }}
    />
  )
}

function EditBedDialogRenderer({ dialog, close }: IDialogRenderer<'edit-bed'>) {
  const { group, track, callback } = dialog.payload
  return (
    <BedEditDialog
      group={group}
      track={track}
      onResponse={(response, data) => {
        if (response === TEXT_OK && data) {
          callback?.(data)
        }
        close(dialog.id)
      }}
    />
  )
}

function EditGenesDialogRenderer({
  dialog,
  close,
}: IDialogRenderer<'edit-genes'>) {
  const { group, track, callback } = dialog.payload
  return (
    <GenesEditDialog
      group={group}
      track={track}
      onResponse={(response, data) => {
        if (response === TEXT_OK && data) {
          callback?.(data)
        }
        close(dialog.id)
      }}
    />
  )
}

function EditCytobandsDialogRenderer({
  dialog,
  close,
}: IDialogRenderer<'edit-cytobands'>) {
  return <CytobandsEditDialog onResponse={() => close(dialog.id)} />
}

function EditScaleDialogRenderer({
  dialog,
  close,
}: IDialogRenderer<'edit-scale'>) {
  const { group, track, callback } = dialog.payload
  return (
    <ScaleEditDialog
      group={group}
      track={track}
      onResponse={(response, data) => {
        if (response === TEXT_OK && data) {
          callback?.(data)
        }
        close(dialog.id)
      }}
    />
  )
}

function EditRulerDialogRenderer({
  dialog,
  close,
}: IDialogRenderer<'edit-ruler'>) {
  return <RulerEditDialog onResponse={() => close(dialog.id)} />
}

function TrackInfoDialogRenderer({
  dialog,
  close,
}: IDialogRenderer<'track-info'>) {
  const { track } = dialog.payload

  return <TrackInfoDialog track={track} onCancel={() => close(dialog.id)} />
}

function AddSeqsDialogRenderer({ dialog, close }: IDialogRenderer<'add-seqs'>) {
  const { dispatch } = useTracks()
  let { technology } = dialog.payload

  technology = technology.includes('chip-seq')
    ? 'ChIP-seq'
    : technology.includes('rna-seq')
      ? 'RNA-seq'
      : 'Cut&Run'

  return (
    <SeqsDialog
      technology={technology}
      onResponse={(response, data) => {
        if (response === TEXT_OK && data) {
          const signals: ISeqDBTrack[] = data.tracks.map((track, ti) => {
            const displayOptions: ISeqTrackDisplayOptions = produce(
              DEFAULT_SEQ_TRACK_DISPLAY_OPTIONS,
              (draft) => {
                draft.stroke.value =
                  DEFAULT_PALETTE[ti % DEFAULT_PALETTE.length]!
                draft.fill.value = DEFAULT_PALETTE[ti % DEFAULT_PALETTE.length]!
              }
            )

            switch (track.type) {
              case 'RemoteBigWig':
                // remote bigwig add reader so data can be read
                // from track
                return {
                  ...track,
                  type: 'RemoteBigWig',
                  scale: track.tags.some((x) => x.value.includes('BPM'))
                    ? 'BPM'
                    : 'Count',
                  displayOptions,
                  reader: new BigWigReader(
                    new BigWig({
                      url: track.url!,
                    })
                  ),
                }
              case 'BigWig':
                return {
                  ...track,
                  type: 'BigWig',
                  scale: track.tags.some((x) => x.value.includes('BPM'))
                    ? 'BPM'
                    : 'Count',
                  displayOptions,
                }
              default:
                return {
                  ...track,
                  type: 'Seq',
                  displayOptions,
                }
            }
          })

          let displayTracks: ITrackGroup[] = []

          if (data.combine) {
            displayTracks = [newTrackGroup(signals)]
          } else {
            displayTracks = signals.map((s) => newTrackGroup([s]))
          }

          dispatch({ type: 'add', tracks: displayTracks })
        }

        close(dialog.id)
      }}
    />
  )
}

function AddPeaksDialogRenderer({
  dialog,
  close,
}: IDialogRenderer<'add-peaks'>) {
  const { dispatch } = useTracks()

  return (
    <PeaksDialog
      technology="ChIP-seq"
      onResponse={(response, data) => {
        if (response === TEXT_OK && data) {
          // we make copies so user can edit each independently
          // even if they duplicate tracks
          const peaks: IBedDBTrack[] = data.tracks.map((track: IBedDBTrack) => {
            //const id = makeUuid()
            const displayOptions = { ...DEFAULT_BED_TRACK_DISPLAY_OPTIONS }

            switch (track.type) {
              case 'RemoteBigBed':
                return {
                  ...track,
                  type: 'RemoteBigBed',
                  reader: new BigBedReader(new BigBed({ url: track.url! })),
                }
              default:
                return {
                  ...track,
                  displayOptions,
                }
            }
          })

          let displayTracks: ITrackGroup[] = []

          if (data.combine) {
            displayTracks = [newTrackGroup(peaks)]
          } else {
            displayTracks = peaks.map((s) => newTrackGroup([s]))
          }

          dispatch({ type: 'add', tracks: displayTracks })
        }
        close(dialog.id)
      }}
    />
  )
}

function AddLocalFilesDialogRenderer({
  dialog,
  close,
}: IDialogRenderer<'add-local-files'>) {
  const { dispatch } = useTracks()
  return (
    <AddLocalFilesDialog
      onResponse={(response, data) => {
        if (response === TEXT_OK && data) {
          // we make copies so user can edit each independently
          // even if they duplicate tracks
          for (const file of data.files) {
            if (file.name.includes('.bed')) {
              const displayBed: ILocalBedTrack = {
                type: 'LocalBED',
                name: file.name,
                id: makeUuid(),
                displayOptions: {
                  ...DEFAULT_BED_TRACK_DISPLAY_OPTIONS,
                  fill: { ...DEFAULT_COLOR_PROPS, value: data.color },
                },
                reader: new LocalBedReader(
                  file.data as GenomicFeatureIndex<IGenomicLocation>
                ),
              }

              dispatch({ type: 'add', tracks: [newTrackGroup([displayBed])] })
            }
          }
        }

        close(dialog.id)
      }}
    />
  )
}

function DialogRenderer({
  dialog,
  close,
}: {
  dialog: Dialog
  close: ApplyToDialog
}) {
  switch (dialog.type) {
    case 'edit-seq':
      return <EditSeqDialogRenderer dialog={dialog} close={close} />
    case 'track-info':
      return <TrackInfoDialogRenderer dialog={dialog} close={close} />
    case 'edit-bed':
      return <EditBedDialogRenderer dialog={dialog} close={close} />
    case 'edit-genes':
      return <EditGenesDialogRenderer dialog={dialog} close={close} />
    case 'edit-cytobands':
      return <EditCytobandsDialogRenderer dialog={dialog} close={close} />
    case 'edit-scale':
      return <EditScaleDialogRenderer dialog={dialog} close={close} />
    case 'edit-ruler':
      return <EditRulerDialogRenderer dialog={dialog} close={close} />
    case 'add-seqs':
      return <AddSeqsDialogRenderer dialog={dialog} close={close} />
    case 'add-peaks':
      return <AddPeaksDialogRenderer dialog={dialog} close={close} />
    case 'add-local-files':
      return <AddLocalFilesDialogRenderer dialog={dialog} close={close} />
    default:
      return null
  }
}

export function SeqbrowserDialogsRoot() {
  const stack = useSeqBrowserDialogStore((s) => s.stack)
  const close = useSeqBrowserDialogStore((s) => s.close)
  const dialog = stack.at(-1) as Dialog | undefined // top dialog is still a discriminated union for rendering

  if (!dialog) {
    return null
  }

  return <DialogRenderer dialog={dialog} close={close} />
}
