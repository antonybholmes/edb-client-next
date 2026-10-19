import { IDisplayPlot } from '@/components/plot/axes/props/axes-groups-popover'
import { AxesDisplayPropsPanel } from '@/components/plot/axes/props/axes-props-panel'
import { useGseaPlot } from '../gsea-plot-provider'

export function GseaGraphAxesPropsPanel() {
  const { pathways } = useGseaPlot()

  const plots: IDisplayPlot[] = pathways.map((p) => ({
    id: p.id,
    title: p.name,
    groups: [
      {
        id: 'es',
        title: 'ES',
        axes: [
          { id: 'x', axis: 'x', title: 'X' },
          { id: 'y', axis: 'y', title: 'Y' },
        ],
      },
      {
        id: 'snr',
        title: 'SNR',
        axes: [{ id: 'y', axis: 'y', title: 'Y' }],
      },
    ],
  }))

  return <AxesDisplayPropsPanel plots={plots} />
}
