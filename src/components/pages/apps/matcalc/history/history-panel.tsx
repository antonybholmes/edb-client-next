import {
  APP_NAME,
  NO_DIALOG,
  TEXT_CLEAR,
  TEXT_OK,
  type IDialogParams,
} from '@/consts'
import { OKCancelDialog } from '@dialog/ok-cancel-dialog'
import { cn } from '@lib/shadcn-utils'

import { PropsPanel } from '@components/props-panel'
import {
  TabIndicatorContext,
  TabIndicatorProvider,
} from '@components/tabs/tab-indicator-provider'
import { TabIndicatorV } from '@components/tabs/tab-indicator-v'
import { V_SCROLL_CHILD_CLS, VScrollPanel } from '@components/v-scroll-panel'
import type { IDivProps } from '@interfaces/div-props'
import { VCenterRow } from '@layout/v-center-row'
import { getFormattedShape } from '@lib/dataframe/dataframe-utils'
import { LinkButton } from '@themed/link-button'
import { useContext, useEffect, useRef, useState } from 'react'
import {
  currentSheet,
  currentStepIndex,
  currentSteps,
  useBranch,
  useHistory,
} from './history-store'

interface IProps extends IDivProps {
  branchId: string
  defaultHeightRem?: number
}

export function HistoryPanel({
  ref,
  branchId = '',
  defaultHeightRem = 3.1,
}: IProps) {
  const { branch } = useBranch(branchId)

  return (
    <TabIndicatorProvider
      index={currentStepIndex(branch)}
      size={defaultHeightRem}
      scale={0.4}
    >
      <HistoryPanelContent ref={ref} branchId={branchId} />
    </TabIndicatorProvider>
  )
}

export function HistoryPanelContent({ ref, branchId = '' }: IProps) {
  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })

  const { resetBranch } = useHistory()
  const { branch, gotoStep } = useBranch(branchId)
  const stepIndex = currentStepIndex(branch)
  const tabListRef = useRef<HTMLUListElement>(null)
  const buttonsRef = useRef<HTMLButtonElement[]>([])
  const { size, setTabIndicatorPos } = useContext(TabIndicatorContext)
  const pressed = useRef(false)

  //const cb = useMemo(() => currentBranch(history)[0], [history])
  //const [_, stepIdx] = useMemo(() => currentStep(history), [history])

  function _scale(index: number, scale: number) {
    const containerRect = tabListRef.current!.getBoundingClientRect()

    const clientRect = buttonsRef.current[index]!.getBoundingClientRect()

    const h = clientRect.height
    const s = h * scale

    setTabIndicatorPos({
      x: clientRect.top + h / 2 - s * 0.5 - containerRect.top,
      size: s,
    })

    // setTabIndicatorPos({
    //   x: (index + 0.5) * size - s * 0.5,
    //   size: s,
    //   //transform: `scaleX(${ 1})`, //`scaleX(${scale > 1 ? trueScale : 1})`,
    // })
  }

  useEffect(() => {
    if (branch) {
      _scale(stepIndex, pressed.current ? 0.6 : 0.4)
    }
  }, [branch])

  if (!branch) {
    return null
  }

  return (
    <>
      {showDialog.id === 'Clear' && (
        <OKCancelDialog
          open={true}
          showClose={true}
          title={APP_NAME}
          onResponse={(r) => {
            if (r === TEXT_OK) {
              resetBranch(branch.id)
            }

            setShowDialog({ ...NO_DIALOG })
          }}
        >
          Are you sure you want to clear the history?
        </OKCancelDialog>
      )}

      {/* {showDialog.id === 'Delete' && (
        <OKCancelDialog
          open={true}
          showClose={true}
          onResponse={r => {
            if (r === TEXT_OK) {
              historyDispatch({
                type: 'remove-step',
                stepId: showDialog.params!.step as number,
              })
            }

            setShowDialog({ ...NO_DIALOG })
          }}
        >
          Are you sure you want to delete the selected history item?
        </OKCancelDialog>
      )} */}

      <PropsPanel ref={ref} className="gap-y-2">
        <VCenterRow className="justify-end py-1">
          <LinkButton
            // ripple={false}
            onClick={() => {
              if (branch && branch.steps.length > 1) {
                setShowDialog({ id: 'Clear', params: {} })
              }
            }}
            title="Clear History"
          >
            {TEXT_CLEAR}
          </LinkButton>
        </VCenterRow>

        <VScrollPanel>
          <ul
            ref={tabListRef}
            className={cn(
              V_SCROLL_CHILD_CLS,
              'flex flex-col relative group pl-1.5'
            )}
            // onMouseEnter={() => {
            //   setScale(2)
            // }}
            // onMouseLeave={() => {
            //   setScale(1)
            // }}
          >
            {currentSteps(branch).map((step, hi) => {
              const sheet = currentSheet(step)

              const selected = hi === stepIndex
              return (
                <li key={hi} className="group">
                  <button
                    ref={(el) => {
                      buttonsRef.current[hi] = el!
                    }}
                    aria-label={`Goto history step ${hi + 1}`}
                    className="flex flex-col gap-y-0.5 w-full px-2.5 justify-center items-start overflow-hidden hover:bg-muted rounded-theme trans-all"
                    onMouseEnter={() => {
                      if (selected) {
                        _scale(hi, 0.6)
                      }
                    }}
                    onMouseDown={() => {
                      pressed.current = true

                      gotoStep(step.id)

                      // historyDispatch({
                      //   type: 'goto-step',
                      //   stepId: historyStep.id,
                      // })
                    }}
                    onMouseUp={() => {
                      pressed.current = false
                    }}
                    onMouseLeave={() => {
                      if (selected) {
                        _scale(hi, 0.4)
                      }
                    }}
                    style={{
                      height: `${size}rem`,
                    }}
                  >
                    <span className="font-medium text-left truncate">
                      {`${hi + 1}. ${step.name}`}
                    </span>

                    <span className="text-left text-foreground/50 truncate">
                      {`${getFormattedShape(sheet)}${step!.sheets.length > 1 ? `, ${step!.sheets.length - 1} more...` : ''}`}
                    </span>
                  </button>
                </li>
              )
            })}

            <TabIndicatorV />
          </ul>
        </VScrollPanel>
      </PropsPanel>
    </>
  )
}
