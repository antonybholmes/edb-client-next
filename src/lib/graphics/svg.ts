import { IPos } from '@/interfaces/pos'

/**
 * Converts SVG coordinates to screen coordinates.
 *
 * @param svg The SVG element.
 * @param x The x-coordinate in SVG space.
 * @param y The y-coordinate in SVG space.
 * @returns The corresponding screen coordinates as an object with x and y properties, or null if the transformation fails.
 */
export function svgPointToScreen(svg: SVGSVGElement, p: IPos) {
  const pt = svg.createSVGPoint()
  pt.x = p.x
  pt.y = p.y
  const ctm = svg.getScreenCTM()
  if (!ctm) {
    return null
  }

  const screenPt = pt.matrixTransform(ctm)

  return { x: screenPt.x, y: screenPt.y }
}

/**
 * Converts screen coordinates (clientX, clientY) to SVG coordinates.
 *
 * @param svg The SVG element.
 * @param clientX The x-coordinate in screen space (clientX).
 * @param clientY The y-coordinate in screen space (clientY).
 * @returns The corresponding SVG coordinates as an object with x and y properties.
 */
export function getSvgPoint(svg: SVGSVGElement, p: IPos) {
  const pt = svg.createSVGPoint()
  pt.x = p.x
  pt.y = p.y

  return pt.matrixTransform(svg.getScreenCTM()!.inverse())
}
