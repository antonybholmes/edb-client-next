import { CenterCol } from '@/components/layout/center-col'
import type { IPos } from '@/interfaces/pos'
import type { ISVGProps } from '@/interfaces/svg-props'
import { MAX_REGION_SIZE, MAX_VARIANTS, PileupPlotSvg } from './pileup-plot-svg'
import { useVariants, type IVariant } from './variant-store'

export interface ITooltip {
  pos: IPos
  variant: IVariant
}

export function PileupPlotPanel({ ref }: ISVGProps) {
  const { variants: results } = useVariants()

  //const [toolTipInfo ] = useState<ITooltip | null>(null)

  //const highlightRef = useRef<HTMLSpanElement>(null)

  if (!results || results.variants.length === 0) {
    return null
  }

  if (results.location.end - results.location.start > MAX_REGION_SIZE) {
    return (
      <CenterCol className="grow border h-full">
        <div className="rounded-theme bg-red-100 p-6 text-sm text-red-600 text-center">
          <p>
            This region is too long to display. Please reduce the region size to
            less than {MAX_REGION_SIZE.toLocaleString()} bases.
          </p>
        </div>
      </CenterCol>
    )
  }

  if (results.variants.length > MAX_VARIANTS) {
    return (
      <div className="m-4 rounded-theme bg-red-100 p-6 text-sm text-red-600 text-center">
        <p>
          This region contains too many variants to display (
          {results.variants.length}). Please apply filters to reduce the number
          of variants.
        </p>
      </div>
    )
  }

  return <PileupPlotSvg ref={ref} />
}
