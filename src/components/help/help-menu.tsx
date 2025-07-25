import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { HamburgerIcon } from '../icons/hamburger-icon'
import { VCenterRow } from '../layout/v-center-row'
import { DialogDescription, DialogTitle } from '../shadcn/ui/themed/dialog'
import { Sheet, SheetContent, SheetTrigger } from '../shadcn/ui/themed/sheet'
import { HelpTreeNode, type ITopicTree } from './help-tree-node'

export function HelpMenu({
  tree,
  node,
}: {
  tree: ITopicTree
  node: ITopicTree
}) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="lg:hidden shrink-0 grow-0 h-8" asChild>
        <button className="shrink-0 grow-0">
          <HamburgerIcon />
        </button>
      </SheetTrigger>
      <SheetContent className="w-9/10 sm:w-2/3 p-1 flex flex-col" side="left">
        <VCenterRow className="justify-start pb-2 px-1">
          <button onClick={() => setOpen(false)} title="Close menu">
            <ArrowLeft className="w-5" strokeWidth={2} />
          </button>
        </VCenterRow>

        <ul className="text-xs">
          {tree.children.map((t, ti) => {
            return (
              <HelpTreeNode key={ti} node={t} currentNode={node} level={0} />
            )
          })}
        </ul>

        <VisuallyHidden asChild>
          <DialogTitle>Help menu</DialogTitle>
        </VisuallyHidden>

        <VisuallyHidden asChild>
          <DialogDescription>Help menu</DialogDescription>
        </VisuallyHidden>
      </SheetContent>
    </Sheet>
  )
}
