import { useDialogs } from '@/components/dialogs/dialogs'
import { DoubleNumericalInput } from '@/components/double-numerical-input'
import { DownloadIcon } from '@/components/icons/download-icon'
import { PlayIcon } from '@/components/icons/play-icon'
import { VCenterRow } from '@/components/layout/v-center-row'
import { openFilesDialog } from '@/components/pages/open-files'
import { NumericalInput } from '@/components/shadcn/ui/themed/numerical-input'
import { Checkbox } from '@/components/shadcn/ui/themed/v2/check-box'
import { ToolbarCol } from '@/components/toolbar/toolbar-col'
import { ToolbarColSmallButton } from '@/components/toolbar/toolbar-col-button'
import { ToolbarOpenFile } from '@/components/toolbar/toolbar-open-files'
import { ToolbarRow } from '@/components/toolbar/toolbar-row'
import { ToolbarTabGroup } from '@/components/toolbar/toolbar-tab-group'
import { TEXT_DOWNLOAD, TEXT_FILE } from '@/consts'
import { AnnotationDataFrame } from '@/lib/dataframe/annotation-dataframe'
import { useGenomes } from '@/lib/edb/genome'
import { makeUuid } from '@/lib/id'
import { capitalizeFirstWord } from '@/lib/text/capital-case'
import { useFooter } from '@/providers/footer-provider'
import { useCurrentSheets } from '../../../matcalc/history/history-provider/history-contexts'
import { useHistory } from '../../../matcalc/history/history-provider/history-provider'
import { useBasicSaveAs } from '../../../matcalc/hooks/save'
import { useAnnotations } from '../annotate-store'
import { useAnnotateWorker } from '../annotate-worker'
import { useOpen } from '../use-open'

export function HomeToolbar() {
  const { open: openDialog } = useDialogs()
  const { run: runAnnotate } = useAnnotateWorker()

  const { onFileChange } = useOpen()
  const { sheet } = useCurrentSheets()
  const { addSheets } = useHistory()
  const { saveAs } = useBasicSaveAs()
  const { gtf } = useGenomes()
  const { settings, updateSettings } = useAnnotations()
  const { addIndicator, remove: removeFooter } = useFooter()

  async function annotate() {
    if (!sheet || !gtf) {
      return
    }
    const id = addIndicator('Running....')

    runAnnotate(
      {
        id: makeUuid(),
        df: (sheet as AnnotationDataFrame).values,
        columns: (sheet as AnnotationDataFrame).columns,
        assembly: gtf.assembly,
        closest: settings.closest,
        tss: settings.tss,
        useOfficialGenes: settings.useOfficialGenes,
      },
      (data) => {
        const { error, table, header } = data

        if (error === null) {
          const df = new AnnotationDataFrame({ data: table, columns: header })

          addSheets([df], { name: `Annotated` })
        } else {
          openDialog({
            type: 'alert',
            payload: {
              content: capitalizeFirstWord(error) + '.',
            },
          })
        }

        removeFooter('left', id)
      }
    )

    // const dfa = await createAnnotationTable(
    //   sheet as AnnotationDataFrame,
    //   gtf.assembly,
    //   {
    //     closest: settings.closest,
    //     tss: settings.tss,
    //     useOfficialGenes: settings.useOfficialGenes,
    //   }
    // )

    // if (dfa) {
    //   addSheets([dfa], { name: `Annotated` })
    // }
  }

  return (
    <>
      <ToolbarTabGroup title={TEXT_FILE} className="items-start">
        <ToolbarOpenFile
          onClick={() => {
            openFilesDialog({
              onFileChange,
            })
          }}
        />
        <ToolbarCol>
          <ToolbarRow>
            <ToolbarColSmallButton
              title="Download table to device"
              onClick={() => saveAs()}
              icon={<DownloadIcon />}
            >
              {TEXT_DOWNLOAD}
            </ToolbarColSmallButton>
          </ToolbarRow>
          <ToolbarRow>
            <ToolbarColSmallButton
              title="Annotate locations"
              onClick={annotate}
              icon={<PlayIcon />}
            >
              Annotate
            </ToolbarColSmallButton>
          </ToolbarRow>
        </ToolbarCol>
      </ToolbarTabGroup>

      <ToolbarTabGroup title="TSS" className="gap-x-2">
        <DoubleNumericalInput
          h="sm"
          v1={settings.tss.prom5p}
          v2={settings.tss.prom3p}
          limit={[0, 1000000]}
          dp={0}
          inc={1000}
          onNumChange1={(value) =>
            updateSettings({
              ...settings,
              tss: { ...settings.tss, prom5p: value },
            })
          }
          onNumChange2={(value) =>
            updateSettings({
              ...settings,
              tss: { ...settings.tss, prom3p: value },
            })
          }
        />
      </ToolbarTabGroup>

      <ToolbarTabGroup title="Options" className="gap-x-2">
        <ToolbarCol gap="gap-x-2">
          <VCenterRow className="gap-x-1">
            <span>Closest genes:</span>
            <NumericalInput
              h="sm"
              value={settings.closest}
              onNumChange={(value) =>
                updateSettings({ ...settings, closest: value })
              }
              limit={[0, 10]}
              dp={0}
              step={1}
            />
          </VCenterRow>
          <ToolbarRow>
            <Checkbox
              checked={settings.useOfficialGenes}
              onCheckedChange={(value) =>
                updateSettings({ ...settings, useOfficialGenes: value })
              }
            >
              Official genes
            </Checkbox>
          </ToolbarRow>
        </ToolbarCol>
      </ToolbarTabGroup>
    </>
  )
}
