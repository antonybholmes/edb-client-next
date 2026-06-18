import { TEXT_NAME, TEXT_OK } from '@/consts'
import { OKCancelDialog } from '@/dialogs/ok-cancel-dialog'
import { TextPropRow } from '@/dialogs/text-prop-row'
import type { SignalOrPeakTrack } from '../tracks-provider'

export interface IProps {
  track: SignalOrPeakTrack
  onCancel: () => void
}

export function TrackInfoDialog({ track, onCancel }: IProps) {
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
      <TextPropRow
        title="Name"
        labelW="sm"
        value={track.name}
        readOnly={true}
        placeholder={TEXT_NAME}
        //className="rounded-theme"
        //h="lg"
      />

      <TextPropRow
        labelW="sm"
        title="Track Type"
        value={track.type}
        readOnly={true}
        placeholder="Track Type"
      />

      {'url' in track && track.url && (
        <TextPropRow
          title="URL"
          labelW="sm"
          value={track.url}
          readOnly={true}
          placeholder="URL"
        />
      )}

      {'reads' in track && track.reads > 0 && (
        <TextPropRow
          title="Reads"
          labelW="sm"
          value={track.reads.toLocaleString()}
          readOnly={true}
          placeholder="Reads"
        />
      )}
    </OKCancelDialog>
  )
}
