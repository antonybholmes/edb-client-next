import type { IDialogParams } from '@/consts'
import { VCenterRow } from '@layout/v-center-row'
import { cn } from '@lib/shadcn-utils'
import type { NullStr } from '@lib/text/text'
import { type Dispatch, type SetStateAction } from 'react'
import type { IScaleTrack, ITrackGroup } from '../tracks-provider'
import { BaseTrackItem } from './base-track-item'
import {
  DeleteTrackGroupButton,
  EditTrackButton,
  TRACK_ITEM_BUTTONS_CLS,
} from './seq-track-item'

export function ScaleTrackItem({
  group,
  active,
  multiselect,
  setShowDialog,
}: {
  group: ITrackGroup
  active: NullStr
  multiselect: boolean
  setShowDialog: Dispatch<SetStateAction<IDialogParams>>
}) {
  //const [drag, setDrag] = useState(false)

  //useMouseUpListener(() => setDrag(false))

  const track = group.tracks[group.order[0]!]! as IScaleTrack

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
      <span className="truncate grow overflow-hidden">
        <span className="font-semibold">{track.name}</span>
      </span>

      <VCenterRow className={cn(TRACK_ITEM_BUTTONS_CLS, 'px-2')}>
        <EditTrackButton
          cmd="edit-scale"
          group={group}
          track={track}
          setShowDialog={setShowDialog}
        />
      </VCenterRow>
    </BaseTrackItem>
  )
}
