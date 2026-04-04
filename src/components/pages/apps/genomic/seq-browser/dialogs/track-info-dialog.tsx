import { LabelContainer } from '@/components/shadcn/ui/themed/v2/label'
import { TEXT_NAME, TEXT_OK } from '@/consts'
import { OKCancelDialog } from '@/dialog/ok-cancel-dialog'
import { Input } from '@/themed/v2/input'
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
      <LabelContainer label={TEXT_NAME} className="w-30">
        <Input
          id="name"
          value={track.name}
          readOnly={true}
          placeholder={TEXT_NAME}
          //className="rounded-theme"
          //h="lg"
        />
      </LabelContainer>

      <LabelContainer label="Track Type" className="w-30">
        <Input
          id="type"
          value={track.type}
          readOnly={true}
          placeholder="Track Type"
        />
      </LabelContainer>

      {'url' in track && track.url && (
        <LabelContainer label="URL" className="w-30">
          <Input id="url" value={track.url} readOnly={true} placeholder="URL" />
        </LabelContainer>
      )}

      {'reads' in track && track.reads > 0 && (
        <LabelContainer label="Reads" className="w-30">
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
