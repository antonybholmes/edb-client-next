import { TruncateSpan } from '@/components/truncate-span'
import { VCenterRow } from '@/layout/v-center-row'
import { Settings2 } from 'lucide-react'
import { useSeqBrowserDialogs } from '../seq-browser-dialogs'
import type { ICytobandsTrack, ITrackGroup } from '../tracks-provider'
import { BaseTrackItem } from './base-track-item'
import {
  DeleteTrackGroupButton,
  TRACK_ITEM_BUTTONS_CLS,
} from './seq-track-item'

export function CytobandsTrackItem({
  index,
  group,
  active,
  multiselect,
}: {
  index: number
  group: ITrackGroup
  active: string | null
  multiselect: boolean
}) {
  const { open: openDialog } = useSeqBrowserDialogs()
  const track = group.tracks[0]! as ICytobandsTrack

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
      <TruncateSpan className="font-semibold grow h-8">
        {track.name}
      </TruncateSpan>

      <VCenterRow className={TRACK_ITEM_BUTTONS_CLS}>
        <button
          title={`Edit ${track.name}`}
          className="opacity-50 hover:opacity-100 trans-opacity"
          onClick={() => {
            openDialog({
              type: 'edit-cytobands',
              payload: {},
            })
          }}
        >
          <Settings2 size={20} strokeWidth={1.5} />
        </button>
      </VCenterRow>
    </BaseTrackItem>
  )
}
