import { SvgG } from '@/components/plot/svg-g'
import { SvgText } from '@/components/plot/svg-text'
import { IExtGseaSettings } from '../ext-gsea-settings'

export function ExtGseaTitleSvg({
  name,
  displayProps,
}: {
  name: string
  displayProps: IExtGseaSettings
}) {
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
