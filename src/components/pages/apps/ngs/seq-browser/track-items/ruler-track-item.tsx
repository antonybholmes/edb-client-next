import { TruncateSpan } from '@/components/truncate-span'
import { VCenterRow } from '@/layout/v-center-row'
import { useSeqBrowserDialogs } from '../seq-browser-dialogs'
import type { IRulerTrack, ITrackGroup } from '../tracks-provider'
import { BaseTrackItem } from './base-track-item'
import {
  DeleteTrackGroupButton,
  EditTrackButton,
  TRACK_ITEM_BUTTONS_CLS,
} from './seq-track-item'

export function RulerTrackItem({
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

  const track = group.tracks[0]! as IRulerTrack

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
        <EditTrackButton
          onClick={() => {
            openDialog({
              type: 'edit-ruler',
              payload: {},
            })
          }}
        />
      </VCenterRow>
    </BaseTrackItem>
  )
}
