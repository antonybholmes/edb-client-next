import { PropsPanel } from '@/components/props-panel'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@/themed/v2/accordion'
import { useNetworkSettings } from './network-settings-store'

export function NetworkDisplayPropsPanel() {
  const { settings, updateSettings } = useNetworkSettings()

  return (
    <PropsPanel>
      <ScrollAccordion
        value={['plot', 'style', 'statistics', 'bubbles', 'size']}
      >
        <AccordionItem value="plot">
          <AccordionTrigger>Plot</AccordionTrigger>
          <AccordionContent></AccordionContent>
        </AccordionItem>
      </ScrollAccordion>
    </PropsPanel>
  )
}
