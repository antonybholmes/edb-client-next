import { AxesDisplayPropsPanel } from '@/components/plot/axes/plot/axes-props-panel'
import { useMotifs } from './motifs-store'

export function AxesPropsPanel() {
  const { motifsToPlot } = useMotifs()

  return (
    <AxesDisplayPropsPanel
      plotIds={motifsToPlot.map((m) => ({ id: m.id, title: m.name }))}
      axesGroups={[
        {
          id: 'motif',
          title: 'Motif',
          axesIds: [{ id: 'x', axis: 'x', title: 'X' }],
        },
        {
          id: 'y',
          title: 'y',
          axesIds: [{ id: 'y', axis: 'y', title: 'Y' }],
        },
      ]}
    />
  )
}
