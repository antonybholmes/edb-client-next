import { where } from './where'

/**
 * Returns the indices of an array that pass a filtering criteria. Useful
 * for getting the indices in a dataframe that you want to keep etc.
 *
 * @param data  an array of data to filter
 * @param f     a function that maps a value in the array to true or false to
 *              determine if it should be kept
 * @returns     the indices where the applied function to the array is true.
 */
export function reorder<K, V>(
  data: K[],
  order: V[],
  f: (x: K, y: V) => boolean
): K[] {
  return order
    .map(id => where(data, d => f(d, id)))
    .filter(x => x.length > 0)
    .map(x => x[0]!)
    .map(x => data[x]!)
}

//reorder(dfs, order, (df, id)=>df.id===id)
