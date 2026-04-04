import type { IDialogParams } from '@/consts'
import { VCenterRow } from '@/layout/v-center-row'
import type { IGeneTrack, ITrackGroup } from '../tracks-provider'
import { BaseTrackItem } from './base-track-item'
import {
  DeleteTrackGroupButton,
  EditTrackButton,
  TRACK_ITEM_BUTTONS_CLS,
} from './seq-track-item'

export function GenesTrackItem({
  group,
  active,
  multiselect,
  setShowDialog,
}: {
  group: ITrackGroup
  active: string | null
  multiselect: boolean
  setShowDialog: (params: IDialogParams) => void
}) {
  //const [drag, setDrag] = useState(false)

  // useMouseUpListener(() => setDrag(false))

  const track = group.tracks[0]! as IGeneTrack

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
      </VCenterRow>
    </BaseTrackItem>
  )
}
