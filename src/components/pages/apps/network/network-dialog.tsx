import {
  ActionCheckRow,
  ActionDialogRow,
} from '@/components/dialogs/card/action-dialog-card'
import { ICustomDialogProps } from '@/components/dialogs/dialogs'
import { Checkbox } from '@/components/shadcn/ui/themed/baseui/check-box'
import { LineSeparator } from '@/components/shadcn/ui/themed/baseui/dropdown-menu'
import {
  RunningIndicator,
  useRunning,
} from '@/components/toolbar/running-indicator'
import { TEXT_OK } from '@/consts'
import { OKCancelDialog, type IModalProps } from '@/dialogs/ok-cancel-dialog'
import { type BaseDataFrame } from '@/lib/dataframe/base-dataframe'
import { SelectItem, SelectList } from '@/themed/baseui/select'
import { produce } from 'immer'
import { useEffect, useState } from 'react'
import { useCurrentSheets } from '../matcalc/history/history-provider/history-contexts'
import { HistoryPlot } from '../matcalc/history/history-provider/history-types'
import { useNetworkSettings } from './network-settings'
import { dataframesToNetwork, useNetwork } from './network-store'
import { useNetworkD3Sim } from './network-store-d3-sim'
import { useUserData } from './network-user-data-store'

const MAX_COLS = 10

export const SORT_BY_ITEMS = [
  { value: 'off', label: 'Off' },
  { value: 'nes', label: 'NES' },
  { value: 'pvalue', label: 'P-value' },
  { value: 'size', label: 'Size' },
]

function findLabelCol(df: BaseDataFrame) {
  if (!df) {
    return 'Label'
  }

  const cols = df.columns.strs.filter((c) => c.toLowerCase().includes('label'))

  if (cols.length === 0) {
    return 'Label'
  }

  return cols[0]
}

function findIdCol(df: BaseDataFrame) {
  if (!df) {
    return 'ID'
  }

  const cols = df.columns.strs.filter((c) =>
    c.toLowerCase().match(/.*(id|gene_set|name).*/)
  )

  if (cols.length === 0) {
    return 'ID'
  }

  return cols[0]
}

function findSizeCol(df: BaseDataFrame | null) {
  if (!df) {
    return 'Size'
  }

  const cols = df.columns.strs.filter((c) => c.toLowerCase() === 'size')

  if (cols.length === 0) {
    return 'Size'
  }

  return cols[0]
}

function findGroupCol(df: BaseDataFrame | null) {
  if (!df) {
    return ''
  }

  const cols = df.columns.strs.filter((c) =>
    c.toLowerCase().match(/.*(group|collection).*/)
  )

  if (cols.length === 0) {
    return ''
  }

  return cols[0]
}

function findSourceCol(df: BaseDataFrame | null) {
  if (!df) {
    return ''
  }

  const cols = df.columns.strs.filter((c) =>
    c.toLowerCase().match(/.*(source|from).*/)
  )

  if (cols.length === 0) {
    return ''
  }

  return cols[0]
}

function findTargetCol(df: BaseDataFrame | null) {
  if (!df) {
    return ''
  }

  const cols = df.columns.strs.filter((c) =>
    c.toLowerCase().match(/.*(target|to).*/)
  )

  if (cols.length === 0) {
    return ''
  }

  return cols[0]
}

function findStrengthCol(df: BaseDataFrame | null) {
  if (!df) {
    return ''
  }

  const cols = df.columns.strs.filter((c) =>
    c.toLowerCase().match(/.*(similarity).*/)
  )

  if (cols.length === 0) {
    return ''
  }

  return cols[0]
}

export interface IProps extends IModalProps<HistoryPlot> {
  open?: boolean
  //df: BaseDataFrame

  minThreshold?: number
}

export function NetworkDialog({ close }: ICustomDialogProps<unknown>) {
  const { sheets } = useCurrentSheets()
  const { settings, updateSettings } = useNetworkSettings()
  const { setNetwork } = useNetwork()
  const { settings: userData } = useUserData()

  const { status, setIdle } = useNetworkD3Sim()
  const { setMessage, clearMessage } = useRunning('network')

  const [dfNode, setDfNode] = useState<BaseDataFrame | null>(null)
  const [dfEdge, setDfEdge] = useState<BaseDataFrame | null>(null)

  // const labelCol = findCol(dfNodes, 'label')
  //   const sizeCol = findCol(dfNodes, 'size', { exact: true })
  //   const groupCol = findCol(dfNodes, 'collection')

  const [labelCol, setLabelCol] = useState<string>('')
  const [idCol, setIdCol] = useState<string>('')
  const [groupCol, setGroupCol] = useState<string>('')
  const [sizeCol, setSizeCol] = useState<string>('')
  const [useColor, setUseColor] = useState<boolean>(false)
  const [colorMetricCol, setColorMetricCol] = useState<string>('<none>')

  const [sourceCol, setSourceCol] = useState<string>('')
  const [targetCol, setTargetCol] = useState<string>('')
  const [strengthCol, setStrengthCol] = useState<string>('')

  useEffect(() => {
    const nodeSheets = sheets.filter((sheet) =>
      sheet.name.toLowerCase().includes('node')
    )
    const edgeSheets = sheets.filter((sheet) =>
      sheet.name.toLowerCase().includes('edge')
    )

    if (nodeSheets.length === 0 || edgeSheets.length === 0) {
      return
    }

    setDfNode(nodeSheets[0]! as BaseDataFrame)
    setDfEdge(edgeSheets[0]! as BaseDataFrame)
  }, [sheets])

  useEffect(() => {
    setLabelCol(findLabelCol(dfNode))
    setIdCol(findIdCol(dfNode))
    setGroupCol(findGroupCol(dfNode))
    setSizeCol(findSizeCol(dfNode))
    //setMetric2Col(findSizeCol(dfNode))
  }, [dfNode])

  useEffect(() => {
    setSourceCol(findSourceCol(dfEdge))
    setTargetCol(findTargetCol(dfEdge))
    setStrengthCol(findStrengthCol(dfEdge))
  }, [dfEdge])

  useEffect(() => {
    if (status === 'finished') {
      clearMessage()
      setIdle()
      close()
    }
  }, [status, clearMessage, close])

  async function submit() {
    if (
      !dfNode ||
      !dfEdge ||
      !labelCol ||
      !idCol ||
      !sizeCol ||
      !groupCol ||
      !sourceCol ||
      !targetCol ||
      !strengthCol
    ) {
      close()
      return
    }

    const { network, groups, nodes } = dataframesToNetwork(
      dfNode,
      dfEdge,
      idCol,
      labelCol,
      groupCol,
      sizeCol,
      colorMetricCol,
      sourceCol,
      targetCol,
      strengthCol,
      settings,
      userData
    )

    updateSettings(
      produce(settings, (draft) => {
        draft.plot.nodes.color.mode =
          useColor && colorMetricCol !== '<none>' ? 'auto' : 'group'
      })
    )

    setNetwork(
      network,
      nodes,
      groups,

      strengthCol,
      sizeCol,
      colorMetricCol
    )

    setMessage('Creating graph...')

    // runSim(() => {
    //   setMessage(null)
    //   close()
    // })

    close()
  }

  const colorCols = [
    '<none>',
    ...(dfNode?.columns.strs.filter((name) => name !== '').slice(0, MAX_COLS) ??
      []),
  ]

  return (
    <OKCancelDialog
      title="Network"
      onResponse={(r) => {
        if (r === TEXT_OK) {
          submit()
        } else {
          close()
        }
      }}
      leftFooterChildren={<RunningIndicator id="network"></RunningIndicator>}
    >
      <strong>Nodes</strong>
      <ActionDialogRow title="ID">
        <SelectList onValueChange={setIdCol} value={idCol} w="lg">
          {dfNode?.columns.strs
            .filter((name) => name !== '')
            .slice(0, MAX_COLS)
            .map((name, ni) => (
              <SelectItem value={name} key={ni}>
                {name}
              </SelectItem>
            ))}
        </SelectList>
      </ActionDialogRow>

      <ActionDialogRow title="Label">
        <SelectList onValueChange={setLabelCol} value={labelCol} w="lg">
          {dfNode?.columns.strs
            .filter((name) => name !== '')
            .slice(0, MAX_COLS)
            .map((name, ni) => (
              <SelectItem value={name} key={ni}>
                {name}
              </SelectItem>
            ))}
        </SelectList>
      </ActionDialogRow>

      <ActionDialogRow title="Group">
        <SelectList onValueChange={setGroupCol} value={groupCol} w="lg">
          {dfNode?.columns.strs
            .filter((name) => name !== '')
            .slice(0, MAX_COLS)
            .map((name, ni) => (
              <SelectItem value={name} key={ni}>
                {name}
              </SelectItem>
            ))}
        </SelectList>
      </ActionDialogRow>
      <LineSeparator />
      <ActionDialogRow title="Size">
        <SelectList onValueChange={setSizeCol} value={sizeCol} w="lg">
          {dfNode?.columns.strs
            .filter((name) => name !== '')
            .slice(0, MAX_COLS)
            .map((name, ni) => (
              <SelectItem value={name} key={ni}>
                {name}
              </SelectItem>
            ))}
        </SelectList>
        <Checkbox
          checked={settings.data.metrics.size.applyMinusLog10}
          onCheckedChange={(checked) =>
            updateSettings(
              produce(settings, (draft) => {
                draft.data.metrics.size.applyMinusLog10 = checked
              })
            )
          }
        >
          Apply -log10
        </Checkbox>
      </ActionDialogRow>

      <LineSeparator />

      <ActionCheckRow
        title="Color"
        text="Color Nodes By Value"
        checked={useColor}
        onCheckedChange={setUseColor}
      />

      {useColor && (
        <>
          <ActionDialogRow title="Field">
            <SelectList
              onValueChange={setColorMetricCol}
              value={colorMetricCol}
              w="lg"
            >
              {colorCols.map((name, ni) => (
                <SelectItem value={name} key={ni}>
                  {name}
                </SelectItem>
              ))}
            </SelectList>
            <Checkbox
              checked={settings.data.metrics.color.applyMinusLog10}
              onCheckedChange={(checked) =>
                updateSettings(
                  produce(settings, (draft) => {
                    draft.data.metrics.color.applyMinusLog10 = checked
                  })
                )
              }
            >
              Apply -log10
            </Checkbox>
          </ActionDialogRow>
        </>
      )}

      <strong className="mt-2">Edges</strong>
      <ActionDialogRow title="Source">
        <SelectList onValueChange={setSourceCol} value={sourceCol} w="lg">
          {dfEdge?.columns.strs
            .filter((name) => name !== '')
            .slice(0, MAX_COLS)
            .map((name, ni) => (
              <SelectItem value={name} key={ni}>
                {name}
              </SelectItem>
            ))}
        </SelectList>
      </ActionDialogRow>

      <ActionDialogRow title="Target">
        <SelectList onValueChange={setTargetCol} value={targetCol} w="lg">
          {dfEdge?.columns.strs
            .filter((name) => name !== '')
            .slice(0, MAX_COLS)
            .map((name, ni) => (
              <SelectItem value={name} key={ni}>
                {name}
              </SelectItem>
            ))}
        </SelectList>
      </ActionDialogRow>

      <ActionDialogRow title="Strength">
        <SelectList onValueChange={setStrengthCol} value={strengthCol} w="lg">
          {dfEdge?.columns.strs
            .filter((name) => name !== '')
            .slice(0, MAX_COLS)
            .map((name, ni) => (
              <SelectItem value={name} key={ni}>
                {name}
              </SelectItem>
            ))}
        </SelectList>
      </ActionDialogRow>
    </OKCancelDialog>
  )
}
