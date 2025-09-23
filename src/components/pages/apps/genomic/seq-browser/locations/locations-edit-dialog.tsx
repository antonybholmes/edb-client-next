import { LabelContainer } from '@/components/shadcn/ui/themed/label'
import { TEXT_OK } from '@/consts'
import { OKCancelDialog } from '@dialog/ok-cancel-dialog'
import { type GenomicLocation } from '@lib/genomic/genomic'
import { useState } from 'react'
import { LocationAutocomplete } from '../location-autocomplete'

export interface IProps {
  index: number
  location: GenomicLocation
  callback?: (index: number, location: string) => void
  onCancel: () => void
}

export function LocationDialog({
  index,
  location,
  callback,
  onCancel,
}: IProps) {
  const [text, setText] = useState(location.loc)
  return (
    <OKCancelDialog
      //buttons={[TEXT_OK]}
      title="New Location"
      onResponse={(e) => {
        if (e === TEXT_OK) {
          callback?.(index, text)
        } else {
          onCancel()
        }
      }}
      //contentVariant="glass"
      //bodyVariant="card"
      //bodyCls="flex flex-row items-center gap-x-4"
    >
      <LabelContainer label="Location or gene" id="location">
        <LocationAutocomplete
          id="location"
          //variant="dialog"
          //h="dialog"
          value={text}
          placeholder="height"
          onTextChange={(v) => setText(v)}
          //className="rounded-theme grow"
        />
      </LabelContainer>

      {/* <SwitchPropRow
        title="Labels"
        checked={_track.displayOptions.labels.show}
        onCheckedChange={v => {
          const newTrack = produce(_track, draft => {
            draft.displayOptions.labels.show = v
          })

          callback?.(group, newTrack)
          setTrack(newTrack)
        }}
      >
        <SwitchPropRow
          title="Reduce labels"
          disabled={!_track.displayOptions.labels.show}
          checked={_track.displayOptions.labels.skip.on}
          onCheckedChange={v => {
            const newTrack = produce(_track, draft => {
              draft.displayOptions.labels.skip.on = v
            })

            callback?.(group, newTrack)
            setTrack(newTrack)
          }}
        >
          <BasicHoverCard>
            Reduces the number of labels shown to make figures look less
            clustered.
          </BasicHoverCard>
        </SwitchPropRow>
      </SwitchPropRow> */}
    </OKCancelDialog>
  )
}
