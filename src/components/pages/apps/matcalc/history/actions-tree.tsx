import { FileTree } from '@/components/file-tree'
import type { ITab } from '@/components/tabs/tab-provider'
import { useMemo } from 'react'
import { useHistory } from './history-store'

export function ActionsTree({
  onTabChange,
}: {
  onTabChange: (tab: ITab) => void
}) {
  const { history } = useHistory()

  const tree: ITab = useMemo(() => {
    const actionsTab: ITab = {
      id: 'actions',
      name: 'Actions',
      children: [],
    }

    for (const action of history) {
      const actionTab: ITab = {
        id: action.id,
        name: `${action.name}`,
        data: action,
        type: 'Action',
      }

      actionsTab.children!.push(actionTab)
    }

    // const root: ITab = {
    //   id: 'root',
    //   name: 'History',
    //   children: [appsTab, actionsTab],
    // }

    return actionsTab
  }, [history])

  return (
    <FileTree
      tab={tree}
      onValueChange={t => {
        onTabChange(t)
      }}
    />
  )
}
