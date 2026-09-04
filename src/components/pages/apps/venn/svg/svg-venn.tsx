import { SvgBase } from '@/components/plot/svg-base'
import { SvgMargin } from '@/components/plot/svg-margin'
import { useVennSettings } from '../venn-settings-store'
import { useVenn } from '../venn-store'
import { SVGFourWayVenn } from './svg-four-way-venn'
import { SVGOneWayVenn } from './svg-one-way-venn'
import { SVGThreeWayVenn } from './svg-three-way-venn'
import { SVGTwoWayVenn } from './svg-two-way-venn'

export function SvgVenn({ scale }: { scale: number }) {
  const { vennListsInUse } = useVenn()
  const { settings } = useVennSettings()

  const width =
    settings.w + settings.page.margin.left + settings.page.margin.right
  const height =
    settings.w + settings.page.margin.top + settings.page.margin.bottom

  return (
    <SvgBase scale={scale} width={width} height={height}>
      <SvgMargin margin={settings.page.margin}>
        {vennListsInUse.length < 2 && <SVGOneWayVenn />}
        {vennListsInUse.length === 2 && <SVGTwoWayVenn />}
        {vennListsInUse.length === 3 && <SVGThreeWayVenn />}
        {vennListsInUse.length > 3 && <SVGFourWayVenn />}
      </SvgMargin>
    </SvgBase>
  )
}
