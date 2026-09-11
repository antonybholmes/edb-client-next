import { DownloadIcon } from '@/components/icons/download-icon'
import { PlayIcon } from '@/components/icons/play-icon'
import { ColorMapToolbarMenu } from '@/components/pages/apps/matcalc/color-map-menu'
import { useCurrentSheets } from '@/components/pages/apps/matcalc/history/history-provider/history-contexts'
import { useHistory } from '@/components/pages/apps/matcalc/history/history-provider/history-provider'
import { useOpenFiles } from '@/components/pages/apps/matcalc/hooks/open'
import {
  onTextFileChange,
  openFilesDialog,
} from '@/components/pages/open-files'
import { NumericalInput } from '@/components/shadcn/ui/themed/numerical-input'
import { ToolbarCol } from '@/components/toolbar/toolbar-col'
import { ToolbarColButton } from '@/components/toolbar/toolbar-col-button'
import { ToolbarIconButton } from '@/components/toolbar/toolbar-icon-button'
import { ToolbarOpenFile } from '@/components/toolbar/toolbar-open-files'
import { ToolbarRow } from '@/components/toolbar/toolbar-row'
import { ToolbarTabGroup } from '@/components/toolbar/toolbar-tab-group'
import { TEXT_OPTIONS, TEXT_PLOT, TEXT_SAVE_IMAGE } from '@/consts'
import { ColorMapName, getColorMap } from '@/lib/color/colormap'
import { BaseDataFrame } from '@/lib/dataframe/base-dataframe'
import { useFooter } from '@/providers/footer-provider'
import { useSVG } from '@/providers/svg-provider'
import { produce } from 'immer'
import { useGseaBubbleSettings } from '../../gsea-plot/bubble/gsea-bubble-settings-store'
import { newExtGseaPlot } from '../ext-gsea-provider'

import { IRankedGene, IScoreGene } from '@/lib/gsea/geneset'
import { makeUuid } from '@/lib/id'
import { argsort } from '@/lib/math/argsort'
import { range } from '@/lib/math/range'
import { IViper } from '../viper'
import { useViperWorker } from '../viper-worker'

export function dfToViper(df: BaseDataFrame): IViper {
  const genes = df.rowNames

  const scores = df.col(0).nums

  // want largest to smallest
  const idx = argsort(scores, true)

  const signature: IRankedGene[] = idx.map((originalIndex, i) => ({
    name: genes[originalIndex],
    score: scores[originalIndex],
    rank: i,
  }))

  const tfs = range(1, df.shape[1]).map((tfi) => {
    const scores = df.col(tfi).nums

    const pos: IScoreGene[] = []
    const neg: IScoreGene[] = []

    for (const gi of idx) {
      const gene: IScoreGene = { name: genes[gi], score: scores[gi] }

      if (scores[gi] === -1000) {
        continue
      }

      if (scores[gi] > 0) {
        pos.push(gene)
      } else {
        neg.push(gene)
      }
    }

    return { id: makeUuid(), name: df.colName(tfi), targets: { pos, neg } }
  })

  return { id: makeUuid(), name: 'Viper', signature, tfs }
}

export function HomeToolbar() {
  const { settings, updateSettings } = useGseaBubbleSettings()
  const { openDataFrames } = useOpenFiles({ mode: 'set' })
  const { saveAs } = useSVG()

  const { sheet } = useCurrentSheets()
  const { remove: removeFooter, addIndicator } = useFooter()

  const { addPlots } = useHistory()

  const { run: runViperWorker } = useViperWorker()

  return (
    <>
      <ToolbarTabGroup title="File">
        <ToolbarOpenFile
          onClick={() => {
            openFilesDialog({
              onFileChange: (files) => {
                onTextFileChange(files, ({ success, files }) => {
                  if (!success) {
                    return
                  }
                  openDataFrames(files, { indexCols: 1 })
                })
              },
            })
          }}
        />

        <ToolbarIconButton
          title={TEXT_SAVE_IMAGE}
          onClick={() => {
            saveAs('ext-gsea')
          }}
        >
          <DownloadIcon />
        </ToolbarIconButton>
      </ToolbarTabGroup>

      <ToolbarTabGroup title="Ext GSEA">
        <ToolbarColButton
          icon={<PlayIcon variant="app-theme" />}
          title={TEXT_PLOT}
          onClick={() => {
            const id = addIndicator('Running Viper GSEA...')

            const viper = dfToViper(sheet as BaseDataFrame)

            runViperWorker(
              {
                viper,
              },
              (data) => {
                const { results } = data

                console.log('slob', results)

                const plot = {
                  ...newExtGseaPlot('Extended GSEA', {
                    results,
                  }),
                }

                addPlots([plot], { mode: 'set' })
                // we've finished so get rid of the animations
                //closeToast(id)

                removeFooter('left', id)
              }
            )
          }}
        >
          <PlayIcon variant="app-theme" />
          {TEXT_PLOT}
        </ToolbarColButton>
      </ToolbarTabGroup>

      <ToolbarTabGroup title="Plot Size" className="gap-x-2">
        <ToolbarRow title="Width">
          <NumericalInput
            h="md"
            value={settings.axes.x.length}
            placeholder="Width"
            limit={[1, 1000]}
            dp={0}
            onNumChange={(v) => {
              updateSettings(
                produce(settings, (draft) => {
                  draft.axes.x.length = v
                })
              )
            }}
          />
        </ToolbarRow>
        <ToolbarRow title="Row Height">
          <NumericalInput
            h="md"
            value={settings.axes.y.rowHeight}
            placeholder="Row Height"
            limit={[1, 1000]}
            dp={0}
            onNumChange={(v) => {
              updateSettings(
                produce(settings, (draft) => {
                  draft.axes.y.rowHeight = v
                })
              )
            }}
          />
        </ToolbarRow>
      </ToolbarTabGroup>
      <ToolbarTabGroup title={TEXT_OPTIONS} className="gap-x-2">
        <ToolbarCol>
          <ColorMapToolbarMenu
            cmap={getColorMap(settings.scale.cmap)}
            onChange={(cmap) => {
              updateSettings(
                produce(settings, (draft) => {
                  draft.scale.cmap = cmap.id as ColorMapName
                })
              )
            }}
          />
        </ToolbarCol>
      </ToolbarTabGroup>
    </>
  )
}
