import { TruncateSpan } from '@/components/truncate-span'
import { BaseCol } from '@/layout/base-col'
import { VCenterRow } from '@/layout/v-center-row'
import { cn } from '@/lib/shadcn-utils'
import { Settings2 } from 'lucide-react'
import { useSeqBrowserDialogs } from '../seq-browser-dialogs'
import type {
  IBedDBDataTrack,
  ILocalBedTrack,
  ITrackGroup,
} from '../tracks-provider'
import { BaseTrackItem } from './base-track-item'
import {
  DeleteTrackGroupButton,
  TRACK_ITEM_BUTTONS_CLS,
  UngroupButton,
} from './seq-track-item'

export function BedTrackItem({
  group,
  active,
  multiselect,
}: {
  group: ITrackGroup
  active: string | null
  multiselect: boolean
}) {
  //const [drag, setDrag] = useState(false)

  //useMouseUpListener(() => setDrag(false))

  const { open: openDialog } = useSeqBrowserDialogs()

  return (
    <BaseTrackItem
      active={active}
      group={group}
      multiselect={multiselect}
      className="data-[hover=true]:bg-transparent"
      extChildren={
        <VCenterRow className={TRACK_ITEM_BUTTONS_CLS}>
          <DeleteTrackGroupButton group={group} />
        </VCenterRow>
      }
    >
      {group.tracks.length > 1 && <UngroupButton group={group} />}
      <BaseCol className="grow overflow-hidden">
        {(group.tracks as (IBedDBDataTrack | ILocalBedTrack)[]).map((t, ti) => {
          return (
            <VCenterRow
              key={t.id}
              id={t.name}
              style={{
                color: t.displayOptions.fill.value,
                fill: t.displayOptions.fill.value,
              }}
              className="gap-x-1"
            >
              <VCenterRow
                data-pos={
                  group.tracks.length === 1
                    ? 'normal'
                    : ti === 0
                      ? 'start'
                      : ti === group.tracks.length - 1
                        ? 'end'
                        : 'middle'
                }
                className={cn(
                  'grow overflow-hidden h-9 data-[pos=normal]:rounded-theme data-[pos=start]:rounded-t-theme data-[pos=end]:rounded-b-theme',
                  { 'pl-4': ti > 0 }
                )}
              >
                <TruncateSpan className="h-9 w-full font-semibold">
                  {t.name}
                </TruncateSpan>

                <VCenterRow className={TRACK_ITEM_BUTTONS_CLS}>
                  <button
                    title={`Edit ${t.name}`}
                    className="opacity-50 hover:opacity-100 trans-opacity"
                    onClick={() => {
                      openDialog({
                        type: 'edit-bed',
                        payload: {
                          group,
                          track: t,
                        },
                      })
                    }}
                  >
                    <Settings2 size={20} strokeWidth={1.5} />
                  </button>
                </VCenterRow>
              </VCenterRow>
            </VCenterRow>
          )
        })}
      </BaseCol>
    </BaseTrackItem>
  )
}
