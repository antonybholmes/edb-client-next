import { TEXT_CANCEL, TEXT_OK } from '@/consts'

import { OKCancelDialog, type IModalProps } from '@dialog/ok-cancel-dialog'
import { findCol } from '@lib/dataframe/base-dataframe'
import { uniqueInOrder } from '@lib/utils'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@themed/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@themed/select'

import {
  DEFAULT_FILL_PROPS,
  DEFAULT_STROKE_PROPS,
  WHITE_FILL_PROPS,
} from '@components/plot/svg-props'
import { TAB10_PALETTE } from '@lib/color/palette'
import { DataFrame } from '@lib/dataframe/dataframe'
import { range } from '@lib/math/range'
import { Checkbox } from '@themed/check-box'
import { useRef, type BaseSyntheticEvent } from 'react'
import { useForm } from 'react-hook-form'
import { newPlot, useHistory, type IPlot } from '../../history/history-store'
import { cleanHue, DEFAULT_BOX_PLOT_DISPLAY_PROPS } from './boxplot-plot-svg'

const MAX_COLS = 30

interface IFormInput {
  xCol: string
  yCol: string
  hueCol: string
  columnMode: boolean
}

export interface IProps extends IModalProps {
  open?: boolean
  //df: BaseDataFrame

  // onPlot: (
  //   df: BaseDataFrame,
  //   x: string,
  //   y: string,
  //   hue: string,
  //   xOrder: string[],
  //   hueOrder: string[]
  // ) => void
}

export function BoxPlotDialog({
  open = true,
  //df,
  onResponse,
}: IProps) {
  const { sheet, addPlots } = useHistory()

  //const branch = findBranch(branchAddr, history)[0]
  //const step = currentStep(branch)[0]
  let df = sheet! //currentSheet(step)[0]!

  function _resp(resp: string) {
    onResponse?.(resp)
  }

  const btnRef = useRef<HTMLButtonElement>(null)

  const form = useForm<IFormInput>({
    defaultValues: {
      xCol: df?.colNames[0] ?? '',
      yCol: df?.colNames[1] ?? '',
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

    if (data.columnMode) {
      // convert columns to data
      xCol = 'Category'
      yCol = 'Datum'
      hueCol = xCol
      //Make a fake column for hue with same name as x col containing only
      // the name of the x col. That way we have a name for it when creating
      // the length rather than using a blank space
      hueOrder = [xCol]
      xOrder = uniqueInOrder(df.colNames)

      const data = range(df.shape[0])
        .map(col => df.col(col).numsNoNA.map(v => [df.colNames[col]!, v]))
        .flat()

      df = new DataFrame({ data, columns: ['Category', 'Datum'] })
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
                  fill: { ...DEFAULT_FILL_PROPS, color },
                },
                swarm: {
                  stroke: { ...DEFAULT_STROKE_PROPS, color },
                  fill: { ...DEFAULT_FILL_PROPS, color },
                },
              },
            ]
          })
        ),
      ])
    )

    const plot: IPlot = {
      ...newPlot('Box Plot', { main: df }, 'box'),
      customProps: {
        x: xCol,
        y: yCol,
        hue: hueCol,
        xOrder,
        hueOrder,
        displayOptions: { ...DEFAULT_BOX_PLOT_DISPLAY_PROPS },
        singlePlotDisplayOptions,
      },
    }

    //console.log('add plot', plot)

    addPlots([plot])

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

    _resp(TEXT_OK)
  }

  const cols = df?.colNames.slice(0, MAX_COLS)

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
              <FormItem className="flex flex-row items-center gap-x-3">
                <FormControl>
                  <Checkbox
                    onCheckedChange={field.onChange}
                    checked={field.value}
                  />
                </FormControl>
                <FormLabel>Column Mode</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="xCol"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-x-2">
                <FormLabel className="w-24 shrink-0">X</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select the x column" />
                    </SelectTrigger>

                    <SelectContent>
                      {cols.map((name, ni) => (
                        <SelectItem value={name} key={ni}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="yCol"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-x-2">
                <FormLabel className="w-24 shrink-0">Y</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select the y column" />
                    </SelectTrigger>

                    <SelectContent>
                      {cols.map((name, ni) => (
                        <SelectItem value={name} key={ni}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="hueCol"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-x-2">
                <FormLabel className="w-24 shrink-0">Hue</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select the hue column" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="<none>" key="none">
                        {'<none>'}
                      </SelectItem>
                      {cols.map((name, ni) => (
                        <SelectItem value={name} key={ni}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />

          <button ref={btnRef} type="submit" className="hidden" />
        </form>
      </Form>
    </OKCancelDialog>
  )
}
