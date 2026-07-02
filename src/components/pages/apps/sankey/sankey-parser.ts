import { BaseDataFrame, findCol } from '@/lib/dataframe/base-dataframe'
import { cellNum, cellStr } from '@/lib/dataframe/cell'
import { makeUuid } from '@/lib/id'
import {
  ISankeyLink,
  ISankeyNode,
  ISankeyPlot,
  newSankeyPlot,
} from './sankey-provider'

/**
 * Create a sankey plot from a dataframe. The dataframe should have the following columns:
 * - source: the source node
 * - source column: the column index of the source node (1-based)
 * - target: the target node
 * - target column: the column index of the target node (1-based)
 * - value: the value of the link
 * - source color (optional): the color of the source node
 * - target color (optional): the color of the target node
 * - link color (optional): the color of the link
 *
 * @param df
 * @param opts
 * @returns
 */
export function DFToSankeyGraph(
  df: BaseDataFrame,
  opts: {
    sourceCol?: string
    sourceColCol?: string
    targetCol?: string
    targetColCol?: string
    valueCol?: string
    sourceColorCol?: string
    targetColorCol?: string
    linkColorCol?: string
  } = {}
): ISankeyPlot {
  const {
    sourceCol = 'source',
    sourceColCol = 'source column',
    targetCol = 'target',
    targetColCol = 'target column',
    valueCol = 'value',
    sourceColorCol = 'source color',
    targetColorCol = 'target color',
    linkColorCol = 'link color',
  } = opts

  const sourceIdx = findCol(df, sourceCol)
  const sourceColIdx = findCol(df, sourceColCol)
  const targetIdx = findCol(df, targetCol)
  const targetColIdx = findCol(df, targetColCol)
  const valueIdx = findCol(df, valueCol)
  const sourceColorIdx = findCol(df, sourceColorCol)
  const targetColorIdx = findCol(df, targetColorCol)
  const linkColorIdx = findCol(df, linkColorCol)

  if (
    sourceIdx === -1 ||
    targetIdx === -1 ||
    valueIdx === -1 ||
    sourceColIdx === -1 ||
    targetColIdx === -1 ||
    sourceColorIdx === -1 ||
    targetColorIdx === -1 ||
    linkColorIdx === -1
  ) {
    throw new Error(
      'DataFrame must have columns: source, source column, target, target column, value, source color, target color, link color.'
    )
  }

  const nodesMap: Record<string, ISankeyNode> = {}
  const links: ISankeyLink[] = []

  console.log('Parsing DataFrame to Sankey graph with columns:', df.shape)

  for (let i = 0; i < df.shape[0]; i++) {
    const source = cellStr(df.get(i, sourceIdx))
    const sourceColumn = cellNum(df.get(i, sourceColIdx)) - 1
    const target = cellStr(df.get(i, targetIdx))
    const targetColumn = cellNum(df.get(i, targetColIdx)) - 1
    const value = cellNum(df.get(i, valueIdx))

    const sourceColor = cellStr(df.get(i, sourceColorIdx), { defaultValue: '' })
    const targetColor = cellStr(df.get(i, targetColorIdx), { defaultValue: '' })
    const linkColor = cellStr(df.get(i, linkColorIdx), { defaultValue: '' })

    if (!nodesMap[source]) {
      nodesMap[source] = {
        id: makeUuid(),
        label: source,
        column: sourceColumn,
        color: sourceColor || undefined,
      }
    }

    if (!nodesMap[target]) {
      nodesMap[target] = {
        id: makeUuid(),
        label: target,
        column: targetColumn,
        color: targetColor || undefined,
      }
    }

    links.push({
      source: nodesMap[source].id,
      target: nodesMap[target].id,
      value,
      color: linkColor || undefined,
    })
  }

  const nodes = Object.values(nodesMap)

  const plot = newSankeyPlot(df.name, nodes, links)

  return plot
}
