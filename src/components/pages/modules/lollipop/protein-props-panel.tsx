import { BaseCol } from '@/components/layout/base-col'
import { SearchBox } from '@components/search-box'

import { queryClient } from '@/query'
import { DownloadIcon } from '@components/icons/download-icon'
import { PropsPanel } from '@components/props-panel'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@components/shadcn/ui/themed/accordion'
import { Button } from '@components/shadcn/ui/themed/button'
import { Input } from '@components/shadcn/ui/themed/input'
import { Textarea3 } from '@components/shadcn/ui/themed/textarea3'
import { forwardRef, useContext, type ForwardedRef } from 'react'
import { ProteinContext, searchProteins } from './protein-context'

export interface IMotifDBEntry {
  name: string
  file: string
}

export const ProteinPropsPanel = forwardRef(function ProteinPropsPanel(
  {},
  ref: ForwardedRef<HTMLDivElement>
) {
  //const [search, setSearch] = useState("")

  const [proteinState, proteinDispatch] = useContext(ProteinContext)

  return (
    <>
      {/* <OKCancelDialog
        open={delGroup !== -1}
        onReponse={r => {
          if (r === TEXT_OK) {
            searchDispatch({ type: "remove", ids: [delGroup] })
          }
          setDelGroup(-1)
        }}
      >
        {`Are you sure you want to remove the ${
          delGroup !== -1 ? motifs[delGroup].name : "selected"
        } motif?`}
      </OKCancelDialog> */}

      <PropsPanel ref={ref}>
        <ScrollAccordion value={['details', 'search']}>
          <AccordionItem value="details">
            <AccordionTrigger>Details</AccordionTrigger>
            <AccordionContent>
              <BaseCol className="gap-y-2">
                <Input
                  placeholder="Name"
                  value={proteinState.protein?.name}
                  onChange={(e) => {
                    proteinDispatch({
                      type: 'update',

                      protein: {
                        ...proteinState.protein,
                        name: e.currentTarget.value,
                      },
                    })
                  }}
                  aria-label="Protein name"
                />

                <Textarea3
                  id="seq"
                  placeholder="Sequence"
                  aria-label="Protein sequence"
                  value={proteinState.protein?.seq ?? ''}
                  onChange={(e) =>
                    proteinDispatch({
                      type: 'update',

                      protein: {
                        ...proteinState.protein,
                        seq: e.currentTarget.value,
                      },
                    })
                  }
                  className="h-28"
                />

                <span className="text-foreground/50">
                  Sequence length: {proteinState.protein?.seq.length ?? 0}
                </span>
              </BaseCol>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="search">
            <AccordionTrigger>Search</AccordionTrigger>
            <AccordionContent>
              <BaseCol className="gap-y-2">
                <SearchBox
                  value={proteinState.search.text ?? ''}
                  placeholder="Search UniProt..."
                  onChange={(e) => {
                    proteinDispatch({
                      type: 'set',
                      search: {
                        ...proteinState.search,
                        text: e.currentTarget.value,
                      },
                    })
                  }}
                  onSearch={async (event) => {
                    if (event === 'search') {
                      try {
                        const proteins = await searchProteins(
                          queryClient,
                          proteinState.search.text
                        )
                        proteinDispatch({
                          type: 'set',
                          search: { ...proteinState.search, results: proteins },
                        })
                      } catch (e) {
                        console.log(e)
                      }
                    } else {
                      proteinDispatch({ type: 'clear' })
                    }
                  }}
                  aria-label="Search UniProt"
                />

                <ul className="flex flex-col gap-y-2">
                  {proteinState.search.results.map((protein, pi) => {
                    return (
                      <li
                        key={pi}
                        className="flex flex-row justify-between items-center gap-x-2"
                      >
                        {/* <Checkbox
                  id={protein.accession}
                  checked={pi === proteinState.selectedIndex}
                  onCheckedChange={state => {
                    if (state) {
                      proteinDispatch({ type: "selected", index: pi })
                    }
                  }}
                />   */}
                        <BaseCol>
                          <p className="font-medium">{protein.name}</p>
                          <p className="text-foreground/50">
                            {`${protein.accession}, ${protein.organism}, size: ${protein.seq.length}`}
                          </p>
                        </BaseCol>

                        <Button
                          variant="ghost"
                          size="icon-sm"
                          pad="none"
                          rounded="full"
                          ripple={false}
                          onClick={() => {
                            proteinDispatch({ type: 'selected', index: pi })
                          }}
                        >
                          <DownloadIcon className="fill-foreground" />
                        </Button>
                      </li>
                    )
                  })}
                </ul>
              </BaseCol>
            </AccordionContent>
          </AccordionItem>
        </ScrollAccordion>
      </PropsPanel>
    </>
  )
})
