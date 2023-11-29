import { Dispatch, Fragment, SetStateAction, useState } from 'react'
import { Dialog, Disclosure, Transition } from '@headlessui/react'
import {
    Bars3Icon,
    ChevronRightIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline'
import Facet from './Facet'
import LocationSearch from './LocationSearch'
import classNames from '@/utils/classnames'
import { Filter, Facets as SearchFacet } from '@/interfaces/search.interface'
import { SearchInput } from '@/schema/search.schema'
import { api } from '@/utils/api'
import { useSession } from 'next-auth/react'
import TemporalCoverageFacet from './TemporalCoverageFacet'
import MetadataModifiedFacet from './MetadataModifiedFacet'
import Spinner from '../_shared/Spinner'
import { updateFrequencyLabels, visibilityTypeLabels } from '@/utils/constants'

export default function FilteredSearchLayout({
    children,
    setFilters,
    filters,
}: {
    children: React.ReactNode
    setFilters: Dispatch<SetStateAction<Filter[]>>
    filters: Filter[]
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const session = useSession()

    /*
     * Query used to fetch all possible facet options
     *
     */
    const facetFields = [
        { key: 'featured_dataset', title: 'Featured' },
        { key: 'application', title: 'Application' },
        { key: 'project', title: 'Project' },
        { key: 'organization', title: 'Team' },
        { key: 'groups', title: 'Topics' },
        { key: 'tags', title: 'Tags' },
        {
            key: 'temporal_coverage',
            title: 'Temporal Coverage',
        },
        { key: 'update_frequency', title: 'Update Frequency' },
        { key: 'res_format', title: 'Format' },
        { key: 'license_id', title: 'License' },
        { key: 'language', title: 'Language' },
        { key: 'wri_data', title: 'WRI Data' },
        { key: 'metadata_modified', title: 'Last Updated' },
    ]

    if (session.status == 'authenticated') {
        facetFields.push({ key: 'visibility_type', title: 'Visibility' })
    }

    const [facetsQuery] = useState<SearchInput>({
        search: '',
        page: { start: 0, rows: 5 },
        facetFields: facetFields.map((ff) => ff.key),
    })

    const { data: facetsData, isLoading: isLoadingFacets } =
        api.dataset.getAllDataset.useQuery(facetsQuery)

    const searchFacets = facetsData?.searchFacets

    if (searchFacets) {
        for (let key in searchFacets) {
            /*
             * Boolean fields look better with Yes and No options
             *
             */
            if (['featured_dataset', 'wri_data'].includes(key)) {
                const items =
                    searchFacets[key]?.items.map((i) => ({
                        ...i,
                        display_name: i.name == 'true' ? 'Yes' : 'No',
                    })) || []

                // @ts-ignore
                searchFacets[key].items = items
            } else if (key == 'visibility_type') {
                // @ts-ignore
                searchFacets[key].items = searchFacets[key].items.map((i) => ({
                    ...i,
                    // @ts-ignore
                    display_name: visibilityTypeLabels[i.name],
                }))
            } else if (key == 'update_frequency') {
                // @ts-ignore
                searchFacets[key].items = searchFacets[key].items.map((i) => ({
                    ...i,
                    // @ts-ignore
                    display_name: updateFrequencyLabels[i.name],
                }))
            }
        }
    }

    return (
        <>
            {/*
        This example requires updating your template:

        ```
        <html class="h-full bg-white">
        <body class="h-full">
        ```
      */}
            <div className="flex font-acumin">
                <Transition.Root show={sidebarOpen} as={Fragment}>
                    <Dialog
                        as="div"
                        className="relative z-50 lg:hidden"
                        onClose={setSidebarOpen}
                    >
                        <Transition.Child
                            as={Fragment}
                            enter="transition-opacity ease-linear duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="transition-opacity ease-linear duration-300"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0 bg-gray-900/80" />
                        </Transition.Child>

                        <div className="fixed inset-0 flex">
                            <Transition.Child
                                as={Fragment}
                                enter="transition ease-in-out duration-300 transform"
                                enterFrom="-translate-x-full"
                                enterTo="translate-x-0"
                                leave="transition ease-in-out duration-300 transform"
                                leaveFrom="translate-x-0"
                                leaveTo="-translate-x-full"
                            >
                                <Dialog.Panel className="relative mr-16 flex w-full flex-1 md:max-w-sm">
                                    <Transition.Child
                                        as={Fragment}
                                        enter="ease-in-out duration-300"
                                        enterFrom="opacity-0"
                                        enterTo="opacity-100"
                                        leave="ease-in-out duration-300"
                                        leaveFrom="opacity-100"
                                        leaveTo="opacity-0"
                                    >
                                        <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                                            <button
                                                type="button"
                                                className="-m-2.5 p-2.5"
                                                onClick={() =>
                                                    setSidebarOpen(false)
                                                }
                                            >
                                                <span className="sr-only">
                                                    Close sidebar
                                                </span>
                                                <XMarkIcon
                                                    className="h-6 w-6 text-white"
                                                    aria-hidden="true"
                                                />
                                            </button>
                                        </div>
                                    </Transition.Child>
                                    {/* Sidebar component, swap this element with another sidebar if you like */}
                                    <div
                                        id="facets-list"
                                        className="flex grow flex-col gap-y-5 overflow-y-auto bg-white pb-4"
                                    >
                                        <nav className="flex flex-1 flex-col">
                                            <ul
                                                role="list"
                                                className="flex flex-1 flex-col gap-y-7"
                                            >
                                                <li>
                                                    <ul role="list">
                                                        <LocationSearch />
                                                        {!isLoadingFacets &&
                                                            facetFields.map(
                                                                (ff) =>
                                                                    ff.key === 'temporal_coverage' ? (
                                                                        <TemporalCoverageFacet
                                                                            filters={
                                                                                filters
                                                                            }
                                                                            setFilters={
                                                                                setFilters
                                                                            }
                                                                        />
                                                                    ) : ff.key === 'metadata_modified' ? (
                                                                        <MetadataModifiedFacet
                                                                            filters={
                                                                                filters
                                                                            }
                                                                            setFilters={
                                                                                setFilters
                                                                            }
                                                                        />
                                                                    ) : (
                                                                        <Facet
                                                                            text={
                                                                                ff.title
                                                                            }
                                                                            options={
                                                                                searchFacets &&
                                                                                searchFacets[
                                                                                    ff
                                                                                        .key
                                                                                ]
                                                                                    ? searchFacets[
                                                                                          ff
                                                                                              .key
                                                                                      ]?.items
                                                                                          .filter(
                                                                                              (
                                                                                                  o
                                                                                              ) =>
                                                                                                  o.name
                                                                                          )
                                                                                          .map(
                                                                                              (
                                                                                                  o
                                                                                              ) => ({
                                                                                                  label:
                                                                                                      o.display_name ??
                                                                                                      o.name,
                                                                                                  value: o.name,
                                                                                              })
                                                                                          ) ||
                                                                                      []
                                                                                    : []
                                                                            }
                                                                            fqKey={
                                                                                ff.key
                                                                            }
                                                                            setFilters={
                                                                                setFilters
                                                                            }
                                                                            filters={
                                                                                filters
                                                                            }
                                                                        />
                                                                    )
                                                            )}
                                                    </ul>
                                                </li>
                                            </ul>
                                        </nav>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </Dialog>
                </Transition.Root>

                {/* Static sidebar for desktop */}
                <Disclosure defaultOpen>
                    {({ open }) => (
                        <>
                            <Disclosure.Button className="absolute lg:block hidden left-[calc(25%-1.5rem)] top-[60vh] z-20">
                                <div
                                    className={classNames(
                                        'flex h-12 w-12 items-center rounded-full bg-white shadow-lg transition',
                                        open ? '' : '-translate-x-[23.5vw]'
                                    )}
                                >
                                    <ChevronRightIcon
                                        className={classNames(
                                            'mx-auto h-6 w-6 text-black transition',
                                            open ? 'rotate-180 transform' : ''
                                        )}
                                    />
                                </div>
                            </Disclosure.Button>
                            <div
                                className={classNames(
                                    open ? 'hidden' : 'block min-w-[2%] w-[2%]'
                                )}
                            />
                            <Disclosure.Panel
                                as="div"
                                className="hidden w-[25%] min-w-[25%] lg:z-10 lg:flex lg:flex-col"
                            >
                                {/* Sidebar component, swap this element with another sidebar if you like */}
                                <div
                                    id="facets-list"
                                    className="flex grow flex-col gap-y-5 overflow-y-auto pb-4"
                                >
                                    <nav className="flex flex-1 flex-col">
                                        <ul
                                            role="list"
                                            className="flex flex-1 flex-col gap-y-7"
                                        >
                                            <li>
                                                <ul role="list">
                                                    <LocationSearch setFilters={setFilters} filters={filters} />
                                                    {!isLoadingFacets &&
                                                        facetFields.map((ff) =>
                                                            ff.key === 'temporal_coverage' ? (
                                                                <TemporalCoverageFacet
                                                                    filters={
                                                                        filters
                                                                    }
                                                                    setFilters={
                                                                        setFilters
                                                                    }
                                                                />
                                                            ) : ff.key === 'metadata_modified' ? (
                                                                <MetadataModifiedFacet
                                                                    filters={
                                                                        filters
                                                                    }
                                                                    setFilters={
                                                                        setFilters
                                                                    }
                                                                />
                                                            ) : (
                                                                <Facet
                                                                    text={
                                                                        ff.title
                                                                    }
                                                                    options={
                                                                        searchFacets &&
                                                                        searchFacets[
                                                                            ff
                                                                                .key
                                                                        ]
                                                                            ? searchFacets[
                                                                                  ff
                                                                                      .key
                                                                              ]?.items
                                                                                  .filter(
                                                                                      (
                                                                                          o
                                                                                      ) =>
                                                                                          o.name
                                                                                  )
                                                                                  .map(
                                                                                      (
                                                                                          o
                                                                                      ) => ({
                                                                                          label:
                                                                                              o.display_name ??
                                                                                              o.name,
                                                                                          value: o.name,
                                                                                      })
                                                                                  ) ||
                                                                              []
                                                                            : []
                                                                    }
                                                                    fqKey={
                                                                        ff.key
                                                                    }
                                                                    setFilters={
                                                                        setFilters
                                                                    }
                                                                    filters={
                                                                        filters
                                                                    }
                                                                />
                                                            )
                                                        )}
                                                </ul>
                                            </li>
                                        </ul>
                                    </nav>
                                </div>
                            </Disclosure.Panel>
                        </>
                    )}
                </Disclosure>

                <div className="w-full">
                    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:hidden lg:px-8">
                        <button
                            type="button"
                            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <span className="sr-only">Open sidebar</span>
                            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                        </button>
                    </div>

                    <main className="w-full">
                        <div className="px-4 sm:px-6 lg:px-8 @container w-full">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </>
    )
}
