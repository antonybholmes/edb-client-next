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

import { useEffect, useState } from 'react'

import { SelectAll } from '@/components/select-all'
import { usePathways } from '../pathway/pathway-store'

export function GeneSetsPropsPanel() {
  const {
    datasets: datasetsFromDb,
    collectionsInUse,
    setCollectionsInUse,
    setSelectAllCollections: setSelectAllDatasets,
  } = usePathways({ selectAll: false })

  const [values, setValues] = useState<string[]>([])

  useEffect(() => {
    const id = datasetsFromDb
      .map((dataset) => dataset.collections)
      .flat()
      .find((collection) => collection.name === 'signaturedb.v2022')?.id

    if (id) {
      setCollectionsInUse({ [id]: true })
    }

    setValues(datasetsFromDb.map((dataset) => dataset.id))
  }, [datasetsFromDb])

  return (
    <PropsPanel className="gap-y-2 pr-1 text-xs">
      {/* <PropRow title="Genes">
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
      </PropRow> */}

      <SelectAll
        className="pl-1"
        setSelectAll={(v) => {
          setSelectAllDatasets(v)
        }}
      />

      <ScrollAccordion
        value={values}
        onValueChange={(v) => setValues(v as string[])}
      >
        {datasetsFromDb.map((dataset) => {
          return (
            <AccordionItem
              value={dataset.id}
              key={dataset.id}
              className="flex flex-col gap-y-1"
            >
              <AccordionTrigger>{dataset.name}</AccordionTrigger>
              <AccordionContent>
                <ul className="flex flex-col gap-y-1.5">
                  {dataset.collections.map((collection) => (
                    <li key={collection.id}>
                      <Checkbox
                        aria-label={`Use dataset ${collection.name}`}
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
