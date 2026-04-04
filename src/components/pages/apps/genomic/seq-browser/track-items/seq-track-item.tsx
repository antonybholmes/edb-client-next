import { TEXT_OK, type IDialogParams } from '@/consts'
import { useMouseUpListener } from '@/hooks/mouseup-listener'
import { VCenterRow } from '@/layout/v-center-row'
import { randId } from '@/lib/id'
import { useState } from 'react'

import { OKCancelDialog } from '@/dialog/ok-cancel-dialog'
import { TrashIcon } from '@/icons/trash-icon'
import { UnLinkIcon } from '@/icons/unlink-icon'
import { BaseCol } from '@/layout/base-col'
import { hexColorWithoutAlpha } from '@/lib/color/color'
import { cn } from '@/lib/shadcn-utils'

import { InfoIcon } from '@/components/icons/info-icon'
import { TruncateSpan } from '@/components/truncate-span'
import { where } from '@/lib/math/where'
import { Settings2 } from 'lucide-react'
import MODULE_INFO from '../module.json'
import {
  newTrackGroup,
  type ISignalTrack,
  type ITrackGroup,
  type TrackPlot,
} from '../tracks-provider'
import { useTracks } from '../tracks-store'
import { BaseTrackItem } from './base-track-item'

export const BASE_TRACK_ITEM_CLS =
  'flex flex-row items-center grow overflow-hidden gap-x-1.5 rounded-theme pl-1 '

export const MULTI_TRACK_ITEM_CLS = cn(
  BASE_TRACK_ITEM_CLS
  //'group-data-[hover=true]:bg-muted'
)

export const TRACK_ITEM_CLS = 'group' // cn(MULTI_TRACK_ITEM_CLS, 'group')

/**
 * Animation effects for track item buttons e.g. animate delete button scaling in on hover.
 */
export const TRACK_ITEM_BUTTONS_CLS = `gap-x-1 pr-1 opacity-0 scale-75 group-hover:scale-100 
  group-data-[focus=true]:scale-100 group-data-[focus=true]:opacity-100 data-[hover=true]:opacity-100 
  group-hover:opacity-100 shrink-0 transition-opacity transition-transform ease-in-out duration-200`

export function DeleteTrackGroupButton({ group }: { group: ITrackGroup }) {
  const { dispatch } = useTracks()
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
          onResponse={r => {
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
        <TrashIcon stroke="" w="w-4" />
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
  const { dispatch } = useTracks()
  const [showDialog, setShowDialog] = useState(false)

  return (
    <>
      {showDialog && (
        <OKCancelDialog
          modalType="Warning"
          showClose={true}
          title={MODULE_INFO.name}
          onResponse={r => {
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
  setShowDialog: (params: IDialogParams) => void
}) {
  return (
    <button
      title={`Edit ${track.name}`}
      className="opacity-50 hover:opacity-100 trans-opacity"
      onClick={() => {
        setShowDialog({
          id: randId(cmd),
          params: { group, track },
        })
      }}
    >
      <Settings2 size={20} strokeWidth={1.5} />
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
  setShowDialog: (params: IDialogParams) => void
}) {
  return (
    <button
      title={`${track.name} Info`}
      className="opacity-50 hover:opacity-100 trans-opacity"
      onClick={() => {
        setShowDialog({
          id: randId('track-info'),
          params: { group, track },
        })
      }}
    >
      <InfoIcon />
    </button>
  )
}

export function UngroupButton({ group }: { group: ITrackGroup }) {
  const { groups, dispatch } = useTracks()
  const [showDialog, setShowDialog] = useState(false)

  return (
    <>
      <OKCancelDialog
        open={showDialog}
        title={MODULE_INFO.name}
        onResponse={r => {
          if (r === TEXT_OK) {
            // find current index of the group
            const idx = where(groups, g => g.id === group.id)[0]!

            dispatch({
              type: 'set',
              tracks: [
                // what comes before our group is left intact
                ...groups.slice(0, idx),

                // split each track into a separate group
                ...group.tracks.map(t => newTrackGroup([t])),

                // add what comes after the group intact
                ...groups.slice(idx + 1),
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
  setShowDialog: (params: IDialogParams) => void
}) {
  //const { state, dispatch } = useContext(TracksContext)

  const [drag, setDrag] = useState(false)

  useMouseUpListener(() => setDrag(false))

  const track = group.tracks[0]! as ISignalTrack

  return (
    <BaseTrackItem
      group={group}
      active={active}
      multiselect={multiselect}
      onMouseDown={() => setDrag(true)}
      className="data-[hover=true]:bg-transparent"
    >
      {group.tracks.length > 1 && <UngroupButton group={group} />}
      <BaseCol className="grow overflow-hidden">
        {(group.tracks as ISignalTrack[]).map((t, ti) => {
          const accentColor = hexColorWithoutAlpha(t.displayOptions.fill.color)
          return (
            <VCenterRow
              key={t.id}
              id={t.name}
              style={{
                color: accentColor,
                stroke: accentColor,
                fill: accentColor,
              }}
              className="gap-x-1 overflow-hidden"
            >
              <VCenterRow
                data-pos={
                  group.tracks.length === 1
                    ? 'normal'
                    : ti === 0
                      ? 'start'
                      : ti === group.tracks.length - 1
                        ? 'end'
                        : 'middle'
                }
                className={cn(
                  'grow overflow-hidden data-[pos=normal]:rounded-theme data-[pos=start]:rounded-t-theme data-[pos=end]:rounded-b-theme',
                  { 'pl-4': ti > 0 }
                )}
              >
                <TruncateSpan className="grow h-8 font-semibold">
                  {`${t.name} ${'platform' in t ? `- ${track.technology}` : ''}`}
                </TruncateSpan>

                <VCenterRow data-drag={drag} className={TRACK_ITEM_BUTTONS_CLS}>
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
