interface DataPoint {
  duration: number
  event: number // 1 for event, 0 for censoring
  group: number // 1 for group 1, 2 for group 2
}

const EPSILON = 1e-8

// Sample data: duration (time to event or censoring), event (1=event, 0=censoring), group (1=Group 1, 2=Group 2)
const TEST_DATA: DataPoint[] = [
  { duration: 5, event: 1, group: 1 },
  { duration: 6, event: 1, group: 1 },
  { duration: 6, event: 0, group: 1 },
  { duration: 8, event: 1, group: 1 },
  { duration: 6, event: 1, group: 1 },
  { duration: 2, event: 1, group: 2 },
  { duration: 4, event: 1, group: 2 },
  { duration: 7, event: 0, group: 2 },
  { duration: 3, event: 1, group: 2 },
  { duration: 2, event: 1, group: 2 },
  { duration: 6, event: 1, group: 2 },
  { duration: 9, event: 0, group: 2 },
]

// Function to perform the Log-Rank Test
function logRankTest(group1: DataPoint[], group2: DataPoint[]): number {
  // Combine both groups and sort by time (duration)
  const allData = [...group1, ...group2].sort((a, b) => a.duration - b.duration)

  let logRankStatistic = 0
  let totalAtRiskGroup1 = group1.length
  let totalAtRiskGroup2 = group2.length
  let totalAtRisk = allData.length

  // Track the number of events observed in each group
  let observedGroup1 = 0
  let observedGroup2 = 0

  // Loop through all the unique times

  for (const current of allData) {
    // If time changes, calculate the expected events at the last time point

    // Calculate expected events for each group
    const expectedGroup1 = (observedGroup1 / totalAtRisk) * totalAtRiskGroup1
    const expectedGroup2 = (observedGroup2 / totalAtRisk) * totalAtRiskGroup2

    const n2 = totalAtRisk * totalAtRisk

    // Calculate the variance for each group
    let varianceGroup1 =
      (totalAtRiskGroup1 * (totalAtRiskGroup1 - observedGroup1)) / n2

    let varianceGroup2 =
      (totalAtRiskGroup2 * (totalAtRiskGroup2 - observedGroup2)) / n2

    if (varianceGroup1 === 0) {
      varianceGroup1 = EPSILON
    }
    if (varianceGroup2 === 0) {
      varianceGroup2 = EPSILON
    }

    console.log(
      observedGroup1,
      totalAtRisk,
      totalAtRiskGroup1,
      totalAtRiskGroup2,
      varianceGroup1,
      varianceGroup2,
      Math.pow(observedGroup1 - expectedGroup1, 2) / varianceGroup1,
      Math.pow(observedGroup2 - expectedGroup2, 2) / varianceGroup2
    )

    // Update the Log-Rank statistic
    logRankStatistic +=
      Math.pow(observedGroup1 - expectedGroup1, 2) / varianceGroup1 +
      Math.pow(observedGroup2 - expectedGroup2, 2) / varianceGroup2

    // If event occurs, increment the observed events for the corresponding group
    if (current.event === 1) {
      if (current.group === 1) {
        observedGroup1++
      } else {
        observedGroup2++
      }
    }

    // **Decrement the number at risk for both groups when either an event or censoring happens**
    if (current.group === 1) {
      totalAtRiskGroup1-- // Decrease the number at risk in Group 1
    } else if (current.group === 2) {
      totalAtRiskGroup2-- // Decrease the number at risk in Group 2
    }

    totalAtRisk-- // Decrease the total number at risk across both groups
  }

  return logRankStatistic
}

export function logrankExample() {
  // Split the data into two groups: Group 1 (event = 1), Group 2 (event = 0)
  const group1 = TEST_DATA.filter((d) => d.group === 1) // Group 1
  const group2 = TEST_DATA.filter((d) => d.group === 2) // Group 2

  //console.log(group1, group2)

  // Perform the Log-Rank Test
  const logRankStatistic = logRankTest(group1, group2)
  console.log('Log-Rank Test Statistic:', logRankStatistic)
}
