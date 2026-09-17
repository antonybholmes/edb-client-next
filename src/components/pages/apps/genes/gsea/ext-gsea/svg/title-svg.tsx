import { axisLength, IAxis } from '@/components/plot/axes/axis'
import { SvgG } from '@/components/plot/svg-g'
import { SvgText } from '@/components/plot/svg-text'
import { useExtGseaContext } from '../ext-gsea-provider'
import { IExtGseaSettings } from '../ext-gsea-settings'

export function ExtGseaTitleSvg({ name, xax }: { name: string; xax: IAxis }) {
  const { plot } = useExtGseaContext()

  const displayProps: IExtGseaSettings = plot.props

  const xlen = axisLength(xax)

  return (
    <SvgG
      pos={{
        x: xlen / 2,
        y: -displayProps.title.offset,
      }}
    >
      <SvgText font={displayProps.title} textAnchor="middle">
        {name}
      </SvgText>
    </SvgG>
  )
}
