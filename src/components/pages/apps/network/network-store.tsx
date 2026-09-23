import { IDBEntity } from '@/interfaces/db-entity'
import { IPos } from '@/interfaces/pos'
import {
  forceCenter,
  forceLink,
  forceManyBody,
  forceSimulation,
} from 'd3-force'
import { useEffect } from 'react'

import { BaseDataFrame } from '@/lib/dataframe/base-dataframe'
import { makeUuid } from '@/lib/id'
import { create } from 'zustand'
import { useNetworkSettings } from './network-settings-store'

interface INode extends IDBEntity {
  size: number
  group: string
  x?: number
  y?: number
}

interface IEdge {
  id: string
  score: number
  source: string
  target: string
}

interface INetwork {
  nodes: INode[]
  edges: IEdge[]
}

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

export function dataframesToNetwork(
  dfNodes: BaseDataFrame,
  dfEdges: BaseDataFrame,
  labelCol: string,
  sizeCol: string,
  groupCol: string,
  sourceCol: string,
  targetCol: string,
  scoreCol: string
): INetwork {
  //const labelCol = findCol(dfNodes, 'label')
  //const sizeCol = findCol(dfNodes, 'size', { exact: true })
  //const groupCol = findCol(dfNodes, 'collection')

  const labels = dfNodes.col(labelCol).strs
  const sizes = dfNodes.col(sizeCol).nums
  const groups = dfNodes.col(groupCol).strs

  console.log(dfNodes.shape, labels.length)

  const nodes: INode[] = labels.map((label, i) => ({
    id: makeUuid(),
    name: label,
    size: sizes[i] ?? 1,
    group: groups[i] ?? '',
  }))

  const nodeMap = {}

  for (const node of nodes) {
    //nodeMap[node.id] = node

    const id2 = (node.group + '::' + node.name).replace(/\s+/g, '_')

    nodeMap[id2] = node
  }

  console.log(nodeMap)

  //const sourceCol = findCol(dfEdges, /(source|from)/i)
  //const targetCol = findCol(dfEdges, /(target|to)/i)
  //const scoreCol = findCol(dfEdges, 'similarity', { exact: true })

  const sources = dfEdges.col(sourceCol).strs
  const targets = dfEdges.col(targetCol).strs
  const scores = dfEdges.col(scoreCol).nums

  const edges: IEdge[] = sources.map((source, si) => {
    console.log(source, targets[si], scores[si])
    return {
      id: makeUuid(),
      source: nodeMap[source].id ?? '',
      target: nodeMap[targets[si]]?.id ?? '',
      score: scores[si] ?? 0,
    }
  })

  return { nodes, edges }
}

export interface INetworkStore {
  network: INetwork | undefined
  nodeMap: Record<string, INode>
  coordinateMap: Record<string, IPos>
  setNetwork: (settings: INetwork) => void
  updateCoordinates: (coordinateMap: Record<string, IPos>) => void
}

export const useNetworkStore = create<INetworkStore>()((set) => ({
  network: undefined,
  nodeMap: {},
  coordinateMap: {},
  setNetwork: (network: INetwork) => {
    set({
      network,
      nodeMap: Object.fromEntries(network.nodes.map((node) => [node.id, node])),
      coordinateMap: Object.fromEntries(
        network.nodes.map((node) => [node.id, { x: 0, y: 0 }])
      ),
    })
  },
  updateCoordinates: (coordinateMap: Record<string, IPos>) => {
    set({
      coordinateMap,
    })
  },
}))

export function useNetwork(): {
  network: INetwork | undefined
  coordinates: Record<string, IPos>
  setNetwork: (network: INetwork) => void
} {
  const { settings } = useNetworkSettings()
  const network = useNetworkStore((state) => state.network)
  const coordinates = useNetworkStore((state) => state.coordinateMap)
  const setNetwork = useNetworkStore((state) => state.setNetwork)
  const updateCoordinates = useNetworkStore((state) => state.updateCoordinates)

  useEffect(() => {
    if (!network) {
      return
    }

    // 2. Clone the structure out into D3-friendly array mutations
    const nodes = network.nodes.map((node) => ({ ...node }))
    const edges = network.edges.map((edge) => ({ ...edge }))

    // 3. Initialize the D3 Force Engine
    const simulation = forceSimulation(nodes)
      .force('charge', forceManyBody().strength(settings.chargeStrength))
      .force(
        'center',
        forceCenter(settings.plot.size.w / 2, settings.plot.size.h / 2)
      )
      .force(
        'link',
        forceLink(edges)
          .id((d: any) => d.id)
          .distance(settings.linkDistance)
      )

    // 4. Stream layout coordinates straight back into the store on every frame tick
    simulation.on('tick', () => {
      const nextNodeMap: Record<string, IPos> = {}

      nodes.forEach((node) => {
        nextNodeMap[node.id] = { x: node.x ?? 0, y: node.y ?? 0 }
      })

      // Atomically batch update the store
      updateCoordinates(nextNodeMap)
    })

    // 5. Hard lifecycle boundary: If the hook unmounts or options change, kill the simulation loop immediately
    return () => {
      simulation.stop()
    }
  }, [
    settings.plot.size.w,
    settings.plot.size.h,
    settings.chargeStrength,
    settings.linkDistance,
    updateCoordinates,
  ])

  return {
    network,
    coordinates,
    setNetwork,
  }
}
