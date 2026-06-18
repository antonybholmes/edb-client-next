import { ExtScrollCard } from '@/components/ext-scroll-card/ext-scroll-card'
import { BaseCol } from '@/components/layout/base-col'
import { HCenterCol } from '@/components/layout/h-center-col'
import { HCenterRow } from '@/components/layout/h-center-row'
import { VCenterCol } from '@/components/layout/v-center-col'
import { VCenterRow } from '@/components/layout/v-center-row'
import { NumericalInput } from '@/components/shadcn/ui/themed/numerical-input'
import { SkeletonCard } from '@/components/shadcn/ui/themed/v2/skeleton'
import type { ISVGProps } from '@/interfaces/svg-props'
import { useDNAQuery } from '@/lib/genomic/dna'
import { MAFPlotSVG } from './maf-plot-svg'
import { useMAFs } from './maf-store'
import { useVariantSettings } from './variant-settings-store'

function MAFSkeleton() {
  return (
    <VCenterCol className="gap-y-2 grow h-96">
      <HCenterCol className="gap-y-2">
        <HCenterCol className="gap-y-2">
          <HCenterRow className="gap-x-4 w-full items-end">
            {Array.from({ length: 30 }).map((_, i) => {
              const h = 2 + Math.random() * 8
              return (
                <SkeletonCard
                  orientation="vertical"
                  key={i}
                  className="w-3 rounded-full"
                  style={{ height: `${h}rem` }}
                />
              )
            })}
          </HCenterRow>
          <SkeletonCard className="w-full h-3 rounded-full" />
        </HCenterCol>
      </HCenterCol>
    </VCenterCol>
  )
}

export function MAFPanel({ ref }: ISVGProps) {
  const { settings } = useVariantSettings()
  const { mafs, setSampleCount } = useMAFs()

  const { data: dna } = useDNAQuery(settings.location, {
    format: 'upper',
    assembly: 'hg19',
  })

  if (!mafs || mafs.mafs.length === 0 || !dna) {
    return <MAFSkeleton />
  }

  return (
    <BaseCol className="grow gap-y-4">
      <VCenterRow className="border-b border-border/50 pb-1 gap-x-2 text-sm">
        <span>Samples</span>
        <NumericalInput
          title="Samples"
          value={mafs?.samples ?? 0}
          dp={0}
          min={1}
          max={1000000}
          onNumChange={v => setSampleCount(v)}
        />
      </VCenterRow>
      <ExtScrollCard>
        <MAFPlotSVG ref={ref} />
      </ExtScrollCard>
    </BaseCol>
  )
}
