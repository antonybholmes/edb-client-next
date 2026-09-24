import { memo, useMemo, type ReactNode } from 'react'

import type { IGseaResult } from '@/components/pages/apps/genes/gsea/ext-gsea/ext-gsea'
import { axisDomainToRangeFunc, axisLength } from '@/components/plot/axes/axis'
import { AxisBottomSvg, AxisLeftSvg } from '@/components/plot/axes/svg-axis'

import { useEdbSettings } from '@/components/edb/edb-settings'
import { useAxis } from '@/components/plot/axes/axes-store'
import { SvgG } from '@/components/plot/svg-g'
import { SvgText } from '@/components/plot/svg-text'
import { COLOR_BLACK } from '@/lib/color/color'
import { useGseaSettings } from '../../gsea-plot/gsea-settings-store'
import { EsCurveSvg, EsLeadingEdgeSvg } from '../../gsea-plot/svg/es-svg'
import { getColorMapFromSettings } from '../../gsea-plot/svg/hits-svg'
import { IExtGseaPlotResult, useExtGseaContext } from '../ext-gsea-provider'
import { useExtGseaSettings } from '../ext-gsea-settings'

export const ExtGseaEsCurveSvg = memo(function ExtGseaEsCurveSvg({
  result,
  gsea,
  gsMode,
}: {
  result: IExtGseaPlotResult
  gsea: IGseaResult
  gsMode: 'gs1' | 'gs2'
}) {
  const { displayProps } = useExtGseaContext()
  const { settings } = useGseaSettings()
  const { settings: edbSettings } = useEdbSettings()

  const { axis: xax } = useAxis({
    plotId: result.id,
    groupId: 'es',
    axisId: 'x',
  })

  const { axis: yaxEs } = useAxis({
    plotId: result.id,
    groupId: 'es',
    axisId: 'y',
  })

  const yaf = useMemo(() => axisDomainToRangeFunc(yaxEs), [yaxEs])

  const { leadingEdge, es, esHits } = gsea

  const cmap = useMemo(
    () => getColorMapFromSettings(settings, edbSettings),
    [settings, edbSettings]
  )

  let leadingEdgeEs = useMemo(() => {
    let les = leadingEdge.map((g) => es[g.rank])

    les =
      gsea.esScore >= 0
        ? [...les, { ...les[les.length - 1]!, esScore: 0 }]
        : [{ ...les[0]!, esScore: 0 }, ...les]

    return les
  }, [leadingEdge, es])

  if (gsea.leadingEdge.length === 0) {
    return null
  }

  let leadingEdge1Svg: ReactNode | undefined = undefined

  if (displayProps.es[gsMode].leadingEdge.show) {
    leadingEdge1Svg = (
      <EsLeadingEdgeSvg
        leadingEdge={leadingEdgeEs}
        xax={xax}
        yaf={yaf}
        fill={cmap.getHexColor(gsMode === 'gs1' ? 0 : 1)} // gs.color ?? displayProps.es[gsMode].leadingEdge.value}
        fillOpacity={displayProps.es[gsMode].leadingEdge.opacity}
      />
    )
  }

  let line1Svg: ReactNode | undefined = undefined

  if (displayProps.es[gsMode].curve.show) {
    line1Svg = (
      <EsCurveSvg
        hits={esHits}
        xax={xax}
        yax={yaxEs}
        //stroke={gs.color ?? displayProps.es[gsMode].curve.value}
        stroke={cmap.getHexColor(gsMode === 'gs1' ? 0 : 1)}
      />
    )
  }

  return (
    <>
      {leadingEdge1Svg && leadingEdge1Svg}
      {line1Svg && line1Svg}
    </>
  )
})

export const ExtGseaEsSvgPlot = memo(function ExtGseaEsSvgPlot({
  result,
}: {
  result: IExtGseaPlotResult
}) {
  const { settings } = useExtGseaSettings()
  const { settings: gseaSettings } = useGseaSettings()

  const { axis: xax } = useAxis({
    plotId: result.id,
    groupId: 'es',
    axisId: 'x',
  })

  const { axis: yaxEs } = useAxis({
    plotId: result.id,
    groupId: 'es',
    axisId: 'y',
  })

  const { scores, extGsea, gsea1, gsea2 } = result

  if (!gsea1 || !gsea2) {
    return null
  }
  const yaf = axisDomainToRangeFunc(yaxEs)

  const ylen = axisLength(yaxEs)
  const xlen = axisLength(xax)

  return (
    <SvgG
      pos={{
        x: 0,
        y: 0,
      }}
    >
      <ExtGseaEsCurveSvg result={result} gsea={gsea1} gsMode="gs1" />

      <ExtGseaEsCurveSvg result={result} gsea={gsea2} gsMode="gs2" />

      <AxisLeftSvg ax={yaxEs} />
      <SvgG
        pos={{
          x: 0,
          y: yaf(0),
        }}
      >
        <AxisBottomSvg ax={xax} showTicks={gseaSettings.es.axes.x.showTicks} />
        <SvgG
          pos={{
            x: gseaSettings.es.axes.x.length + gseaSettings.plot!.gap.x / 2,
            y: 0,
          }}
        >
          <SvgText fill={COLOR_BLACK} font={xax.ticks.major.style.labels}>
            {scores.length.toLocaleString()}
          </SvgText>
        </SvgG>
      </SvgG>

      <SvgG
        pos={{
          x: 0,
          y: ylen + gseaSettings.plot!.gap.y / 2,
        }}
      >
        <SvgG>
          <SvgText fill={COLOR_BLACK} font={xax.ticks.major.style.labels}>
            {gseaSettings.phenotypes.mode === 'normal'
              ? settings.phenotypes.p1.name
              : settings.phenotypes.p2.name}
          </SvgText>
        </SvgG>

        <SvgG
          pos={{
            x: xlen,
            y: 0,
          }}
        >
          <SvgText
            fill={COLOR_BLACK}
            font={xax.ticks.major.style.labels}
            textAnchor="end"
          >
            {gseaSettings.phenotypes.mode === 'normal'
              ? settings.phenotypes.p2.name
              : settings.phenotypes.p1.name}
          </SvgText>
        </SvgG>
      </SvgG>

      {settings.es.stats.show && (
        <SvgG
          id="stats"
          pos={{
            x: xlen,
            y: 0,
          }}
        >
          <SvgText fill={COLOR_BLACK} font={xax.ticks.major.style.labels}>
            NES: {extGsea.nes.toFixed(2)}
          </SvgText>

          <SvgG
            pos={{
              x: 0,
              y: 20,
            }}
          >
            <SvgText fill={COLOR_BLACK} font={xax.ticks.major.style.labels}>
              P-value: {extGsea.pvalue.toFixed(3)}
            </SvgText>
          </SvgG>
        </SvgG>
      )}
    </SvgG>
  )
})
