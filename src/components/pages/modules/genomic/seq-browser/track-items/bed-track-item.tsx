import { BaseCol } from '@/components/layout/base-col'
import { VCenterRow } from '@/components/layout/v-center-row'
import type { IDialogParams } from '@/consts'
import { cn } from '@/lib/class-names'
import { type Dispatch, type SetStateAction } from 'react'
import type { IBedTrack, ILocalBedTrack, ITrackGroup } from '../tracks-provider'
import { BaseTrackItem } from './base-track-item'
import {
  DeleteTrackGroupButton,
  EditTrackButton,
  TRACK_ITEM_BUTTONS_CLS,
  UngroupButton,
} from './seq-track-item'

export function BedTrackItem({
  group,
  multiselect,
  setShowDialog,
}: {
  group: ITrackGroup
  multiselect: boolean
  setShowDialog: Dispatch<SetStateAction<IDialogParams>>
}) {
  //const [drag, setDrag] = useState(false)

  //useMouseUpListener(() => setDrag(false))

  return (
    <BaseTrackItem
      group={group}
      multiselect={multiselect}
      //onMouseDown={() => setDrag(true)}
    >
      {group.order.length > 1 && <UngroupButton group={group} />}
      <BaseCol className="grow">
        {group.order
          .map((id) => group.tracks[id]! as IBedTrack | ILocalBedTrack)
          .map((t, ti) => {
            return (
              <VCenterRow
                key={t.id}
                id={t.name}
                className={cn('h-8', [ti > 0, 'pl-3'])}
                style={{
                  color: t.displayOptions.fill.color,

                  fill: t.displayOptions.fill.color,
                }}
              >
                <span className="grow truncate font-semibold">{t.name}</span>

                <VCenterRow className={TRACK_ITEM_BUTTONS_CLS}>
                  <EditTrackButton
                    cmd="edit-bed"
                    group={group}
                    track={t}
                    setShowDialog={setShowDialog}
                  />

                  <DeleteTrackGroupButton group={group} />
                </VCenterRow>
              </VCenterRow>
            )
          })}
      </BaseCol>
    </BaseTrackItem>
  )
}
