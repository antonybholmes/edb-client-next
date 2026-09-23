import { ActionDialogRow } from '@/components/dialogs/card/action-dialog-card'
import { ICustomDialogProps } from '@/components/dialogs/dialogs'
import { Checkbox } from '@/components/shadcn/ui/themed/v2/check-box'
import { RunningIndicator } from '@/components/toolbar/running-indicator'
import { TEXT_OK } from '@/consts'
import { OKCancelDialog, type IModalProps } from '@/dialogs/ok-cancel-dialog'
import { type BaseDataFrame } from '@/lib/dataframe/base-dataframe'
import { SelectItem, SelectList } from '@/themed/v2/select'
import { produce } from 'immer'
import { useEffect, useState } from 'react'
import { useCurrentSheets } from '../matcalc/history/history-provider/history-contexts'
import { HistoryPlot } from '../matcalc/history/history-provider/history-types'
import { useNetworkSettings } from './network-settings-store'
import { dataframesToNetwork, useNetwork, useNetworkSim } from './network-store'

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

  const cols = df.columns.filter((c) => c.toLowerCase().includes('label'))

  if (cols.length === 0) {
    return 'Label'
  }

  return cols[0]
}

function findNameCol(df: BaseDataFrame) {
  if (!df) {
    return 'Name'
  }

  const cols = df.columns.filter((c) =>
    c.toLowerCase().match(/.*(gene_set|name).*/)
  )

  if (cols.length === 0) {
    return 'Name'
  }

  return cols[0]
}

function findSizeCol(df: BaseDataFrame | null) {
  if (!df) {
    return 'Size'
  }

  const cols = df.columns.filter((c) => c.toLowerCase().includes('size'))

  if (cols.length === 0) {
    return 'Size'
  }

  return cols[0]
}

function findGroupCol(df: BaseDataFrame | null) {
  if (!df) {
    return ''
  }

  const cols = df.columns.filter((c) =>
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

  const cols = df.columns.filter((c) =>
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

  const cols = df.columns.filter((c) =>
    c.toLowerCase().match(/.*(target|to).*/)
  )

  if (cols.length === 0) {
    return ''
  }

  return cols[0]
}

function findScoreCol(df: BaseDataFrame | null) {
  if (!df) {
    return ''
  }

  const cols = df.columns.filter((c) =>
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

  const { run: runSim } = useNetworkSim()
  const [message, setMessage] = useState<string | null>(null)

  const [dfNode, setDfNode] = useState<BaseDataFrame | null>(null)
  const [dfEdge, setDfEdge] = useState<BaseDataFrame | null>(null)

  // const labelCol = findCol(dfNodes, 'label')
  //   const sizeCol = findCol(dfNodes, 'size', { exact: true })
  //   const groupCol = findCol(dfNodes, 'collection')

  const [labelCol, setLabelCol] = useState<string>('')
  const [nameCol, setNameCol] = useState<string>('')
  const [groupCol, setGroupCol] = useState<string>('')
  const [sizeCol, setSizeCol] = useState<string>('')

  const [sourceCol, setSourceCol] = useState<string>('')
  const [targetCol, setTargetCol] = useState<string>('')
  const [scoreCol, setScoreCol] = useState<string>('')

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
    setNameCol(findNameCol(dfNode))
    setGroupCol(findGroupCol(dfNode))
    setSizeCol(findSizeCol(dfNode))
  }, [dfNode])

  useEffect(() => {
    setSourceCol(findSourceCol(dfEdge))
    setTargetCol(findTargetCol(dfEdge))
    setScoreCol(findScoreCol(dfEdge))
  }, [dfEdge])

  async function submit() {
    if (
      !dfNode ||
      !dfEdge ||
      !labelCol ||
      !nameCol ||
      !sizeCol ||
      !groupCol ||
      !sourceCol ||
      !targetCol ||
      !scoreCol
    ) {
      close()
      return
    }

    const { network, groups } = dataframesToNetwork(
      dfNode,
      dfEdge,
      labelCol,
      nameCol,
      sizeCol,
      groupCol,
      sourceCol,
      targetCol,
      scoreCol
    )

    setNetwork(network, groups)

    if (settings.sim.run) {
      setMessage('Running simulation...')
      runSim(network, () => {
        setMessage(null)
        close()
      })
    } else {
      close()
    }
  }

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
      leftFooterChildren={
        <RunningIndicator message={message}>
          <Checkbox
            checked={settings.sim.run}
            onCheckedChange={(checked) =>
              updateSettings(
                produce(settings, (draft) => {
                  draft.sim.run = checked
                })
              )
            }
          >
            Run Simulation
          </Checkbox>
        </RunningIndicator>
      }
    >
      <strong>Nodes</strong>
      <ActionDialogRow title="Label">
        <SelectList onValueChange={setLabelCol} value={labelCol} w="lg">
          {dfNode?.columns
            .filter((name) => name !== '')
            .slice(0, MAX_COLS)
            .map((name, ni) => (
              <SelectItem value={name} key={ni}>
                {name}
              </SelectItem>
            ))}
        </SelectList>
      </ActionDialogRow>

      <ActionDialogRow title="Name">
        <SelectList onValueChange={setNameCol} value={nameCol} w="lg">
          {dfNode?.columns
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
          {dfNode?.columns
            .filter((name) => name !== '')
            .slice(0, MAX_COLS)
            .map((name, ni) => (
              <SelectItem value={name} key={ni}>
                {name}
              </SelectItem>
            ))}
        </SelectList>
      </ActionDialogRow>

      <ActionDialogRow title="Size">
        <SelectList onValueChange={setSizeCol} value={sizeCol} w="lg">
          {dfNode?.columns
            .filter((name) => name !== '')
            .slice(0, MAX_COLS)
            .map((name, ni) => (
              <SelectItem value={name} key={ni}>
                {name}
              </SelectItem>
            ))}
        </SelectList>
      </ActionDialogRow>
      <strong>Edges</strong>
      <ActionDialogRow title="Source">
        <SelectList onValueChange={setSourceCol} value={sourceCol} w="lg">
          {dfEdge?.columns
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
          {dfEdge?.columns
            .filter((name) => name !== '')
            .slice(0, MAX_COLS)
            .map((name, ni) => (
              <SelectItem value={name} key={ni}>
                {name}
              </SelectItem>
            ))}
        </SelectList>
      </ActionDialogRow>

      <ActionDialogRow title="Score">
        <SelectList onValueChange={setScoreCol} value={scoreCol} w="lg">
          {dfEdge?.columns
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
