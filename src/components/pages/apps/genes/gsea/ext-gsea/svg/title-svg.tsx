import { axisLength, IAxis } from '@/components/plot/axes/axis'
import { SvgG } from '@/components/plot/svg-g'
import { SvgText } from '@/components/plot/svg-text'
import { useGseaSettings } from '../../gsea-web/gsea-settings-store'

export function ExtGseaTitleSvg({ name, xax }: { name: string; xax: IAxis }) {
  const { settings } = useGseaSettings()

  const xlen = axisLength(xax)

  return (
    <SvgG
      pos={{
        x: xlen / 2,
        y: -settings.title.offset,
      }}
    >
      <SvgText font={settings.title} textAnchor="middle">
        {name}
      </SvgText>
    </SvgG>
  )
}
