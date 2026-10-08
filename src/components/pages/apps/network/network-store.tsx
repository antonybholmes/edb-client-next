import { IDBEntity } from '@/interfaces/db-entity'
import { IPos } from '@/interfaces/pos'

import { autoTickInterval } from '@/components/plot/axes/axis'
import { IDim } from '@/interfaces/dim'
import { COLOR_BLACK } from '@/lib/color/color'
import { getColorMap } from '@/lib/color/colormap'
import { TAB10_PALETTE } from '@/lib/color/palette'
import { BaseDataFrame } from '@/lib/dataframe/base-dataframe'
import { makeUuid } from '@/lib/id'
import { DEFAULT_LIMIT, ILimit } from '@/lib/math/limit'
import { min } from '@/lib/math/math'
import { useMemo } from 'react'
import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import { nodeRadiusFunc } from '../matcalc/apps/heatmap/svg/cell-svg'
import {
  INetworkSettings,
  NodeViewMode,
  useNetworkSettings,
} from './network-settings'
import { IUserDataSettings, useUserData } from './network-user-data-store'

export interface IGroup extends IDBEntity {
  color: string
  show: boolean
}

export interface INode {
  id: string
  /**
   * Secondary id e.g. group::name
   */
  id2: string

  groupId: string

  /**
   * The label of the node, used for display purposes.
   */
  //label: string
  size: number
  size2?: number
  //group: string
  x?: number
  y?: number
  vx?: number
  vy?: number
  data?: Record<string, string | number>
}

export interface IEdge {
  id: string
  strength: number
  source: string
  target: string
}

export interface INetwork extends IDBEntity {
  nodes: INode[]
  nodeMap: Record<string, INode>
  edges: IEdge[]
}

export interface IRenderNode extends INode, d3.SimulationNodeDatum {
  //group: IGroup
  view: NodeViewMode
}

export interface IRenderEdge extends Omit<IEdge, 'source' | 'target'> {
  view: NodeViewMode
  source: string | INode
  target: string | INode
}

const FRAME_SKIP = 5

// export function dataframesToNetwork(dfs: BaseDataFrame[]): INetwork {
//   const dfNodes = dfs.filter((df) => df.name.toLowerCase().includes('node'))[0]
//   const dfEdges = dfs.filter((df) => df.name.toLowerCase().includes('edge'))[0]

//   const labelCol = findCol(dfNodes, 'label')
//   const sizeCol = findCol(dfNodes, 'size', { exact: true })
//   const groupCol = findCol(dfNodes, 'collection')

//   const labels = dfNodes.col(labelCol).strs
//   const sizes = dfNodes.col(sizeCol).nums
//   const groups = dfNodes.col(groupCol).strs

//   const nodes: INode[] = labels.map((label, i) => ({
//     id: makeUuid(),
//     name: label,
//     size: sizes[i] ?? 1,
//     group: groups[i] ?? '',
//   }))

//   const nodeMap = {}

//   for (const node of nodes) {
//     nodeMap[node.id] = node

//     nodeMap[node.group + '::' + node.name] = node
//   }

//   const sourceCol = findCol(dfEdges, /(source|from)/i)
//   const targetCol = findCol(dfEdges, /(target|to)/i)
//   const scoreCol = findCol(dfEdges, 'similarity', { exact: true })

//   const sources = dfEdges.col(sourceCol).strs
//   const targets = dfEdges.col(targetCol).strs
//   const scores = dfEdges.col(scoreCol).nums

//   const edges: IEdge[] = sources.map((source, si) => ({
//     id: makeUuid(),
//     source: nodeMap[source].id ?? '',
//     target: nodeMap[targets[si]]?.id ?? '',
//     score: scores[si] ?? 0,
//   }))

//   return { nodes, edges }
// }

function fixName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, '_')
}

export function dataframesToNetwork(
  dfNodes: BaseDataFrame,
  dfEdges: BaseDataFrame,
  labelCol: string,
  nameCol: string,
  groupCol: string,
  sizeCol: string,
  colorCol: string,
  sourceCol: string,
  targetCol: string,
  strengthCol: string,
  settings: INetworkSettings,
  userData: IUserDataSettings
) {
  const labels = dfNodes.col(labelCol).strs
  const names = dfNodes.col(nameCol).strs
  let sizes = dfNodes.col(sizeCol).nums
  let sizes2 = []

  try {
    sizes2 = dfNodes.col(colorCol).nums
  } catch (error) {
    //console.error('Error reading color column:', error)
  }

  const groups = dfNodes.col(groupCol).strs

  const minNonZeroP = min(sizes.filter((p) => p > 0))

  // 2. Set a floor slightly smaller than that (e.g., one order of magnitude lower)
  const pFloor = minNonZeroP * 0.1

  sizes = sizes.map((size) =>
    settings.data.applyMinusLog10ToMetric1
      ? -Math.log10(size === 0 ? pFloor : size)
      : size
  )

  // const sizeLim: ILimit = {
  //   min: min(sizes),
  //   max: max(sizes),
  // }

  //  sizes = sizes.map((size) => size / sizeLim.max)

  const minNonZeroP2 = min(sizes2.filter((p) => p > 0))
  const pFloor2 = minNonZeroP2 * 0.1

  sizes2 = sizes2.map((size) =>
    settings.data.applyMinusLog10ToMetric2
      ? -Math.log10(size === 0 ? pFloor2 : size)
      : size
  )

  // const sizeLim2: ILimit = {
  //   min: min(sizes2),
  //   max: max(sizes2),
  // }

  //sizes2 = sizes2.map((size) => size / sizeLim2.max)

  const colNames = dfNodes.columns

  const nodes: INode[] = labels.map((label, i) => {
    const node = {
      id: makeUuid(),
      id2: groups[i].trim() + '::' + names[i].trim(),
      label,
      name: names[i].trim(),
      size: sizes[i],
      size2: sizes2?.[i] ?? 0,
      groupId: '',
      data: {},
    }

    for (const colName of colNames) {
      const value = dfNodes.get(i, colName)
      node.data[colName] = value as string | number
    }

    return node
  })

  const nodeMap = new Map<string, INode>()

  const used = new Set<string>()

  for (const node of nodes) {
    const id2 = fixName(node.id2) //.group + '::' + node.name)

    nodeMap.set(id2, node)
    used.add(id2)
  }

  const sources = dfEdges.col(sourceCol).strs
  const targets = dfEdges.col(targetCol).strs
  const strengths = dfEdges.col(strengthCol).nums

  const edges: IEdge[] = sources.map((source, si) => {
    return {
      id: makeUuid(),
      source: nodeMap.get(fixName(source))?.id ?? '',
      target: nodeMap.get(fixName(targets[si]))?.id ?? '',
      strength: strengths[si] ?? 0,
    }
  })

  const uniqueGroups = [...new Set(groups)].sort().map((g, index) => ({
    id: makeUuid(),
    name: g,
    show: true,
    color:
      userData.groups.colors[g.toLowerCase()] ??
      TAB10_PALETTE[index % TAB10_PALETTE.length],
  }))

  const groupToIdMap = new Map(
    uniqueGroups.map((g) => [g.name.toLowerCase(), g.id])
  )

  for (let [ni, node] of nodes.entries()) {
    node.groupId = groupToIdMap.get(groups[ni].toLowerCase()) ?? ''
  }

  const idNodeMap = Object.fromEntries(nodes.map((node) => [node.id, node]))

  return {
    network: {
      id: makeUuid(),
      name: 'Network',
      nodes,
      nodeMap: idNodeMap,
      edges,
    },
    nodeDataTypes: colNames,
    groups: uniqueGroups,
  }
}

export interface INetworkStore {
  network: INetwork | undefined

  nodes: {
    /**
     * The limit for the primary metric (size) of the nodes.
     */
    metricLim1: ILimit
    stepSize: number
    /**
     * The limit for the secondary metric (size2) of the nodes.
     */
    metricLim2: ILimit

    label: {
      field: string
      fields: string[]
    }
  }
  edges: {
    strengthLim: ILimit
    stepSize: number
  }
  headings: {
    score: string
    metric1: string
    metric2: string
  }
  groups: IGroup[]

  coordinateMap: Record<string, IPos>
  size: IDim

  setNetwork: (
    settings: Omit<INetwork, 'id'>,
    groups: IGroup[],
    nodeDataTypes: string[],
    labelField: string,
    scoreName: string,
    sizeName: string,
    size2Name: string
  ) => void
  setNodeLabelField: (field: string) => void
  setGroups: (groups: IGroup[]) => void
  updateCoordinates: (coordinateMap: Record<string, IPos>, size: IDim) => void
}

export const useNetworkStore = create<INetworkStore>()((set, get) => ({
  network: undefined,

  nodes: {
    metricLim1: { ...DEFAULT_LIMIT },
    stepSize: 0,
    metricLim2: { ...DEFAULT_LIMIT },
    label: {
      fields: [],
      field: '',
    },
  },
  edges: {
    strengthLim: { ...DEFAULT_LIMIT },
    stepSize: 0,
  },
  headings: {
    score: 'Score',
    metric1: 'Size',
    metric2: 'Size2',
  },
  groups: [],
  tree: null,

  coordinateMap: {},
  size: { w: 0, h: 0 },

  setNetwork: (
    network: Omit<INetwork, 'id'>,
    groups: IGroup[],
    nodeLabelFields: string[],
    labelField: string,
    scoreName: string,
    sizeName: string,
    size2Name: string
  ) => {
    // set metric limits for the primary metric (size) of the nodes
    // set max to a min of 1 so that we dont get divide by zero errors
    // for the primary metric (size) of the nodes

    const metricLim1: ILimit = {
      min: Math.min(...network.nodes.map((node) => node.size)),
      max: Math.max(1, ...network.nodes.map((node) => node.size)),
    }

    // get step size using log10 to find a suitable magnitude for the step
    const { interval: stepSize } = autoTickInterval({
      min: 0,
      max: metricLim1.max,
    })

    // max must be a multiple of step size for size
    metricLim1.min = Math.floor(metricLim1.min / stepSize) * stepSize
    metricLim1.max = Math.ceil(metricLim1.max / stepSize) * stepSize

    // set max to a min of 1 so that we dont get divide by zero errors
    const metricLim2: ILimit = {
      min: Math.min(...network.nodes.map((node) => node.size2)),
      max: Math.max(1, ...network.nodes.map((node) => node.size2)),
    }

    const { interval: stepSize2 } = autoTickInterval({
      min: 0,
      max: metricLim2.max,
    })

    // max must be a multiple of step size
    metricLim2.min = Math.floor(metricLim2.min / stepSize2) * stepSize2
    metricLim2.max = Math.ceil(metricLim2.max / stepSize2) * stepSize2

    const strengthLim: ILimit = {
      min: Math.min(...network.edges.map((edge) => edge.strength)),
      max: Math.max(1, ...network.edges.map((edge) => edge.strength)),
    }

    const { interval: stepSizeStrength } = autoTickInterval({
      min: 0,
      max: strengthLim.max,
    })

    strengthLim.min =
      Math.floor(strengthLim.min / stepSizeStrength) * stepSizeStrength
    strengthLim.max =
      Math.ceil(strengthLim.max / stepSizeStrength) * stepSizeStrength

    set({
      network: { ...network, id: makeUuid() },

      nodes: {
        metricLim1,
        metricLim2,
        stepSize,
        label: {
          field: labelField,
          fields: [...new Set(nodeLabelFields)].sort(),
        },
      },
      edges: {
        strengthLim,
        stepSize: stepSizeStrength,
      },
      headings: {
        score: scoreName,
        metric1: sizeName,
        metric2: size2Name,
      },
      coordinateMap: {},
      groups,
    })
  },
  setNodeLabelField: (field: string) => {
    set({
      nodes: {
        ...get().nodes,
        label: {
          ...get().nodes.label,
          field,
        },
      },
    })
  },
  setGroups: (groups: IGroup[]) => {
    set({
      groups,
    })
  },
  updateCoordinates: (coordinateMap: Record<string, IPos>, size: IDim) => {
    set({
      coordinateMap,
      size,
    })
  },
}))

export function useNetwork() {
  const { settings } = useNetworkSettings()
  const { settings: userData } = useUserData()

  const network = useNetworkStore(useShallow((state) => state.network))
  const nodes = useNetworkStore(useShallow((state) => state.nodes))
  const edges = useNetworkStore(useShallow((state) => state.edges))

  const groups = useNetworkStore(useShallow((state) => state.groups))
  const headings = useNetworkStore(useShallow((state) => state.headings))
  const coordinates = useNetworkStore(
    useShallow((state) => state.coordinateMap)
  )

  const size = useNetworkStore((state) => state.size)

  const setNodeLabelField = useNetworkStore((state) => state.setNodeLabelField)
  const setNetwork = useNetworkStore((state) => state.setNetwork)
  const setGroups = useNetworkStore((state) => state.setGroups)

  const groupMap = useMemo(
    () => new Map<string, IGroup>(groups.map((group) => [group.id, group])),
    [groups]
  )

  const userLabelSet = useMemo(
    () =>
      new Set(
        userData.labels.ids
          .filter((x) => x.length > 0)
          .map((x) => x.toLowerCase())
      ),
    [userData.labels.ids]
  )

  // how to label each node
  const nodeLabelMap = useMemo(() => {
    if (!network) {
      return new Map()
    }
    return new Map<string, string>(
      network.nodes.map((node) => [
        node.id,
        getNodeText(node, nodes.label.field, groupMap),
      ])
    )
  }, [network?.nodes, nodes.label.field])

  const renderNodes: IRenderNode[] = useMemo(() => {
    if (!network) {
      return []
    }

    return network.nodes.map((node) => {
      let view: NodeViewMode = 'hidden'

      if (groupMap.get(node.groupId)?.show) {
        const isLabelled = getIsNodeLabelled(
          node,
          userLabelSet,
          settings.plot.nodes.labels.showAll,
          settings.plot.nodes.view.labelled.on,
          userData.labels.mode
        )

        if (isLabelled) {
          view = settings.plot.nodes.view.labelled.mode
        } else {
          view = settings.plot.nodes.view.mode
        }
      }

      return {
        ...node,
        group: groupMap.get(node.groupId),
        view,
      }
    })
  }, [
    network,
    groupMap,
    userLabelSet,
    settings.plot.nodes.view.mode,
    settings.plot.nodes.labels.showAll,
    settings.plot.nodes.view.labelled.mode,
    settings.plot.nodes.view.labelled.on,
    userData.labels.mode,
  ])

  const renderNodeMap = useMemo(() => {
    return new Map(renderNodes.map((node) => [node.id, node]))
  }, [renderNodes])

  const nodeEdgeMap = useMemo(() => {
    if (!network?.edges || network.edges.length === 0) {
      return new Map<string, Set<string>>()
    }

    const map = new Map<string, Set<string>>()

    for (const edge of network.edges) {
      if (!map.has(edge.source)) {
        map.set(edge.source, new Set())
      }
      if (!map.has(edge.target)) {
        map.set(edge.target, new Set())
      }

      map.get(edge.source)?.add(edge.id)
      map.get(edge.target)?.add(edge.id)
    }

    return map
  }, [network?.edges])

  const renderEdges: IRenderEdge[] = useMemo(() => {
    if (!network) {
      return []
    }

    return network.edges.map((edge) => {
      let view: NodeViewMode = settings.plot.edges.mode

      const sourceNode = renderNodeMap.get(edge.source)
      const targetNode = renderNodeMap.get(edge.target)

      if (settings.plot.edges.labelled.on) {
        // to view an edge, both nodes must be in the 'default' view
        if (sourceNode?.view === 'normal' || targetNode?.view === 'normal') {
          view = settings.plot.edges.labelled.mode
        }
      }

      return { ...edge, view } as IRenderEdge
    })
  }, [
    network?.edges,
    renderNodeMap,
    settings.plot.edges.mode,
    settings.plot.edges.labelled.on,
    settings.plot.edges.labelled.mode,
  ])

  const renderEdgeMap = useMemo(() => {
    return new Map(renderEdges.map((edge) => [edge.id, edge]))
  }, [renderEdges])

  const radiusMap = useMemo(() => {
    if (!network?.nodes || network.nodes.length === 0) {
      return new Map<string, number>()
    }

    const nodeRadiusScale = nodeRadiusFunc(
      settings.plot.nodes.radius,
      settings.plot.nodes.scale.mode
    )

    return new Map<string, number>(
      network.nodes.map((node) => [
        node.id,
        nodeRadiusScale((node.size ?? 0) / nodes.metricLim1.max),
      ])
    )
  }, [
    network?.nodes,
    settings.plot.nodes.radius,
    settings.plot.nodes.scale.mode,
    nodes.metricLim1.max,
  ])

  const nodeColorMap = useMemo(() => {
    if (!network?.nodes || network.nodes.length === 0) {
      return new Map<string, string>()
    }

    switch (settings.plot.nodes.color.mode) {
      case 'group':
        return new Map(
          network.nodes.map((node) => [
            node.id,
            groupMap.get(node.groupId)?.color ?? COLOR_BLACK,
          ])
        )

      default:
        const colorMap = getColorMap(settings.plot.nodes.color.cmap)

        return new Map(
          network.nodes.map((node) => [
            node.id,
            colorMap.getHexColor(node.size2 ?? 0) ?? COLOR_BLACK,
          ])
        )
    }
  }, [
    settings.plot.nodes.color.mode,
    groupMap,
    settings.plot.nodes.color.cmap,
    network?.nodes,
  ])

  return {
    network,
    nodes,
    edges,
    groups,
    coordinates,
    size,
    headings,
    groupMap,
    renderEdges,
    renderNodes,
    renderEdgeMap,
    radiusMap,
    nodeColorMap,
    nodeLabelMap,
    renderNodeMap,
    nodeEdgeMap,
    userLabelSet,
    setNetwork,
    setGroups,
    setNodeLabelField,
  }
}

// export function useNetworkSim(): {
//   run: (network: INetwork, onFinished?: () => void) => void
// } {
//   const { settings } = useNetworkSettings()
//   const updateCoordinates = useNetworkStore((state) => state.updateCoordinates)

//   const run = useCallback(
//     (network: INetwork, onFinished?: () => void) => {
//       const size = settings.plot.size

//       // 2. Clone the structure out into D3-friendly array mutations
//       const nodes = network.nodes.map((node) => ({
//         ...node,
//         x: size.w / 2,
//         y: size.h / 2,
//       }))
//       const edges = network.edges.map((edge) => ({ ...edge }))

//       let frame = 0

//       // 3. Initialize the D3 Force Engine
//       const simulation = forceSimulation(nodes)
//         .force('charge', forceManyBody().strength(settings.chargeStrength))
//         // .force(
//         //   'center',
//         //   forceCenter(settings.plot.size.w / 2, settings.plot.size.h / 2)
//         // )
//         .force(
//           'link',
//           forceLink(edges)
//             .id((d: any) => d.id)
//             .distance(settings.linkDistance)
//         )

//         // 3. The Custom Canvas Walls Box Constraint
//         .force('canvas-walls', () => {
//           for (let node of nodes as any[]) {
//             // Keep X coordinates within bounds (0 + radius to width - radius)
//             if (node.x < 0) {
//               node.x = 0
//             }

//             if (node.x > size.w) {
//               node.x = size.w
//             }

//             // Keep Y coordinates within bounds (0 + radius to height - radius)
//             if (node.y < 0) {
//               node.y = 0
//             }

//             if (node.y > size.h) {
//               node.y = size.h
//             }
//           }
//         })

//       // 4. Stream layout coordinates straight back into the store on every frame tick
//       simulation.on('tick', () => {
//         frame++

//         if (frame % FRAME_SKIP !== 0) {
//           return
//         }

//         const nextNodeMap: Record<string, IPos> = {}

//         nodes.forEach((node) => {
//           nextNodeMap[node.id] = { x: node.x ?? 0, y: node.y ?? 0 }
//         })

//         // Atomically batch update the store
//         updateCoordinates(nextNodeMap, { w: size.w, h: size.h })
//       })

//       simulation.on('end', () => {

//         onFinished?.()
//       })

//       // 5. Hard lifecycle boundary: If the hook unmounts or options change, kill the simulation loop immediately
//       return () => {
//         simulation.stop()
//       }
//     },
//     [settings, updateCoordinates]
//   )

//   return {
//     run,
//   }
// }

/**
 * Get the text for a specific field of a node.
 *
 * @param node The node object.
 * @param field The field name to retrieve the text from.
 * @returns The text value of the specified field.
 */
export function getNodeText(
  node: INode,
  field: string,
  groupMap: Map<string, IGroup>
): string {
  switch (field) {
    case 'id':
      return node.id
    case 'id2':
      return node.id2
    case 'group':
      return groupMap.get(node.groupId)?.name ?? ''
    default:
      let value = node.data[field]

      if (typeof value === 'number') {
        value = value.toString()
      }

      return value ?? ''
  }
}

export function getIsNodeLabelled(
  node: INode,
  labelSet: Set<string>,
  showAll: boolean,
  labelledOn: boolean,
  mode: 'partial' | 'exact'
) {
  // whether found in user node data or the ids we attach to each node
  const found =
    inNodeData(node, labelSet, mode) || labelsInNodeIds(node, labelSet)

  // if showAll is true, we show the label only if it is not found in the node data or node ids
  // if showAll is false, we show the label only if it is found in the node data or node ids
  // therefore we just check if showAll is different from found because that captures both cases correctly
  const showLabel = showAll || (labelledOn && found)

  return showLabel
}

export function labelsInNodeIds(node: INode, labelSet: Set<string>): boolean {
  return (
    inLabelSet(node.id, labelSet, 'exact') ||
    inLabelSet(node.id2, labelSet, 'exact')
  )
}

export function inNodeData(
  node: INode,
  labelSet: Set<string>,
  mode: 'partial' | 'exact'
) {
  return Object.values(node.data)
    .filter((d) => typeof d === 'string')
    .some((d) => inLabelSet(d.toString(), labelSet, mode))
}

export function inLabelSet(
  text: string,
  labelSet: Set<string>,
  mode: 'partial' | 'exact'
): boolean {
  text = text.toLowerCase().trim()

  if (mode === 'exact') {
    return labelSet.has(text)
  }

  // check if anything in label set is within the text
  for (const label of labelSet) {
    if (text.includes(label)) {
      return true
    }
  }

  return false
}

// function getNodeText(node: INode, settings: INetworkSettings): string {
//   switch (settings.plot.nodes.labels.type) {
//     case 'label':
//       return node.label
//     case 'name':
//       return node.name
//     case 'group':
//       return node.group
//     case 'size':
//       return node.size.toString()
//     case 'id':
//       return node.id
//     case 'id2':
//       return node.id2
//     default:
//       return ''
//   }
// }

export function getTextAnchor(settings: INetworkSettings, radius: number) {
  let textAnchor: 'start' | 'middle' | 'end' = 'middle'
  let baseline: 'auto' | 'middle' | 'hanging' = 'middle'

  let offset: IPos = { x: 0, y: 0 }

  switch (settings.plot.nodes.labels.position) {
    case 'left':
      textAnchor = 'end'
      offset = { x: -radius - settings.plot.nodes.labels.offset, y: 0 }
      break
    case 'right':
      textAnchor = 'start'
      offset = { x: radius + settings.plot.nodes.labels.offset, y: 0 }
      break
    case 'below':
      textAnchor = 'middle'
      baseline = 'hanging'
      offset = { x: 0, y: radius + settings.plot.nodes.labels.offset }
      break
    case 'above':
      textAnchor = 'middle'
      baseline = 'auto'
      offset = { x: 0, y: -radius - settings.plot.nodes.labels.offset }
      break
    default:
      textAnchor = 'middle'
      break
  }
  return { textAnchor, baseline, offset }
}
