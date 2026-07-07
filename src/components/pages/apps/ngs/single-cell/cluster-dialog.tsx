import { IS_DEV_MODE, TEXT_OK } from '@/consts'
import { OKCancelDialog, type IModalProps } from '@/dialogs/ok-cancel-dialog'
import { produce } from 'immer'

import { PropRow } from '@/components/dialogs/prop-row'
import {
  ColorPickerButton,
  SIMPLE_COLOR_EXT_CLS,
} from '@/components/plot/color-picker-popover'
import { SwitchPropRow } from '@/dialogs/switch-prop-row'
import { TextPropRow } from '@/dialogs/text-prop-row'
import { useEffect, useState } from 'react'
import { usePlotGrid, type IScrnaCluster } from './plot-grid-store'

export interface IProps extends IModalProps {
  cluster: IScrnaCluster
}

export function ClusterDialog({ cluster, onResponse }: IProps) {
  const { clusterInfo, updateClusterInfo } = usePlotGrid() //useContext(PlotGridContext)!

  const [_cluster, setCluster] = useState<IScrnaCluster>(cluster)

  // we need local state to reflect changes made outside the dialog
  useEffect(() => {
    setCluster(cluster)
  }, [cluster])

  return (
    <OKCancelDialog
      open={true}
      buttons={[TEXT_OK]}
      title={`Edit ${!cluster.name.toLowerCase().includes('cluster') ? 'Cluster ' : ''}${cluster.name}`}
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

      leftHeaderChildren={
        <ColorPickerButton
          colors={[
            {
              color: _cluster.color,
              onColorChange: ({ color }) => {
                const newCluster = produce(_cluster, (draft) => {
                  draft.color = color
                })

                setCluster(newCluster)

                if (clusterInfo) {
                  updateClusterInfo(
                    produce(clusterInfo, (draft) => {
                      draft.clusters.find(
                        (c) => c.label === _cluster.label
                      )!.color = color
                    })
                  )
                }
              },
            },
          ]}
          className={SIMPLE_COLOR_EXT_CLS}
        />
      }
      // leftFooterChildren={
      //   <span className="text-foreground/50">{cluster.id}</span>
      // }
      //contentVariant="glass"
      //bodyVariant="card"
      //headerVariant="opaque"
      //bodyVariant="default"
      //footerVariant="default"
      bodyCls="gap-y-2"
    >
      <TextPropRow
        title="Title"
        id="name"
        value={_cluster.name}
        onTextChange={(e) => {
          if (!clusterInfo) {
            return
          }

          updateClusterInfo(
            produce(clusterInfo, (draft) => {
              draft.clusters = draft.clusters.map((g) => {
                if (g.label === _cluster.label) {
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

      <SwitchPropRow
        title="Show"
        checked={_cluster.show}
        onCheckedChange={(checked) => {
          const newCluster = produce(_cluster, (draft) => {
            draft.show = checked
          })

          setCluster(newCluster)

          if (!clusterInfo) {
            return
          }

          updateClusterInfo(
            produce(clusterInfo, (draft) => {
              draft.clusters.find((c) => c.label === _cluster.label)!.show =
                checked
            })
          )
        }}
      />

      <SwitchPropRow
        title="Label"
        checked={_cluster.display.label.show}
        onCheckedChange={(checked) => {
          const newCluster = produce(_cluster, (draft) => {
            draft.display.label.show = checked
          })

          setCluster(newCluster)

          if (!clusterInfo) {
            return
          }

          updateClusterInfo(
            produce(clusterInfo, (draft) => {
              draft.clusters.find(
                (c) => c.label === _cluster.label
              )!.display.label.show = checked
            })
          )
        }}
      />

      <SwitchPropRow
        title="Roundel"
        checked={_cluster.display.label.roundel.show}
        onCheckedChange={(checked) => {
          const newCluster = produce(_cluster, (draft) => {
            draft.display.label.roundel.show = checked
          })

          setCluster(newCluster)

          if (!clusterInfo) {
            return
          }

          updateClusterInfo(
            produce(clusterInfo, (draft) => {
              draft.clusters.find(
                (c) => c.label === _cluster.label
              )!.display.label.roundel.show = checked
            })
          )
        }}
      />
      {IS_DEV_MODE && (
        <PropRow title="Cluster Id">
          <span className="text-foreground/50">{cluster.id}</span>
        </PropRow>
      )}
    </OKCancelDialog>
  )
}
