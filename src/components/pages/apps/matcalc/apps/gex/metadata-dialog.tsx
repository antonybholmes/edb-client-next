import { type IModalProps } from '@dialog/ok-cancel-dialog'
import { useEffect, useState } from 'react'

import { queryClient } from '@/query'
import { ToggleButtons, ToggleButtonTriggers } from '@components/toggle-buttons'
import { API_GEX_DATASETS_URL, API_GEX_TECHNOLOGIES_URL } from '@lib/edb/edb'
import { httpFetch } from '@lib/http/http-fetch'
import { bearerHeaders } from '@lib/http/urls'

import { TEXT_OK } from '@/consts'
import { BaseCol } from '@layout/base-col'
import { Checkbox } from '@themed/check-box'

import { AnnotationDataFrame } from '@lib/dataframe/annotation-dataframe'
import { useQuery } from '@tanstack/react-query'
import { produce } from 'immer'

import { VScrollPanel } from '@components/v-scroll-panel'
import { CheckPropRow } from '@dialog/check-prop-row'
import { GlassSideDialog } from '@dialog/glass-side-dialog'
import { toast } from '@themed/crisp'
import { useHistory } from '../../history/history-store'

import { useEdbAuth } from '@lib/edb/edb-auth'
import { useMatcalcSettings } from '../../settings/matcalc-settings'
import type { IGexDataset, IGexTechnology } from './gex-store'

// const DEFAULT_SAMPLE_DATA_TYPES = ['COO', 'Lymphgen']

// const STANDARD_SAMPLE_DATA_TYPE_REGEX = /(coo|lymphgen)/i

const SPECIES = ['Human', 'Mouse']

export interface IProps extends IModalProps {
  open?: boolean
}

export function GexMetadataDialog({
  open = true,

  onResponse = undefined,
}: IProps) {
  const { settings, updateSettings } = useMatcalcSettings()

  const [platform, setPlatform] = useState<IGexTechnology | null>(null)
  const [datasets, setDatasets] = useState<IGexDataset[]>([])
  const [datasetMap, setDatasetMap] = useState<Map<string, IGexDataset>>(
    new Map<string, IGexDataset>()
  )
  const [species, setSpecies] = useState<string>(SPECIES[0]!)

  const [institutions, setInstitutions] = useState<string[]>([])
  const [instituteMap, setInstituteMap] = useState<Map<string, IGexDataset[]>>(
    new Map<string, IGexDataset[]>()
  )

  //const [addAltNames, setAddAltNames] = useState(false)

  const [datasetUseMap, setDatasetUseMap] = useState<Map<string, boolean>>(
    new Map<string, boolean>()
  )

  const { openBranch } = useHistory()

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
    const accessToken = await fetchAccessToken()

    if (!accessToken) {
      return
    }

    let datasets: IGexDataset[] = []

    try {
      const res = await queryClient.fetchQuery({
        queryKey: ['datasets'],
        queryFn: () => {
          return httpFetch.getJson<{ data: IGexDataset[] }>(
            `${API_GEX_DATASETS_URL}/${species}/${platform?.name ?? ''}`,
            { headers: bearerHeaders(accessToken) }
          )
        },
      })

      console.log(res.data)

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

    // make the first one selected
    if (datasets.length > 0) {
      setDatasetUseMap(
        new Map<string, boolean>([[datasets[0]!.publicId, true]])
      )
    }

    setDatasetMap(
      new Map<string, IGexDataset>(
        datasets.map((dataset) => [dataset.publicId, dataset])
      )
    )

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
  }

  const { data: platformData } = useQuery({
    queryKey: ['repoData'],
    queryFn: () =>
      httpFetch.getJson<{ data: IGexTechnology[] }>(API_GEX_TECHNOLOGIES_URL),
  })

  useEffect(() => {
    if (platformData?.data) {
      const defaultPlatforms = platformData.data.filter((t) =>
        t.name.includes('RNA')
      )

      if (defaultPlatforms.length > 0) {
        setPlatform(defaultPlatforms[0]!)
      }
    }
  }, [platformData?.data])

  useEffect(() => {
    if (!platform) {
      return
    }

    loadDatasets()

    //loadValueTypes()
  }, [platform])

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

  async function fetchMetadata() {
    if (!platform) {
      toast({
        title: 'Gene Expression',
        description: 'You must select a platform.',
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

    const selectedDataset = selectedDatasets[0]!

    const data: string[][] = []

    const maxAltNameCount = Math.max(
      ...selectedDataset.samples.map((sample) => sample.altNames.length)
    )

    for (const sample of selectedDataset.samples) {
      let row: string[] = []

      if (settings.apps.gex.addAltNames) {
        row = row.concat(sample.altNames)
      }

      row = row.concat(sample.metadata.map((m) => m.value.toString()))

      data.push(row)
    }

    let columns: string[] = []

    if (settings.apps.gex.addAltNames) {
      for (let i = 0; i < maxAltNameCount; i++) {
        columns.push(`Alt Name ${i + 1}`)
      }
    }

    columns = columns.concat(
      selectedDataset.samples[0]!.metadata.map((m) => m.name)
    )

    console.log(columns, 'columns')
    console.log(data, 'data')

    const df = new AnnotationDataFrame({
      data,
      index: selectedDataset.samples.map((sample) => sample.name),
      columns,
      name: `${selectedDataset.name} metadata`,
    })

    df.setIndexName('Sample')

    openBranch('Open GEX data', [df])

    // if everthing works, finally respond with ok
    onResponse?.(TEXT_OK)
  }

  return (
    <GlassSideDialog
      title="Gene Expression Metadata"
      open={open}
      onResponse={(response, data) => {
        if (response === TEXT_OK) {
          fetchMetadata()
        } else {
          onResponse?.(response, data)
        }
      }}
      buttons={[TEXT_OK]}
      headerChildren={
        <ToggleButtons
          value={platform?.name ?? ''}
          onTabChange={(selectedTab) => {
            if (platformData?.data) {
              const defaultPlatforms = platformData.data.filter(
                (t) => t.name === selectedTab.tab.id
              )

              if (defaultPlatforms.length > 0) {
                setPlatform(defaultPlatforms[0]!)
              }
            }
          }}
          tabs={platformData?.data.map((p) => ({ id: p.name })) ?? []}
        >
          <ToggleButtonTriggers
            className="rounded-theme overflow-hidden"
            variant="outline"
            defaultWidth={5.5}
          />
        </ToggleButtons>
      }
    >
      <VScrollPanel>
        <ul className="flex flex-col gap-y-4">
          {institutions.map((institution) => {
            return (
              <li key={institution} className="flex flex-col gap-y-1">
                <h2 className="text-sm font-semibold">{institution}</h2>

                <ul className="flex flex-col gap-y-1">
                  {instituteMap.get(institution)?.map((dataset) => {
                    return (
                      <li key={dataset.publicId}>
                        <Checkbox
                          checked={datasetUseMap.get(dataset.publicId) ?? false}
                          onCheckedChange={() => {
                            setDatasetUseMap(
                              new Map<string, boolean>([
                                [dataset.publicId, true],
                              ])
                            )
                          }}
                        >
                          {dataset.name}
                        </Checkbox>
                      </li>
                    )
                  })}
                </ul>
              </li>
            )
          })}
        </ul>
      </VScrollPanel>

      <>
        <BaseCol className="grow gap-y-2">
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
