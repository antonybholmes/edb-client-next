import { PropRow } from '@/components/dialogs/prop-row'
import { SwitchPropRow } from '@/components/dialogs/switch-prop-row'
import { FontPopover } from '@/components/plot/font/font-popover'
import { NumericalInput } from '@/components/shadcn/ui/themed/numerical-input'
import { Input } from '@/components/shadcn/ui/themed/v2/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/shadcn/ui/themed/v2/popover'
import { ToolbarIconButton } from '@/components/toolbar/toolbar-icon-button'
import { ITEM_REGEX } from '@/consts'
import { vfill } from '@/lib/fill'
import { numSort } from '@/lib/math/math'
import { capitalCase } from '@/lib/text/capital-case'
import { produce } from 'immer'
import { MoveRight, MoveUp } from 'lucide-react'
import { useState } from 'react'
import { IPlotAddress, useAxes, useAxis } from '../axes-store'
import { getAxisFormatter, getAxisTicks, IAxis } from '../axis'
import { ITickItem } from '../svg-axis-props'

const RANGE_REGEX = /^(\d+|start)-(-?\d+|end)$/

export function TickPlotPropsPopover({
  title,
  plotAddress,
  which,
}: {
  title: string
  plotAddress: IPlotAddress
  which: 'major' | 'minor'
}) {
  const [open, setOpen] = useState(false)

  const { updateAxis } = useAxes()

  const { axis } = useAxis(plotAddress)

  const ticks = axis.ticks[which]

  const items = getAxisTicks(axis, { which })
  const format = getAxisFormatter(axis, axis.ticks.major.numTicks)

  const icon = title.toLowerCase().includes('x') ? (
    <MoveRight size={which === 'major' ? 18 : 14} strokeWidth={1.5} />
  ) : (
    <MoveUp size={which === 'major' ? 18 : 14} strokeWidth={1.5} />
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="text-foreground/70 hover:text-foreground data-pressed:text-foreground"
        title={`${title} Properties`}
        render={<ToolbarIconButton>{icon}</ToolbarIconButton>}
      />

      <PopoverContent className="gap-y-1">
        <SwitchPropRow
          title={title}
          className="font-bold"
          checked={ticks.show}
          onCheckedChange={(v) => {
            updateAxis(plotAddress, {
              ticks: produce(axis.ticks, (draft) => {
                draft[which].show = v
              }),
            })
          }}
        >
          <FontPopover
            fonts={[
              {
                title: `${title} ${capitalCase(which)} Tick Labels`,
                textProps: ticks.style.labels,
                showRotation: true,
                update: (f) =>
                  updateAxis(plotAddress, {
                    ticks: produce(axis.ticks, (draft) => {
                      draft[which].style.labels = Object.assign(
                        {},
                        draft[which].style.labels,
                        f
                      )
                    }),
                  }),
              },
            ]}
          />
        </SwitchPropRow>

        <SwitchPropRow
          title="Ticks"
          tooltip="Specify the tick values using semicolons (e.g., 1; 2; 3) or use 'auto' for automatic ticks. Use a-b for ranges, e.g. 1-5;6;7"
          checked={axis.ticks[which].style.line.show}
          onCheckedChange={(v) => {
            updateAxis(plotAddress, {
              ticks: produce(axis.ticks, (draft) => {
                draft[which].style.line.show = v
              }),
            })
          }}
        >
          <Input
            value={items.map((v) => format(v.v)).join('; ')}
            onTextChanged={(v) => {
              if (v === 'auto') {
                updateAxis(plotAddress, {
                  ticks: produce(axis.ticks, (draft) => {
                    draft[which].items = undefined
                  }),
                })
                return
              }

              updateAxis(plotAddress, {
                ticks: produce(axis.ticks, (draft) => {
                  draft[which].items = parseValues(v, axis)
                }),
              })
            }}
            w="lg"
          />
        </SwitchPropRow>

        <SwitchPropRow
          title="Labels"
          tooltip="Specify the tick labels using semicolons (e.g., 1; 2; 3)"
          checked={axis.ticks[which].style.labels.show}
          onCheckedChange={(v) => {
            updateAxis(plotAddress, {
              ticks: produce(axis.ticks, (draft) => {
                draft[which].style.labels.show = v
              }),
            })
          }}
        >
          <Input
            value={items
              .map((v) => v?.label?.trim() ?? '')
              .filter((s) => s.length > 0)
              .join('; ')}
            onTextChanged={(v) => {
              updateAxis(plotAddress, {
                ticks: produce(axis.ticks, (draft) => {
                  draft[which].items = parseTickLabels(v, items, format, axis)
                }),
              })
            }}
            w="lg"
          />
        </SwitchPropRow>

        <PropRow title="Size / Offset">
          <NumericalInput
            title="Size"

            value={ticks.style.line.size}

            limit={[1, 1000]}
            dp={0}
            onNumChanged={(v) => {
              updateAxis(plotAddress, {
                ticks: produce(axis.ticks, (draft) => {
                  draft[which].style.line.size = v
                }),
              })
            }}
          />

          <NumericalInput
            value={ticks.style.line.offset}
            title="Offset"
            onNumChanged={(v) => {
              updateAxis(plotAddress, {
                ticks: produce(axis.ticks, (draft) => {
                  draft[which].style.line.offset = v
                }),
              })
            }}
          />
        </PropRow>
        <PropRow title="Label Offset">
          <NumericalInput
            value={ticks.style.labels.offset}
            title="Label Offset"
            onNumChanged={(v) => {
              updateAxis(plotAddress, {
                ticks: produce(axis.ticks, (draft) => {
                  draft[which].style.labels.offset = v
                }),
              })
            }}
          />
        </PropRow>
      </PopoverContent>
    </Popover>
  )
}

function parseValues(v: string, ax: IAxis): ITickItem[] | undefined {
  if (v === 'auto') {
    return undefined
  }

  if (v === 'clear') {
    return []
  }

  const values = v
    .split(ITEM_REGEX)
    .map((s) => s.trim().replaceAll(',', ''))
    .filter((s) => s !== '')

  const ticks = new Set<number>()

  for (const value of values) {
    // See if a range is specified, e.g., "1-5"
    const rangeMatch = value.match(RANGE_REGEX)

    if (rangeMatch) {
      const rangeValues = parseRange(rangeMatch, ax)
      for (const v of rangeValues) {
        ticks.add(v)
      }

      continue
    }

    const v: number = parseFloat(value)

    if (Number.isFinite(v)) {
      ticks.add(v)
      continue
    }
  }

  const ret = numSort([...ticks]).map((v) => ({ v, label: String(v) }))

  return ret
}

function parseTickLabels(
  v: string,
  items: ITickItem[],
  format: (v: number) => string,
  ax: IAxis
): ITickItem[] | undefined {
  const values: string[] = []

  switch (v) {
    case 'auto':
      values.push(...items.map((v) => format(v.v)))
      break
    case 'clear':
      values.push(...vfill('', items.length))
      break
    default:
      const parsedValues = v
        .split(ITEM_REGEX)
        .map((s) => s.trim())
        .filter((s) => s !== '')

      for (const parsedValue of parsedValues) {
        const rangeMatch = parsedValue.match(RANGE_REGEX)

        if (rangeMatch) {
          const rangeValues = parseRange(rangeMatch, ax)

          values.push(...rangeValues.map(String))

          continue
        }

        values.push(parsedValue)
      }

      break
  }

  // map to existing labels
  const newItems = items.map((item, i) => ({
    v: item.v,
    label: i < values.length ? values[i] : '',
  }))

  return newItems
}

function parseRange(rangeMatch: RegExpMatchArray, ax: IAxis): number[] {
  let start =
    rangeMatch[1] === 'start' ? ax.domain[0] : parseFloat(rangeMatch[1])

  if (!Number.isFinite(start)) {
    return []
  }

  let endValue = rangeMatch[2]
  let negMode = false

  let end: number

  if (endValue === 'end') {
    end = ax.domain[1]
  } else {
    if (endValue.startsWith('-')) {
      negMode = true
      endValue = endValue.slice(1)
    }

    end = parseFloat(endValue)

    if (!Number.isFinite(end)) {
      return []
    }

    if (negMode) {
      end = ax.domain[1] - end + 1
    }
  }

  const values = []

  for (let i = start; i <= end; i++) {
    values.push(i)
  }

  return values
}
