import { TEXT_OK } from '@/consts'
import { OKCancelDialog } from '@/dialogs/ok-cancel-dialog'
import { VCenterRow } from '@/layout/v-center-row'

import { Label } from '@/components/shadcn/ui/themed/v2/label'
import { produce } from 'immer'
import { useOncoplotSettings } from './oncoplot-settings-store'

import {
  ColorPickerButton,
  SIMPLE_COLOR_EXT_CLS,
} from '@/components/plot/color-picker-popover'
import type { ClinicalDataTrack } from './clinical-utils'
import { NO_ALTERATION_COLOR } from './oncoplot-utils'

export type OncoplotType = 'loconcoplot' | 'oncoplot'

export interface IProps {
  track: ClinicalDataTrack
  onPlot?: (type: OncoplotType) => void
  onResponse?: (response: string) => void
}

export function ClinicalDialog({
  track,

  onResponse,
}: IProps) {
  const { displayProps, setDisplayProps } = useOncoplotSettings()
  const trackProps = displayProps.legend.clinical.tracks[track.name]!

  return (
    <OKCancelDialog
      open={true}
      title="Clinical Track Properties"
      buttons={[TEXT_OK]}
      onResponse={(r) => onResponse?.(r)}
      //contentVariant="glass"
      //bodyVariant="card"
      bodyCls="gap-y-2"
    >
      {track.categoriesInUse.map((category, ci) => (
        <VCenterRow className="gap-x-2" key={ci}>
          <ColorPickerButton
            colors={[
              {
                color:
                  trackProps.categoryColors[category.toLowerCase()] ??
                  NO_ALTERATION_COLOR,
                onColorChange: ({ color }) => {
                  const newTracksProps = produce(
                    displayProps.legend.clinical.tracks,
                    (draft) => {
                      draft[track.name]!.categoryColors[
                        category.toLowerCase()
                      ] = color
                    }
                  )

                  setDisplayProps(
                    produce(displayProps, (draft) => {
                      draft.legend.clinical.tracks = newTracksProps
                    })
                  )
                },
              },
            ]}
            className={SIMPLE_COLOR_EXT_CLS}
          />
          <Label>{category}</Label>
        </VCenterRow>
      ))}
    </OKCancelDialog>
  )
}
