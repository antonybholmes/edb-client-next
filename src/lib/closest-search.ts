// JavaScript program to find element
// closest to given target using binary search.

// Returns element closest to target in arr[]

interface IClosest {
  index: number
  value: number
}

export function findClosest(
  arr: number[],
  target: number,
  lower: boolean = false
): IClosest {
  const n = arr.length

  // Corner cases
  if (target <= arr[0]!) {
    return { index: 0, value: arr[0]! }
  }

  if (target >= arr[n - 1]!) {
    return { index: n - 1, value: arr[n - 1]! }
  }

  // Doing binary search
  let i = 0,
    j = n,
    mid = 0

  while (i < j) {
    mid = Math.floor(0.5 * (i + j))

    if (arr[mid] == target) {
      return { index: mid, value: arr[mid]! }
    } else if (target < arr[mid]!) {
      // If target is less than array
      // element,then search in left

      // If target is greater than previous
      // to mid, return closest of two
      if (mid > 0 && target > arr[mid - 1]!) {
        return lower
          ? { index: mid - 1, value: arr[mid - 1]! }
          : getClosest(arr, mid - 1, mid, target)
      }

      // Repeat for left half
      j = mid
    } else {
      if (mid < n - 1 && target < arr[mid + 1]!) {
        return lower
          ? { index: mid, value: arr[mid]! }
          : getClosest(arr, mid, mid + 1, target)
      }

      i = mid + 1 // update i
    }
  }

  // Only single element left after search
  return { index: mid, value: arr[mid]! }
}

// Method to compare which one is the more close
// We find the closest by taking the difference
//  between the target and both values. It assumes
// that val2 is greater than val1 and target lies
// between these two.
function getClosest(
  arr: number[],
  i1: number,
  i2: number,
  target: number
): IClosest {
  if (target - arr[i1]! >= arr[i2]! - target) {
    return { index: i2, value: arr[i2]! }
  } else {
    return { index: i1, value: arr[i1]! }
  }
}
