import { Input } from '@/components/shadcn/ui/themed/input'
import { TEXT_OK } from '@/consts'
import { type GenomicLocation } from '@/lib/genomic/genomic'
import { OKCancelDialog } from '@components/dialog/ok-cancel-dialog'
import { useState } from 'react'

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
      title="Add location"
      onReponse={(e) => {
        if (e === TEXT_OK) {
          callback?.(index, text)
        } else {
          onCancel()
        }
      }}
    >
      <Input
        variant="alt"
        h="lg"
        value={text}
        placeholder="height"
        onChange={(e) => setText(e.target.value)}
        className="rounded-theme"
      />

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
