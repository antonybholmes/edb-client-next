import { HCenterRow } from '@/components/layout/h-center-row'
import { NumericalInput } from '@/components/shadcn/ui/themed/numerical-input'
import { Tabs, TabsContent } from '@/components/shadcn/ui/themed/v2/tabs'
import { SafariTabs } from '@/components/tabs/safari-tabs'
import type { ITab } from '@/components/tabs/tab-provider'
import { useTabs } from '@/components/tabs/tab-provider'
import { TEXT_CANCEL, TEXT_OK } from '@/consts'
import { OKCancelDialog, type IModalProps } from '@/dialogs/ok-cancel-dialog'
import { VCenterRow } from '@/layout/v-center-row'
import { type BaseDataFrame } from '@/lib/dataframe/base-dataframe'
import {
  meanFilter,
  medianFilter,
  stdevFilter,
  xInY,
} from '@/lib/dataframe/dataframe-utils'
import { SelectItem, SelectList } from '@/themed/v2/select'
import { Blend, ListFilterPlus } from 'lucide-react'
import {
  RefObject,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { useCurrentSheets } from './history/history-provider/history-contexts'
import { useHistory } from './history/history-provider/history-provider'

const TABS: ITab[] = [
  {
    id: 'top-rows',
    name: 'Top Rows',
    icon: <ListFilterPlus size={16} strokeWidth={3} />,
  },
  { id: 'x-in-y', name: 'X in Y', icon: <Blend size={16} strokeWidth={3} /> },
]

type IRef = { applyFilter: () => void }

export function TopRowsPanel({
  ref,
  onResponse,
}: IModalProps<BaseDataFrame> & { ref: RefObject<IRef | null> }) {
  const [topRows, setTopRows] = useState(300)
  const [method, setMethod] = useState('Stdev')
  const { addSheets } = useHistory()
  const { sheets } = useCurrentSheets()

  let df = sheets[0] as BaseDataFrame

  function applyFilter() {
    if (!df) {
      onResponse?.(TEXT_CANCEL)
      return
    }

    switch (method) {
      case 'Mean':
        df = meanFilter(df, topRows)

        break
      case 'Median':
        df = medianFilter(df, topRows)
        break
      default:
        // stdev

        df = stdevFilter(df, topRows)
        break
    }

    if (!df) {
      onResponse?.(TEXT_CANCEL)
      return
    }

    addSheets([df], { name: 'Top Rows' })

    onResponse?.(TEXT_OK, df)
  }

  useImperativeHandle(ref, () => ({
    applyFilter,
  }))

  return (
    <HCenterRow className="gap-x-3">
      <VCenterRow className="gap-x-3">
        <span>Keep top</span>
        <NumericalInput
          id="top-rows"
          value={topRows}
          limit={[1, Number.MAX_SAFE_INTEGER]}
          step={1}
          onChange={(e) => setTopRows(Number.parseInt(e.target.value))}
          w="xs"
          placeholder="Top rows..."
        />
        <span>rows using row</span>
        <SelectList
          value={method}
          onValueChange={(v) => {
            if (v) {
              setMethod(v as string)
            }
          }}
        >
          <SelectItem value="Stdev">Stdev</SelectItem>
          <SelectItem value="Mean">Mean</SelectItem>
          <SelectItem value="Median">Median</SelectItem>
        </SelectList>
      </VCenterRow>
    </HCenterRow>
  )
}

export function XInYPanel({
  ref,
  onResponse,
}: IModalProps<BaseDataFrame> & { ref: RefObject<IRef | null> }) {
  const [exp, setExp] = useState(1)
  const [samples, setSamples] = useState(3)

  const { addSheets } = useHistory()
  const { sheets } = useCurrentSheets()

  let df = sheets[0] as BaseDataFrame

  function applyFilter() {
    if (!df) {
      onResponse?.(TEXT_CANCEL)
      return
    }

    df = xInY(df, exp, samples)

    if (!df) {
      onResponse?.(TEXT_CANCEL)
      return
    }

    addSheets([df], { name: 'X in Y samples' })

    onResponse?.(TEXT_OK, df)
  }

  useImperativeHandle(ref, () => ({
    applyFilter,
  }))

  return (
    <HCenterRow className="gap-x-3">
      <VCenterRow className="gap-x-3">
        <span>Expression</span>
        <NumericalInput
          value={exp}
          limit={[1, Number.MAX_SAFE_INTEGER]}
          step={1}
          dp={1}
          onChange={(e) => setExp(Number.parseFloat(e.target.value))}
          w="xs"
          placeholder="Expression..."
        />
        <span>in</span>
        <NumericalInput
          value={samples}
          limit={[1, Number.MAX_SAFE_INTEGER]}
          step={1}
          onChange={(e) => setSamples(Number.parseInt(e.target.value))}
          w="xs"
          placeholder="Samples..."
        />
        <span>samples.</span>
      </VCenterRow>
    </HCenterRow>
  )
}

const TABS_ID = 'matcalc-filter-rows'

export function FilterRowsDialog({ onResponse }: IModalProps<BaseDataFrame>) {
  const { selectedTab, setTabs } = useTabs(TABS_ID)

  useEffect(() => {
    setTabs(TABS.map((t) => ({ ...t })))
  }, [setTabs])

  const topRowRef = useRef<IRef | null>(null)
  const xInYRef = useRef<IRef | null>(null)

  return (
    <OKCancelDialog
      title={TABS.find((t) => t.id === selectedTab?.id)?.name}
      onResponse={(r) => {
        if (r === TEXT_OK) {
          if (selectedTab?.id === 'top-rows') {
            topRowRef.current?.applyFilter()
          } else {
            xInYRef.current?.applyFilter()
          }
        } else {
          onResponse?.(TEXT_CANCEL)
        }
      }}
      centerHeaderChildren={
        <SafariTabs id={TABS_ID} defaultWidth={4.5} className="mt-2" />
      }
      h="h-56"
      bodyCls="mt-2"
    >
      <Tabs value={selectedTab?.id ?? ''} onValueChange={() => {}}>
        <TabsContent value="top-rows">
          <TopRowsPanel ref={topRowRef} onResponse={onResponse} />
        </TabsContent>
        <TabsContent value="x-in-y">
          <XInYPanel ref={xInYRef} onResponse={onResponse} />
        </TabsContent>
      </Tabs>
    </OKCancelDialog>
  )
}
