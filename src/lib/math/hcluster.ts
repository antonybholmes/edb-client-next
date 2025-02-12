import type { IPos } from '@interfaces/pos'
import { BaseDataFrame } from '@lib/dataframe/base-dataframe'
import { DataFrame } from '@lib/dataframe/dataframe'
import { pearsond } from './distance'
import { numSort } from './math'
import { range, rangeMap } from './range'

export interface ICluster {
  id: number
  //name: string
  height: number
  indices: number[]
  children: ICluster[]
}

// to make the square u shape to join nodes requires 4 coordinates
// bottom left, top left, top right, bottom right
export type IBranchCoords = [IPos, IPos, IPos, IPos]

export interface IClusterTree {
  cluster: ICluster
  coords: IBranchCoords[]
  leaves: number[]
}

//export const MAIN_CLUSTER_FRAME = 'main'

export interface IClusterFrame {
  df: BaseDataFrame
  secondaryTables?: { [key: string]: BaseDataFrame } | undefined
  rowTree?: IClusterTree | undefined
  colTree?: IClusterTree | undefined
}

export type IDistFunc = (a: number[], b: number[]) => number

export type ILinkageFunc = (d: number[]) => number

export type ILinkage = (
  df: number[][],
  c1: ICluster,
  c2: ICluster,
  distFunc: IDistFunc
) => number

/**
 * Returns the pairs of indices to compare to each other.
 *
 * @param n   size of square matrix
 * @returns   list of indices to check consisting of [a, b, inf]. The
 *            third element is the distance between them, initially
 *            set to infinity, but will be eventually be set to
 *            real distance in a later step.
 */
// function squareMatrixPairs(n: number): [number, number, number][] {
//   return range(n)
//     .map(a => range(a + 1, n).map(b => [a, b, Infinity]))
//     .flat() as [number, number, number][]
// }

/**
 * Creates a linkage that is row oriented, i.e. you should
 * transpose the dataframe if you want to cluster columns.
 *
 * @param df Dataframe to process
 * @param c1
 * @param c2
 * @param distFunc
 * @returns
 */
function _linkage(
  df: number[][],
  c1: ICluster,
  c2: ICluster,
  distFunc: IDistFunc = pearsond,
  linkageFunc: ILinkageFunc
): number {
  const cardinality = c1.indices.length * c2.indices.length

  const distances = Array(cardinality).fill(0)
  let di = 0

  for (const c1i of c1.indices) {
    for (const c2i of c2.indices) {
      distances[di++] = distFunc(df[c1i]!, df[c2i]!)
    }
  }

  return linkageFunc(distances)

  // if (!dcache.has(c1.id)) {
  //   dcache.set(c1.id, new Map<number, number>())
  // }

  // if (!dcache.get(c1.id)!.has(c2.id)) {
  //   const cardinality = c1.indices.length * c2.indices.length

  //   const distances = Array(cardinality).fill(0)
  //   let di = 0

  //   for (const c1i of c1.indices) {
  //     for (const c2i of c2.indices) {
  //       distances[di++] = distFunc(df[c1i]!, df[c2i]!)
  //     }
  //   }

  //   // find the one we want to pick
  //   const l = linkageFunc(distances)

  //   dcache.get(c1.id)!.set(c2.id, l)
  // }

  // return dcache.get(c1.id)!.get(c2.id)!
}

/**
 * Pick the closest distance.
 *
 * @param df
 * @param c1
 * @param c2
 * @param distFunc
 * @returns
 */
export function singleLinkage(
  df: number[][],
  c1: ICluster,
  c2: ICluster,
  distFunc: IDistFunc = pearsond
): number {
  return _linkage(
    df,
    c1,
    c2,
    distFunc,
    (distances: number[]) => numSort(distances)[0]!
  )
}

/**
 * Pick the largest distance betweenunknown two clusters.
 *
 * @param df
 * @param c1
 * @param c2
 * @param distFunc
 * @param dcache
 * @returns
 */
export function completeLinkage(
  df: number[][],
  c1: ICluster,
  c2: ICluster,
  distFunc: IDistFunc = pearsond
): number {
  return _linkage(df, c1, c2, distFunc, (distances: number[]) => {
    const s = numSort(distances)
    return s[s.length - 1]!
  })
}

export function averageLinkage(
  df: number[][],
  c1: ICluster,
  c2: ICluster,
  distFunc: IDistFunc = pearsond
): number {
  const cardinality = c1.indices.length * c2.indices.length

  return _linkage(df, c1, c2, distFunc, (distances: number[]) => {
    let sum = 0

    for (const d of distances) {
      sum += d
    }

    return sum / cardinality
  })
}

export class HCluster {
  private _linkage: ILinkage
  private _distFunc: IDistFunc
  constructor(
    linkage: ILinkage = averageLinkage,
    distFunc: IDistFunc = pearsond
  ) {
    this._linkage = linkage
    this._distFunc = distFunc
  }

  run(df: BaseDataFrame): IClusterTree {
    // Row based so is faster if matrix is
    // row oriented

    const clusterN = df.shape[0]

    // the original clusters (leaves)
    const clusters: ICluster[] = rangeMap(
      (cluster) => ({
        id: cluster,
        //name: _df.rowIndex[0].ids[i].toString(),
        height: 0,
        indices: [cluster],
        children: [],
      }),
      clusterN
    )

    // if we already know the dist, reuse it
    const dcache: Map<number, Map<number, number>> = new Map()

    //const dist: Map<number, Map<number, number>> = new Map()

    for (let mergeIndex = 0; mergeIndex < clusterN - 1; mergeIndex++) {
      //range(n - 1).forEach(i => {
      // since clusters change (gets smaller), calculate all pairwise combinations
      // we need to test
      // const clusterPairs = squareMatrixPairs(clusters.length)

      // clusterPairs.forEach(pair => {
      //   const c1 = pair[0]!
      //   const c2 = pair[1]!

      const clustersLength = clusters.length
      let nearestPair = [-1, -1, Infinity]

      for (let c1 = 0; c1 < clustersLength; c1++) {
        for (let c2 = c1 + 1; c2 < clustersLength; c2++) {
          const cluster1 = clusters[c1]!
          const cluster2 = clusters[c2]!

          if (!dcache.has(cluster1.id)) {
            dcache.set(cluster1.id, new Map<number, number>())
          }

          if (!dcache.get(cluster1.id)!.has(cluster2.id)) {
            const l = this._linkage(
              df.values as number[][],
              cluster1,
              cluster2,
              this._distFunc
            )

            dcache.get(cluster1.id)!.set(cluster2.id, l)
          }

          const l = dcache.get(cluster1.id)!.get(cluster2.id)!

          // const l = this._linkage(
          //   df.values as number[][],
          //   cluster1,
          //   cluster2,
          //   this._distFunc,
          //   dcache
          // )

          if (l < nearestPair[2]!) {
            nearestPair = [c1, c2, l]
          }

          // if (!dist.has(c1.id)) {
          //   dist.set(c1.id, new Map<number, number>())
          // }

          // if (!dist.get(c1.id)?.has(c2.id)) {
          //   dist.get(c1.id)!.set(c2.id, this._linkage(
          //     df,
          //     c1,
          //     c2,
          //     this._distFunc,
          //     dcache,
          //   ))
          // }

          //dist.get(c1.id)!.get(c2.id)!
        }
      }

      //console.log('h2', nearestPair, clustersLength)
      //console.log(clusters)

      // each time we find something closer, keep that
      // as the running 'sum'
      // const nearestPair = clusterPairs.reduce(
      //   (pairA, pairB) => (pairA[2] <= pairB[2] ? pairA : pairB),
      //   [-1, -1, Infinity]
      // )

      // console.log(
      //   "her ",
      //   nearestPair,
      //   clusters[nearestPair[0]!],
      //   clusters[nearestPair[1]!],
      // )

      // console.log(
      //   "merge",
      //   clusters[nearestPair[0]!].name,
      //   clusters[nearestPair[1]!].name
      // )

      const newCluster: ICluster = {
        id: clusterN + mergeIndex,
        //name: "",
        height: nearestPair[2]!,
        indices: numSort([
          ...clusters[nearestPair[0]!]!.indices,
          ...clusters[nearestPair[1]!]!.indices,
        ]),
        children: [clusters[nearestPair[0]!]!, clusters[nearestPair[1]!]!],
      }

      // remove merged nodes and push new node
      clusters.splice(Math.max(nearestPair[0]!, nearestPair[1]!), 1)
      clusters.splice(Math.min(nearestPair[0]!, nearestPair[1]!), 1)
      clusters.push(newCluster)
    }

    const cluster = clusters[0]!

    const leaves = getLeaves(cluster)

    // we assume a normalized width of a cell/row as 1 so the mid point
    // is 0.5 from where we draw the tree edge
    const leafXMap = new Map<number, number>(
      leaves.map((leaf, li) => [leaf, li + 0.5])
    )
    const xCacheMap = new Map<number, number>()

    const coords = clusterToCoords(df, cluster, leafXMap, xCacheMap)
    //const [xPos, yPos] = getNodePositions(df, cluster, leafXMap, xCacheMap)

    const tree: IClusterTree = {
      cluster,
      coords,
      leaves,
    }

    return tree
  }

  // run(df: IDataFrame|IClusterFrame, axis:AxisDim): IClusterFrame {
  //   const rowTree = axis === 0 ? this.#_run(df) : null
  //   const colTree = axis === 1  ? this.#_run(transpose(df)) : null

  //   return {...df, rowTree, colTree }

  // }
}

// dfs to get rows/cols in their tree order
export function getLeaves(cluster: ICluster): number[] {
  const stack: ICluster[] = [cluster]

  const ret: number[] = []

  while (stack.length > 0) {
    const c = stack.pop()

    if (c) {
      if (c.children.length > 0) {
        stack.push(...c.children.toReversed())
      } else {
        // c.id will be the index of the row/col in the original table
        ret.push(c.id)
      }
    }
  }

  return ret
}

export function clusterToCoords(
  df: BaseDataFrame,
  cluster: ICluster,
  leafXMap: Map<number, number>,
  xCacheMap: Map<number, number>
): IBranchCoords[] {
  // if (!leaves) {
  //   leaves = getLeaves(cluster)
  // }

  // we use the mid point of a block as the position of x or y to draw
  // nodes. We simplify the system and use a cell size of 1 to construct
  // the coordinates, which can then be scaled to the actual drawing size
  // hence the start point is li + 0.5
  // const leafXMap = new Map<number, number>(
  //   leaves.map((leaf, li) => [leaf, li + 0.5])
  // )

  // assume we start at the root
  const maxH = cluster.height
  const maxX = df.shape[0]

  const stack: ICluster[] = [cluster]

  const coords: IBranchCoords[] = []

  // map a node id to a coordinate so we can make a tree
  //const xCacheMap = new Map<number, number>()

  while (stack.length > 0) {
    const c = stack.pop()!

    if (c.children.length > 1) {
      const x1 = _getNodeX(c.children[0]!, leafXMap, xCacheMap) / maxX
      const x2 = _getNodeX(c.children[1]!, leafXMap, xCacheMap) / maxX
      const y = c.height / maxH

      coords.push([
        { x: x1, y: c.children[0]!.height / maxH },
        { x: x1, y },
        { x: x2, y },
        { x: x2, y: c.children[1]!.height / maxH },
      ])

      // depth first left tree first
      stack.push(...c.children.toReversed())
    }
  }

  return coords
}

export function getNodePositions(
  df: BaseDataFrame,
  cluster: ICluster,
  leafXMap: Map<number, number>,
  xCacheMap: Map<number, number>
): [
  { x: number; clusters: ICluster[] }[],
  { x: number; clusters: ICluster[] }[],
] {
  // if (!leaves) {
  //   leaves = getLeaves(cluster)
  // }

  // we use the mid point of a block as the position of x or y to draw
  // nodes. We simplify the system and use a cell size of 1 to construct
  // the coordinates, which can then be scaled to the actual drawing size
  // hence the start point is li + 0.5

  // assume we start at the root
  const maxH = cluster.height
  const maxX = df.shape[0]

  const stack: ICluster[] = [cluster]

  const xMap = new Map<number, ICluster[]>()
  const yMap = new Map<number, ICluster[]>()

  while (stack.length > 0) {
    const c = stack.pop()!

    const y = c.height / maxH

    if (!yMap.has(y)) {
      yMap.set(y, [])
    }

    yMap.get(y)!.push(c)

    if (c.children.length === 0) {
      const x = leafXMap.get(c.id)!

      if (!xMap.has(x)) {
        xMap.set(x, [])
      }

      xMap.get(x)!.push(c)
    } else {
      const x1 = _getNodeX(c.children[0]!, leafXMap, xCacheMap) / maxX
      const x2 = _getNodeX(c.children[1]!, leafXMap, xCacheMap) / maxX

      const x = (x1 + x2) / 2

      if (!xMap.has(x)) {
        xMap.set(x, [])
      }

      xMap.get(x)!.push(c)

      // depth first left tree first
      stack.push(...c.children.toReversed())
    }
  }

  const xRet: { x: number; clusters: ICluster[] }[] = numSort([
    ...xMap.keys(),
  ]).map((x) => ({ x, clusters: xMap.get(x)! }))

  const yRet: { x: number; clusters: ICluster[] }[] = numSort([
    ...yMap.keys(),
  ]).map((x) => ({ x, clusters: yMap.get(x)! }))

  return [xRet, yRet]
}

export function _findClusterClosestToPos(
  pos: number,
  xClusters: { x: number; clusters: ICluster[] }[],

  d: number = 0.05
): ICluster[] {
  let l = 0
  let r = xClusters.length - 1

  while (l <= r) {
    const m = Math.floor((l + r) / 2)

    const p = xClusters[m]!

    if (Math.abs(p.x - pos) <= d) {
      return p.clusters
    }

    if (p.x < pos) {
      l = m + 1
    } else {
      r = m - 1
    }
  }

  return []
}

export function findClusterClosestToPos(
  pos: IPos,
  xClusters: { x: number; clusters: ICluster[] }[],
  yClusters: { x: number; clusters: ICluster[] }[],
  d: number = 0.05
): ICluster[] {
  const foundXClusters: ICluster[] = _findClusterClosestToPos(
    pos.x,
    xClusters,
    d
  )

  const foundYClusters: ICluster[] = _findClusterClosestToPos(
    pos.y,
    yClusters,
    d
  )

  const ret: ICluster[] = []

  for (const xc of foundXClusters) {
    for (const yc of foundYClusters) {
      if (xc.id === yc.id) {
        ret.push(xc)
      }
    }
  }

  return ret
}

/**
 * Returns the x position of a node/cluster. In this case, x can be either
 * x or y in the diagram as we use it for both dimensions, simply transposing
 * as necessary. The default is to assume the x/column direction.
 *
 * @param cluster a cluster to find the position of
 * @param leafMap a map of the x positions of all leaves
 * @param xCacheMap    a cache of the positions of all nodes (leaves or branches)
 * @returns       the x position of the cluster/node
 */
function _getNodeX(
  cluster: ICluster,
  leafMap: Map<number, number>,
  xCacheMap: Map<number, number>
): number {
  // use cached coordinate if we already have it
  if (!xCacheMap.has(cluster.id)) {
    if (cluster.children.length === 0) {
      xCacheMap.set(cluster.id, leafMap.get(cluster.id)!)
    } else {
      xCacheMap.set(
        cluster.id,
        (_getNodeX(cluster.children[0]!, leafMap, xCacheMap) +
          _getNodeX(cluster.children[1]!, leafMap, xCacheMap)) /
          2
      )
    }
  }

  return xCacheMap.get(cluster.id)!
}

/**
 * Using the row and col leaves of a cluster frame, reorder the main dataframe to
 * match
 * @param cf
 * @returns
 */
export function getClusterOrderedDataFrame(cf: IClusterFrame): BaseDataFrame {
  const df = cf.df
  const rowLeaves = cf.rowTree ? cf.rowTree.leaves : range(df.shape[0])
  const colLeaves = cf.colTree ? cf.colTree.leaves : range(df.shape[1])

  const data = df.values

  const ret = new DataFrame({
    data: rowLeaves.map((r) => colLeaves.map((c) => data[r]![c]!)),
    columns: colLeaves.map((c) => df.colNames[c]!),
    index: rowLeaves.map((r) => df.rowNames[r]!),
    name: df.name,
  })

  return ret
}
