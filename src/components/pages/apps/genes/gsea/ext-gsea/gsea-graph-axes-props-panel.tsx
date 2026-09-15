import { IDisplayPlot } from '@/components/plot/axes/plot/axes-groups-popover'
import { AxesDisplayPropsPanel } from '../../../../../plot/axes/plot/axes-props-panel'
import { useExtGseaContext } from './ext-gsea-provider'

export function GseaGraphAxesPropsPanel() {
  const { plot } = useExtGseaContext()

  const plots: IDisplayPlot[] = (plot?.results ?? []).map((result) => ({
    id: result.id,
    title: result.name,
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
