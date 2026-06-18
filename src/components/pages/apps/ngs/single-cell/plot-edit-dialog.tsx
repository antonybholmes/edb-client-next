import { OKCancelDialog, type IModalProps } from '@/dialogs/ok-cancel-dialog'
import { Input } from '@/themed/v2/input'
import { produce } from 'immer'

import { LabelContainer } from '@/components/shadcn/ui/themed/v2/label'
import { PropRow } from '@/dialogs/prop-row'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/themed/v2/select'
import { useEffect, useState } from 'react'

import { TEXT_OK } from '@/consts'
import { useSingleCellSettings, type IGeneSet } from './single-cell-settings'

export interface IProps extends IModalProps {
  geneset: IGeneSet
}

export function PlotEditDialog({ geneset, onResponse }: IProps) {
  const { settings, updateSettings } = useSingleCellSettings()
  const [_geneset, setGeneSet] = useState<IGeneSet>(geneset)
  //const [selectAll, setSelectAll] = useState(false)
  useEffect(() => {
    setGeneSet(geneset)
  }, [geneset])

  return (
    <OKCancelDialog
      open={true}
      title={`Edit ${_geneset.name}`}
      onResponse={onResponse}
      buttons={[TEXT_OK]}
      //showClose={true}
      //className="w-3/4 md:w-1/2 lg:w-1/3 xl:w-1/4"

      //headerStyle={{ color }}
      // headerChildren={
      //   <VCenterRow className="gap-x-1 bg-foreground/50 text-background rounded-full text-xs px-3 py-1.5 hidden xl:flex">
      //     <span className="text-nowrap shrink-0">Id</span>
      //     <span className="truncate">{group?.id}</span>
      //   </VCenterRow>
      // }
      leftFooterChildren={
        <span className="text-foreground/50">{_geneset.id}</span>
      }
      //contentVariant="glass"
      //bodyVariant="card"
      //headerVariant="opaque"
      //bodyVariant="default"
      //footerVariant="default"
      bodyCls="gap-y-4"
    >
      <LabelContainer label="Title">
        <Input
          id="name"
          value={_geneset.name}
          onTextChange={e => {
            //updatePlot({ ..._geneset, name: e })

            updateSettings(
              produce(settings, draft => {
                draft.genesets = draft.genesets.map(g => {
                  if (g.id === _geneset.id) {
                    return { ...g, name: e }
                  }
                  return g
                })
              })
            )
          }}
          placeholder="Title..."
          //variant="dialog"
          h="lg"
        />
      </LabelContainer>

      {_geneset.mode !== 'clusters' && (
        <PropRow title="Mode">
          <Select
            value={_geneset.mode}
            onValueChange={v => {
              const newGeneSet = produce(_geneset, draft => {
                draft.mode = v as 'global-gex' | 'gex' | 'clusters'

                if (draft.mode === 'clusters') {
                  draft.name = 'Clusters'
                }
              })

              console.log(newGeneSet)

              setGeneSet(newGeneSet)

              updateSettings(
                produce(settings, draft => {
                  draft.genesets = draft.genesets.map(g => {
                    if (g.id === _geneset.id) {
                      return { ...newGeneSet }
                    }
                    return g
                  })
                })
              )
            }}
          >
            <SelectTrigger className="w-42">
              <SelectValue data-placeholder="Plot mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="global-gex">Global GEX</SelectItem>
              <SelectItem value="gex">GEX</SelectItem>
              {/* <SelectItem value="clusters">Cluster</SelectItem> */}
            </SelectContent>
          </Select>
        </PropRow>
      )}

      {/* <LabelBlock title="Clusters">
        <Checkbox
          checked={selectAll}
          onCheckedChange={v => {
            setSelectAll(v)
            const newPlot = produce(_plot, draft => {
              if (v) {
                draft.clusters = clusterInfo.clusters
              } else {
                draft.clusters = []
              }
            })
            updatePlot(newPlot)
            setPlot(newPlot)
          }}
          className="p-1"
        >
          {TEXT_SELECT_ALL}
        </Checkbox>
        <VScrollPanel className="w-full h-42">
          <ul className="flex flex-col gap-y-1 p-1">
            {clusterInfo.clusters.map(cluster => (
              <li
                key={cluster.id}
                className="flex flex-row items-center gap-x-2"
              >
                <Checkbox
                  checked={_plot.clusters.some(c => c.id === cluster.id)}
                  onCheckedChange={v => {
                    const newPlot = produce(_plot, draft => {
                      draft.clusters = draft.clusters.filter(
                        c => c.id !== cluster.id
                      )

                      if (v) {
                        draft.clusters.push(cluster)
                      }

                      // resort clusters by clusterId
                      draft.clusters.sort((a, b) => a.id - b.id)

                      console.log('Updated clusters:', draft.clusters)
                    })
                    updatePlot(newPlot)
                    setPlot(newPlot)
                  }}
                />
                <ColorPickerButton
                  color={cluster.color}
                  //onColorChange={setColor}
                  className="w-3.5 h-3.5 rounded-full aspect-auto shrink-0"
                  title="Set color"
                />
                <span className="truncate">
                  {cluster.name} ({cluster.metadata['scClass']?.value})
                </span>
              </li>
            ))}
          </ul>
        </VScrollPanel>
      </LabelBlock> */}

      {/* <Input
        id="search"
        value={search}
        onTextChange={e => setSearch(e)}
        placeholder="Matches"
        rightChildren={
          <InfoHoverCard title="Matches">
            A comma separated list of words or partial words that match column
            names. All matching columns will belong to the group.
          </InfoHoverCard>
        }
        otherChildren={
          <Checkbox checked={exactMatch} onCheckedChange={setExactMatch}>
            Exact match
          </Checkbox>
        }
        label="Match"
        labelPos="left"
        //variant="alt"
        //variant="dialog"
        h="dialog"
        className="grow"
      /> */}
    </OKCancelDialog>
  )
}
