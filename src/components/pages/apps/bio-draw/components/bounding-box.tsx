import type { IBox } from '@/interfaces/pos'

const HANDLE_DEFS = [
  { x: 0, y: 0, dir: 'nw' },
  { x: 0.5, y: 0, dir: 'n' },
  { x: 1, y: 0, dir: 'ne' },
  { x: 0, y: 0.5, dir: 'w' },
  { x: 1, y: 0.5, dir: 'e' },
  { x: 0, y: 1, dir: 'sw' },
  { x: 0.5, y: 1, dir: 's' },
  { x: 1, y: 1, dir: 'se' },
]

interface IProps {
  bbox: IBox
  handleMouseDown: (e: MouseEvent | React.MouseEvent, direction: string) => void
}

export function BoundingBoxSvg({ bbox, handleMouseDown }: IProps) {
  return (
    <>
      <rect
        x={bbox.x}
        y={bbox.y}
        width={bbox.width}
        height={bbox.height}
        fill="transparent"
        stroke="cornflowerblue"
        //pointerEvents="all"
        //strokeDasharray="4"
        onMouseDown={e => {
          handleMouseDown(e, 'move')
        }}
      />

      {HANDLE_DEFS.map(({ x, y, dir }, i) => {
        switch (dir) {
          case 'n':
          case 's':
            return (
              <rect
                key={i}
                x={bbox!.x + x * bbox!.width - 6}
                y={bbox!.y + y * bbox!.height - 1.5}
                width={12}
                height={3}
                rx={2}
                fill="white"
                stroke="cornflowerblue"
                strokeWidth={1}
                onMouseDown={e => {
                  e.stopPropagation()
                  handleMouseDown(e, dir)
                }}
                style={{ cursor: `${dir}-resize` }}
              />
            )
          case 'e':
          case 'w':
            return (
              <rect
                key={i}
                x={bbox!.x + x * bbox!.width - 1.6}
                y={bbox!.y + y * bbox!.height - 6}
                width={3}
                height={12}
                rx={2}
                fill="white"
                stroke="cornflowerblue"
                strokeWidth={1}
                onMouseDown={e => {
                  e.stopPropagation()
                  handleMouseDown(e, dir)
                }}
                style={{ cursor: `${dir}-resize` }}
              />
            )
          default:
            return (
              <circle
                key={i}
                cx={bbox!.x + x * bbox!.width}
                cy={bbox!.y + y * bbox!.height}
                r={3}
                fill="cornflowerblue"
                stroke="white"
                strokeWidth={1}
                onMouseDown={e => {
                  e.stopPropagation()
                  handleMouseDown(e, dir)
                }}
                style={{ cursor: `${dir}-resize` }}
              />
            )
        }
      })}
    </>
  )
}
