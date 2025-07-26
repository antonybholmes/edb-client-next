import chroma from 'chroma-js'

function generateColormap(steps = 31) {
  // Define start (gray) and end (red)
  //const scale = chroma.scale(['#e0e0e0', '#ff0000'])

  // Apply nonlinear skew to concentrate more steps in red
  //   const colors = Array.from({ length: steps }, (_, i) => {
  //     const t = Math.pow(i / (steps - 1), skew) // skew towards red
  //     return scale(t).hex()
  //   })

  //https://cssgradient.io/shades-of-red/
  const scale = chroma
    .scale(['#ffe5e5', '#cc0000']) // light → medium → dark
    .mode('lab')

  const colors = Array.from({ length: steps }, (_, i) => {
    const t = i / (steps - 1) //Math.pow(i / (steps - 1), skew) // skew towards red
    return scale(t).hex()
  })

  return colors
}

// Example usage:
console.log(
  'export const REDS_CMAP: ColorMap = new ColorMap("Reds", [' +
    generateColormap()
      .map(x => '\"' + x + '\"')
      .join(',') +
    '])'
)
