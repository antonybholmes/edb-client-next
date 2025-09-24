import type { IDialogParams } from '@/consts'
import { VCenterRow } from '@layout/v-center-row'
import { type Dispatch, type SetStateAction } from 'react'
import type { ICytobandsTrack, ITrackGroup } from '../tracks-provider'
import { BaseTrackItem } from './base-track-item'
import {
  DeleteTrackGroupButton,
  TRACK_ITEM_BUTTONS_CLS,
} from './seq-track-item'

export function CytobandsTrackItem({
  group,
  active,
  multiselect,
}: {
  group: ITrackGroup
  active: string | null
  multiselect: boolean
  setShowDialog: Dispatch<SetStateAction<IDialogParams>>
}) {
  //const [drag, setDrag] = useState(false)

  //useMouseUpListener(() => setDrag(false))

  const track = group.tracks[group.order[0]!]! as ICytobandsTrack

  return (
    <BaseTrackItem
      active={active}
      group={group}
      multiselect={multiselect}
      rightChildren={
        <VCenterRow className={TRACK_ITEM_BUTTONS_CLS}>
          <DeleteTrackGroupButton group={group} />
        </VCenterRow>
      }
    >
      <span className="grow truncate font-semibold">{track.name} </span>
    </BaseTrackItem>
  )
}
