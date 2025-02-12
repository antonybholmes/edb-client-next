import { DropdownMenuItem } from '@components/shadcn/ui/themed/dropdown-menu'
import { FileImageIcon } from '@icons/file-image-icon'
import { SaveIcon } from '@icons/save-icon'
import { downloadSvg, downloadSvgAsPng } from '@lib/image-utils'
import type { RefObject } from 'react'
import { ToolbarOptionalDropdownButton } from './toolbar-optional-dropdown-button'

interface IProps {
  svgRef: RefObject<SVGElement | null>
  canvasRef: RefObject<HTMLCanvasElement | null>
  downloadRef: RefObject<HTMLAnchorElement | null>
}

export function ToolbarSaveSvg({ svgRef, canvasRef, downloadRef }: IProps) {
  return (
    <ToolbarOptionalDropdownButton
      onMainClick={() => downloadSvgAsPng(svgRef, canvasRef, downloadRef)}
      icon={<SaveIcon className="-scale-100 fill-foreground" />}
      tooltip="Save image"
      aria-label="Save as PNG"
    >
      <DropdownMenuItem
        onClick={() => downloadSvgAsPng(svgRef, canvasRef, downloadRef)}
      >
        <FileImageIcon fill="" />
        <span>Download as PNG</span>
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => downloadSvg(svgRef, downloadRef)}>
        Download as SVG
      </DropdownMenuItem>
    </ToolbarOptionalDropdownButton>
  )
}
