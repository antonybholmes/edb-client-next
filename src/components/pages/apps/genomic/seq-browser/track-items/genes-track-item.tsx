import { VCenterRow } from '@/layout/v-center-row'
import { Settings2 } from 'lucide-react'
import { useSeqBrowserDialogs } from '../seq-browser-dialogs'
import type { IGeneTrack, ITrackGroup } from '../tracks-provider'
import { useTracks } from '../tracks-store'
import { BaseTrackItem } from './base-track-item'
import {
  DeleteTrackGroupButton,
  TRACK_ITEM_BUTTONS_CLS,
} from './seq-track-item'

export function GenesTrackItem({
  index,
  group,
  active,
  multiselect,
}: {
  group: ITrackGroup
  active: string | null
  multiselect: boolean
  index: number
}) {
  const { open: openDialog } = useSeqBrowserDialogs()
  const { dispatch } = useTracks()

  const track = group.tracks[0]! as IGeneTrack

  return (
    <BaseTrackItem
      index={index}
      active={active}
      group={group}
      multiselect={multiselect}
      extChildren={
        <VCenterRow className={TRACK_ITEM_BUTTONS_CLS}>
          <DeleteTrackGroupButton group={group} />
        </VCenterRow>
      }
    >
      <span className="grow truncate">
        <span className="font-semibold">{track.name}</span>
      </span>

      <VCenterRow className={TRACK_ITEM_BUTTONS_CLS}>
        <button
          title={`Edit ${track.name}`}
          className="opacity-50 hover:opacity-100 trans-opacity"
          onClick={() => {
            openDialog({
              type: 'edit-genes',
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
      </VCenterRow>
    </BaseTrackItem>
  )
}
