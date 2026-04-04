import { TruncateSpan } from '@/components/truncate-span'
import type { IDialogParams } from '@/consts'
import { VCenterRow } from '@/layout/v-center-row'
import type { ICytobandsTrack, ITrackGroup } from '../tracks-provider'
import { BaseTrackItem } from './base-track-item'
import {
  DeleteTrackGroupButton,
  EditTrackButton,
  TRACK_ITEM_BUTTONS_CLS,
} from './seq-track-item'

export function CytobandsTrackItem({
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

  //useMouseUpListener(() => setDrag(false))

  const track = group.tracks[0]! as ICytobandsTrack

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
      <TruncateSpan className="font-semibold grow h-8">
        {track.name}
      </TruncateSpan>

      <VCenterRow className={TRACK_ITEM_BUTTONS_CLS}>
        <EditTrackButton
          cmd="edit-cytobands"
          group={group}
          track={track}
          setShowDialog={setShowDialog}
        />
      </VCenterRow>
    </BaseTrackItem>
  )
}
