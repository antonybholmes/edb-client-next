import { VCenterRow } from '@/components/layout/v-center-row'
import { TEXT_OK, type IDialogParams } from '@/consts'
import { useMouseUpListener } from '@/hooks/use-mouseup-listener'
import { makeRandId } from '@/lib/utils'
import { useContext, useState, type Dispatch, type SetStateAction } from 'react'

import { OKCancelDialog } from '@/components/dialog/ok-cancel-dialog'
import { SettingsIcon } from '@/components/icons/settings-icon'
import { TrashIcon } from '@/components/icons/trash-icon'
import { UnLinkIcon } from '@/components/icons/unlink-icon'
import { BaseCol } from '@/components/layout/base-col'
import { cn } from '@/lib/class-names'
import { removeHexAlpha } from '@/lib/color'
import { where } from '@/lib/math/math'
import MODULE_INFO from '../module.json'
import {
  newTrackGroup,
  TracksContext,
  type ISeqTrack,
  type ITrackGroup,
  type TrackPlot,
} from '../tracks-provider'
import { BaseTrackItem } from './base-track-item'

export const BASE_TRACK_ITEM_CLS =
  ' grow min-h-8 overflow-hidden gap-x-1.5 rounded-theme'

export const MULTI_TRACK_ITEM_CLS = cn(
  BASE_TRACK_ITEM_CLS,
  'data-[drag=false]:hover:bg-accent/30 data-[drag=true]:bg-accent/30'
)

export const TRACK_ITEM_CLS = cn(MULTI_TRACK_ITEM_CLS, 'group')

export const TRACK_ITEM_BUTTONS_CLS =
  'gap-x-1 opacity-0 group-hover:opacity-100 px-2'

export function DeleteTrackGroupButton({ group }: { group: ITrackGroup }) {
  const { dispatch } = useContext(TracksContext)
  const [showDialog, setShowDialog] = useState(false)

  return (
    <>
      {showDialog && (
        <OKCancelDialog
          showClose={true}
          modalType="Warning"
          title={MODULE_INFO.name}
          onReponse={r => {
            if (r === TEXT_OK) {
              dispatch({
                type: 'remove-groups',
                ids: [group.id],
              })
            }
            setShowDialog(false)
          }}
        >
          {`Are you sure you want to remove the ${group.name} track?`}
        </OKCancelDialog>
      )}

      <button
        onClick={() => setShowDialog(true)}
        className="stroke-foreground hover:stroke-red-500 trans-color opacity-75"
        // style={{
        //   stroke: track.displayOptions.stroke.color,
        // }}
        title={`Delete ${group.name}`}
      >
        <TrashIcon stroke="" />
      </button>
    </>
  )
}

export function DeleteTrackButton({
  group,
  track,
}: {
  group: ITrackGroup
  track: TrackPlot
}) {
  const { dispatch } = useContext(TracksContext)
  const [showDialog, setShowDialog] = useState(false)

  return (
    <>
      {showDialog && (
        <OKCancelDialog
          modalType="Warning"
          showClose={true}
          title={MODULE_INFO.name}
          onReponse={r => {
            if (r === TEXT_OK) {
              dispatch({
                type: 'remove-tracks',
                group: group,
                ids: [track.id],
              })
            }
            setShowDialog(false)
          }}
        >
          {`Are you sure you want to remove the ${group.name} track?`}
        </OKCancelDialog>
      )}

      <button
        onClick={() => setShowDialog(true)}
        //className="opacity-50 hover:opacity-100 trans-opacity shrink-0"
        // style={{
        //   stroke: track.displayOptions.stroke.color,
        // }}
        title={`Delete ${group.name}`}
      >
        <TrashIcon />
      </button>
    </>
  )
}

export function EditTrackButton({
  cmd,
  group,
  track,
  setShowDialog,
}: {
  cmd: string
  group: ITrackGroup
  track: TrackPlot
  setShowDialog: Dispatch<SetStateAction<IDialogParams>>
}) {
  return (
    <button
      title={`Edit ${track.name}`}
      className="opacity-50 hover:opacity-100 trans-opacity"
      onClick={() => {
        setShowDialog({
          id: makeRandId(cmd),
          params: { group, track },
        })
      }}
    >
      <SettingsIcon />
    </button>
  )
}

export function UngroupButton({ group }: { group: ITrackGroup }) {
  const { state, dispatch } = useContext(TracksContext)
  const [showDialog, setShowDialog] = useState(false)

  return (
    <>
      <OKCancelDialog
        open={showDialog}
        title={MODULE_INFO.name}
        onReponse={r => {
          if (r === TEXT_OK) {
            // find current index of the group
            const idx = where(
              state.order,
              id => state.groups[id]!.id === group.id
            )[0]!

            dispatch({
              type: 'set',
              tracks: [
                // what comes before our group is left intact
                ...state.order.slice(0, idx).map(id => state.groups[id]!),

                // split each track into a separate group
                ...group.order.map(id => newTrackGroup([group.tracks[id]!])),

                // add what comes after the group intact
                ...state.order.slice(idx + 1).map(id => state.groups[id]!),
              ],
            })
          }

          setShowDialog(false)
        }}
      >
        Are you sure you want to ungroup the tracks?
      </OKCancelDialog>

      <button
        onClick={() => setShowDialog(true)}
        className="opacity-50 hover:opacity-100 trans-opacity shrink-0"
        // style={{
        //   stroke: track.displayOptions.stroke.color,
        // }}
        title="Ungroup tracks"
      >
        <UnLinkIcon />
      </button>
    </>
  )
}

export function SeqTrackItem({
  group,
  multiselect,
  setShowDialog,
}: {
  group: ITrackGroup
  multiselect: boolean
  setShowDialog: Dispatch<SetStateAction<IDialogParams>>
}) {
  //const { state, dispatch } = useContext(TracksContext)

  const [drag, setDrag] = useState(false)

  useMouseUpListener(() => setDrag(false))

  const track = group.tracks[group.order[0]!]! as ISeqTrack

  return (
    <BaseTrackItem
      group={group}
      multiselect={multiselect}
      onMouseDown={() => setDrag(true)}
    >
      {group.order.length > 1 && <UngroupButton group={group} />}
      <BaseCol className="grow">
        {group.order
          .map(id => group.tracks[id]! as ISeqTrack)
          .map((t, ti) => {
            const accentColor = removeHexAlpha(t.displayOptions.fill.color)
            return (
              <VCenterRow
                key={t.id}
                id={t.name}
                className={cn([ti > 0, 'pl-2'])}
                style={{
                  color: accentColor,
                  stroke: accentColor,
                  fill: accentColor,
                }}
              >
                <span className="truncate grow">
                  <span className="font-semibold">{t.name}</span> -{' '}
                  {track.platform}
                </span>

                <VCenterRow
                  data-drag={drag}
                  className="gap-x-1 opacity-0 group-hover:opacity-100 px-2 h-8"
                >
                  <EditTrackButton
                    cmd="edit-seq"
                    group={group}
                    track={t}
                    setShowDialog={setShowDialog}
                  />

                  {ti > 0 ? (
                    <DeleteTrackButton group={group} track={t} />
                  ) : (
                    <DeleteTrackGroupButton group={group} />
                  )}
                </VCenterRow>
              </VCenterRow>
            )
          })}
      </BaseCol>
    </BaseTrackItem>
  )
}
