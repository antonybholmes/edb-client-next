'use client'

import { useEffect, useState } from 'react'

import { API_HUBS_URL } from '@lib/edb/edb'

import { BaseCol } from '@layout/base-col'

import { ShortcutLayout } from '@layouts/shortcut-layout'

import { SlidersIcon } from '@icons/sliders-icon'

import { HubsPropsPanel } from './hubs-props-panel'

import { useHubs, type IHub } from './hubs-store'

import { type ITab } from '@components/tabs/tab-provider'

import { IndexArrowIcon } from '@/components/icons/index-arrow-icon'
import { Autocomplete, AutocompleteLi } from '@components/autocomplete'
import { HeaderPortal } from '@components/header/header-portal'
import { ModuleInfoButton } from '@components/header/module-info-button'
import { BLANK_TARGET } from '@components/link/base-link'
import { TabSlideBar } from '@components/slide-bar/tab-slide-bar'
import { useSearch } from '@hooks/use-search'
import { useEdbAuth } from '@lib/edb/edb-auth'
import { httpFetch } from '@lib/http/http-fetch'
import { bearerHeaders } from '@lib/http/urls'
import { useQueryClient } from '@tanstack/react-query'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@themed/accordion'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@themed/select'
import { produce } from 'immer'
import MODULE_INFO from './module.json'

const BASE_URL = 'http://genome.ucsc.edu/cgi-bin/hgTracks' //https://genome.ucsc.edu/goldenPath/help/examples/hubDirectory/hub.txt

export function HubsPage() {
  const queryClient = useQueryClient()

  const [rightTab, setRightTab] = useState('Search')

  //const [hubs, setHubs] = useState<IHub[]>([])

  const { settings, updateSettings } = useHubs()

  const { query, setQuery, resetQuery } = useSearch()

  const [showSideBar, setShowSideBar] = useState(true)

  const [platformMap, setPlatformMap] = useState(
    new Map<string, Map<string, IHub[]>>()
  )

  const [searchPlaformMap, setSearchPlatformMap] = useState(
    new Map<string, Map<string, IHub[]>>()
  )

  //const { toast } = useToast()

  const { csrfToken, fetchAccessToken } = useEdbAuth()

  useEffect(() => {
    async function loadHubs() {
      if (!settings.genome || !csrfToken) {
        return
      }

      const accessToken = await fetchAccessToken()

      try {
        const res = await queryClient.fetchQuery({
          queryKey: ['hubs'],
          queryFn: () => {
            return httpFetch.getJson<{ data: IHub[] }>(
              `${API_HUBS_URL}/${settings.genome}`,
              {
                headers: bearerHeaders(accessToken),
              }
            )
          },
        })

        const hubs: IHub[] = res.data

        //setHubs(hubs)

        const platformMap = new Map<string, Map<string, IHub[]>>()

        for (const hub of hubs) {
          if (!platformMap.has(hub.institution)) {
            platformMap.set(hub.institution, new Map<string, IHub[]>())
          }

          if (!platformMap.get(hub.institution)!.has(hub.platform)) {
            platformMap.get(hub.institution)!.set(hub.platform, [])
          }

          platformMap.get(hub.institution)!.get(hub.platform)!.push(hub)
        }

        setPlatformMap(platformMap)
      } catch {
        console.error('error loading hubs')
      }
    }
    loadHubs()
  }, [settings.genome, csrfToken])

  useEffect(() => {
    if (query) {
      const ls = query.toLowerCase()

      const searchPlatformMap = new Map<string, Map<string, IHub[]>>()

      for (const institution of platformMap.keys()) {
        for (const platform of platformMap.get(institution)!.keys()) {
          for (const hub of platformMap.get(institution)!.get(platform)!) {
            if (
              hub.name.toLowerCase().includes(ls) ||
              hub.description.toLowerCase().includes(ls) ||
              hub.institution.toLowerCase().includes(ls) ||
              hub.genome.toLowerCase().includes(ls) ||
              hub.platform.toLowerCase().includes(ls) ||
              hub.samples.some((sample) =>
                sample.name.toLowerCase().includes(ls)
              )
            ) {
              if (!searchPlatformMap.has(institution)) {
                searchPlatformMap.set(institution, new Map<string, IHub[]>())
              }

              if (!searchPlatformMap.get(institution)!.has(platform)) {
                searchPlatformMap.get(institution)!.set(platform, [])
              }

              searchPlatformMap.get(institution)!.get(platform)!.push(hub)
            }
          }
        }
      }

      setSearchPlatformMap(searchPlatformMap)
    } else {
      setSearchPlatformMap(platformMap)
    }
  }, [query, platformMap])

  const rightTabs: ITab[] = [
    {
      //id: nanoid(),
      id: 'Options',
      icon: <SlidersIcon />,

      content: <HubsPropsPanel />,
    },
  ]

  const institutions = [...searchPlaformMap.keys()].sort()

  return (
    <ShortcutLayout info={MODULE_INFO}>
      <HeaderPortal>
        <ModuleInfoButton info={MODULE_INFO} />

        <Autocomplete
          //variant="header"
          h="header"
          value={query}
          onTextChange={(v) => (v.length > 0 ? setQuery([v]) : resetQuery())}
          className="w-4/5 lg:w-1/2 text-xs font-medium"
        >
          {institutions.map((institution) => {
            return (
              <AutocompleteLi key={institution}>{institution}</AutocompleteLi>
            )
          })}
        </Autocomplete>

        <Select
          value={settings.genome}
          onValueChange={(v) => {
            const newStore = produce(settings, (draft) => {
              draft.genome = v
            })

            updateSettings(newStore)
          }}
        >
          <SelectTrigger
            variant="header"
            className="text-sm"
            title="Select Genome"
          >
            <SelectValue placeholder="Select a genome" />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="hg19">hg19</SelectItem>
            <SelectItem value="grch38">grch38</SelectItem>
            <SelectItem value="mm10">mm10</SelectItem>
          </SelectContent>
        </Select>
      </HeaderPortal>

      <TabSlideBar
        id="hubs"
        side="right"
        tabs={rightTabs}
        value={rightTab}
        onTabChange={(selectedTab) => setRightTab(selectedTab.tab.id)}
        open={showSideBar}
        showCloseButton={false}
        onOpenChange={setShowSideBar}
      >
        <BaseCol className="p-4 grow">
          <Accordion
            type="multiple"
            value={institutions}
            variant="settings"
            className="p-4"
          >
            {institutions.map((institution) => {
              return (
                <AccordionItem
                  key={institution}
                  value={institution}
                  className="bg-background rounded-card border border-border/50"
                >
                  <AccordionTrigger variant="none" className="p-4">
                    {institution}
                  </AccordionTrigger>
                  <AccordionContent>
                    {[...searchPlaformMap.get(institution)!.keys()]
                      .sort()
                      .map((platform) => {
                        return (
                          <BaseCol
                            className="gap-y-2 border-t border-border/50 p-4"
                            key={platform}
                          >
                            <h2 className=" text-lg">{platform}</h2>
                            <ul className="flex flex-col gap-y-2">
                              {searchPlaformMap
                                .get(institution)!
                                .get(platform)!
                                .map((hub) => {
                                  const params = new URLSearchParams()
                                  params.append('db', settings.genome)
                                  params.append('hubUrl', hub.url)
                                  if (settings.hideTracks) {
                                    params.append('hideTracks', '1')
                                  }

                                  params.append(
                                    'guidelines',
                                    settings.showGuidelines ? 'on' : 'off'
                                  )

                                  return (
                                    <li
                                      key={hub.publicId}
                                      className="flex flex-row items-center gap-x-2 text-sm"
                                    >
                                      <BaseCol className="grow">
                                        <h3 className="font-semibold">
                                          {hub.name}
                                        </h3>
                                        <p>{hub.description}</p>
                                        {/* <p className="text-xs mt-1 truncate text-gray-400">
                                          {hub.samples
                                            .map(sample => sample.name)
                                            .sort()
                                            .join(', ')}{' '}
                                        </p> */}
                                      </BaseCol>
                                      <a
                                        href={`${BASE_URL}?${params.toString()}`}
                                        target={BLANK_TARGET}
                                        className="bg-theme text-white group px-4 py-2 rounded-full flex flex-row items-center gap-x-1 text-xs"
                                      >
                                        <span>View</span>
                                        <IndexArrowIcon />
                                      </a>
                                    </li>
                                  )
                                })}
                            </ul>
                          </BaseCol>
                        )
                      })}
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        </BaseCol>
      </TabSlideBar>
    </ShortcutLayout>
  )
}
