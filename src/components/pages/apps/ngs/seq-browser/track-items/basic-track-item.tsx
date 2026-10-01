import { TruncateSpan } from '@/components/truncate-span'
import { VCenterRow } from '@/layout/v-center-row'
import type { NullStr } from '@/lib/text/text'
import type { ITrackGroup } from '../tracks-provider'
import { BaseTrackItem } from './base-track-item'
import {
  DeleteTrackGroupButton,
  TRACK_ITEM_BUTTONS_CLS,
} from './seq-track-item'

export function BasicTrackItem({
  index,
  group,
  active,
  multiselect,
}: {
  index: number
  group: ITrackGroup
  active: NullStr
  multiselect: boolean
}) {
  //const { isDragging } = useContext(SortableItemContext)

  const hoverMode = group.id === active

  const track = group.tracks[0]!

  return (
    <BaseTrackItem
      index={index}
      group={group}
      active={active}
      multiselect={multiselect}
      extChildren={
        <VCenterRow data-hover={hoverMode} className={TRACK_ITEM_BUTTONS_CLS}>
          <DeleteTrackGroupButton group={group} />
        </VCenterRow>
      }
    >
      {/* <span className="font-semibold grow truncate w-full">{track.name}</span> */}

      <TruncateSpan className="font-semibold grow h-8">
        {track.name}
      </TruncateSpan>
    </BaseTrackItem>
  )
}
