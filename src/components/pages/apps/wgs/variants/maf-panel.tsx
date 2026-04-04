import { NumericalPropRow } from '@/components/dialog/numerical-prop-row'
import { BaseCol } from '@/components/layout/base-col'
import { VScrollPanel } from '@/components/v-scroll-panel'
import type { ISVGProps } from '@/interfaces/svg-props'
import { MAFPlotSVG } from './maf-plot-svg'
import { useMAFs } from './maf-store'

export function MAFPanel({ ref }: ISVGProps) {
  const { mafs, setSampleCount } = useMAFs()

  return (
    <BaseCol className="grow gap-y-4">
      <BaseCol className="border-b border-border/50 pb-1">
        <NumericalPropRow
          title="Samples"
          value={mafs?.samples ?? 0}
          dp={0}
          min={1}
          max={1000000}
          onNumChange={v => setSampleCount(v)}
        />
      </BaseCol>

      <VScrollPanel className="grow h-full">
        <MAFPlotSVG ref={ref} />
      </VScrollPanel>
    </BaseCol>
  )
}
