import { TEXT_OK, type IDialogParams } from '@/consts'
import { useMouseUpListener } from '@/hooks/mouseup-listener'
import { VCenterRow } from '@layout/v-center-row'
import { randID } from '@lib/id'
import { useContext, useState, type Dispatch, type SetStateAction } from 'react'

import { OKCancelDialog } from '@dialog/ok-cancel-dialog'
import { SettingsIcon } from '@icons/settings-icon'
import { TrashIcon } from '@icons/trash-icon'
import { UnLinkIcon } from '@icons/unlink-icon'
import { BaseCol } from '@layout/base-col'
import { hexColorWithoutAlpha } from '@lib/color/color'
import { cn } from '@lib/shadcn-utils'

import { InfoIcon } from '@components/icons/info-icon'
import { where } from '@lib/math/where'
import MODULE_INFO from '../module.json'
import {
  newTrackGroup,
  TracksContext,
  type ISignalTrack,
  type ITrackGroup,
  type TrackPlot,
} from '../tracks-provider'
import { BaseTrackItem } from './base-track-item'

export const BASE_TRACK_ITEM_CLS =
  'flex flex-row items-center grow min-h-9 overflow-hidden gap-x-1.5 rounded-theme pl-1 '

export const MULTI_TRACK_ITEM_CLS = cn(
  BASE_TRACK_ITEM_CLS,
  'group-data-[hover=true]:bg-muted'
)

export const TRACK_ITEM_CLS = cn(MULTI_TRACK_ITEM_CLS, 'group')

export const TRACK_ITEM_BUTTONS_CLS = `gap-x-1 opacity-0 scale-75 group-hover:scale-100 
  group-data-[focus=true]:scale-100 group-data-[focus=true]:opacity-100 data-[hover=true]:opacity-100 
  group-hover:opacity-100 shrink-0 transition-opacity transition-transform ease-in-out duration-200`

export function DeleteTrackGroupButton({ group }: { group: ITrackGroup }) {
  const { dispatch } = useContext(TracksContext)
  const [showDialog, setShowDialog] = useState(false)

  return (
    <>
      {showDialog && (
        <OKCancelDialog
          showClose={true}
          modalType="Warning"
          //contentVariant="glass"
          //bodyVariant="card"
          title={MODULE_INFO.name}
          onResponse={(r) => {
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
        className="stroke-foreground/50 hover:stroke-red-500"
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
          onResponse={(r) => {
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
        className="stroke-foreground/50 hover:stroke-red-500"
        title={`Delete ${group.name}`}
      >
        <TrashIcon stroke="" />
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
          id: randID(cmd),
          params: { group, track },
        })
      }}
    >
      <SettingsIcon />
    </button>
  )
}

export function TrackInfoButton({
  group,
  track,
  setShowDialog,
}: {
  group: ITrackGroup
  track: TrackPlot
  setShowDialog: Dispatch<SetStateAction<IDialogParams>>
}) {
  return (
    <button
      title={`${track.name} Info`}
      className="opacity-50 hover:opacity-100 trans-opacity"
      onClick={() => {
        setShowDialog({
          id: randID('track-info'),
          params: { group, track },
        })
      }}
    >
      <InfoIcon />
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
        onResponse={(r) => {
          if (r === TEXT_OK) {
            // find current index of the group
            const idx = where(
              state.order,
              (id) => state.groups[id]!.id === group.id
            )[0]!

            dispatch({
              type: 'set',
              tracks: [
                // what comes before our group is left intact
                ...state.order.slice(0, idx).map((id) => state.groups[id]!),

                // split each track into a separate group
                ...group.order.map((id) => newTrackGroup([group.tracks[id]!])),

                // add what comes after the group intact
                ...state.order.slice(idx + 1).map((id) => state.groups[id]!),
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
  active,
  multiselect,
  setShowDialog,
}: {
  group: ITrackGroup
  active: string | null
  multiselect: boolean
  setShowDialog: Dispatch<SetStateAction<IDialogParams>>
}) {
  //const { state, dispatch } = useContext(TracksContext)

  const [drag, setDrag] = useState(false)

  useMouseUpListener(() => setDrag(false))

  const track = group.tracks[group.order[0]!]! as ISignalTrack

  return (
    <BaseTrackItem
      group={group}
      active={active}
      multiselect={multiselect}
      onMouseDown={() => setDrag(true)}
      className="data-[hover=true]:bg-transparent"
    >
      {group.order.length > 1 && <UngroupButton group={group} />}
      <BaseCol className="grow overflow-hidden">
        {group.order
          .map((id) => group.tracks[id]! as ISignalTrack)
          .map((t, ti) => {
            const accentColor = hexColorWithoutAlpha(
              t.displayOptions.fill.color
            )
            return (
              <VCenterRow
                key={t.id}
                id={t.name}
                style={{
                  color: accentColor,
                  stroke: accentColor,
                  fill: accentColor,
                }}
                className="gap-x-1"
              >
                <VCenterRow
                  data-pos={
                    group.order.length === 1
                      ? 'normal'
                      : ti === 0
                        ? 'start'
                        : ti === group.order.length - 1
                          ? 'end'
                          : 'middle'
                  }
                  className={cn(
                    'grow overflow-hidden group-hover:bg-muted h-9 data-[pos=normal]:rounded-theme data-[pos=start]:rounded-t-theme data-[pos=end]:rounded-b-theme px-2',
                    [ti > 0, 'pl-4']
                  )}
                >
                  <p className="grow truncate">
                    <span className="font-semibold">{t.name}</span>
                    {'platform' in t ? `- ${track.platform}` : ''}
                  </p>

                  <VCenterRow
                    data-drag={drag}
                    className={TRACK_ITEM_BUTTONS_CLS}
                  >
                    <EditTrackButton
                      cmd="edit-seq"
                      group={group}
                      track={t}
                      setShowDialog={setShowDialog}
                    />

                    <TrackInfoButton
                      group={group}
                      track={t}
                      setShowDialog={setShowDialog}
                    />
                  </VCenterRow>
                </VCenterRow>
                <VCenterRow data-drag={drag} className={TRACK_ITEM_BUTTONS_CLS}>
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
