import { useDialogs } from '@/components/dialogs/dialogs'
import { DownloadIcon } from '@/components/icons/download-icon'
import { PlayIcon } from '@/components/icons/play-icon'
import {
  DEFAULT_PARSE_OPTS,
  filesToDataFrames,
  onTextFileChange,
  openFilesDialog,
} from '@/components/pages/open-files'
import { ToolbarButton } from '@/components/toolbar/toolbar-button'
import { ToolbarIconButton } from '@/components/toolbar/toolbar-icon-button'
import { ToolbarOpenFile } from '@/components/toolbar/toolbar-open-files'
import { ToolbarTabGroup } from '@/components/toolbar/toolbar-tab-group'
import { TEXT_RUN, TEXT_SAVE_TABLE } from '@/consts'
import { randomHexColor } from '@/lib/color/color'
import { AnnotationDataFrame } from '@/lib/dataframe/annotation-dataframe'
import { DEFAULT_SHEET_NAME } from '@/lib/dataframe/base-dataframe'
import {
  API_PATHWAY_COLLECTIONS_URL,
  API_PATHWAY_GENES_URL,
} from '@/lib/edb/edb'
import { ICollection, IDataset, IGeneSet } from '@/lib/gsea/geneset'
import { httpFetch } from '@/lib/http/http-fetch'
import { makeUuid } from '@/lib/id'
import { range } from '@/lib/math/range'
import { sum } from '@/lib/math/sum'
import { truncate } from '@/lib/text/text'
import { useFooter } from '@/providers/footer-provider'
import { useCallback, useState } from 'react'
import { useCurrentSheets } from '../../../matcalc/history/history-provider/history-contexts'
import { useHistory } from '../../../matcalc/history/history-provider/history-provider'
import { useSave } from '../../../matcalc/hooks/save'
import { usePathways } from '../pathway-store'
import { usePathwayWorker } from '../pathway-worker'

export function HomeToolbar() {
  const { open: openDialog } = useDialogs()
  const { save } = useSave()
  const { sheets } = useCurrentSheets()

  const { openFile, addSheets } = useHistory()
  const { run: runPathway } = usePathwayWorker()
  const [validGeneSet, setValidGeneSet] = useState(new Set<string>())
  const { datasets, collectionsInUse, genesInUniverse } = usePathways()

  const { addIndicator, remove: removeFooter } = useFooter()

  const df = sheets[0] as AnnotationDataFrame

  function _open(message: string, files: FileList | []) {
    onTextFileChange(message, files, (files) => {
      if (files.length > 0) {
        filesToDataFrames(files, {
          parseOpts: {
            ...DEFAULT_PARSE_OPTS,
            colNames: files[0]!.name.includes('gmx') ? 0 : 1,
            skipRows: files[0]!.name.includes('gmx') ? 1 : 0,
          },
          onSuccess: (tables) => {
            if (tables.length > 0) {
              const table = tables[0]!
              openFile(`Load ${table.name}`, {
                sheets: [table.setName(truncate(table.name, { length: 16 }))],
              })
            }
          },
        })
      }
    })
  }

  const getValidGenes = useCallback(async () => {
    if (validGeneSet.size > 0) {
      return validGeneSet
    }

    const ret = new Set<string>()

    // Only fetch if data is missing
    try {
      const res = await httpFetch.getJson<{ data: string[] }>(
        API_PATHWAY_GENES_URL
      )

      const dataset = res.data

      for (const gene of dataset.map((g: string) => g.toLowerCase())) {
        ret.add(gene)
      }
    } catch (e) {
      console.log(e)
    }

    setValidGeneSet(ret)
    return ret
  }, [validGeneSet])

  async function runLocal() {
    //setIsRunning(true)

    if (!df) {
      return
    }

    if (df.size === 0 || df.name === DEFAULT_SHEET_NAME) {
      // addToast({
      //   id: makeUuid(),
      //   title: 'Pathway',
      //   description: 'You must load at least 1 geneset.',
      //   type: 'destructive',
      //   timeout: 10000,
      // })

      openDialog({
        type: 'alert',
        payload: {
          content: 'You must load at least 1 geneset.',
          type: 'warning',
        },
      })

      return
    }

    const genes = await getValidGenes()

    // only keep genes in approved list
    const genesets: IGeneSet[] = range(df.shape[1]).map(() => {
      return {
        id: makeUuid(),
        name: df.col(0).name.toString(),
        genes: df
          .col(0)
          .strs.filter((v) => v !== '' && genes.has(v.toLowerCase())),
        color: randomHexColor(),
        type: 'geneset',
      }
    })

    if (sum(genesets.map((geneset) => geneset.genes.length)) === 0) {
      openDialog({
        type: 'alert',
        payload: {
          content:
            'None of your gene sets appear to contain valid gene symbols. Please check your input and try again.',
          type: 'error',
        },
      })

      return
    }

    const queryCollections = datasets
      .map((dataset) =>
        dataset.collections.filter(
          (collection) => collectionsInUse[collection.id]
        )
      )
      .flat()

    let fullCollections: ICollection[] = []

    try {
      const res = await httpFetch.postJson<{ data: IDataset[] }>(
        API_PATHWAY_COLLECTIONS_URL,
        {
          body: {
            ids: queryCollections.map((c) => c.id),
          },
        }
      )

      fullCollections = res.data.flatMap((dataset) => dataset.collections)
    } catch (e) {
      console.log(e)
    }

    if (fullCollections.length < 1) {
      openDialog({
        type: 'alert',
        payload: {
          content: 'You must select at least 1 collection to test.',
          type: 'warning',
        },
      })

      return
    }

    const iid = addIndicator('Calculating pathway enrichment...')

    runPathway(
      { genesets, collections: fullCollections, genesInUniverse },
      (e) => {
        const { data, columns } = e

        const dfOut = new AnnotationDataFrame({ data, columns }).setName(
          'Pathways'
        )

        console.log('Pathway analysis result:', dfOut)
        addSheets([dfOut], { name: 'Pathway' })

        // we've finished so get rid of the animations
        removeFooter('left', iid)
      }
    )
  }

  return (
    <>
      <ToolbarTabGroup title="File">
        <ToolbarOpenFile
          onClick={() => {
            openFilesDialog({
              onFileChange: _open,
            })
          }}
        />

        <ToolbarIconButton
          onClick={() => {
            openDialog({
              type: 'save',
              payload: {
                callback: (data) => {
                  save(data.name, data.format.ext!)
                },
              },
            })
          }}
          title={TEXT_SAVE_TABLE}
        >
          <DownloadIcon />
        </ToolbarIconButton>
      </ToolbarTabGroup>

      <ToolbarTabGroup title="Pathways">
        <ToolbarButton
          onClick={() => runLocal()}
          aria-label="Run pathway analysis"
        >
          <PlayIcon />
          <span>{TEXT_RUN}</span>
        </ToolbarButton>

        {/* <Tooltip content="Create bar plot">
                  <ToolbarButton aria-label="Create bar plot" onClick={makeBarPlot}>
                    Bar Plot
                  </ToolbarButton>
                </Tooltip> */}
      </ToolbarTabGroup>
    </>
  )
}
