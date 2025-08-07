import { TEXT_OK, TEXT_SELECT_ALL } from '@/consts'
import { OKCancelDialog, type IModalProps } from '@dialog/ok-cancel-dialog'
import { Input } from '@themed/input'
import { produce } from 'immer'

import { ColorPickerButton } from '@/components/color/color-picker-button'
import { LabelBlock } from '@/components/dialog/label-block'
import { PropRow } from '@/components/dialog/prop-row'
import { Checkbox } from '@/components/shadcn/ui/themed/check-box'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shadcn/ui/themed/select'
import { VScrollPanel } from '@/components/v-scroll-panel'
import { useContext, useEffect, useState } from 'react'
import {
  PlotGridContext,
  type IUmapPlot,
  type PlotMode,
} from './plot-grid-provider'

export interface IProps extends IModalProps {
  plot: IUmapPlot
}

export function PlotDialog({ plot, onResponse }: IProps) {
  const { clusterInfo, updatePlot } = useContext(PlotGridContext)!
  const [_plot, setPlot] = useState<IUmapPlot>(plot)
  const [selectAll, setSelectAll] = useState(false)
  useEffect(() => {
    setPlot(plot)
  }, [plot])

  return (
    <OKCancelDialog
      open={true}
      title={`Edit ${_plot.name}`}
      onResponse={(r) => {
        if (r === TEXT_OK) {
        }

        onResponse?.(r)
      }}
      showClose={true}
      //className="w-3/4 md:w-1/2 lg:w-1/3 xl:w-1/4"

      //headerStyle={{ color }}
      // headerChildren={
      //   <VCenterRow className="gap-x-1 bg-foreground/50 text-background rounded-full text-xs px-3 py-1.5 hidden xl:flex">
      //     <span className="text-nowrap shrink-0">Id</span>
      //     <span className="truncate">{group?.id}</span>
      //   </VCenterRow>
      // }
      // leftFooterChildren={
      //   <span className="text-foreground/50">Id: {group?.id}</span>
      // }
      //contentVariant="glass"
      //bodyVariant="card"
      //headerVariant="opaque"
      //bodyVariant="default"
      //footerVariant="default"
      bodyCls="gap-y-4"
    >
      <Input
        id="name"
        label="Title"
        value={_plot.name}
        onTextChange={(e) => {
          updatePlot({ ..._plot, name: e })
        }}
        placeholder="Title..."
        //variant="dialog"
        h="dialog"
        className="grow"
      />

      <PropRow title="Mode">
        <Select
          value={_plot.mode}
          onValueChange={(v) => {
            const newPlot = produce(_plot, (draft) => {
              draft.mode = v as PlotMode
            })

            console.log(newPlot)

            updatePlot(newPlot)
            setPlot(newPlot)
          }}
        >
          <SelectTrigger className="w-42">
            <SelectValue placeholder="Scale mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="global-gex">Global GEX</SelectItem>
            <SelectItem value="gex">GEX</SelectItem>
            <SelectItem value="clusters">Cluster</SelectItem>
          </SelectContent>
        </Select>
      </PropRow>

      <LabelBlock title="Clusters">
        <Checkbox
          checked={selectAll}
          onCheckedChange={(v) => {
            setSelectAll(v)
            const newPlot = produce(_plot, (draft) => {
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
            {clusterInfo.clusters.map((cluster) => (
              <li
                key={cluster.clusterId}
                className="flex flex-row items-center gap-x-2"
              >
                <Checkbox
                  checked={_plot.clusters.some(
                    (c) => c.clusterId === cluster.clusterId
                  )}
                  onCheckedChange={(v) => {
                    const newPlot = produce(_plot, (draft) => {
                      draft.clusters = draft.clusters.filter(
                        (c) => c.clusterId !== cluster.clusterId
                      )

                      if (v) {
                        draft.clusters.push(cluster)
                      }

                      // resort clusters by clusterId
                      draft.clusters.sort((a, b) => a.clusterId - b.clusterId)

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
                  {cluster.scClass} [{cluster.clusterId}]
                </span>
              </li>
            ))}
          </ul>
        </VScrollPanel>
      </LabelBlock>

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
