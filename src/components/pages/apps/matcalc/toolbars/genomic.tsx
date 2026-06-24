import { ToolbarButton } from '@/components/toolbar/toolbar-button'
import { ToolbarCol } from '@/components/toolbar/toolbar-col'
import { ToolbarTabGroup } from '@/components/toolbar/toolbar-tab-group'

import { AnnotationDataFrame } from '@/lib/dataframe/annotation-dataframe'
import { oneWayFromDataframes } from '@/lib/genomic/overlap/one-way-overlap'
import {
  createOverlapTableFromDataframes,
  OVERLAP_MODE,
} from '@/lib/genomic/overlap/overlap'
import { useSelectionRange } from '@/providers/selection-range'
import { useCurrentSheets } from '../history/history-provider/history-contexts'
import { useHistory } from '../history/history-provider/history-provider'
import { useMatcalcDialogs } from '../matcalc-dialogs'

export function GenomicToolbar() {
  const { open: openMatcalcDialog } = useMatcalcDialogs()

  const { sheets } = useCurrentSheets()
  const { addSheets } = useHistory()
  const { selection } = useSelectionRange()

  function overlapGenomicLocations(mode: OVERLAP_MODE = 'mcr') {
    if (sheets) {
      const dfOverlaps = createOverlapTableFromDataframes(
        sheets.map((s) => s as AnnotationDataFrame),
        mode
      )

      if (dfOverlaps) {
        addSheets([dfOverlaps])
      }
    }

    // history.current = ({
    //   step: history.current.step + 1,
    //   history: [{ title: df.name, df: [df] }],
    // })
  }

  function overlapOneWay() {
    if (sheets) {
      const dfOverlaps = oneWayFromDataframes(
        sheets.map((s) => s as AnnotationDataFrame)
      )

      if (dfOverlaps) {
        addSheets([dfOverlaps])
      }
    }
  }

  return (
    <>
      <ToolbarTabGroup title="Overlap">
        <ToolbarButton
          title="Minimum Common Regions of Genomic Locations"
          onClick={() => overlapGenomicLocations('mcr')}
        >
          MCR
        </ToolbarButton>
        <ToolbarButton
          title="Maximum Overlap Regions of Genomic Locations"
          onClick={() => overlapGenomicLocations('max')}
        >
          Min/Max
        </ToolbarButton>

        <ToolbarButton
          title="One Way Overlap of Genomic Locations in Files"
          onClick={() => overlapOneWay()}
        >
          One Way
        </ToolbarButton>
      </ToolbarTabGroup>

      <ToolbarTabGroup title="Annotation">
        <ToolbarCol>
          <ToolbarButton
            title="Annotate Locations"
            onClick={() => {
              openMatcalcDialog({
                type: 'annotate',
                payload: {
                  selection,
                },
              })
            }}
          >
            Annotate
          </ToolbarButton>
        </ToolbarCol>
      </ToolbarTabGroup>
    </>
  )
}
