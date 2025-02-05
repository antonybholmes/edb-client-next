import type { RefObject } from 'react'
import { MIME_JSON } from './http/urls'

export function downloadJson(
  data: unknown,
  downloadRef: RefObject<HTMLAnchorElement | null>,
  file: string = 'data.json'
) {
  const s = JSON.stringify(data, null, 2)

  download(s, downloadRef, file, MIME_JSON)
}

export function download(
  data: string,
  downloadRef: RefObject<HTMLAnchorElement | null>,
  file: string = 'data.txt',
  mime: string = 'text/plain'
) {
  const blob = new Blob([data], { type: mime })

  const url = URL.createObjectURL(blob)

  //console.log(downloadRef)

  if (downloadRef && downloadRef.current) {
    downloadRef.current.href = url
    downloadRef.current.download = file
    //document.body.appendChild(element); // Required for this to work in FireFox
    downloadRef.current.click()
  }
}
