import { type IModalProps } from '@dialog/ok-cancel-dialog'
import { useEffect, useState } from 'react'

import { queryClient } from '@/query'
import { API_GEX_DATASETS_URL, API_GEX_EXP_URL } from '@lib/edb/edb'
import { useEdbAuth } from '@lib/edb/edb-auth'
import { httpFetch } from '@lib/http/http-fetch'
import { bearerHeaders } from '@lib/http/urls'

import { TEXT_NA, TEXT_OK } from '@/consts'
import { BaseCol } from '@layout/base-col'
import { DEFAULT_PALETTE } from '@lib/color/palette'
import { Checkbox } from '@themed/check-box'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@themed/select'

import { makeNewGroup, type IClusterGroup } from '@lib/cluster-group'
import { AnnotationDataFrame } from '@lib/dataframe/annotation-dataframe'
import { range } from '@lib/math/range'
import { textToLines } from '@lib/text/lines'
import { produce } from 'immer'

import { CheckPropRow } from '@dialog/check-prop-row'
import { GlassSideDialog } from '@dialog/glass-side-dialog'
import { PropRow } from '@dialog/prop-row'
import { DataFrame } from '@lib/dataframe/dataframe'
import { storeItem } from '@lib/storage'
import { toast } from '@themed/crisp'
import { Textarea } from '@themed/textarea'
import { useHistory } from '../../history/history-store'

import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/components/shadcn/ui/themed/toggle-group'
import {
  getAccordionId,
  SettingsAccordionItem,
} from '@components/dialog/settings/settings-dialog'
import { ChevronUpDownIcon } from '@components/icons/chevron-up-down-icon'
import { ExternalLinkIcon } from '@components/icons/external-link'
import { HCenterRow } from '@components/layout/h-center-row'
import { VCenterRow } from '@components/layout/v-center-row'
import { ScrollAccordion } from '@components/shadcn/ui/themed/accordion'
import { DropdownMenuButton } from '@components/shadcn/ui/themed/dropdown-menu-button'
import { InfoHoverCard } from '@components/shadcn/ui/themed/hover-card'
import {
  Popover,
  PopoverContent,
  PopoverSpeechArrow,
  PopoverTrigger,
} from '@components/shadcn/ui/themed/popover'
import { HelpButton } from '@help/help-button'
import { useMatcalcSettings } from '../../settings/matcalc-settings'
import type { IGexDataset, IGexSearchResult, IGexTechnology } from './gex-store'
import { metadataToShared } from './gex-utils'
import { SampleDataTypeCombo } from './sample-datatype-combo'

// const DEFAULT_SAMPLE_DATA_TYPES = ['COO', 'Lymphgen']

// const STANDARD_SAMPLE_DATA_TYPE_REGEX = /(coo|lymphgen)/i

const SPECIES = ['Human', 'Mouse']

const TECHNOLOGIES: IGexTechnology[] = [
  {
    publicId: '8wyay6lyvz9f',
    name: 'RNA-seq',
    gexTypes: ['Counts', 'TPM', 'VST'],
  },
  { publicId: '4fdknkjpa95h', name: 'Microarray', gexTypes: ['RMA'] },
]

const COO_COLORMAP: Record<string, string> = {
  abc: 'cornflowerblue',
  gcb: 'orange',
  unclass: 'mediumseagreen',
  u: 'mediumseagreen',
  unc: 'mediumseagreen',
  na: 'gray',
}

export interface IProps extends IModalProps {
  open?: boolean
}

export function GexDialog({
  open = true,

  onResponse = undefined,
}: IProps) {
  const { settings, updateSettings } = useMatcalcSettings()

  const [technology, setTechnology] = useState<IGexTechnology | null>(null)
  const [datasets, setDatasets] = useState<IGexDataset[]>([])
  const [datasetMap, setDatasetMap] = useState<Map<string, IGexDataset>>(
    new Map<string, IGexDataset>()
  )

  const [accordionValues, setAccordionValues] = useState<string[]>([])

  const [institutions, setInstitutions] = useState<string[]>([])
  const [instituteMap, setInstituteMap] = useState<Map<string, IGexDataset[]>>(
    new Map<string, IGexDataset[]>()
  )

  //const [addAltNames, setAddAltNames] = useState(false)

  const [gexType, setGexType] = useState<string | undefined>(
    settings.apps.gex.gexType
  )

  const [datasetUseMap, setDatasetUseMap] = useState<Map<string, boolean>>(
    new Map<string, boolean>()
  )

  const { openBranch } = useHistory()

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

  //const [sampleDataType, setSampleDataType] = useState<string[]>(['COO'])

  const { fetchAccessToken } = useEdbAuth()

  async function loadDatasets() {
    if (!technology) {
      return
    }

    let datasets: IGexDataset[] = []

    try {
      const accessToken = await fetchAccessToken()

      if (!accessToken) {
        return
      }

      const res = await queryClient.fetchQuery({
        queryKey: ['datasets'],
        queryFn: () => {
          return httpFetch.getJson<{ data: IGexDataset[] }>(
            `${API_GEX_DATASETS_URL}/${settings.apps.gex.species}/${technology.name}`,
            { headers: bearerHeaders(accessToken) }
          )
        },
      })

      //console.log(res.data)

      // convert data to translate certain strings to numbers
      datasets = res.data.map((dataset) => {
        return produce(dataset, (draft) => {
          draft.samples = dataset.samples.map((sample) => {
            return produce(sample, (sampleDraft) => {
              const entries = sample.metadata.map((m) => {
                const v = Number(m.value)

                return { name: m.name, value: !Number.isNaN(v) ? v : m.value }
              })

              sampleDraft.metadata = entries
            })
          })
        })
      })
    } catch {
      console.error('error loading datasets from remote')
    }

    setDatasets(datasets)

    setDatasetMap(
      new Map<string, IGexDataset>(
        datasets.map((dataset) => [dataset.publicId, dataset])
      )
    )

    if (datasets.length > 0) {
      // check if the datasets the user already chose are selected

      const previouslySelected = datasets.filter((dataset) =>
        settings.apps.gex.selectedDatasets.includes(dataset.publicId)
      )

      if (previouslySelected.length > 0) {
        // we found one the use already selected, so highlight that
        setDatasetUseMap(
          new Map<string, boolean>(
            previouslySelected.map((dataset) => [dataset.publicId, true])
          )
        )
      } else {
        // nothing was selected, so just auto select the first dataset
        setDatasetUseMap(
          new Map<string, boolean>([[datasets[0]!.publicId, true]])
        )
      }
    }

    // push certain types to the top of the list because we assume
    // people will be interested in these more
    // setSampleDataTypes([
    //   ...DEFAULT_SAMPLE_DATA_TYPES,

    //   ...[
    //     ...new Set(
    //       datasets
    //         .map(dataset =>
    //           dataset.samples.map(sample => Object.keys(sample.data)).flat()
    //         )
    //         .flat()
    //         .filter(x => !x.match(STANDARD_SAMPLE_DATA_TYPE_REGEX))
    //     ),
    //   ].toSorted(),
    // ])

    const instituteMap = new Map<string, IGexDataset[]>()

    for (const dataset of datasets) {
      if (!instituteMap.has(dataset.institution)) {
        instituteMap.set(dataset.institution, [])
      }

      instituteMap.get(dataset.institution)?.push(dataset)
    }

    const institutions = [...instituteMap.keys()].sort()

    setInstituteMap(instituteMap)
    setInstitutions(institutions)
    setAccordionValues(institutions.map((ins) => getAccordionId(ins)))
  }

  // const { data: technologyData } = useQuery({
  //   queryKey: ['repoData'],
  //   queryFn: () =>
  //     httpFetch.getJson<{ data: IGexTechnology[] }>(API_GEX_TECHNOLOGIES_URL),
  // })

  //console.log(technologyData?.data)

  useEffect(() => {
    const defaultTechnologies = TECHNOLOGIES.filter((t) =>
      t.name.includes(settings.apps.gex.technology)
    )

    if (defaultTechnologies.length > 0) {
      setTechnology(defaultTechnologies[0]!)
    }
  }, [TECHNOLOGIES])

  useEffect(() => {
    if (!technology) {
      return
    }

    let defaultGexTypes = technology.gexTypes.filter((t) =>
      t.includes(settings.apps.gex.gexType)
    )

    if (defaultGexTypes.length === 0) {
      // Can't find the type in the technology, so see if we have tpm
      defaultGexTypes = technology.gexTypes.filter((t) => t.includes('TPM'))

      if (defaultGexTypes.length === 0) {
        // No TPM, so just pick the first one
        defaultGexTypes = [technology.gexTypes[0]!]
      }

      setGexType(defaultGexTypes[0])

      updateSettings(
        produce(settings, (draft) => {
          draft.apps.gex.gexType = defaultGexTypes[0]!
        })
      )
    }

    loadDatasets()

    //loadValueTypes()
  }, [technology])

  useEffect(() => {
    loadDatasets()
  }, [settings.apps.gex.species])

  useEffect(() => {
    const types = [
      ...new Set(
        datasets
          .filter((dataset) => datasetUseMap.get(dataset.publicId))
          .map((dataset) =>
            dataset.samples
              .map((sample) => sample.metadata.map((m) => m.name))
              .flat()
          )
          .flat()
        //.filter(x => !x.match(STANDARD_SAMPLE_DATA_TYPE_REGEX))
      ),
    ].toSorted()

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
  }, [datasetUseMap])

  async function fetchGex() {
    if (!technology) {
      toast({
        title: 'Gene Expression',
        description: 'You must select a platform.',
        variant: 'destructive',
      })

      return
    }

    const genes = textToLines(text, { trim: true })

    //console.log(genes)

    if (genes.length === 0) {
      toast({
        title: 'Gene Expression',
        description: 'You must enter some genes to search for.',
        variant: 'destructive',
      })

      return
    }

    const selectedDatasets = datasets.filter((dataset) =>
      datasetUseMap.get(dataset.publicId)
    )

    if (selectedDatasets.length === 0) {
      toast({
        title: 'Gene Expression',
        description: 'You must select a dataset.',
        variant: 'destructive',
      })

      return
    }

    const accessToken = await fetchAccessToken()

    if (!accessToken) {
      toast({
        title: 'Gene Expression',
        description:
          'You do not have permission to download data from this module. Please contact your adminstrator to get access.',
        variant: 'destructive',
      })

      return
    }

    try {
      const accessToken = await fetchAccessToken()

      const res = await queryClient.fetchQuery({
        queryKey: ['gex'],
        queryFn: () => {
          return httpFetch.postJson<{ data: IGexSearchResult[] }>(
            API_GEX_EXP_URL,
            {
              body: {
                species: settings.apps.gex.species,
                technology: technology.name,
                gexType,
                genes,
                datasets: selectedDatasets.map((dataset) => dataset.publicId),
              },

              headers: bearerHeaders(accessToken),
            }
          )
        },
      })

      const searchResults: IGexSearchResult[] = res.data

      const geneResults = searchResults[0]!.features

      const data: number[][] = range(geneResults.length).map((gi) =>
        searchResults
          .map((datasetResult) => datasetResult.features[gi]!.expression)
          .flat()
      )

      let columns: string[] = []

      if (settings.apps.gex.addSampleMetadataToColumns) {
        for (const datasetResult of searchResults) {
          const dataset = datasetMap.get(datasetResult.dataset)!

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
              .get(datasetResult.dataset)!
              .samples.map((sample) => sample.name)
          )
          .flat()
      }

      let geneData: string[][] = []

      // If species is mouse we use MGI id, otherwise Hugo Id for human
      let rowMetaDataColumns: string[] = [
        settings.apps.gex.species === 'Mouse' ? 'MGI Id' : 'Hugo Id',
        'Gene Symbol',
        'Ensembl',
        'RefSeq',
      ]

      if (technology.name.includes('Microarray')) {
        geneData = geneResults.map((geneResult) => [
          geneResult.probeId ?? '',
          settings.apps.gex.species === 'Mouse'
            ? geneResult.gene.mgi
            : geneResult.gene.hugo,
          geneResult.gene.geneSymbol,
          geneResult.gene.ensembl,
          geneResult.gene.refseq,
        ])

        rowMetaDataColumns = ['Probe', ...rowMetaDataColumns]
      } else {
        geneData = geneResults.map((geneResult) => [
          settings.apps.gex.species === 'Mouse'
            ? geneResult.gene.mgi
            : geneResult.gene.hugo,
          geneResult.gene.geneSymbol,
          geneResult.gene.ensembl,
          geneResult.gene.refseq,
        ])
      }

      const rowMetaData = new DataFrame({
        data: geneData,
        columns: rowMetaDataColumns,
      })

      console.log('data', data, columns, geneData, rowMetaData)

      const df = new AnnotationDataFrame({
        data,
        rowMetaData,
        columns,
        name: `${selectedDatasets[0]!.name} ${gexType}`,
      })

      //df.setIndexName('Genes', true)

      // add alternative names

      if (settings.apps.gex.addAltNames) {
        // max number of alt names we might be adding
        const maxAltNameCount = Math.max(
          ...searchResults
            .map((datasetResult) =>
              datasetMap
                .get(datasetResult.dataset)!
                .samples.map((sample) => sample.altNames.length)
            )
            .flat()
        )

        for (let i = 0; i < maxAltNameCount; i++) {
          const labels = searchResults
            .map((datasetResult) =>
              datasetMap
                .get(datasetResult.dataset)!
                .samples.map((sample) =>
                  sample.altNames.length > i ? sample.altNames[i]! : ''
                )
            )
            .flat()

          df.colMetaData.setCol(`Alt Name ${i + 1}`, labels, true)
        }
      }

      // add the sample meta data

      for (const datatype of sampleDataTypes.filter(
        (t) => sampleDataTypeUseMap.get(t) ?? false
      )) {
        const labels = searchResults
          .map((datasetResult) =>
            datasetMap.get(datasetResult.dataset)!.samples.map((sample) => {
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

        df.colMetaData.setCol(datatype, labels, true)
      }

      let groups: IClusterGroup[] = []

      if (settings.apps.gex.addGroup) {
        const groupsMap = new Map<string, string[]>()
        const orderedGroupNames = []

        for (const datasetResult of searchResults) {
          const dataset = datasetMap.get(datasetResult.dataset)!

          for (const sample of dataset.samples) {
            let t = TEXT_NA

            for (const m of sample.metadata) {
              if (m.name === groupSampleDataType[0]) {
                t = m.value.toString()
                break
              }
            }

            if (!groupsMap.has(t)) {
              groupsMap.set(t, [])
              if (t !== TEXT_NA) {
                orderedGroupNames.push(t)
              }
            }

            groupsMap.get(t)?.push(sample.name)
          }
        }

        // construct groups in order of appearance with
        // anything not in a group being pushed to the end in the NA group
        groups = [...orderedGroupNames, TEXT_NA]
          .filter((groupName) => groupsMap.has(groupName))
          .map((groupName, gi) => {
            const cidx = gi % DEFAULT_PALETTE.length
            let color = DEFAULT_PALETTE[cidx]!

            // for coo, use a predefined palette
            if (groupSampleDataType[0] === 'COO') {
              color = COO_COLORMAP[groupName.toLowerCase()] ?? 'gray'
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

        //console.log('groups', groups)
      }

      // if user does not want to add groups, then we need to
      // make sure that the groups are empty
      //addGroups(groups, 'set')

      openBranch('Open GEX data', [df], { mode: 'append', groups })

      // cache the genes so user doesn't have to keep re-entering them
      updateSettings(
        produce(settings, (draft) => {
          draft.apps.gex.genes = genes
        })
      )

      // if everthing works, finally respond with ok
      onResponse?.(TEXT_OK)
    } catch (e) {
      console.log(e)

      toast({
        title: 'Gene Expression',
        description:
          'You do not have permission to download data from this module. Please contact your adminstrator to get access.',
        variant: 'destructive',
      })
    }
  }

  return (
    <GlassSideDialog
      cols={3}
      title="Gene Expression"
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
      headerChildren={
        <>
          {/* <ToggleButtons
            value={technology?.name ?? ''}
            onTabChange={selectedTab => {
              console.log(selectedTab)
              if (technologyData?.data) {
                const defaultPlatforms = technologyData.data.filter(
                  t => t.name === selectedTab.tab.id
                )

                if (defaultPlatforms.length > 0) {
                  updateSettings(
                    produce(settings, draft => {
                      draft.apps.gex.technology = defaultPlatforms[0]!.name
                    })
                  )
                  setTechnology(defaultPlatforms[0]!)
                }
              }
            }}
            tabs={technologyData?.data.map(p => ({ id: p.name })) ?? []}
          >
            <ToggleButtonTriggers variant="tab" defaultWidth={5} />
          </ToggleButtons> */}

          {/* <HelpButton url="/help/apps/matcalc/gene-expression" /> */}
        </>
      }
    >
      <>
        <HCenterRow>
          {/* <Select
            value={`${settings.apps.gex.species} ${technology?.name ?? ''}`}
            onValueChange={v => {
              const [species, plaform] = v.split(':')

              const defaultPlatforms = TECHNOLOGIES.filter(
                t => t.name === plaform
              )

              if (defaultPlatforms.length > 0) {
                updateSettings(
                  produce(settings, draft => {
                    draft.apps.gex.technology = defaultPlatforms[0]!.name
                  })
                )
                setTechnology(defaultPlatforms[0]!)
              }

              const newOptions = produce(settings, draft => {
                draft.apps.gex.species = species!
              })

              updateSettings(newOptions)
            }}
          >
            <SelectTrigger
              variant="glass"
              className="text-sm w-[10rem]"
              aria-label="Select technology"
            >
              <SelectValue placeholder="Select technology..." />
            </SelectTrigger>
            <SelectContent>
              {SPECIES.map(species => (
                <SelectGroup key={species}>
                  <SelectLabel>{species}</SelectLabel>

                  {TECHNOLOGIES.map(t => {
                    const id = `${species} ${t.name}`
                    return (
                      <SelectItem value={id} key={id}>
                        {species} {t.name}
                      </SelectItem>
                    )
                  })}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select> */}

          <Popover>
            <PopoverTrigger className="font-bold text-xs flex flex-row items-center gap-x-4 w-48 justify-between hover:bg-muted/75 data-[state=open]:bg-muted/75 rounded-theme p-2.5 trans-color">
              <span>{`${settings.apps.gex.species} ${technology?.name ?? ''}`}</span>
              <ChevronUpDownIcon />
            </PopoverTrigger>
            <PopoverContent
              //variant="content"
              className="w-48 flex flex-col gap-y-4 relative"
              sideOffset={10}
              align="center"
            >
              <PopoverSpeechArrow />
              {/* <HCenterRow className="pt-2">
                <Tabs
                  value={settings.apps.gex.species}
                  onValueChange={(v) => {
                    updateSettings(
                      produce(settings, (draft) => {
                        draft.apps.gex.species = v
                      })
                    )
                  }}
                >
                  <IOSTabsList
                    defaultWidth="64px"
                    value={settings.apps.gex.species}
                    tabs={SPECIES.map((s) => ({ id: s }))}
                  />
                </Tabs>
              </HCenterRow> */}

              <HCenterRow className="pt-2">
                <ToggleGroup
                  //variant="outline"
                  type="single"
                  value={settings.apps.gex.species}
                  onValueChange={(v) => {
                    updateSettings(
                      produce(settings, (draft) => {
                        draft.apps.gex.species = v
                      })
                    )
                  }}
                >
                  {SPECIES.map((s) => (
                    <ToggleGroupItem
                      value={s}
                      className="w-16"
                      aria-label="Filter rows"
                    >
                      {s}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </HCenterRow>
              <ul className="flex flex-col">
                {TECHNOLOGIES.map((t) => {
                  return (
                    <li key={t.publicId}>
                      <DropdownMenuButton
                        checked={t.name === technology?.name}
                        //variant="menu"
                        animation="none"
                        // ripple={false}
                        className="w-full text-left"
                        onClick={() => {
                          updateSettings(
                            produce(settings, (draft) => {
                              draft.apps.gex.technology = t.name
                            })
                          )
                          setTechnology(t)
                        }}
                      >
                        {t.name}
                      </DropdownMenuButton>
                    </li>
                  )
                })}
              </ul>
            </PopoverContent>
          </Popover>
        </HCenterRow>
        <ScrollAccordion
          value={accordionValues}
          onValueChange={setAccordionValues}
        >
          {institutions.map((institution) => {
            return (
              <SettingsAccordionItem
                title={institution}
                value={institution}
                key={institution}
              >
                <ul className="flex flex-col gap-y-2">
                  {instituteMap.get(institution)?.map((dataset) => {
                    return (
                      <li
                        key={dataset.publicId}
                        className="flex flex-row items-center justify-between gap-x-2"
                      >
                        <VCenterRow className="gap-x-2">
                          <Checkbox
                            checked={
                              datasetUseMap.get(dataset.publicId) ?? false
                            }
                            onCheckedChange={() => {
                              setDatasetUseMap(
                                new Map<string, boolean>([
                                  [dataset.publicId, true],
                                ])
                              )

                              updateSettings(
                                produce(settings, (draft) => {
                                  draft.apps.gex.selectedDatasets = [
                                    dataset.publicId,
                                  ]
                                })
                              )
                            }}
                          />

                          <span className="text-left">{dataset.name}</span>
                        </VCenterRow>

                        <button
                          title={`View metadata of ${dataset.name}`}
                          onClick={() => {
                            const id = storeItem(
                              'table-viewer',
                              'data',
                              JSON.stringify(metadataToShared(dataset))
                            )

                            window.open(
                              `/apps/table-viewer?key=${id}`,
                              '_blank',
                              'width=800,height=600'
                            )
                          }}
                          className="opacity-30 hover:opacity-70"
                        >
                          <ExternalLinkIcon />
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </SettingsAccordionItem>
            )
          })}
        </ScrollAccordion>

        {/* <VCenterRow className="justify-end border-t border-border/50 pt-2">
          <Select
            value={settings.apps.gex.species}
            onValueChange={v => {
              const newOptions = produce(settings, draft => {
                draft.apps.gex.species = v
              })

              updateSettings(newOptions)
            }}
          >
            <SelectTrigger
              variant="glass"
              className="text-sm w-24"
              title="Select species"
            >
              <SelectValue placeholder="Select a species" />
            </SelectTrigger>
            <SelectContent>
              {SPECIES.map(species => (
                <SelectItem value={species} key={species}>
                  {species}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </VCenterRow> */}
      </>

      <>
        <BaseCol className="grow gap-y-2">
          <BaseCol className="gap-y-1">
            <Textarea
              id="Genes"
              aria-label="Genes"
              label="Genes"
              labelW=""
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="grow h-42" // rounded-theme border border-border overflow-hidden outline-hidden placeholder:text-muted-foreground"
              labelChildren={
                <InfoHoverCard title="Genes">
                  Enter a list of genes to search for, one per line.
                </InfoHoverCard>
              }
            />
          </BaseCol>

          <PropRow title="Expression">
            <Select
              value={gexType ?? ''}
              onValueChange={(value) => {
                if (technology) {
                  const matches = technology.gexTypes.filter((t) => t === value)

                  if (matches.length > 0) {
                    setGexType(matches[0])
                    updateSettings(
                      produce(settings, (draft) => {
                        draft.apps.gex.gexType = matches[0]!
                      })
                    )
                  }
                }
              }}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              {technology && (
                <SelectContent>
                  {technology.gexTypes.map((t, ti) => (
                    <SelectItem value={t} key={ti}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              )}
            </Select>
          </PropRow>

          <PropRow title="Sample Info">
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
              className="w-48"
            />
          </PropRow>

          <CheckPropRow
            title="Add group"
            checked={settings.apps.gex.addGroup}
            onCheckedChange={(v) => {
              updateSettings(
                produce(settings, (draft) => {
                  draft.apps.gex.addGroup = v
                })
              )
            }}
          >
            <SampleDataTypeCombo
              selectedValues={groupSampleDataType}
              values={sampleDataTypes}
              setValue={(value) => {
                setGroupSampleDataType([value])
              }}
              className="w-48"
            />
          </CheckPropRow>

          <CheckPropRow
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

          <CheckPropRow
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
        </BaseCol>
      </>
    </GlassSideDialog>
  )
}
