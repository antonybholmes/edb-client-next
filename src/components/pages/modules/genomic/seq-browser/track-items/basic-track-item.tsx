import { VCenterRow } from '@/components/layout/v-center-row'
import { useMouseUpListener } from '@/hooks/use-mouseup-listener'
import { useState } from 'react'
import type { ITrackGroup } from '../tracks-provider'
import { BaseTrackItem } from './base-track-item'
import {
  DeleteTrackGroupButton,
  TRACK_ITEM_BUTTONS_CLS,
} from './seq-track-item'

export function BasicTrackItem({
  group,
  multiselect,
}: {
  group: ITrackGroup
  multiselect: boolean
}) {
  const [drag, setDrag] = useState(false)

  useMouseUpListener(() => setDrag(false))

  const track = group.tracks[group.order[0]!]!

  return (
    <BaseTrackItem
      group={group}
      multiselect={multiselect}
      onMouseDown={() => setDrag(true)}
    >
      <span className="font-semibold grow truncate w-full">{track.name}</span>

      <VCenterRow data-drag={drag} className={TRACK_ITEM_BUTTONS_CLS}>
        <DeleteTrackGroupButton group={group} />
      </VCenterRow>
    </BaseTrackItem>
  )
}
