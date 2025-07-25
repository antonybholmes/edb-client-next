import { fill } from '../fill'
import { argMin } from './argmin'
import { type DistFunc, type Point } from './distance'

export class KMeans {
  private _k: number
  private _maxIterations: number
  private _tolerance: number
  private _dist: DistFunc

  constructor(
    k: number,
    d: DistFunc,
    maxIterations: number = 100,
    tolerance: number = 1e-4
  ) {
    this._k = k
    this._dist = d
    this._maxIterations = maxIterations
    this._tolerance = tolerance
  }

  //   // Function to calculate the Euclidean distance between two points
  //   private euclideanDistance(p1: number[], p2: number[]): number {
  //     return Math.sqrt(
  //       p1.reduce((sum, value, index) => sum + Math.pow(value - p2[index]!, 2), 0)
  //     )
  //   }

  /**
   * Create a random set of centroids by selecting random points in the data.
   *
   * @param points
   * @returns
   */
  private _initializeCentroids(points: Point[]): Point[] {
    const centroids: Point[] = []
    const seenIndices = new Set<number>()

    while (centroids.length < this._k) {
      const index = Math.floor(Math.random() * points.length)
      if (!seenIndices.has(index)) {
        centroids.push(points[index]!)
        seenIndices.add(index)
      }
    }

    return centroids
  }

  // Function to assign points to the nearest centroid
  private _assignPointsToCentroids(
    points: Point[],
    centroids: Point[]
  ): number[] {
    return points.map(point => {
      const distances = centroids.map(c => this._dist(point, c))

      return argMin(distances)
    })
  }

  // Function to recalculate centroids based on point assignments
  private _recalculateCentroids(
    points: Point[],
    assignments: number[]
  ): Point[] {
    // dimension of each point (often 2 for 2d data)
    const n = points[0]!.length

    // here we create an array of k arrays of size of a point.
    // Usually this will be 2D arrays, e.g. x,y
    const newCentroids: Point[] = Array.from({ length: this._k }, () =>
      fill(0, n)
    )

    const count: number[] = fill(0, this._k)

    // Sum all points assigned to each centroid
    for (let i = 0; i < points.length; i++) {
      // lookup which centroid this point is currently assigned
      const centroidIndex = assignments[i]!

      for (let di = 0; di < n; ++di) {
        newCentroids[centroidIndex]![di]! += points[i]![di]!
      }

      //   newCentroids[centroidIndex] = newCentroids[centroidIndex]!.map(
      //     (sum, idx) => sum + points[i]![idx]!
      //   )
      count[centroidIndex]!++
    }

    // Calculate the mean for each centroid
    for (let centroidi = 0; centroidi < this._k; centroidi++) {
      if (count[centroidi]! > 0) {
        newCentroids[centroidi] = newCentroids[centroidi]!.map(
          sum => sum / count[centroidi]!
        )
      }
    }

    return newCentroids
  }

  // Function to check if the centroids have converged
  private hasConverged(oldCentroids: Point[], newCentroids: Point[]): boolean {
    return oldCentroids.every((oldCentroid, index) => {
      return this._dist(oldCentroid, newCentroids[index]!) < this._tolerance
    })
  }

  // K-Means clustering algorithm
  public fit(points: Point[]): { assignments: number[]; centroids: Point[] } {
    let centroids = this._initializeCentroids(points)

    // default everything is assigned to one cluster if all else fails
    let assignments: number[] = fill(0, points.length)

    for (let iteration = 0; iteration < this._maxIterations; iteration++) {
      assignments = this._assignPointsToCentroids(points, centroids)
      const newCentroids = this._recalculateCentroids(points, assignments)

      // Check for convergence
      if (this.hasConverged(centroids, newCentroids)) {
        console.log(`Converged after ${iteration + 1} iterations`)
        break
      }

      centroids = newCentroids
    }

    return { assignments, centroids }
  }
}

// Example usage
// const points: Point[] = [
//   [1, 2],
//   [2, 3],
//   [3, 4],
//   [8, 9],
//   [9, 10],
//   [10, 11],
// ]

// const kMeans = new KMeans(2, euclidean) // 2 clusters
// const result = kMeans.fit(points)

// console.log('Centroids:', result.centroids)
// console.log('Assignments:', result.assignments)
