'use client'

import {
  API_ADMIN_ADD_USER_URL,
  API_ADMIN_GROUPS_URL,
  API_ADMIN_UPDATE_USER_URL,
  API_ADMIN_USER_STATS_URL,
  API_ADMIN_USERS_URL,
  DEFAULT_EDB_USER,
  flattenGroups,
  flattenRoles,
  INewUser,
  type IEdbUser,
  type IRBACGroup,
} from '@/lib/edb/edb'

import { useEffect, useState } from 'react'

import { PaginationComponent } from '@/components/pagination-component'
import { TEXT_OK } from '@/consts'
import { PenIcon } from '@/icons/pen-icon'
import { PlusIcon } from '@/icons/plus-icon'
import { TrashIcon } from '@/icons/trash-icon'
import { VCenterRow } from '@/layout/v-center-row'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/themed/table'
import { Button } from '@/themed/v2/button'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'

import { CenterCol } from '@/components/layout/center-col'

import { BaseCol } from '@/layout/base-col'
import { Card } from '@/themed/card'

import { AdminLayout } from '@/layouts/admin-layout'
import { useEdbAuth } from '@/lib/edb/edb-auth'
import { httpFetch } from '@/lib/http/http-fetch'
import { csfrWithTokenHeaders } from '@/lib/http/urls'
import { logger } from '@/lib/logger'
import { CoreProviders } from '@/providers/core-provider'

import { useDialogs } from '@/components/dialogs/dialogs'
import { AppHeaderIcon } from '@/components/header/app-header-icon'
import { AppInfoButton } from '@/components/header/app-info-button'
import { HeaderPortal } from '@/components/header/header-portal'
import { getCSRFToken } from '@/lib/edb/csrf'
import { useAppInfo } from '@/lib/edb/edb-settings'
import { makeUuid } from '@/lib/id'
import { Toast } from '@base-ui/react/toast'
import APP_INFO from './manifest.json'
import { UsersDialogsRoot, useUserDialogs } from './users-dialogs'

interface IUserStats {
  users: number
}

export function AdminUsersPage() {
  const [userStats, setUserStats] = useState<IUserStats | null>(null)

  const [groups, setGroups] = useState<IRBACGroup[]>([])

  const [page, setPage] = useState(1)

  const [itemsPerPage] = useState(100)

  const [users, setUsers] = useState<IEdbUser[]>([])

  const { fetchAccessToken } = useEdbAuth()

  const { add: addToast } = Toast.useToastManager()

  const { open: openDialogs } = useDialogs()
  const { open: openUserDialog } = useUserDialogs()
  const { setAppInfo } = useAppInfo()

  useEffect(() => {
    async function loadUserStats() {
      const accessToken = await fetchAccessToken()

      if (!accessToken) {
        return
      }

      const csrfToken = await getCSRFToken()

      const res = await httpFetch.getJson<{ data: IUserStats }>(
        API_ADMIN_USER_STATS_URL,
        {
          headers: csfrWithTokenHeaders(csrfToken, accessToken),
        }
      )

      const stats: IUserStats = res.data

      setUserStats(stats)
    }

    async function loadRoles() {
      const accessToken = await fetchAccessToken()

      if (!accessToken) {
        return
      }

      const csrfToken = await getCSRFToken()

      const res = await httpFetch.getJson<{ data: IRBACGroup[] }>(
        API_ADMIN_GROUPS_URL,
        {
          headers: csfrWithTokenHeaders(csrfToken, accessToken),
        }
      )

      //console.log('roles', res.data)
      setGroups(res.data)
      loadUserStats()
    }

    setAppInfo(APP_INFO)

    try {
      loadRoles()
    } catch {
      logger.error('could not fetch remote roles')
    }
  }, [])

  async function loadUsers() {
    const accessToken = await fetchAccessToken()

    if (!accessToken) {
      return
    }

    const csrfToken = await getCSRFToken()

    const res = await httpFetch.postJson<{ data: IEdbUser[] }>(
      API_ADMIN_USERS_URL,
      {
        body: { offset: (page - 1) * itemsPerPage, records: itemsPerPage },
        headers: csfrWithTokenHeaders(csrfToken, accessToken),
      }
    )

    setUsers(res.data)
  }

  logger.log('users', users)

  useEffect(() => {
    if (userStats) {
      try {
        loadUsers()
      } catch {
        console.error('could not load users')
      }
    }

    // reset offset if number of records changes significantly
    // and we are no longer on a valid page
    //if (userStats.users < (page - 1) * itemsPerPage) {
    ///  setPage(1)
    //}
  }, [page, itemsPerPage, userStats])

  // useEffect(() => {
  //   if (!user) {
  //     return
  //   }

  //   form.reset({
  //     ...user,
  //   })
  // }, [user])

  const columnHelper = createColumnHelper<IEdbUser>()

  const columns = [
    columnHelper.accessor((row) => row, {
      id: 'user',
      header: 'User',
      cell: (props) => (
        <BaseCol className="text-xs gap-0.5 truncate">
          <p className="font-semibold">{props.getValue().username}</p>
          <p title={props.getValue().id}>{props.getValue().id}</p>
        </BaseCol>
      ),
    }),

    // columnHelper.accessor('username', {
    //   header: 'Username',
    // }),

    columnHelper.accessor('email', {
      header: 'Email',
    }),

    columnHelper.accessor('groups', {
      id: 'groups',
      header: 'Groups',
      cell: (props) => (
        <BaseCol className="gap-y-0.5">
          {props.getValue().map((group) => (
            <div key={group.id} className="truncate" title={group.name}>
              {group.name}
            </div>
          ))}
        </BaseCol>
      ),
    }),

    columnHelper.accessor('groups', {
      id: 'roles',
      header: 'Roles',
      cell: (props) => (
        <BaseCol className="gap-y-0.5">
          {props
            .getValue()
            .map((group) => flattenRoles([group]))
            .flat()
            .map((role) => (
              <div key={role} className="truncate" title={role}>
                {role}
              </div>
            ))}
        </BaseCol>
      ),
    }),

    columnHelper.accessor((row) => row, {
      id: 'edit',
      header: '',
      cell: (props) => (
        <VCenterRow className="gap-x-2 justify-end">
          <button
            title="Edit user"
            onClick={() => {
              openUserDialog({
                type: 'edit-user',
                payload: {
                  title: 'Edit User',
                  user: props.getValue(),
                  groups,
                  callback: (user: INewUser) => {
                    updateUser(user)
                  },
                },
              })
            }}
            className="group"
          >
            <PenIcon
              fill="fill-foreground/25"
              className="group-hover:fill-foreground"
            />
          </button>

          <button
            title="Delete user"
            onClick={() => {
              openDialogs({
                type: 'warning',
                payload: {
                  title: 'Delete User',
                  content: `Are you sure you want to delete user ${props.getValue().username} (${props.getValue().id})?`,
                  callback: (r) => {
                    if (r === TEXT_OK) {
                      deleteUser(props.getValue())
                    }
                  },
                },
              })
            }}
            className="group"
          >
            <TrashIcon
              stroke="stroke-foreground/25"
              className="group-hover:stroke-destructive"
            />
          </button>
        </VCenterRow>
      ),
    }),
  ]

  const table = useReactTable({
    columns,
    data: users,
    getCoreRowModel: getCoreRowModel(),
  })

  const smallColumns = [
    columnHelper.accessor((row) => row, {
      header: 'User Info',
      cell: (props) => (
        <BaseCol className="gap-y-3 text-sm truncate">
          <span className="font-bold">{props.getValue().id}</span>
          <span>{props.getValue().username}</span>
          <span>{props.getValue().email}</span>
          {props.getValue().name && <span>{props.getValue().name}</span>}

          {props
            .getValue()
            .groups.map((group) => flattenGroups([group]))
            .flat()
            .map((group) => (
              <div key={group} className="truncate">
                {group}
              </div>
            ))}
        </BaseCol>
      ),
    }),

    columnHelper.accessor((row) => row, {
      id: 'edit',
      header: '',
      cell: (props) => (
        <VCenterRow className="gap-x-3 justify-end">
          <button
            title="Edit user"
            onClick={() => {
              openUserDialog({
                type: 'edit-user',
                payload: {
                  title: 'Edit User',
                  user: props.getValue(),
                  groups,
                  callback: (user: INewUser) => {
                    updateUser(user)
                  },
                },
              })
            }}
            className="group"
          >
            <PenIcon
              fill="fill-foreground/25"
              className="group-hover:fill-foreground"
            />
          </button>

          <button title="Delete user" onClick={() => {}} className="group">
            <TrashIcon
              stroke="stroke-foreground/25"
              className="group-hover:stroke-destructive"
            />
          </button>
        </VCenterRow>
      ),
    }),
  ]

  const smallTable = useReactTable({
    columns: smallColumns,
    data: users,
    getCoreRowModel: getCoreRowModel(),
  })

  async function newUser(user: INewUser) {
    const accessToken = await fetchAccessToken()

    if (!accessToken) {
      return
    }

    const csrfToken = await getCSRFToken()

    try {
      await httpFetch.post(API_ADMIN_ADD_USER_URL, {
        body: { ...user },
        headers: csfrWithTokenHeaders(csrfToken, accessToken),
      })

      // force refresh
      await loadUsers()
    } catch {
      console.error('error making new user')
    }
  }

  async function updateUser(user: INewUser) {
    const accessToken = await fetchAccessToken()

    if (!accessToken) {
      return
    }

    const csrfToken = await getCSRFToken()

    console.log(
      'updating user',
      user,
      user.selectedGroups,
      API_ADMIN_UPDATE_USER_URL
    )

    try {
      await httpFetch.post(
        API_ADMIN_UPDATE_USER_URL, ///${user.uuid}`,
        {
          body: { ...user, groups: user.selectedGroups },
          headers: csfrWithTokenHeaders(csrfToken, accessToken),
        }
      )

      await loadUsers()

      addToast({
        id: makeUuid(),
        title: 'User updated',
      })
    } catch (err) {
      console.error(err)
    }
  }

  async function deleteUser(user: IEdbUser) {
    const accessToken = await fetchAccessToken()

    if (!accessToken) {
      return
    }

    const csrfToken = await getCSRFToken()

    try {
      await httpFetch.delete(`${API_ADMIN_USERS_URL}/${user.id}/delete`, {
        headers: csfrWithTokenHeaders(csrfToken, accessToken),
      })

      await loadUsers()
    } catch (err) {
      console.error(err)
    }
  }

  // doesn't seem to like it when there is no data in the table
  // so only render table when we've loaded something. This is
  // similar to using an isMounted flag except we can use an
  // existing variable to do the same thing without an extra
  // useState

  return (
    <>
      <HeaderPortal>
        <>
          <AppHeaderIcon />
          <AppInfoButton />
        </>
      </HeaderPortal>

      <UsersDialogsRoot />

      <AdminLayout title="Users">
        <CenterCol className="grow">
          <BaseCol className="w-9/10 gap-y-4">
            <BaseCol className="flex flex-col gap-y-4">
              <VCenterRow>
                <Button
                  //variant="theme"
                  //rounded="full"
                  onClick={() => {
                    openUserDialog({
                      type: 'edit-user',
                      payload: {
                        title: 'New User',
                        user: { ...DEFAULT_EDB_USER },
                        groups,
                        callback: (user: INewUser) => {
                          newUser(user)
                        },
                      },
                    })
                  }}
                  className="text-sm px-3"
                >
                  <PlusIcon /> <span>New User</span>
                </Button>
              </VCenterRow>
              <Card className="hidden xl:flex text-xs" variant="content">
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => {
                      return (
                        <TableRow key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            <TableHead key={header.id} colSpan={header.colSpan}>
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                            </TableHead>
                          ))}
                        </TableRow>
                      )
                    })}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} className="text-xs">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>

              <Card className="xl:hidden">
                <Table>
                  <TableHeader>
                    {smallTable.getHeaderGroups().map((headerGroup) => {
                      return (
                        <TableRow key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            <TableHead key={header.id} colSpan={header.colSpan}>
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                            </TableHead>
                          ))}
                        </TableRow>
                      )
                    })}
                  </TableHeader>
                  <TableBody>
                    {smallTable.getRowModel().rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </BaseCol>

            <CenterCol>
              <CenterCol className="col-span-2">
                <PaginationComponent
                  currentPage={page}
                  setCurrentPage={(page) => {
                    setPage(page)
                  }}
                  itemsPerPage={itemsPerPage}
                  itemCount={users.length}
                />
              </CenterCol>
            </CenterCol>
          </BaseCol>
        </CenterCol>
      </AdminLayout>
    </>
  )
}

export function AdminUsersQueryPage() {
  return (
    <CoreProviders>
      <AdminUsersPage />
    </CoreProviders>
  )
}
