import { AxesDisplayPropsPanel } from '@/components/plot/axes/plot/axes-props-panel'
import { capitalCase } from '@/lib/text/capital-case'
import { useMotifSettings } from './motifs-settings'
import { useMotifs } from './motifs-store'

export function AxesPropsPanel() {
  const { settings } = useMotifSettings()
  const { motifsToPlot } = useMotifs()

  const plots = [
    {
      id: 'y',
      title: 'Y',
      groups: [
        {
          id: 'y',
          title: capitalCase(settings.mode) as string,
          axes: [{ id: 'y', axis: 'y', title: 'Y' }],
        },
      ],
    },
  ].concat(
    motifsToPlot.map((m) => ({
      id: m.id,
      title: m.name,
      groups: [
        {
          id: 'motif',
          title: 'Motif',
          axes: [{ id: 'x', axis: 'x', title: 'X' }],
        },
      ],
    }))
  )

  return <AxesDisplayPropsPanel plots={plots} />
}
