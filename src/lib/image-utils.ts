import type { RefObject } from 'react'

const MIN_SIZE = 10

/**
 * Converts an SVG DOM element into a standalone
 * SVG file string
 * @param svgRef a ref to an svg DOM element
 * @returns
 */
export function getSvg(svgRef: RefObject<SVGElement | null>): string | null {
  if (!svgRef.current) {
    return null
  }

  const svg = svgRef.current

  //get svg source.
  let source = new XMLSerializer().serializeToString(svg)

  //add name spaces.
  if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
    source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"')
  }
  if (!source.match(/^<svg[^>]+"http:\/\/www\.w3\.org\/1999\/xlink"/)) {
    source = source.replace(
      /^<svg/,
      '<svg xmlns:xlink="http://www.w3.org/1999/xlink"'
    )
  }

  //add xml declaration
  return '<?xml version="1.0" standalone="no"?>\r\n' + source
}

export function downloadSvg(
  svgRef: RefObject<SVGElement | null>,

  name = 'chart.svg'
) {
  if (!svgRef.current) {
    return
  }

  const source = getSvg(svgRef)

  if (!source) {
    return
  }

  if (!name.endsWith('.svg')) {
    name += '.svg'
  }

  const url = window.URL.createObjectURL(
    new Blob([source], { type: 'image/svg+xml' })
  ) //["data:image/svg+xml;charset=utf-8," + encodeURIComponent(source)]));

  const link = document.createElement('a')

  link.href = url
  link.download = name
  document.body.appendChild(link) // Required for this to work in FireFox
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
  //document.body.removeChild(element);

  //   const link = document.createElement("a")
  //   link.href = url
  //   link.setAttribute("download", `chart.svg`)
  //   document.body.appendChild(link)
  //   link.click()

  // Clean up and remove the link
  //link.parentNode.removeChild(link)
}

export async function downloadSvgAutoFormat(
  svgRef: RefObject<SVGElement | null>,

  name = 'chart.png',
  scale = 2
) {
  if (name.endsWith('svg')) {
    downloadSvg(svgRef, name)
  } else {
    downloadSvgAsPng(svgRef, name, scale)
  }
}

export async function downloadSvgAsPng(
  svgRef: RefObject<SVGElement | null>,

  name = 'chart.png',
  scale = 2
) {
  if (!svgRef.current) {
    return
  }

  const source = getSvg(svgRef)

  if (!source) {
    return
  }

  if (!name.endsWith('.png')) {
    name += '.png'
  }

  //console.log(source)

  // create a virtual instance of the svg,
  // then load into an image so the browser
  // will internally render it as a bitmap and
  // then we can export the bitmap
  const svgUrl = window.URL.createObjectURL(
    new Blob([source], { type: 'image/svg+xml' })
  )

  const canvas = document.createElement('canvas')

  const ctx = canvas.getContext('2d')

  const newWidth = Math.max(MIN_SIZE, svgRef.current.clientWidth * scale) //3000
  const img = new Image()

  img.onload = function () {
    if (ctx) {
      // Declare initial dimensions of the image
      const originalWidth = Math.max(MIN_SIZE, img.width)
      const originalHeight = Math.max(MIN_SIZE, img.height)

      const newHeight = Math.max(
        MIN_SIZE,
        (originalHeight / originalWidth) * newWidth
      )

      // Declare the new width of the image
      // And calculate the new height to preserve the aspect ratio
      img.width = newWidth
      img.height = newHeight

      // Set the dimensions of the canvas to the new dimensions of the image
      canvas.width = newWidth
      canvas.height = newHeight

      //ctx.fillStyle = '#ff0000' // Transparent pixel
      //ctx.fillRect(0, 0, newWidth, newHeight)

      // Render image in Canvas
      ctx.drawImage(img, 0, 0, newWidth, newHeight)

      canvas.toBlob(blob => {
        console.log(blob)
        if (blob) {
          const pngUrl = window.URL.createObjectURL(blob)

          const link = document.createElement('a')
          link.href = pngUrl
          link.download = name
          document.body.appendChild(link) // Required for this to work in FireFox
          link.click()
          link.remove()
          URL.revokeObjectURL(pngUrl)
          URL.revokeObjectURL(svgUrl)
        }
      }, 'image/png')
    }
  }

  img.onerror = e => {
    console.error('Image load error', e)
    URL.revokeObjectURL(svgUrl)
  }

  // Load the DataURL of the SVG
  img.src = svgUrl

  //document.body.removeChild(element);

  //   const link = document.createElement("a")
  //   link.href = url
  //   link.setAttribute("download", `chart.svg`)
  //   document.body.appendChild(link)
  //   link.click()

  // Clean up and remove the link
  //link.parentNode.removeChild(link)
}

export async function downloadCanvasAsPng(
  canvas: RefObject<HTMLCanvasElement | null>,
  name = 'chart.png'
) {
  //get svg element.
  //d3.select("svg") //document.getElementById("svg");

  if (canvas.current) {
    const url = canvas.current.toDataURL('image/png')

    const link = document.createElement('a')
    link.href = url
    link.download = name
    document.body.appendChild(link) // Required for this to work in FireFox
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }
}
