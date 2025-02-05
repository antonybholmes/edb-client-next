import {
  APP_NAME,
  NO_DIALOG,
  TEXT_CLEAR,
  TEXT_OK,
  type IDialogParams,
} from '@/consts'
import { OKCancelDialog } from '@components/dialog/ok-cancel-dialog'
import { cn } from '@lib/class-names'

import { VCenterRow } from '@/components/layout/v-center-row'
import { PropsPanel } from '@components/props-panel'
import { Button } from '@components/shadcn/ui/themed/button'
import { V_SCROLL_CHILD_CLS, VScrollPanel } from '@components/v-scroll-panel'
import { getFormattedShape } from '@lib/dataframe/dataframe-utils'
import {
  currentBranch,
  getCurrentSheet,
  HistoryContext,
} from '@providers/history-provider'
import { motion } from 'motion/react'
import {
  forwardRef,
  useContext,
  useEffect,
  useState,
  type ForwardedRef,
} from 'react'

interface IProps {
  defaultWidthRem?: number
}

export const HistoryPanel = forwardRef(function HistoryPanel(
  { defaultWidthRem: defaultWidth = 3.1 }: IProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })

  const { history, historyDispatch } = useContext(HistoryContext)
  //const [_scale, setScale] = useState(1)
  //const lineRef = useRef<SVGLineElement>(null)
  //const initial = useRef(true)

  //const currentStep = useRef<number>(-1)

  const w = `${defaultWidth}rem`

  //const h = Math.round((1 / history.steps.length) * 100)

  //const offset = h * 0.15
  //Math.round((1-nh)*100)}

  // useEffect(() => {

  //   const dir = currentTree(history).currentStep - currentStep.current
  //   //const ext = _scale > 1 ? 0 : 2
  //   const y1 = h * currentTree(history).currentStep + offset
  //   const y2 = h * (currentTree(history).currentStep + 1) - offset
  //   const duration = initial.current ? 0 : ANIMATION_DURATION_S

  //   if (dir > 0) {
  //     gsap
  //       .timeline()
  //       .to(lineRef.current, {
  //         attr: { y2 },
  //         duration,
  //         ease: "power2.out",
  //       })
  //       .to(
  //         lineRef.current,
  //         {
  //           attr: { y1 },
  //           duration,
  //           ease: "power2.out",
  //         },
  //         "-=50%",
  //       )
  //   } else if (dir < 0) {
  //     gsap
  //       .timeline()
  //       .to(lineRef.current, {
  //         attr: { y1 },
  //         duration,
  //         ease: "power2.out",
  //       })
  //       .to(
  //         lineRef.current,
  //         {
  //           attr: { y2 },
  //           duration,
  //           ease: "power2.out",
  //         },
  //         "-=50%",
  //       )
  //   } else {
  //     gsap.timeline().to(lineRef.current, {
  //       attr: { y1, y2 },
  //       duration,
  //       ease: "power2.out",
  //     })
  //   }

  //   currentStep.current = currentTree(history).currentStep
  //   initial.current = false
  // }, [_scale, currentTree(history).currentStep])

  const [tabPos, setTabPos] = useState<{ y: string; height: string }>({
    y: '0rem',
    height: `${defaultWidth}rem`,
  })

  useEffect(() => {
    const x = currentBranch(history)[0]!.currentStep * defaultWidth

    //const width = tabs[selectedTab.index].size ?? defaultWidth

    setTabPos({ y: `${x}rem`, height: `${defaultWidth - 1}rem` })
  }, [currentBranch(history)[0]!.currentStep])

  return (
    <>
      {showDialog.id === 'Clear' && (
        <OKCancelDialog
          open={true}
          showClose={true}
          title={APP_NAME}
          onReponse={(r) => {
            if (r === TEXT_OK) {
              historyDispatch({
                description: 'History',
                type: 'clear',
              })
            }

            setShowDialog({ ...NO_DIALOG })
          }}
        >
          Are you sure you want to clear the history?
        </OKCancelDialog>
      )}

      {showDialog.id === 'Delete' && (
        <OKCancelDialog
          open={true}
          showClose={true}
          onReponse={(r) => {
            if (r === TEXT_OK) {
              historyDispatch({
                type: 'remove-step',
                stepId: showDialog.params!.step,
              })
            }

            setShowDialog({ ...NO_DIALOG })
          }}
        >
          Are you sure you want to delete the selected history item?
        </OKCancelDialog>
      )}

      <PropsPanel ref={ref} className="gap-y-2">
        <VCenterRow className="justify-end py-1">
          <Button
            multiProps="link"
            //rounded="full"
            ripple={false}
            onClick={() => {
              if (currentBranch(history)[0]!.steps.length > 1) {
                setShowDialog({ id: 'Clear', params: {} })
              }
            }}
            title="Clear history"
          >
            {TEXT_CLEAR}
          </Button>
        </VCenterRow>

        <VScrollPanel>
          <ul
            className={cn(
              V_SCROLL_CHILD_CLS,
              'flex flex-col relative group pl-1'
            )}
            // onMouseEnter={() => {
            //   setScale(2)
            // }}
            // onMouseLeave={() => {
            //   setScale(1)
            // }}
          >
            {currentBranch(history)[0]!.steps.map((historyStep, hi) => (
              <li
                key={hi}
                className="group flex grow flex-row items-center justify-between rounded-theme hover:bg-accent/30 trans-all"
                style={{
                  height: w,
                }}
              >
                <button
                  aria-label={`Goto history step ${hi + 1}`}
                  className="flex flex-col gap-y-0.5 grow px-2.5 justify-start items-start overflow-hidden"
                  onClick={() => {
                    historyDispatch({
                      type: 'goto-step',
                      stepId: hi,
                    })
                  }}
                >
                  <span className="font-medium text-left truncate">{`${hi + 1}. ${historyStep.name}`}</span>

                  <span className="text-left text-foreground/50 truncate">
                    {`${getFormattedShape(getCurrentSheet(historyStep))}${historyStep.sheets.length > 1 ? `, ${historyStep.sheets.length - 1} more...` : ''}`}
                  </span>
                </button>

                {/* {hi > 0 && (
                <Tooltip content="Delete history item">
                  <button
                    disabled={hi == 0}
                    onClick={() =>
                      setShowDialog({ name: "Delete", params: { step: hi } })
                    }
                    className={cn(
                      FOCUS_RING_CLS,
                      "group aspect-square shrink-0 stroke-muted-foreground hover:stroke-foreground",
                    )}
                  >
                    <CloseIcon w="w-3" />
                  </button>
                </Tooltip>
              )} */}
              </li>
            ))}

            {/* <VToolbarTabLine
                ref={lineRef}
                w={2}
                lineClassName={TAB_LINE_CLS}
              /> */}

            <motion.span
              className="absolute left-0 top-2 w-0.5 z-0 bg-theme"
              animate={{ ...tabPos }}
              initial={false}
              transition={{ ease: 'easeInOut' }}
            />
          </ul>
        </VScrollPanel>
      </PropsPanel>
    </>
  )
})
