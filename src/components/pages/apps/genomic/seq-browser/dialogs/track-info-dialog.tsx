import { TEXT_NAME, TEXT_OK } from '@/consts'
import { OKCancelDialog } from '@dialog/ok-cancel-dialog'
import { Input } from '@themed/input'
import type { AllSeqTrackTypes, ITrackGroup } from '../tracks-provider'

export interface IProps {
  group: ITrackGroup
  track: AllSeqTrackTypes

  onCancel: () => void
}

export function TrackInfoDialog({ group, track, onCancel }: IProps) {
  return (
    <OKCancelDialog
      buttons={[TEXT_OK]}
      title="Track Info"
      // contentVariant="glass"
      //bodyVariant="card"
      onResponse={() => {
        onCancel()
      }}
    >
      <Input
        id="name"
        label={TEXT_NAME}
        labelPos="left"
        value={track.name}
        readOnly={true}
        placeholder={TEXT_NAME}
        //className="rounded-theme"
        //h="lg"
      />

      <Input
        id="type"
        label="Track Type"
        labelPos="left"
        value={track.trackType}
        readOnly={true}
        placeholder="Track Type"
        //className="rounded-theme"
        //h="lg"
      />

      {'url' in track && track.url && (
        <Input
          id="url"
          label="URL"
          labelPos="left"
          value={track.url}
          readOnly={true}
          placeholder="URL"
          //className="rounded-theme"
          //h="lg"
        />
      )}

      {'reads' in track && track.reads > 0 && (
        <Input
          id="reads"
          label="Reads"
          labelPos="left"
          value={track.reads.toLocaleString()}
          readOnly={true}
          placeholder="Reads"
          //className="rounded-theme"
          //h="lg"
        />
      )}
    </OKCancelDialog>
  )
}
