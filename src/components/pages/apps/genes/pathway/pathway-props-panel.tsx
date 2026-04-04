// 'use client'

import { TEXT_SELECT_ALL } from '@/consts'

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@/themed/v2/accordion'

import { Checkbox } from '@/themed/v2/check-box'

import { PropsPanel } from '@/components/props-panel'

//import { toast } from '@/themed/use-toast'

import { VCenterRow } from '@/components/layout/v-center-row'
import { Button } from '@/components/shadcn/ui/themed/v2/button'

import { PropRow } from '@/components/dialog/prop-row'
import { NumericalInput } from '@/components/shadcn/ui/themed/numerical-input'
import { InfoHoverCard } from '@/components/shadcn/ui/themed/v2/hover-card'
import { useEffect, useState } from 'react'
import {
  makeDatasetId,
  usePathways,
  type IDatasetInfo,
  type IOrgInfo,
} from './pathway-store'

export function PathwayPropsPage() {
  const {
    datasets,
    datasetsForUse,
    selectAllDatasets,
    setDatasetsForUse,
    setSelectAllDatasets,
    genesInUniverse,
    setGenesInUniverse,
  } = usePathways()

  const [values, setValues] = useState<string[]>(datasets.map(org => org.name))

  useEffect(() => {
    setValues(datasets.map(org => org.name))
  }, [datasets])

  return (
    <PropsPanel className="gap-y-2 pr-1 text-xs">
      <PropRow title="Genes">
        <NumericalInput
          value={genesInUniverse}
          onNumChange={setGenesInUniverse}
          w="sm"
          limit={[0, 100000]}
          step={1}
          dp={0}
        />
        <InfoHoverCard>
          The background set of genes used for the hypergeometric test.
        </InfoHoverCard>
      </PropRow>
      <VCenterRow>
        <Button
          variant="link"
          pad="xs"
          aria-label="Select all gene sets"
          checked={selectAllDatasets}
          onClick={() => setSelectAllDatasets(!selectAllDatasets)}
        >
          {TEXT_SELECT_ALL}
        </Button>
      </VCenterRow>
      <ScrollAccordion
        variant="sidebar"
        value={values}
        onValueChange={v => setValues(v as string[])}
      >
        {datasets.map((org: IOrgInfo, oi) => {
          return (
            <AccordionItem
              value={org.name}
              key={oi}
              className="flex flex-col gap-y-1"
            >
              <AccordionTrigger variant="sidebar">{org.name}</AccordionTrigger>
              <AccordionContent variant="sidebar">
                <ul className="flex flex-col gap-y-1.5">
                  {org.datasets.map((dataset: IDatasetInfo, di: number) => (
                    <li key={di}>
                      <Checkbox
                        aria-label={`Use dataset ${dataset.name}`}
                        checked={datasetsForUse[makeDatasetId(dataset)]}
                        onCheckedChange={() => {
                          setDatasetsForUse({
                            ...datasetsForUse,
                            [makeDatasetId(dataset)]:
                              !datasetsForUse[makeDatasetId(dataset)],
                          })
                        }}
                      >
                        {`${dataset.name} (${dataset.pathways.toLocaleString()})`}
                      </Checkbox>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </ScrollAccordion>
    </PropsPanel>
  )
}
