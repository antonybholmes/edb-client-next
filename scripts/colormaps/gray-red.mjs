import chroma from 'chroma-js'

function generateGrayToRedColormap(steps = 32, skew = 2.5) {
  // Define start (gray) and end (red)
  //const scale = chroma.scale(['#e0e0e0', '#ff0000'])

  // Apply nonlinear skew to concentrate more steps in red
  //   const colors = Array.from({ length: steps }, (_, i) => {
  //     const t = Math.pow(i / (steps - 1), skew) // skew towards red
  //     return scale(t).hex()
  //   })

  const scale = chroma
    .scale(['#F0F0F0', '#fa8072', '#cc0000', '#8b0000'])
    .domain([0, 0.2, 0.8, 1])

  const colors = Array.from({ length: steps }, (_, i) => {
    const t = i / (steps - 1) //Math.pow(i / (steps - 1), skew) // skew towards red
    return scale(t).hex()
  })

  return colors
}

// Example usage:
console.log(generateGrayToRedColormap())
