import type { RefObject } from 'react'

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
  downloadRef: RefObject<HTMLAnchorElement | null>,
  name = 'chart.svg'
) {
  if (!svgRef.current || !downloadRef.current) {
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

  downloadRef.current.href = url
  downloadRef.current.download = name
  //document.body.appendChild(element); // Required for this to work in FireFox
  downloadRef.current.click()
  //document.body.removeChild(element);

  //   const link = document.createElement("a")
  //   link.href = url
  //   link.setAttribute("download", `chart.svg`)
  //   document.body.appendChild(link)
  //   link.click()

  // Clean up and remove the link
  //link.parentNode.removeChild(link)
}

export async function downloadImageAutoFormat(
  svgRef: RefObject<SVGElement | null>,
  canvasRef: RefObject<HTMLCanvasElement | null>,
  downloadRef: RefObject<HTMLAnchorElement | null>,
  name = 'chart.png',
  scale = 2
) {
  if (name.endsWith('svg')) {
    downloadSvg(svgRef, downloadRef, name)
  } else {
    downloadSvgAsPng(svgRef, canvasRef, downloadRef, name, scale)
  }
}

export async function downloadSvgAsPng(
  svgRef: RefObject<SVGElement | null>,
  canvasRef: RefObject<HTMLCanvasElement | null>,
  downloadRef: RefObject<HTMLAnchorElement | null>,
  name = 'chart.png',
  scale = 2
) {
  if (!svgRef.current || !canvasRef.current || !downloadRef.current) {
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

  const ctx = canvasRef.current.getContext('2d')

  const newWidth = svgRef.current.clientWidth * scale //3000
  const img = new Image()

  img.onload = function () {
    if (ctx && canvasRef.current && downloadRef.current) {
      // Declare initial dimensions of the image
      const originalWidth = img.width
      const originalHeight = img.height

      // Declare the new width of the image
      // And calculate the new height to preserve the aspect ratio
      img.width = newWidth
      img.height = (originalHeight / originalWidth) * newWidth

      // Set the dimensions of the canvas to the new dimensions of the image
      canvasRef.current.width = img.width
      canvasRef.current.height = img.height

      // Render image in Canvas
      ctx.drawImage(img, 0, 0, img.width, img.height)

      canvasRef.current.toBlob(blob => {
        if (blob && downloadRef.current) {
          const url = window.URL.createObjectURL(blob)

          downloadRef.current.href = url
          downloadRef.current.download = name
          //document.body.appendChild(element); // Required for this to work in FireFox
          downloadRef.current.click()
        }
      }, 'image/png')
    }
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
  canvas: HTMLCanvasElement | null,
  downloadRef: RefObject<HTMLAnchorElement | null>,
  name = 'chart.png'
) {
  //get svg element.
  //d3.select("svg") //document.getElementById("svg");

  //console.log(canvas, downloadRef.current)

  if (canvas && downloadRef.current) {
    const url = canvas.toDataURL('image/png')

    downloadRef.current.href = url
    downloadRef.current.download = name
    //document.body.appendChild(element); // Required for this to work in FireFox
    downloadRef.current.click()
  }
}
