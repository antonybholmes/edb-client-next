import { TEXT_CANCEL, TEXT_OK } from '@/consts'

import { Form, FormField } from '@/components/shadcn/ui/themed/v2/form'
import { OKCancelDialog, type IModalProps } from '@/dialogs/ok-cancel-dialog'
import { BaseDataFrame, findCol } from '@/lib/dataframe/base-dataframe'
import { uniqueInOrder } from '@/lib/utils'
import { SelectItem, SelectList } from '@/themed/v2/select'

import {
  DEFAULT_COLOR_PROPS,
  DEFAULT_STROKE_PROPS,
  WHITE_FILL_PROPS,
} from '@/components/plot/svg-props'
import { CheckPropRow } from '@/dialogs/check-prop-row'
import { PropRow } from '@/dialogs/prop-row'
import { TAB10_PALETTE } from '@/lib/color/palette'
import type { AnnotationDataFrame } from '@/lib/dataframe/annotation-dataframe'
import { DataFrame } from '@/lib/dataframe/dataframe'
import { range } from '@/lib/math/range'
import { useRef, type BaseSyntheticEvent } from 'react'
import { useForm } from 'react-hook-form'
import {
  newBoxPlot,
  useSheet,
  type HistoryPlot,
} from '../../history/history-store'
import { cleanHue } from './boxplot-plot-svg'

const MAX_COLS = 30

interface IFormInput {
  xCol: string
  yCol: string
  hueCol: string
  columnMode: boolean
}

export interface IProps extends IModalProps<HistoryPlot> {
  open?: boolean
}

export function BoxWhiskersDialog({
  open = true,
  //df,
  onResponse,
}: IProps) {
  const sheet = useSheet()

  //const branch = findBranch(branchAddr, history)[0]
  //const step = currentStep(branch)[0]
  let df = sheet as AnnotationDataFrame

  function _resp(resp: string) {
    onResponse?.(resp, undefined)
  }

  const btnRef = useRef<HTMLButtonElement>(null)

  const form = useForm<IFormInput>({
    defaultValues: {
      xCol: df?.columns[0] ?? '',
      yCol: df?.columns[1] ?? '',
      hueCol: '<none>',
      columnMode: false,
    },
  })

  async function onSubmit(data: IFormInput, e: BaseSyntheticEvent | undefined) {
    e?.preventDefault()
    if (!df) {
      _resp(TEXT_CANCEL)
      return
    }

    let hueCol = ''
    let xCol = ''
    let yCol = ''
    let xOrder: string[] = []
    let hueOrder: string[] = ['']

    let boxDf: BaseDataFrame = df

    if (data.columnMode) {
      // convert columns to data
      xCol = 'Category'
      yCol = 'Datum'
      hueCol = xCol
      //Make a fake column for hue with same name as x col containing only
      // the name of the x col. That way we have a name for it when creating
      // the length rather than using a blank space
      hueOrder = [xCol]
      xOrder = uniqueInOrder(df.columns)

      const data = range(df.shape[0])
        .map(col => df.col(col).numsNoNA.map(v => [df.columns[col]!, v]))
        .flat()

      boxDf = new DataFrame({ data, columns: ['Category', 'Datum'] })
    } else {
      xCol = data.xCol
      yCol = data.yCol
      hueOrder = [xCol]

      if (data.hueCol !== '<none>') {
        hueCol = data.hueCol
        if (findCol(df, hueCol) !== -1) {
          hueOrder = uniqueInOrder(df.col(hueCol).strs).map(v => cleanHue(v))
        }
      } else {
        hueCol = xCol
        //hueOrder = [xCol]
      }

      xOrder = uniqueInOrder(df.col(xCol).strs)
    }

    const singlePlotDisplayOptions = Object.fromEntries(
      xOrder.map(x => [
        x,
        Object.fromEntries(
          hueOrder.map((hue, huei) => {
            const color = TAB10_PALETTE[huei % TAB10_PALETTE.length]

            return [
              hue,
              {
                box: {
                  stroke: { ...DEFAULT_STROKE_PROPS, color },
                  fill: { ...WHITE_FILL_PROPS },
                  median: {
                    stroke: { ...DEFAULT_STROKE_PROPS, color },
                  },
                },
                violin: {
                  stroke: { ...DEFAULT_STROKE_PROPS, color },
                  fill: { ...DEFAULT_COLOR_PROPS, color },
                },
                swarm: {
                  stroke: { ...DEFAULT_STROKE_PROPS, color },
                  fill: { ...DEFAULT_COLOR_PROPS, color },
                },
              },
            ]
          })
        ),
      ])
    )

    const plot: HistoryPlot = newBoxPlot(
      'Box Plot',
      { main: boxDf },
      {
        x: xCol,
        y: yCol,
        hue: hueCol,
        xOrder,
        hueOrder,

        singlePlotDisplayOptions,
      }
    )

    //console.log('add plot', plot)

    //addPlots([plot])

    // plotsDispatch({
    //   type: 'add',
    //   customProps: {
    //     df,
    //     x,
    //     y,
    //     hue,
    //     xOrder,
    //     hueOrder,
    //     displayOptions: { ...DEFAULT_BOX_WHISKER_DISPLAY_PROPS },
    //     singlePlotDisplayOptions,
    //   },
    //   style: 'Box Plot Plot',
    // })

    onResponse?.(TEXT_OK, plot)
  }

  const cols = df?.columns.slice(0, MAX_COLS)

  return (
    <OKCancelDialog
      open={open}
      title="Box Plot"
      onResponse={r => {
        if (r === TEXT_OK) {
          btnRef.current?.click()
        } else {
          _resp(TEXT_CANCEL)
        }
      }}
      //contentVariant="glass"
    >
      <Form {...form}>
        <form
          className="flex flex-col gap-y-2"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            name="columnMode"
            render={({ field }) => (
              <CheckPropRow
                title="Column Mode"
                onCheckedChange={field.onChange}
                checked={field.value}
              />
            )}
          />

          <FormField
            control={form.control}
            name="xCol"
            render={({ field }) => (
              <PropRow title="X">
                <SelectList
                  onValueChange={field.onChange}
                  value={field.value}
                  w="lg"
                >
                  {cols.map((name, ni) => (
                    <SelectItem value={name} key={ni}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectList>
              </PropRow>
            )}
          />

          <FormField
            control={form.control}
            name="yCol"
            render={({ field }) => (
              <PropRow title="X">
                <SelectList
                  onValueChange={field.onChange}
                  value={field.value}
                  w="lg"
                >
                  {cols.map((name, ni) => (
                    <SelectItem value={name} key={ni}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectList>
              </PropRow>
            )}
          />

          <FormField
            control={form.control}
            name="hueCol"
            render={({ field }) => (
              <PropRow title="Hue">
                <SelectList
                  onValueChange={field.onChange}
                  value={field.value}
                  w="lg"
                >
                  <SelectItem value="<none>" key="none">
                    {'<none>'}
                  </SelectItem>

                  {cols.map((name, ni) => (
                    <SelectItem value={name} key={ni}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectList>
              </PropRow>
            )}
          />

          <button ref={btnRef} type="submit" className="hidden" />
        </form>
      </Form>
    </OKCancelDialog>
  )
}
