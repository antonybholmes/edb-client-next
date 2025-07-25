import { MIME_JSON } from './http/urls'

export function downloadJson(data: unknown, file: string = 'data.json') {
  const s = JSON.stringify(data, null, 2)

  download(s, file, MIME_JSON)
}

export function download(
  data: string,

  file: string = 'data.txt',
  mime: string = 'text/plain'
) {
  const blob = new Blob([data], { type: mime })

  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = file
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
