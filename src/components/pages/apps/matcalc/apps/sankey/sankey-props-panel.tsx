import { PropsPanel } from '@/components/props-panel'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@/themed/v2/accordion'

import { useHistory } from '../../history/history-provider/history-provider'
import { ISankeyDisplayOptions, useSankey } from './sankey-provider'

export function SankeyPropsPanel() {
  //const { plotsState, plotsDispatch } = useContext(PlotsContext)

  // const plot = plotsState.plotMap[plotId]

  // if (!plot) {
  //   return null
  // }

  const { updatePlot } = useHistory()

  const { plot } = useSankey()

  const displayProps: ISankeyDisplayOptions = plot.props

  return (
    <PropsPanel>
      <ScrollAccordion value={['plot', 'fold-change', 'p-value', 'labels']}>
        <AccordionItem value="plot">
          <AccordionTrigger>Plot</AccordionTrigger>
          <AccordionContent></AccordionContent>
        </AccordionItem>
      </ScrollAccordion>
    </PropsPanel>
  )
}
