import { TEXT_OK } from '@/consts'
import { useMouseUpListener } from '@/hooks/mouseup-listener'
import { VCenterRow } from '@/layout/v-center-row'
import { useState } from 'react'

import { TrashIcon } from '@/icons/trash-icon'
import { UnLinkIcon } from '@/icons/unlink-icon'
import { BaseCol } from '@/layout/base-col'
import { removeAlphaFromHex } from '@/lib/color/color'
import { cn } from '@/lib/shadcn-utils'

import { useDialogs } from '@/components/dialogs/dialogs'
import { InfoIcon } from '@/components/icons/info-icon'
import type { IButtonProps } from '@/components/shadcn/ui/themed/v2/button'
import { TruncateSpan } from '@/components/truncate-span'
import { where } from '@/lib/math/where'
import { Settings2 } from 'lucide-react'
import { useSeqBrowserDialogs } from '../seq-browser-dialogs'
import {
  newTrackGroup,
  type ISeqTrack,
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

  const { open: openDialog } = useDialogs()

  return (
    <button
      onClick={() => {
        openDialog({
          type: 'warning',
          payload: {
            content: `Are you sure you want to remove the ${group.name} track? This action cannot be undone.`,
            callback: (response) => {
              if (response === TEXT_OK) {
                dispatch({
                  type: 'remove-groups',
                  ids: [group.id],
                })
              }
            },
          },
        })
      }}
      className="stroke-foreground/50 hover:stroke-destructive"
      // style={{
      //   stroke: track.displayOptions.stroke.value,
      // }}
      title={`Delete ${group.name}`}
    >
      <TrashIcon stroke="" />
    </button>
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
  const { open: openDialog } = useDialogs()

  return (
    <button
      onClick={() => {
        openDialog({
          type: 'warning',
          payload: {
            content: `Are you sure you want to remove the ${group.name} track? This action cannot be undone.`,
            callback: (response) => {
              if (response === TEXT_OK) {
                dispatch({
                  type: 'remove-tracks',
                  group: group,
                  ids: [track.id],
                })
              }
            },
          },
        })
      }}
      //className="opacity-50 hover:opacity-100 trans-opacity shrink-0"
      // style={{
      //   stroke: track.displayOptions.stroke.value,
      // }}
      className="stroke-foreground/50 hover:stroke-destructive"
      title={`Delete ${group.name}`}
    >
      <TrashIcon stroke="" />
    </button>
  )
}

export function EditTrackButton({ className, ...props }: IButtonProps) {
  return (
    <button
      className={cn('opacity-50 hover:opacity-100 trans-opacity', className)}
      {...props}
    >
      <Settings2 size={20} strokeWidth={1.5} />
    </button>
  )
}

export function UngroupButton({ group }: { group: ITrackGroup }) {
  const { groups, dispatch } = useTracks()
  const { open: openDialog } = useDialogs()

  return (
    <button
      onClick={() => {
        openDialog({
          type: 'warning',
          payload: {
            content: 'Are you sure you want to ungroup the tracks?',
            callback: (response) => {
              if (response === TEXT_OK) {
                // find current index of the group
                const idx = where(groups, (g) => g.id === group.id)[0]!

                dispatch({
                  type: 'set',
                  tracks: [
                    // what comes before our group is left intact
                    ...groups.slice(0, idx),

                    // split each track into a separate group
                    ...group.tracks.map((t) => newTrackGroup([t])),

                    // add what comes after the group intact
                    ...groups.slice(idx + 1),
                  ],
                })
              }
            },
          },
        })
      }}
      className="opacity-50 hover:opacity-100 trans-opacity shrink-0"
      // style={{
      //   stroke: track.displayOptions.stroke.value,
      // }}
      title="Ungroup tracks"
    >
      <UnLinkIcon />
    </button>
  )
}

export function SeqTrackItem({
  group,
  active,
  multiselect,
}: {
  group: ITrackGroup
  active: string | null
  multiselect: boolean
}) {
  const { dispatch } = useTracks()

  const { open: openDialog } = useSeqBrowserDialogs()

  const [drag, setDrag] = useState(false)

  useMouseUpListener(() => setDrag(false))

  const track = group.tracks[0]! as ISeqTrack

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
        {(group.tracks as ISeqTrack[]).map((t, ti) => {
          const accentColor = removeAlphaFromHex(t.displayOptions.fill.value)
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
                  <button
                    title={`Edit ${track.name}`}
                    className="opacity-50 hover:opacity-100 trans-opacity"
                    onClick={() => {
                      openDialog({
                        type: 'edit-seq',
                        payload: {
                          group,
                          track,
                          callback: (data) => {
                            dispatch({
                              type: 'update',
                              group,
                              track: data.track,
                            })
                          },
                        },
                      })
                    }}
                  >
                    <Settings2 size={20} strokeWidth={1.5} />
                  </button>

                  <button
                    title={`${track.name} Info`}
                    className="opacity-50 hover:opacity-100 trans-opacity"
                    onClick={() => {
                      openDialog({
                        type: 'track-info',
                        payload: { track: t },
                      })
                    }}
                  >
                    <InfoIcon />
                  </button>
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
