'use client'

import {
  API_JOB_COUNT_URL,
  API_LIST_JOB_FILES_URL,
  API_LIST_JOBS_URL,
} from '@/components/edb/edb'
import { format, parseISO } from 'date-fns'
import { useEffect, useRef, useState } from 'react'

import { useEdbAuth } from '@/components/edb/auth/edb-auth'
import { httpFetch } from '@/lib/http/http-fetch'
import { bearerHeaders } from '@/lib/http/urls'

import { ClientLayout } from '@/app/client-layout'

import { CenterLayout } from '@/layouts/center-layout'

import { TEXT_DOWNLOAD } from '@/consts'
import { IRecordStats } from '@/interfaces/database'
import { capitalCase } from '@/lib/text/capital-case'
import { useQuery } from '@tanstack/react-query'
import { IJob, IPreSignedUrl } from './jobs-store'

export function JobsPage() {
  const btnRef = useRef<HTMLButtonElement>(null)

  const [jobMap, setJobMap] = useState<Map<string, IJob[]>>(new Map())
  //const [account, setAccount] = useState<IAccount>({...DEFAULT_ACCOUNT})
  //const { token: csrf, fetchToken } = useCSRF()
  //const { signinMethod } = useEdbSignIn()
  const { fetchAccessToken } = useEdbAuth()

  function useJobCountQuery() {
    return useQuery({
      queryKey: ['job-count'],
      queryFn: async () => {
        try {
          const accessToken = await fetchAccessToken()

          if (!accessToken) {
            return undefined
          }

          const res = await httpFetch.getJson<{ data: IRecordStats }>(
            API_JOB_COUNT_URL,
            {
              headers: bearerHeaders(accessToken),
            }
          )

          return res.data
        } catch (e) {
          console.error('gene search error', e)
          throw e
        }
      },
    })
  }

  function useJobsQuery() {
    return useQuery({
      queryKey: ['jobs'],
      queryFn: async () => {
        try {
          const accessToken = await fetchAccessToken()

          if (!accessToken) {
            return []
          }

          const res = await httpFetch.getJson<{ data: IJob[] }>(
            API_LIST_JOBS_URL,
            {
              headers: bearerHeaders(accessToken),
            }
          )

          return res.data
        } catch (e) {
          console.error('gene search error', e)
          throw e
        }
      },
    })
  }

  const { data: jobCount } = useJobCountQuery()
  const { data: jobs } = useJobsQuery()

  useEffect(() => {
    if (!jobs) {
      return
    }

    const jobMap = new Map<string, IJob[]>()

    for (const job of jobs) {
      const existingJobs = jobMap.get(job.type) ?? []
      jobMap.set(job.type, [...existingJobs, job])
    }

    setJobMap(jobMap)
  }, [jobs])

  //logger.debug('form', csrfToken)

  // useEffect(() => {
  //   async function fetch() {
  //     const accessToken = await fetchAccessToken()

  //     //setUser(await getUser(accessToken))

  //     //setRoles(rolesFromAccessToken(accessToken))
  //   }

  //   fetch()
  // }, [])

  // useEffect(()=> {
  //   if (accessToken && reload) {
  //     refreshAccount()
  //   }
  // },[accessToken])

  return (
    <CenterLayout title="Jobs">
      <p>
        Total jobs: {jobCount?.count ?? 0}, Page size: {jobCount?.pageSize ?? 0}
        , Pages: {jobCount?.pages ?? 0}
      </p>
      <ul className="flex flex-col gap-y-2">
        {[...jobMap.entries()].sort().map(([type, jobs]) => (
          <li key={type}>
            <h2>{type}</h2>
            <ul className="flex flex-col gap-y-1">
              {jobs.map((job) => (
                <li key={job.id} className="flex flex-col">
                  <span>ID: {job.id}</span>
                  <span>Type: {job.type}</span>
                  <span>Status: {capitalCase(job.status)}</span>
                  <span>
                    Created:{' '}
                    {format(parseISO(job.createdAt), 'MMM d, yyyy HH:mm:ss')}
                  </span>
                  <span>
                    Updated:{' '}
                    {format(parseISO(job.updatedAt), 'MMM d, yyyy HH:mm:ss')}
                  </span>
                  <span>Files: {job.files?.length ?? 0}</span>
                  <ul className="flex flex-col gap-y-1 ml-4">
                    {job.files?.map((file) => (
                      <li key={file.id} className="flex flex-col">
                        <span>Filename: {file.filename}</span>
                        <span>Type: {file.type}</span>

                        <span>
                          Created:{' '}
                          {format(
                            parseISO(file.createdAt),
                            'MMM d, yyyy HH:mm:ss'
                          )}
                        </span>
                        <span>
                          Updated:{' '}
                          {format(
                            parseISO(file.updatedAt),
                            'MMM d, yyyy HH:mm:ss'
                          )}
                        </span>
                        {job.type === 'output' && (
                          <button
                            onClick={async () => {
                              try {
                                const accessToken = await fetchAccessToken()

                                if (!accessToken) {
                                  return []
                                }

                                const res = await httpFetch.getJson<{
                                  data: IPreSignedUrl
                                }>(
                                  API_LIST_JOB_FILES_URL +
                                    '/' +
                                    job.id +
                                    '/download',
                                  {
                                    headers: bearerHeaders(accessToken),
                                  }
                                )

                                const downloadUrl = res.data

                                // force download
                                const link = document.createElement('a')
                                link.href = downloadUrl.url
                                link.download = file.filename
                                document.body.appendChild(link)
                                link.click()
                                document.body.removeChild(link)
                              } catch (e) {
                                console.error('gene search error', e)
                                throw e
                              }
                            }}
                          >
                            {TEXT_DOWNLOAD}
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </CenterLayout>
  )
}

export function JobsQueryPage() {
  return (
    <ClientLayout>
      <JobsPage />
    </ClientLayout>
  )
}
