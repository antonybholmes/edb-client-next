export function svgPointToScreen(
  svgElement: SVGSVGElement,
  x: number,
  y: number
) {
  const pt = svgElement.createSVGPoint()
  pt.x = x
  pt.y = y
  const ctm = svgElement.getScreenCTM()
  if (!ctm) return null
  const screenPt = pt.matrixTransform(ctm)
  return { x: screenPt.x, y: screenPt.y }
}
