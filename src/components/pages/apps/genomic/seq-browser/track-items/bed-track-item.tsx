import type { IDialogParams } from '@/consts'
import { BaseCol } from '@layout/base-col'
import { VCenterRow } from '@layout/v-center-row'
import { cn } from '@lib/shadcn-utils'
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
  active,
  multiselect,
  setShowDialog,
}: {
  group: ITrackGroup
  active: string | null
  multiselect: boolean
  setShowDialog: Dispatch<SetStateAction<IDialogParams>>
}) {
  //const [drag, setDrag] = useState(false)

  //useMouseUpListener(() => setDrag(false))

  return (
    <BaseTrackItem
      active={active}
      group={group}
      multiselect={multiselect}
      className="data-[hover=true]:bg-transparent"
    >
      {group.order.length > 1 && <UngroupButton group={group} />}
      <BaseCol className="grow overflow-hidden">
        {group.order
          .map(id => group.tracks[id]! as IBedTrack | ILocalBedTrack)
          .map((t, ti) => {
            return (
              <VCenterRow
                key={t.id}
                id={t.name}
                style={{
                  color: t.displayOptions.fill.color,
                  fill: t.displayOptions.fill.color,
                }}
                className="gap-x-1"
              >
                <VCenterRow
                  data-pos={
                    group.order.length === 1
                      ? 'normal'
                      : ti === 0
                        ? 'start'
                        : ti === group.order.length - 1
                          ? 'end'
                          : 'middle'
                  }
                  className={cn(
                    'grow overflow-hidden group-hover:bg-muted h-9 data-[pos=normal]:rounded-theme data-[pos=start]:rounded-t-theme data-[pos=end]:rounded-b-theme px-2',
                    [ti > 0, 'pl-4']
                  )}
                >
                  <span className="grow truncate font-semibold">{t.name}</span>

                  <VCenterRow className={TRACK_ITEM_BUTTONS_CLS}>
                    <EditTrackButton
                      cmd="edit-bed"
                      group={group}
                      track={t}
                      setShowDialog={setShowDialog}
                    />
                  </VCenterRow>
                </VCenterRow>

                <VCenterRow className={TRACK_ITEM_BUTTONS_CLS}>
                  <DeleteTrackGroupButton group={group} />
                </VCenterRow>
              </VCenterRow>
            )
          })}
      </BaseCol>
    </BaseTrackItem>
  )
}
