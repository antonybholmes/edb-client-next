import { SortableItemContext } from '@components/sortable-item'
import { VCenterRow } from '@layout/v-center-row'
import type { NullStr } from '@lib/text/text'
import { useContext } from 'react'
import type { ITrackGroup } from '../tracks-provider'
import { BaseTrackItem } from './base-track-item'
import {
  DeleteTrackGroupButton,
  TRACK_ITEM_BUTTONS_CLS,
} from './seq-track-item'

export function BasicTrackItem({
  group,
  active,
  multiselect,
}: {
  group: ITrackGroup
  active: NullStr
  multiselect: boolean
}) {
  const { isDragging } = useContext(SortableItemContext)

  const hoverMode = isDragging || group.id === active

  const track = group.tracks[group.order[0]!]!

  return (
    <BaseTrackItem
      group={group}
      active={active}
      multiselect={multiselect}
      rightChildren={
        <VCenterRow data-hover={hoverMode} className={TRACK_ITEM_BUTTONS_CLS}>
          <DeleteTrackGroupButton group={group} />
        </VCenterRow>
      }
    >
      <span className="font-semibold grow truncate w-full">{track.name}</span>
    </BaseTrackItem>
  )
}
