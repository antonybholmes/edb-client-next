import { type IModalProps } from '@/dialogs/ok-cancel-dialog'
import { useEffect, useState } from 'react'

import { useEdbAuth } from '@/components/edb/auth/edb-auth'
import { API_GEX_DATASETS_URL, API_GEX_URL } from '@/components/edb/edb'
import { httpFetch } from '@/lib/http/http-fetch'
import { bearerHeaders } from '@/lib/http/urls'

import { TEXT_NA, TEXT_OK, TIME_5_MINUTES_MS } from '@/consts'
import { BaseCol } from '@/layout/base-col'
import { DEFAULT_PALETTE } from '@/lib/color/palette'
import { SelectItem, SelectList } from '@/themed/v2/select'

import { makeNewGroup, type IClusterGroup } from '@/lib/cluster-group'
import { AnnotationDataFrame } from '@/lib/dataframe/annotation-dataframe'
import { textToLines } from '@/lib/text/lines'
import { produce } from 'immer'

import { GlassSideDialog } from '@/dialogs/glass-side-dialog'
import { DataFrame } from '@/lib/dataframe/dataframe'

import { Textarea } from '@/themed/textarea'

import { getAccordionId } from '@/dialogs/settings/settings-dialog'
import { HelpButton } from '@/help/help-button'
import { makeUuid } from '@/lib/id'
import { Toast } from '@base-ui/react/toast'
import { useMatcalcSettings } from '../../settings/matcalc-settings'
import type { IGexDataset, IGexSearchResult } from './gex-store'
import { SampleDataTypeCombo } from './sample-datatype-combo'

import {
  ActionCheckRow,
  ActionDialogCard,
  ActionDialogCardContent,
  ActionDialogRow,
} from '@/components/dialogs/card/action-dialog-card'
import { Checkbox } from '@/components/shadcn/ui/themed/v2/check-box'
import { appsConfig } from '@/config/apps'
import type { UndefStr } from '@/lib/text/text'
import { useQuery } from '@tanstack/react-query'
import { useHistory } from '../../history/history-provider/history-provider'
import { GexDialogSidePanel, TECHNOLOGIES } from './gex-dialog-side-panel'
// const DEFAULT_SAMPLE_DATA_TYPES = ['COO', 'Lymphgen']

// const STANDARD_SAMPLE_DATA_TYPE_REGEX = /(coo|lymphgen)/i

const COO_COLORMAP: Readonly<Record<string, string>> = Object.freeze({
  abc: '#6495ED', // cornflowerblue
  gcb: '#FFA500', // orange
  unclass: '#3cb371', // mediumseagreen
  u: ' #3cb371',
  unc: ' #3cb371',
  na: '#C0C0C0',
})

const GC_COLORMAP: Readonly<Record<string, string>> = Object.freeze({
  n: '#8c8c8c',
  gc: '#3CB371',
  m: '#ffcc00',
  dz: '#0066cc',
  lz: '#ff0000',
})

export interface IProps extends IModalProps {
  open?: boolean
}

export function GexDialog({ open = true, onResponse = undefined }: IProps) {
  const { settings, updateSettings } = useMatcalcSettings()

  const [technology, setTechnology] = useState<string>('RNA-seq')
  //const [datasets, setDatasets] = useState<IGexDataset[]>([])
  const [datasetMap, setDatasetMap] = useState<Map<string, IGexDataset>>(
    new Map<string, IGexDataset>()
  )
  const [accordionValues, setAccordionValues] = useState<string[]>([])

  const { add: addToast } = Toast.useToastManager()

  //const [addAltNames, setAddAltNames] = useState(false)

  const [exprType, setExprType] = useState<string>('TPM')

  // const [datasetUseMap, setDatasetsInUseMap] = useState<Map<string, boolean>>(
  //   new Map<string, boolean>()
  // )

  const [dataset, setDataset] = useState<IGexDataset | undefined>(undefined)

  const { openFile } = useHistory()

  const [text, setText] = useState<string>(
    settings.apps.gex.genes.length > 0
      ? settings.apps.gex.genes.join('\n')
      : process.env.NODE_ENV === 'development'
        ? 'BCL6\nPRDM1\nKMT2D'
        : ''
  )

  //const [confirmClear, setConfirmClear] = useState(false)

  // const [addSampleMetadataToNames, setAddSampleMetadataToNames] =
  //   useState(false)

  const [sampleDataTypes, setSampleDataTypes] = useState<string[]>([])

  const [sampleDataTypeUseMap, setSampleDataTypeUseMap] = useState<
    Map<string, boolean>
  >(new Map<string, boolean>())

  const [groupSampleDataType, setGroupSampleDataType] = useState<string[]>([])

  const [institutions, setInstitutions] = useState<string[]>([])
  const [instituteMap, setInstituteMap] = useState<Map<string, IGexDataset[]>>(
    new Map<string, IGexDataset[]>()
  )

  const { fetchAccessToken } = useEdbAuth()

  const { data: datasetData } = useQuery({
    queryKey: ['datasets', settings.apps.gex.genome, technology],
    staleTime: TIME_5_MINUTES_MS, // 5 minutes
    queryFn: async () => {
      const accessToken = await fetchAccessToken()

      if (!accessToken) {
        return null
      }

      const params = new URLSearchParams({
        genome: settings.apps.gex.genome,
        technology,
      })

      const res = await httpFetch.getJson<{ data: IGexDataset[] }>(
        `${API_GEX_DATASETS_URL}?${params.toString()}`,
        { headers: bearerHeaders(accessToken) }
      )

      return res.data
    },
  })

  useEffect(() => {
    async function loadDatasets() {
      try {
        // convert data to translate certain strings to numbers
        const datasets = datasetData!.map((dataset) => {
          return produce(dataset, (draft) => {
            draft.samples = dataset.samples.map((sample) => {
              return produce(sample, (draftSample) => {
                const entries = sample.metadata.map((m) => {
                  const v = Number(m.value)

                  return {
                    name: m.name,
                    value: !Number.isNaN(v) ? v : m.value,
                    color: m.color,
                  }
                })

                draftSample.metadata = entries
              })
            })
          })
        })

        //setDatasets(datasets)

        setDatasetMap(
          new Map<string, IGexDataset>(
            datasets.map((dataset) => [dataset.id, dataset])
          )
        )

        if (datasets.length > 0) {
          // check if the datasets the user already chose are selected

          const previouslySelected = datasets.filter((dataset) =>
            settings.apps.gex.selectedDatasets.includes(dataset.id)
          )

          if (previouslySelected.length > 0) {
            // we found one the use already selected, so highlight that

            setDataset(previouslySelected[0]!)
          } else {
            // nothing was selected, so just auto select the first dataset

            setDataset(datasets[0]!)
          }
        }

        const instituteMap = new Map<string, IGexDataset[]>()

        for (const dataset of datasets) {
          if (!instituteMap.has(dataset.institution)) {
            instituteMap.set(dataset.institution, [])
          }

          instituteMap.get(dataset.institution)?.push(dataset)
        }

        const institutions = [
          ...[...instituteMap.keys()]
            .filter(
              (inst) => inst === appsConfig.matcalc.apps.gex.defaultInstitution
            )
            .sort(),

          ...[...instituteMap.keys()]
            .filter(
              (inst) => inst !== appsConfig.matcalc.apps.gex.defaultInstitution
            )
            .sort(),
        ]

        setInstituteMap(instituteMap)
        setInstitutions(institutions)
        setAccordionValues(institutions.map((ins) => getAccordionId(ins)))
      } catch {
        console.error('error loading datasets from remote')
      }
    }

    if (datasetData) {
      loadDatasets()
    }
  }, [datasetData])

  useEffect(() => {
    const defaultTechnologies = TECHNOLOGIES.filter((t) =>
      t.includes(settings.apps.gex.technology)
    )

    if (defaultTechnologies.length > 0) {
      setTechnology(defaultTechnologies[0]!)
    }
  }, [TECHNOLOGIES])

  useEffect(() => {
    if (!dataset) {
      return
    }

    let defaultGexTypes = dataset.exprTypes.filter((t) =>
      t.name.includes(settings.apps.gex.gexType)
    )

    if (defaultGexTypes.length === 0) {
      // Can't find the type in the technology, so see if we have tpm
      defaultGexTypes = dataset.exprTypes.filter((t) => t.name.includes('TPM'))

      if (defaultGexTypes.length === 0) {
        // No TPM, so just pick the first one
        defaultGexTypes = [dataset.exprTypes[0]!]
      }

      updateSettings(
        produce(settings, (draft) => {
          draft.apps.gex.gexType = defaultGexTypes[0]!.name
        })
      )
    }

    setExprType(defaultGexTypes[0]!.name)

    const types = [
      ...new Set(
        dataset.samples
          .map((sample) => sample.metadata.map((m) => m.name))
          .flat()
      ),
    ].sort()

    if (types.length > 0) {
      setSampleDataTypes([
        //...DEFAULT_SAMPLE_DATA_TYPES,

        ...types,
      ])

      if (types.includes('COO')) {
        // pick something we know people are interested in
        setSampleDataTypeUseMap(new Map<string, boolean>([['COO', true]]))
        setGroupSampleDataType(['COO'])
      } else {
        // oh well, just pick the first item in the menu as a guess
        setSampleDataTypeUseMap(new Map<string, boolean>([[types[0]!, true]]))
        setGroupSampleDataType([types[0]!])
      }
    }
  }, [dataset])

  async function fetchGex() {
    if (!technology) {
      addToast({
        id: makeUuid(),
        title: appsConfig.matcalc.apps.gex.title,
        description: 'You must select a platform.',
        type: 'destructive',
      })

      return
    }

    const genes = textToLines(text, { trim: true })

    if (genes.length === 0) {
      addToast({
        id: makeUuid(),
        title: 'Gene Expression',
        description: 'You must enter some genes to search for.',
        type: 'destructive',
      })

      return
    }

    if (!dataset) {
      return
    }

    const selectedDatasets = [dataset]

    if (selectedDatasets.length === 0) {
      addToast({
        id: makeUuid(),
        title: 'Gene Expression',
        description: 'You must select a dataset.',
        type: 'destructive',
      })

      return
    }

    try {
      const accessToken = await fetchAccessToken()

      if (!accessToken) {
        addToast({
          id: makeUuid(),
          title: appsConfig.matcalc.apps.gex.title,
          description:
            'You do not have permission to download data from this module. Please contact your adminstrator to get access.',
          type: 'destructive',
        })

        return
      }

      const res = await httpFetch.postJson<{ data: IGexSearchResult[] }>(
        `${API_GEX_URL}/types/${exprType}/expression`,
        {
          body: {
            genes,
            datasets: selectedDatasets.map((dataset) => dataset.id),
          },

          headers: bearerHeaders(accessToken),
        }
      )

      const searchResults: IGexSearchResult[] = res.data

      const geneResults = searchResults[0]!.probes

      // const data: number[][] = range(geneResults.length).map(gi =>
      //   searchResults
      //     .map(datasetResult => datasetResult.probes[gi]!.values)
      //     .flat()
      // )

      const data: number[][] = searchResults[0]!.probes.map(
        (probeResult) => probeResult.values
      )

      let columns: string[] = []

      if (settings.apps.gex.addSampleMetadataToColumns) {
        for (const datasetResult of searchResults) {
          const dataset = datasetMap.get(datasetResult.dataset.id)!

          for (const sample of dataset.samples) {
            const labels = [sample.name]

            for (const datatype of sampleDataTypes.filter(
              (t) => sampleDataTypeUseMap.get(t) ?? false
            )) {
              for (const m of sample.metadata) {
                if (m.name === datatype) {
                  labels.push(m.value.toString())
                  break
                }
              }
            }

            columns.push(labels.join('_'))
          }
        }
      } else {
        columns = searchResults
          .map((datasetResult) =>
            datasetMap
              .get(datasetResult.dataset.id)!
              .samples.map((sample) => sample.name)
          )
          .flat()
      }

      let geneData: string[][] = []

      // If species is mouse we use MGI id, otherwise Hugo Id for human
      let rowObsCols: string[]

      if (technology.includes('Microarray')) {
        rowObsCols = ['Probe Id', 'Gene Id', 'Gene Symbol', 'Ensembl', 'RefSeq']
      } else {
        rowObsCols = ['Gene Symbol', 'Ensembl', 'RefSeq'] //'Gene Id',
      }

      geneData = geneResults.map((geneResult) => {
        // if user wants official symbol use that if available,
        // otherwise use the original symbol from the dataset
        // which may not be standardized
        const geneSymbol = settings.apps.gex.useOfficialGeneSymbol
          ? (geneResult.probe.gene?.symbol ?? geneResult.probe?.symbol)
          : geneResult.probe.symbol

        if (technology.includes('Microarray')) {
          return [
            geneResult.probe.id,
            geneResult.probe.gene?.geneId ?? '',
            geneSymbol,
            geneResult.probe.gene?.ensembl ?? '',
            geneResult.probe.gene?.refseq ?? '',
          ]
        } else {
          return [
            //geneResult.probe.gene?.geneId ?? '',
            geneSymbol,
            geneResult.probe.gene?.ensembl ?? '',
            geneResult.probe.gene?.refseq ?? '',
          ]
        }
      })

      const rowObs = new DataFrame({
        data: geneData,
        columns: rowObsCols,
      })

      const df = new AnnotationDataFrame({
        data,
        rowObs,
        columns,
        name: `${selectedDatasets[0]!.name} ${exprType}`,
      })

      //df.setIndexName('Genes', true)

      // add alternative names

      // if (settings.apps.gex.addAltNames) {
      //   // max number of alt names we might be adding
      //   const maxAltNameCount = Math.max(
      //     ...searchResults
      //       .map(datasetResult =>
      //         datasetMap
      //           .get(datasetResult.dataset)!
      //           .samples.map(sample => sample.altNames.length)
      //       )
      //       .flat()
      //   )

      //   for (let i = 0; i < maxAltNameCount; i++) {
      //     const labels = searchResults
      //       .map(datasetResult =>
      //         datasetMap
      //           .get(datasetResult.dataset)!
      //           .samples.map(sample =>
      //             sample.altNames.length > i ? sample.altNames[i]! : ''
      //           )
      //       )
      //       .flat()

      //     df.colMetaData.setCol(`Alt Name ${i + 1}`, labels, true)
      //   }
      // }

      // add the sample meta data

      for (const datatype of sampleDataTypes.filter(
        (t) => sampleDataTypeUseMap.get(t) ?? false
      )) {
        const labels = searchResults
          .map((datasetResult) =>
            datasetMap.get(datasetResult.dataset.id)!.samples.map((sample) => {
              let ret = ''

              for (const m of sample.metadata) {
                if (m.name === datatype) {
                  ret = m.value.toString()
                  break
                }
              }

              return ret
            })
          )
          .flat()

        df.colVars.setCol(datatype, labels, true)
      }

      let groups: IClusterGroup[] = []

      if (settings.apps.gex.addGroup) {
        const groupsMap = new Map<string, string[]>()
        const groupColorMap = new Map<string, UndefStr>()
        const orderedGroupNames = []

        // using the sample order from the database, build a
        // list of clusters using the first cluster we encounter
        // that has not been assigned yet, thus the database
        // can enforce the order of the groups otherwise we
        // pick an order based on the group names
        for (const datasetResult of searchResults) {
          const dataset = datasetMap.get(datasetResult.dataset.id)!

          for (const sample of dataset.samples) {
            let t = TEXT_NA
            let color = undefined

            for (const m of sample.metadata) {
              if (m.name === groupSampleDataType[0]) {
                t = m.value.toString()
                color = m.color
                break
              }
            }

            if (!groupsMap.has(t)) {
              groupsMap.set(t, [])
              if (t !== TEXT_NA) {
                orderedGroupNames.push(t)
              }
            }

            groupColorMap.set(t, color)

            groupsMap.get(t)?.push(sample.name)
          }
        }

        // construct groups in order of appearance with
        // anything not in a group being pushed to the end in the NA group
        groups = [...orderedGroupNames, TEXT_NA]
          .filter((groupName) => groupsMap.has(groupName))
          .map((groupName, gi) => {
            const cidx = gi % DEFAULT_PALETTE.length

            // if color assigned from metadata, use that
            let color = groupColorMap.get(groupName)

            // if COO use standard COO colors
            if (!color && groupSampleDataType[0] === 'COO') {
              color = COO_COLORMAP[groupName.toLowerCase()] ?? 'gray'
            }

            if (!color && groupName.toLowerCase() in GC_COLORMAP) {
              color = GC_COLORMAP[groupName.toLowerCase()] ?? 'gray'
            }

            // otherwise, if no color, use a default color
            if (!color) {
              color = DEFAULT_PALETTE[cidx]!
            }

            // we face the issue that some sample names are prefixes of
            // others, so we need to make sure that we are only
            // matching the exact sample names
            const group: IClusterGroup = makeNewGroup({
              name: groupName,
              color,
              search: groupsMap.get(groupName)!,
              exactMatch: true,
            })

            return group
          })
      }

      // if user does not want to add groups, then we need to
      // make sure that the groups are empty
      //addGroups(groups, 'set')

      openFile(df.name + ' GEX', {
        sheets: [df],
        groups,

        groupsName: groupSampleDataType[0] ?? 'GEX',
      })

      // cache the genes so user doesn't have to keep re-entering them
      updateSettings(
        produce(settings, (draft) => {
          draft.apps.gex.genes = genes
        })
      )

      // if everthing works, finally respond with ok
      onResponse?.(TEXT_OK)
    } catch (e) {
      console.error(e)
      addToast({
        id: makeUuid(),
        title: 'Gene Expression',
        description:
          'You do not have permission to download data from this module. Please contact your adminstrator to get access.',
        type: 'destructive',
      })
    }
  }

  // radio buttons don't seem to like init of null so make sure we
  // have a dataset to select
  // if (!dataset) {
  //   return null
  // }

  return (
    <GlassSideDialog
      cols={3}
      title={appsConfig.matcalc.apps.gex.title}
      open={open}
      onResponse={(response, data) => {
        if (response === TEXT_OK) {
          fetchGex()
        } else {
          onResponse?.(response, data)
        }
      }}
      buttons={[TEXT_OK]}
      leftFooterChildren={
        <HelpButton url="/help/apps/matcalc/gene-expression" />
      }
    >
      <GexDialogSidePanel
        technology={technology}
        setTechnology={setTechnology}
        setDataset={setDataset}
        datasetMap={datasetMap}
        institutions={institutions}
        instituteMap={instituteMap}
        accordionValues={accordionValues}
        dataset={dataset}
      />

      {/* Main panel */}
      <>
        <BaseCol className="grow gap-y-2">
          <BaseCol className="gap-y-1">
            <Textarea
              id="Genes"
              aria-label="Genes"
              label="Genes"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="grow h-42" // rounded-theme border border-border overflow-hidden outline-hidden placeholder:text-muted-foreground"
            />
          </BaseCol>

          <ActionDialogCard>
            <ActionDialogCardContent>
              <ActionDialogRow title="Expression">
                <SelectList
                  w="lg"
                  value={exprType}
                  onValueChange={(value) => {
                    if (dataset) {
                      const matches = dataset.exprTypes.filter(
                        (t) => t.name === value
                      )

                      if (matches.length > 0) {
                        setExprType(matches[0]!.name)
                        updateSettings(
                          produce(settings, (draft) => {
                            draft.apps.gex.gexType = matches[0]!.name
                          })
                        )
                      }
                    }
                  }}
                >
                  {dataset && (
                    <>
                      {dataset.exprTypes.map((t, ti) => (
                        <SelectItem value={t.name} key={ti}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectList>
              </ActionDialogRow>

              <ActionDialogRow title="Sample Info">
                <SampleDataTypeCombo
                  selectedValues={sampleDataTypes.filter(
                    (t) => sampleDataTypeUseMap.get(t) ?? false
                  )}
                  values={sampleDataTypes}
                  setValue={(value, selected) => {
                    setSampleDataTypeUseMap(
                      new Map<string, boolean>([
                        ...[...sampleDataTypeUseMap.entries()],
                        [value, selected],
                      ])
                    )
                  }}
                  w="lg"
                />
              </ActionDialogRow>

              <ActionCheckRow
                title="Add sample info to column names"
                checked={settings.apps.gex.addSampleMetadataToColumns}
                onCheckedChange={(v) => {
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.apps.gex.addSampleMetadataToColumns = v
                    })
                  )
                }}
              />

              <ActionCheckRow
                title="Add alternative names to columns"
                checked={settings.apps.gex.addAltNames}
                onCheckedChange={(v) => {
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.apps.gex.addAltNames = v
                    })
                  )
                }}
              />

              <ActionDialogRow
                title="Groups"

                justify="start"
              >
                <Checkbox
                  checked={settings.apps.gex.addGroup}
                  onCheckedChange={(v) => {
                    updateSettings(
                      produce(settings, (draft) => {
                        draft.apps.gex.addGroup = v
                      })
                    )
                  }}
                >
                  Create
                </Checkbox>
                <SampleDataTypeCombo
                  selectedValues={groupSampleDataType}
                  values={sampleDataTypes}
                  setValue={(value) => {
                    setGroupSampleDataType([value])
                  }}
                  className="w-48"
                />
              </ActionDialogRow>

              <ActionCheckRow
                title="Use official gene symbol"
                info="Use the official gene symbol in place of the original symbol if available."
                checked={settings.apps.gex.useOfficialGeneSymbol}
                onCheckedChange={(v) => {
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.apps.gex.useOfficialGeneSymbol = v
                    })
                  )
                }}
              />
            </ActionDialogCardContent>
          </ActionDialogCard>
        </BaseCol>
      </>
    </GlassSideDialog>
  )
}
