import { VCenterRow } from '@/components/layout/v-center-row'
import type { IDialogParams } from '@/consts'
import { type Dispatch, type SetStateAction } from 'react'
import type { IGeneTrack, ITrackGroup } from '../tracks-provider'
import { BaseTrackItem } from './base-track-item'
import {
  DeleteTrackGroupButton,
  EditTrackButton,
  TRACK_ITEM_BUTTONS_CLS,
} from './seq-track-item'

export function GenesTrackItem({
  group,
  multiselect,
  setShowDialog,
}: {
  group: ITrackGroup
  multiselect: boolean
  setShowDialog: Dispatch<SetStateAction<IDialogParams>>
}) {
  //const [drag, setDrag] = useState(false)

  // useMouseUpListener(() => setDrag(false))

  const track = group.tracks[group.order[0]!]! as IGeneTrack

  return (
    <BaseTrackItem
      group={group}
      multiselect={multiselect}
      //onMouseDown={() => setDrag(true)}
    >
      <span className="grow truncate">
        <span className="font-semibold">{track.name}</span>
      </span>

      <VCenterRow className={TRACK_ITEM_BUTTONS_CLS}>
        <EditTrackButton
          cmd="edit-genes"
          group={group}
          track={track}
          setShowDialog={setShowDialog}
        />

        <DeleteTrackGroupButton group={group} />
      </VCenterRow>
    </BaseTrackItem>
  )
}
