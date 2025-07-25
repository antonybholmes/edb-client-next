/**
 * Orders a list by a list of indices. Can also act as a slice tool.
 *
 * @param data
 * @param order
 * @returns
 */
export function ordered<T>(data: T[], order: number[]): T[] {
  return order.map(idx => data[idx]!)
}

//reorder(dfs, order, (df, id)=>df.id===id)
