'use client'

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@/themed/v2/accordion'

import { Checkbox } from '@/themed/v2/check-box'

import { PropsPanel } from '@/components/props-panel'

//import { toast } from '@/themed/use-toast'

import { NumericalInput } from '@/components/shadcn/ui/themed/numerical-input'
import { InfoHoverCard } from '@/components/shadcn/ui/themed/v2/hover-card'
import { useEffect, useMemo, useState } from 'react'

import { VCenterRow } from '@/components/layout/v-center-row'
import { SelectAll } from '@/components/select-all'
import {
  usePathways,
  type ICollectionInfo,
  type IDatsetInfo,
} from './pathway-store'

export function PathwayPropsPanel() {
  const {
    datasets,
    collectionsInUse,
    setCollectionsInUse,
    setSelectAllCollections,
    genesInUniverse,
    setGenesInUniverse,
  } = usePathways()

  const filteredDatasets = useMemo(
    () => datasets.filter((dataset) => dataset.collections.length > 0),
    [datasets]
  )

  const [values, setValues] = useState<string[]>(
    filteredDatasets.map((dataset) => dataset.name)
  )

  useEffect(() => {
    setValues(filteredDatasets.map((dataset) => dataset.name))
  }, [filteredDatasets])

  return (
    <PropsPanel className="gap-y-2 pr-1 text-xs">
      <VCenterRow className="gap-x-2">
        <span>Genes</span>

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
      </VCenterRow>

      <SelectAll
        className="pl-1.5"
        setSelectAll={(v) => {
          setSelectAllCollections(v)
        }}
      />

      <ScrollAccordion
        value={values}
        onValueChange={(v) => setValues(v as string[])}
      >
        {filteredDatasets.map((dataset: IDatsetInfo, oi) => {
          return (
            <AccordionItem
              value={dataset.name}
              key={oi}
              className="flex flex-col gap-y-1"
            >
              <AccordionTrigger>{dataset.name}</AccordionTrigger>
              <AccordionContent>
                <ul className="flex flex-col gap-y-1.5">
                  {dataset.collections.map(
                    (collection: ICollectionInfo, di: number) => (
                      <li key={di}>
                        <Checkbox
                          aria-label={`Use collection ${collection.name}`}
                          checked={collectionsInUse[collection.id]}
                          onCheckedChange={() => {
                            setCollectionsInUse({
                              ...collectionsInUse,
                              [collection.id]: !collectionsInUse[collection.id],
                            })
                          }}
                        >
                          {`${collection.name} (${collection.genesets.toLocaleString()})`}
                        </Checkbox>
                      </li>
                    )
                  )}
                </ul>
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </ScrollAccordion>
    </PropsPanel>
  )
}
