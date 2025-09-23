import { LabelContainer } from '@/components/shadcn/ui/themed/label'
import { TEXT_NAME, TEXT_OK } from '@/consts'
import { OKCancelDialog } from '@dialog/ok-cancel-dialog'
import { Input } from '@themed/input'
import type { AllSeqTrackTypes } from '../tracks-provider'

export interface IProps {
  track: AllSeqTrackTypes

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
      <LabelContainer label={TEXT_NAME} id="name">
        <Input
          id="name"
          value={track.name}
          readOnly={true}
          placeholder={TEXT_NAME}
          //className="rounded-theme"
          //h="lg"
        />
      </LabelContainer>

      <LabelContainer label="Track Type" id="type">
        <Input
          id="type"
          value={track.trackType}
          readOnly={true}
          placeholder="Track Type"
        />
      </LabelContainer>

      {'url' in track && track.url && (
        <LabelContainer label="URL" id="url">
          <Input id="url" value={track.url} readOnly={true} placeholder="URL" />
        </LabelContainer>
      )}

      {'reads' in track && track.reads > 0 && (
        <LabelContainer label="Reads" id="reads">
          <Input
            id="reads"
            value={track.reads.toLocaleString()}
            readOnly={true}
            placeholder="Reads"
          />
        </LabelContainer>
      )}
    </OKCancelDialog>
  )
}
