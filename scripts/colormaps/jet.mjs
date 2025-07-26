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
  const scale = chroma.scale([
  '#00007F', // dark blue
  '#0000FF', // blue
  '#007FFF', // azure
  '#00FFFF', // cyan
  '#7FFF7F', // light green
  '#FFFF00', // yellow
  '#FF7F00', // orange
  '#FF0000', // red
  '#7F0000', // dark red
]) 

  const colors = Array.from({ length: steps }, (_, i) => {
    const t = i / (steps - 1) //Math.pow(i / (steps - 1), skew) // skew towards red
    return scale(t).hex()
  })

  return colors
}

// Example usage:
console.log('export const JET_CMAP: ColorMap = new ColorMap("Jet", ['+generateColormap().map(x=>'\"'+x+'\"').join(',') +'])')
