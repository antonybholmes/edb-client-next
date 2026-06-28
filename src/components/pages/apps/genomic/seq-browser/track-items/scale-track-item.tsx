import { VCenterRow } from '@/layout/v-center-row'
import type { NullStr } from '@/lib/text/text'
import { Settings2 } from 'lucide-react'
import { useSeqBrowserDialogs } from '../seq-browser-dialogs'
import type { IScaleTrack, ITrackGroup } from '../tracks-provider'
import { BaseTrackItem } from './base-track-item'
import {
  DeleteTrackGroupButton,
  TRACK_ITEM_BUTTONS_CLS,
} from './seq-track-item'

export function ScaleTrackItem({
  group,
  active,
  multiselect,
}: {
  group: ITrackGroup
  active: NullStr
  multiselect: boolean
}) {
  const { open: openDialog } = useSeqBrowserDialogs()

  const track = group.tracks[0]! as IScaleTrack

  return (
    <BaseTrackItem
      active={active}
      group={group}
      multiselect={multiselect}
      extChildren={
        <VCenterRow className={TRACK_ITEM_BUTTONS_CLS}>
          <DeleteTrackGroupButton group={group} />
        </VCenterRow>
      }
    >
      <span className="truncate grow overflow-hidden">
        <span className="font-semibold">{track.name}</span>
      </span>

      <VCenterRow className={TRACK_ITEM_BUTTONS_CLS}>
        <button
          title={`Edit ${track.name}`}
          className="opacity-50 hover:opacity-100 trans-opacity"
          onClick={() => {
            openDialog({
              type: 'edit-scale',
              payload: {
                group,
                track,
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
