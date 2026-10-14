import { PropsPanel } from '@/components/props-panel'
import { ScrollAccordion } from '@/themed/baseui/accordion'

export function MotifsPropsPanel() {
  return (
    <>
      <PropsPanel>
        <ScrollAccordion value={['datasets', 'motifs']}></ScrollAccordion>
      </PropsPanel>
    </>
  )
}
