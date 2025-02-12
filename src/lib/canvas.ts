export function setupCanvas(canvas: HTMLCanvasElement, scale: number = 1) {
  // Get the device pixel ratio, falling back to 1.
  let dpr = window.devicePixelRatio || 1 //* UPSCALE //Math.max(1, window.devicePixelRatio || 1)

  //console.log('wdpr', window.devicePixelRatio, dpr)

  // Get the size of the canvas in CSS pixels.
  const rect = canvas.getBoundingClientRect()

  // Give the canvas pixel dimensions of their CSS
  // size * the device pixel ratio.
  //console.log('w', rect.width * dpr)

  canvas.width = rect.width * dpr // * UPSCALE
  canvas.height = rect.height * dpr // * UPSCALE

  //canvas.style.transformOrigin = "0 0"
  //canvas.style.transform = `scale(${scale})`

  //canvas.style.width = rect.width + 'px';
  //canvas.style.height = rect.height + 'px';

  const ctx = canvas.getContext('2d')
  // Scale all drawing operations by the dpr, so you
  // don't have to worry about the difference.

  if (ctx) {
    dpr *= scale
    ctx.scale(dpr, dpr)
  }

  return ctx
}
