import { AxesDisplayPropsPanel } from '../../../../../plot/axes/plot/axes-props-panel'
import { useGseaPlot } from './gsea-plot-provider'

export function GseaGraphAxesPropsPanel() {
  const { pathways } = useGseaPlot()

  return (
    <AxesDisplayPropsPanel
      plotIds={pathways.map((p) => ({ id: p.id, title: p.name }))}
      axesGroups={[
        {
          id: 'es',
          title: 'ES',
          axesIds: [
            { id: 'x', axis: 'x', title: 'X' },
            { id: 'y', axis: 'y', title: 'Y' },
          ],
        },
        {
          id: 'snr',
          title: 'SNR',
          axesIds: [{ id: 'y', axis: 'y', title: 'Y' }],
        },
      ]}
    />
  )
}
