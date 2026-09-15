import { SvgG } from '@/components/plot/svg-g'
import { SvgText } from '@/components/plot/svg-text'
import { useExtGseaContext } from '../ext-gsea-provider'
import { IExtGseaSettings } from '../ext-gsea-settings'

export function ExtGseaTitleSvg({ name }: { name: string }) {
  const { plot } = useExtGseaContext()

  const displayProps: IExtGseaSettings = plot.props

  return (
    <SvgG
      pos={{
        x: displayProps.axes.x.length / 2,
        y: -displayProps.title.offset,
      }}
    >
      <SvgText font={displayProps.title} textAnchor="middle">
        {name}
      </SvgText>
    </SvgG>
  )
}
