// import { FileDropZonePanel } from '@/components/file-dropzone-panel'
// import { VCenterCol } from '@/components/layout/v-center-col'
// import {
//   ColorPickerButton,
//   SIMPLE_COLOR_EXT_CLS,
// } from '@/components/plot/color-picker-popover'
// import { TEXT_OK } from '@/consts'
// import { OKCancelDialog } from '@/dialog/ok-cancel-dialog'
// import { COLOR_BLACK } from '@/lib/color/color'
// import { BigBed } from '@gmod/bbi'
// import { BlobFile } from 'generic-filehandle2'
// import { useState } from 'react'

// export interface IProps {
//   callback?: (name: string, color: string, bigBeds: BigBed[]) => void
//   onCancel: () => void
// }

// export function AddLocalBigBedsDialog({ callback, onCancel }: IProps) {
//   const [name, setName] = useState('')
//   const [color, setColor] = useState(COLOR_BLACK)
//   const [error] = useState('')
//   const [bigBeds, setBigWigs] = useState<BigBed[]>([])

//   return (
//     <OKCancelDialog
//       open={true}
//       //buttons={[TEXT_OK]}
//       title="Load BigBed Files From Device"
//       bodyCls="gap-y-4"
//       onResponse={response => {
//         if (response === TEXT_OK) {
//           if (bigBeds.length > 0) {
//             callback?.(name, color, bigBeds)
//           }
//         } else {
//           onCancel()
//         }
//       }}
//       showClose={true}
//       leftFooterChildren={
//         <>{error && <span className="text-destructive">{error}</span>}</>
//       }
//       leftHeaderChildren={
//         <ColorPickerButton
//           color={color}
//           onColorChange={setColor}
//           className={SIMPLE_COLOR_EXT_CLS}
//           title="Set color"
//         />
//       }
//     >
//       <FileDropZonePanel className="grow"
//         fileTypes={{ 'application/octet-stream': ['.bb', '.bigBed'] }}
//         onFileDrop={files => {
//           if (files.length > 0) {
//             setName(files.map(f => f.name).join(', '))

//             //
//             // TODO: generic-filehandle2 is garbage and won't compile in browser so remove until fixed
//             //

//             setBigWigs(
//               files.map(file => {
//                 return new BigBed({
//                   filehandle: new BlobFile(file),
//                 })
//               })
//             )
//           }
//         }}
//       >
//         <VCenterCol className="items-center h-32 border-2 border-dashed border-border rounded-theme pointer-events-none gap-y-4">
//           {bigBeds.length > 0 ? (
//             <>
//               <span className="font-bold">{name}</span>
//               <span>To replace, drag other BigBed files here.</span>
//             </>
//           ) : (
//             <span>Drag BigBed files here.</span>
//           )}
//         </VCenterCol>
//       </FileDropZonePanel>
//     </OKCancelDialog>
//   )
// }
