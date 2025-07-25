type MouseMoveCallback = (e: MouseEvent) => void

const listeners = new Set<MouseMoveCallback>()

function init() {
  if (listeners.size > 0) return

  window.addEventListener('mousemove', e => {
    for (const cb of listeners) cb(e)
  })
}

export function subscribeMouseMove(cb: MouseMoveCallback): () => void {
  init()
  listeners.add(cb)
  return () => listeners.delete(cb)
}
