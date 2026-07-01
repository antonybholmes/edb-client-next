import { TEXT_CANCEL, TEXT_OK } from '@/consts'
import { OKCancelDialog, type IModalProps } from '@/dialogs/ok-cancel-dialog'
import type { ISelectionRange } from '@/providers/selection-range-provider'

import { DataFrame } from '@/lib/dataframe/dataframe'

import { useState } from 'react'

import { CheckPropRow } from '@/components/dialogs/check-prop-row'
import { useDialogs } from '@/components/dialogs/dialogs'
import { NumericalPropRow } from '@/components/dialogs/numerical-prop-row'
import { PropRow } from '@/components/dialogs/prop-row'
import { DoubleNumericalInput } from '@/components/double-numerical-input'
import { AssemblySelect } from '@/components/edb/assembly-select'
import { useEdbSettings } from '@/components/edb/edb-settings'
import { RunningIndicator } from '@/components/toolbar/running-indicator'
import { AnnotationDataFrame } from '@/lib/dataframe/annotation-dataframe'
import type { BaseDataFrame } from '@/lib/dataframe/base-dataframe'
import { makeUuid } from '@/lib/id'
import { capitalizeFirstWord } from '@/lib/text/capital-case'
import { useAnnotations } from '../../../genomic/annotate/annotate-store'
import { useAnnotateWorker } from '../../../genomic/annotate/annotate-worker'
import { DFColSelect } from '../../df-col-select'
import { useCurrentSheets } from '../../history/history-provider/history-contexts'
import { useHistory } from '../../history/history-provider/history-provider'

export interface IProps extends IModalProps<BaseDataFrame> {
  selection?: ISelectionRange | undefined
}

export function AnnotateDialog({ selection, onResponse }: IProps) {
  const [col, setCol] = useState(0)

  const { addSheets } = useHistory()
  const { settings } = useEdbSettings()
  const {
    settings: annotationSettings,
    updateSettings: updateAnnotationSettings,
  } = useAnnotations()
  const { open: openDialog } = useDialogs()
  const { run: runAnnotate } = useAnnotateWorker()
  const { sheets } = useCurrentSheets()

  const [indicatorMessage, setIndicatorMessage] = useState<string | null>(null)

  const df = sheets[0] as DataFrame

  //const [closest, setClosest] = useState<number>(5)

  function annotate() {
    if (!df || !df.columns.length) {
      return
    }

    setIndicatorMessage('Annotating....')

    runAnnotate(
      {
        id: makeUuid(),
        df: df.values,
        columns: df.columns,
        col,
        assembly: settings.genomic.assembly,
        closest: annotationSettings.closest,
        tss: annotationSettings.tss,
        useOfficialGenes: annotationSettings.useOfficialGenes,
      },
      (data) => {
        const { error, table, header } = data

        setIndicatorMessage(null)

        if (error === null) {
          const df = new AnnotationDataFrame({ data: table, columns: header })

          addSheets([df], { name: `Annotated` })

          onResponse?.(TEXT_OK, df)
        } else {
          openDialog({
            type: 'alert',
            payload: {
              content: capitalizeFirstWord(error) + '.',
            },
          })
        }
      }
    )
  }

  return (
    <OKCancelDialog
      title={
        <RunningIndicator message={indicatorMessage}>
          Annotate Locations
        </RunningIndicator>
      }
      onResponse={(r) => {
        if (r === TEXT_CANCEL) {
          onResponse?.(TEXT_CANCEL)
        } else {
          annotate()
        }
      }}
      //leftFooterChildren={<RunningIndicator message={indicatorMessage} />}
    >
      <PropRow title="Location column">
        <DFColSelect
          df={df}
          value={col}
          onChange={({ index }) => setCol(index)}
        />
      </PropRow>
      <PropRow title="Assembly">
        <AssemblySelect variant="default" />
      </PropRow>

      <NumericalPropRow
        title="Closest genes"
        value={annotationSettings.closest}
        onNumChange={(value) =>
          updateAnnotationSettings({ ...annotationSettings, closest: value })
        }
        limit={[0, 10]}
        dp={0}
        step={1}
        w="xs"
        className="text-xs"
      />

      <PropRow title="Promoter region (TSS)">
        <DoubleNumericalInput
          limit={[0, 100000]}
          step={100}
          dp={0}
          v1={annotationSettings.tss.prom3p}
          w="xs"
          onNumChange1={(value) =>
            updateAnnotationSettings({
              ...annotationSettings,
              tss: { ...annotationSettings.tss, prom5p: value },
            })
          }
          v2={annotationSettings.tss.prom3p}
          onNumChange2={(value) =>
            updateAnnotationSettings({
              ...annotationSettings,
              tss: { ...annotationSettings.tss, prom3p: value },
            })
          }
          inputCls="text-xs"
        />
      </PropRow>

      <CheckPropRow
        title="Use official gene symbols"
        checked={annotationSettings.useOfficialGenes}
        onCheckedChange={(value) =>
          updateAnnotationSettings({
            ...annotationSettings,
            useOfficialGenes: value,
          })
        }
      />
    </OKCancelDialog>
  )
}
