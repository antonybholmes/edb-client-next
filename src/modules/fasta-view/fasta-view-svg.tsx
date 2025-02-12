import {
  COLOR_BLACK,
  COLOR_BLUE,
  COLOR_GREEN,
  COLOR_RED,
  COLOR_WHITE,
} from '@/consts'
import { type IElementProps } from '@interfaces/element-props'
import { type ISeq } from '@interfaces/seq'
import { type IStringMap } from '@interfaces/string-map'
import { cn } from '@lib/class-names'
import { range } from '@lib/math/range'

import { forwardRef, useMemo, useRef, useState } from 'react'

interface IProps extends IElementProps {
  seqFiles: ISeq[]
  onFileChange: (message: string, files: FileList | null) => void
  displayProps: {
    scale: number
    colorMode: boolean
    base: {
      mismatches: boolean
      bgMode: boolean
      bgColor: string
    }
  }
}

const BASE_MAP: IStringMap = {
  A: 'Adenine',
  C: 'Cytosine',
  G: 'Guanine',
  T: 'Thymine',
  '-': 'N',
  N: 'N',
  a: 'Adenine',
  c: 'Cytosine',
  g: 'Guanine',
  t: 'Thymine',
  n: 'N',
}

const BASE_COLOR_MAP: IStringMap = {
  A: COLOR_GREEN,
  C: COLOR_BLUE,
  G: COLOR_RED,
  T: COLOR_BLACK,
  a: COLOR_GREEN,
  c: COLOR_BLUE,
  g: COLOR_RED,
  t: COLOR_BLACK,
  N: 'gray',
  n: 'gray',
}

const BLOCK_SIZE = { w: 14, h: 20 }
const HALF_BLOCK_SIZE = 0.5 * BLOCK_SIZE.h
const RULER_HEIGHT = 50
const RULER_LINE_Y = RULER_HEIGHT - BLOCK_SIZE.h
const RULER_LABEL_OFFSET = 6
const TICK_SIZE = 6
const MINOR_TICK_SIZE = 4
const TICK_LABEL_Y = RULER_LINE_Y - RULER_LABEL_OFFSET
const PADDING = BLOCK_SIZE.h

const margin = { top: PADDING, right: PADDING, bottom: 20, left: 300 }

export const SeqViewSvg = forwardRef<SVGElement, IProps>(function SeqViewSvg(
  { seqFiles, displayProps, className }: IProps,
  svgRef
) {
  //const svgRef = useRef<SVGSVGElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const highlightRef = useRef<HTMLSpanElement>(null)

  const baseRefs = useRef<(SVGRectElement | null)[][]>([])

  const [toolTipInfo, setToolTipInfo] = useState({
    left: -1,
    top: -1,
    visible: false,
    seqIndex: 0,
    pos: -1,
  })

  const [highlightCol, setHighlightCol] = useState(-1)
  const [highlightRow, setHighlightRow] = useState(-1)

  // max bases to display
  const maxLength = Math.max(...seqFiles.map((f) => f.seq.length))

  const bw = BLOCK_SIZE.w * displayProps.scale
  const halfBw = 0.5 * bw

  const innerWidth = maxLength * bw
  const innerHeight = seqFiles.length * BLOCK_SIZE.h
  const width = innerWidth + margin.left + margin.right
  const height = innerHeight + margin.top + margin.bottom + RULER_HEIGHT

  const svg = useMemo(() => {
    //console.log("memo")

    if (seqFiles.length === 0) {
      return null
    }

    const gaps = Math.max(1, Math.round(2 / displayProps.scale))

    // reset
    baseRefs.current.length = 0

    return (
      <svg
        style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
        fontFamily="Arial, Helvetica, sans-serif"
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        ref={svgRef}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        //shapeRendering={SVG_CRISP_EDGES}
      >
        <rect width="100%" height="100%" fill="white" />

        {/* <g
          transform={`translate(${margin.left - 1}, ${
            margin.top + RULER_HEIGHT
          })`}
        >
          <line y2={seqFiles.length * BLOCK_SIZE.h} stroke={COLOR_BLACK} />
        </g> */}

        <g transform={`translate(${margin.left}, ${margin.top})`}>
          <line
            x1={halfBw - 0.5}
            y1={RULER_LINE_Y}
            x2={bw * maxLength - halfBw + 0.5}
            y2={RULER_LINE_Y}
            stroke={COLOR_BLACK}
          />

          {range(maxLength).map((tick) => {
            const x = tick * bw + halfBw

            const t = gaps % 2 == 0 ? tick + 1 : tick

            if (tick === 0 || t % gaps === 0) {
              return (
                <g key={tick}>
                  {/* <line
                    x1={x}
                    y1={RULER_LINE_Y - TICK_SIZE}
                    x2={x}
                    y2={RULER_LINE_Y}
                    stroke={COLOR_BLACK}
                  /> */}
                  <line
                    key={tick}
                    x1={x}
                    y1={RULER_LINE_Y + 1}
                    x2={x}
                    y2={RULER_LINE_Y + TICK_SIZE}
                    stroke={COLOR_BLACK}
                  />
                  <text
                    x={x}
                    y={TICK_LABEL_Y}
                    fill={COLOR_BLACK}
                    fontSize="x-small"
                    textAnchor="middle"
                  >
                    {tick + 1}
                  </text>
                </g>
              )
            } else {
              // minor
              return (
                <line
                  key={tick}
                  x1={x}
                  y1={RULER_LINE_Y + 1}
                  x2={x}
                  y2={RULER_LINE_Y + MINOR_TICK_SIZE}
                  stroke={COLOR_BLACK}
                />
              )
            }
          })}
        </g>
        <g>
          {seqFiles.map((f, fi) => {
            const y = fi * BLOCK_SIZE.h

            baseRefs.current.push([])

            return (
              <g
                transform={`translate(0, ${margin.top + RULER_HEIGHT})`}
                key={fi}
              >
                <text
                  x={PADDING}
                  y={fi * BLOCK_SIZE.h + HALF_BLOCK_SIZE}
                  fill={COLOR_BLACK}
                  dominantBaseline="central"
                  fontSize="smaller"
                >
                  {f.name}
                </text>

                <g
                  fontFamily="Courier, Arial, Helvetica, sans-serif"
                  fontWeight="bold"
                  transform={`translate(${margin.left}, 0)`}
                >
                  {range(f.seq.length).map((si) => {
                    let fill =
                      f.seq[si] !== '-'
                        ? displayProps.base.bgMode
                          ? displayProps.base.bgColor
                          : COLOR_WHITE
                        : COLOR_WHITE

                    let textColor = displayProps.colorMode
                      ? // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        //@ts-ignore
                        BASE_COLOR_MAP[f.seq[si]]
                      : COLOR_BLACK
                    const x = si * bw

                    if (fi > 0) {
                      if (
                        displayProps.base.mismatches &&
                        f.seq[si] !== '-' &&
                        f.seq[si]!.toLowerCase() !==
                          seqFiles[0]!.seq[si]!.toLowerCase()
                      ) {
                        fill = displayProps.colorMode
                          ? // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            //@ts-ignore
                            BASE_COLOR_MAP[f.seq[si]]
                          : COLOR_RED
                        textColor = COLOR_WHITE
                      }
                    }

                    return (
                      <g key={si}>
                        <rect
                          id={`${fi}:${si}`}
                          x={x}
                          y={y}
                          width={bw}
                          height={BLOCK_SIZE.h}
                          fill={fill}
                          ref={(ref) => baseRefs.current[fi].push(ref)}
                        />
                        {displayProps.scale >= 0.8 && (
                          <text
                            x={x + halfBw}
                            y={y + HALF_BLOCK_SIZE}
                            fill={textColor}
                            textAnchor="middle"
                            dominantBaseline="central"
                            pointerEvents="none"
                          >
                            {f.seq[si]}
                          </text>
                        )}
                      </g>
                    )
                  })}
                </g>
              </g>
            )
          })}
        </g>
      </svg>
    )
  }, [displayProps.scale, seqFiles, displayProps])

  // useMouseMoveListener((e:unknown) => {
  //   // @ts-ignore
  //   if (!ref.current) {
  //     return
  //   }

  //   if (
  //     // @ts-ignore
  //     e.pageX >= ref.current.getBoundingClientRect().left + margin.left &&
  //     e.pageX <
  //       // @ts-ignore
  //       ref.current.getBoundingClientRect().left +
  //         // @ts-ignore
  //         ref.current.getBoundingClientRect().width
  //   ) {
  //     console.log(bw)
  //     // @ts-ignore
  //     setHighlightLineX(Math.round((e.pageX - margin.left - ref.current.getBoundingClientRect().left) / bw) * bw + bw2 - 1)
  //   } else {
  //     setHighlightLineX(-1)
  //   }

  //   setHighlightRow(
  //     Math.round(
  //       (e.pageY -
  //         // @ts-ignore
  //         ref.current.getBoundingClientRect().top -
  //         PADDING -
  //         RULER_HEIGHT) /
  //         BLOCK_SIZE.h
  //     )
  //   )
  // })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function onMouseMove(e: MouseEvent | React.MouseEvent) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (!svgRef.current) {
      return
    }

    let c = Math.floor(
      (e.pageX -
        margin.left -
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        svgRef.current.getBoundingClientRect().left -
        window.scrollX) /
        bw
    )

    if (c < 0 || c > maxLength - 1) {
      c = -1
    }

    let r = Math.floor(
      (e.pageY -
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        svgRef.current.getBoundingClientRect().top -
        PADDING -
        RULER_HEIGHT -
        window.scrollY) /
        BLOCK_SIZE.h
    )

    if (r < 0 || r > seqFiles.length - 1) {
      r = -1
    }

    setHighlightRow(r)
    setHighlightCol(c)

    if (r > -1 && c > -1) {
      setToolTipInfo({
        ...toolTipInfo,
        seqIndex: r,
        pos: c,
        left: margin.left + (c + 1) * bw,
        top: PADDING + RULER_HEIGHT + (r + 1) * BLOCK_SIZE.h,
        visible: true,
      })
    }
    //console.log(Math.floor((e.pageX - margin.left - ref.current.getBoundingClientRect().left) / bw) * bw)
  }

  const inBlock =
    highlightCol > -1 && highlightRow > -1 && highlightRow < seqFiles.length

  const base: string = inBlock
    ? BASE_MAP[seqFiles[toolTipInfo.seqIndex]!.seq.charAt(toolTipInfo.pos)]!
    : 'N'

  return (
    <div
      className={cn('relative overflow-scroll bg-white', className)}
      onMouseMove={onMouseMove}
      onMouseLeave={() => {
        setHighlightRow(-1)
        setHighlightCol(-1)
      }}
    >
      <div
        ref={tooltipRef}
        className={cn(
          'absolute z-50 rounded-theme bg-black/60 p-3 text-xs text-white',
          [inBlock && toolTipInfo.visible, 'opacity-100', 'opacity-0']
        )}
        style={{ left: toolTipInfo.left, top: toolTipInfo.top }}
      >
        <p className="font-semibold">
          {toolTipInfo.seqIndex in seqFiles
            ? seqFiles[toolTipInfo.seqIndex]!.name
            : ''}
        </p>
        <p>Base: {base}</p>
        <p>Pos: {toolTipInfo.pos + 1}</p>
      </div>

      <span
        ref={highlightRef}
        className={cn('absolute z-40 border border-black', [
          inBlock,
          'opacity-100',
          'opacity-0',
        ])}
        style={{
          top: `${PADDING + RULER_HEIGHT + highlightRow * BLOCK_SIZE.h}px`,
          left: `${margin.left + highlightCol * bw}px`,
          width: `${bw}px`,
          height: `${BLOCK_SIZE.h}px`,
        }}
      />

      {svg}

      {highlightRow > -1 && highlightRow < seqFiles.length && (
        <span
          className="pointer-events-none absolute left-0 z-10 bg-blue-400/20"
          style={{
            top: `${PADDING + RULER_HEIGHT + highlightRow * BLOCK_SIZE.h}px`,
            height: `${BLOCK_SIZE.h}px`,
          }}
        />
      )}

      {highlightCol > -1 && (
        <span
          className="pointer-events-none absolute top-0 z-20 bg-blue-400/50"
          style={{
            left: `${margin.left + highlightCol * bw + halfBw - 1}px`,
            marginTop: `${PADDING + RULER_LINE_Y}px`,
            width: '2px',
          }}
        />
      )}
    </div>
  )
})
