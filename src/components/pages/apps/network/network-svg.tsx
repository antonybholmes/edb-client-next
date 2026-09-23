import { useCallback, useMemo } from 'react'

import { SvgBase } from '@/components/plot/svg-base'

import { SvgMargin } from '@/components/plot/svg-margin'

import { useEdbSettings } from '@/components/edb/edb-settings'
import { useTooltip } from '@/providers/tooltip-provider'
import { useNetworkSettings } from './network-settings-store'

const TOOLTIP_OFFSET = 10

export function NetworkSvg() {
  const { hideTooltip } = useTooltip()

  const { settings } = useNetworkSettings()
  const { settings: edbSettings } = useEdbSettings()

  // const { showTooltip, hideTooltip } = useTooltip()

  // const handleVariantEnter = useCallback(
  //   (plot: IGseaBubble, row: number, p: IPos) => {
  //     const { screenP } = svgPointToScreen(svgRef.current, p)

  //     const newP = {
  //       x: screenP.x,
  //       y: screenP.y,
  //     }

  //     showTooltip({
  //       pos: newP,
  //       content: (
  //         <>
  //           <p className="font-semibold">{`${plot.genesets[row]!.name}`}</p>
  //           <p>{`${plot.nes.label}: ${plot.genesets[row]!.nes.toFixed(2)}`}</p>
  //           <p>{`-log10(${plot.log10q.label}): ${plot.genesets[row]!.log10q.toFixed(2)}`}</p>
  //           <p>{`${plot.size.label}: ${plot.genesets[row]!.size}`}</p>
  //         </>
  //       ),
  //     })
  //   },
  //   [svgRef, showTooltip, hideTooltip]
  // )

  const handleVariantLeave = useCallback(() => {
    hideTooltip()
  }, [hideTooltip])

  const { svg, width, height } = useMemo(() => {
    //const huedata = hue ? getNumCol(df, findCol(df, hue)) : []

    // inner height is determined by the size of the largest bubble plot
    const innerPlotHeight = settings.plot.size.h

    const innerPlotWidth = settings.plot.size.w

    const plotWidth =
      innerPlotWidth + settings.plot.margin.left + settings.plot.margin.right
    const plotHeight =
      innerPlotHeight + settings.plot.margin.top + settings.plot.margin.bottom

    const innerWidth = plotWidth
    const innerHeight = plotHeight

    const width =
      innerWidth + settings.plot.margin.left + settings.plot.margin.right
    const height =
      innerHeight + settings.plot.margin.top + settings.plot.margin.bottom

    const svg = <SvgMargin margin={settings.plot.margin}></SvgMargin>

    return { svg, width, height }
  }, [settings])

  return (
    <SvgBase width={width} height={height} scale={edbSettings.plots.scale}>
      {svg}
    </SvgBase>
  )
}
