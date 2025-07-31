import classNames from '@/utils/classnames'
import { Tab } from '@headlessui/react'
import { Fragment, useEffect, useState } from 'react'
import SearchPanel from './SearchPanel'
import FiltersPanel from './FiltersPanel'
import { SearchInput } from '@/schema/search.schema'
import { Filter } from '@/interfaces/search.interface'
import { api } from '@/utils/api'
import Spinner from '@/components/_shared/Spinner'
import Pagination from '../Pagination'
import { useDataset } from '@/utils/storeHooks'

export default function AddLayers() {
    const addLayerTabs = [{ name: 'Search' }, { name: 'Filters' }]
    const { dataset } = useDataset()

    /**
     * Query used to show results
     *
     */
    const [query, setQuery] = useState<SearchInput>({
        search: '',
        page: { start: 0, rows: 10 },
        sortBy: 'score desc',
        fq: { res_format: 'Layer' },
        appendRawFq: ` -id:(${dataset.id})`
    })

    const [filters, setFilters] = useState<Filter[]>([])

    const { data, isLoading } = api.dataset.getAllDataset.useQuery(query)

    /*
     * Whenever filters is updated, update the query's fq
     *
     */
    useEffect(() => {
        const keys = [...new Set(filters.map((f) => f.key))].filter(
            (key) => key != 'search'
        )

        const fq: any = {}
        let extLocationQ = ''
        let extAddressQ = ''

        keys.forEach((key) => {
            let keyFq

            const keyFilters = filters.filter((f) => f.key == key)
            if ((key as string) == 'temporal_coverage_start') {
                if (keyFilters.length > 0) {
                    const temporalCoverageStart = keyFilters[0]
                    const temporalCoverageEnd = filters.find(
                        (f) => f.key == 'temporal_coverage_end'
                    )?.value

                    keyFq = `[${temporalCoverageStart?.value} TO *]`

                    if (temporalCoverageEnd) {
                        keyFq = `[* TO ${temporalCoverageEnd}]`
                    }
                }
            } else if ((key as string) == 'temporal_coverage_end') {
                if (keyFilters.length > 0) {
                    const temporalCoverageEnd = keyFilters[0]
                    const temporalCoverageStart = filters.find(
                        (f) => f.key == 'temporal_coverage_start'
                    )?.value

                    keyFq = `[* TO ${temporalCoverageEnd?.value}]`

                    if (temporalCoverageStart) {
                        keyFq = `[${temporalCoverageStart} TO *]`
                    }
                }
            } else if (
                key === 'metadata_modified_since' ||
                key === 'metadata_modified_before'
            ) {
                const metadataModifiedSinceFilter = filters.find(
                    (f) => f.key === 'metadata_modified_since'
                )
                const metadataModifiedSince = metadataModifiedSinceFilter
                    ? metadataModifiedSinceFilter.value + 'T00:00:00Z'
                    : '*'

                const metadataModifiedBeforeFilter = filters.find(
                    (f) => f.key === 'metadata_modified_before'
                )
                const metadataModifiedBefore = metadataModifiedBeforeFilter
                    ? metadataModifiedBeforeFilter.value + 'T23:59:59Z'
                    : '*'

                fq[
                    'metadata_modified'
                ] = `[${metadataModifiedSince} TO ${metadataModifiedBefore}]`
            } else if (key == 'spatial') {
                const coordinates = keyFilters[0]?.value
                const address = keyFilters[0]?.label

                // @ts-ignore
                if (coordinates) extLocationQ = coordinates.reverse().join(',')
                if (address) extAddressQ = address
            } else {
                keyFq = keyFilters.map((kf) => `"${kf.value}"`).join(' OR ')
            }

            if (keyFq) fq[key as string] = keyFq
        })

        delete fq.metadata_modified_since
        delete fq.metadata_modified_before
        delete fq.spatial

        setQuery((prev) => {
            return {
                ...prev,
                fq: { ...fq, res_format: 'Layer' },
                search: filters.find((e) => e?.key == 'search')?.value ?? '',
                extLocationQ,
                extAddressQ,
            }
        })
    }, [filters])

    return (
        <Tab.Group>
            <Tab.List as="nav" className="flex w-full gap-x-2 @sm:pr-8 pr-4">
                {addLayerTabs.map((tab) => (
                    <Tab as="div">
                        {({ selected }: { selected: boolean }) => (
                            <button
                                className={classNames(
                                    selected
                                        ? 'border-wri-green text-wri-green'
                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                                    'whitespace-nowrap border-b-2 px-6 font-acumin font-semibold transition flex gap-x-1'
                                )}
                            >
                                {tab.name}{' '}
                                {tab.name == 'Filters' &&
                                    filters.length > 0 && (
                                        <div className="flex justify-center items-center mt-[0.2rem]">
                                            <span className="h-3 w-3 p-2 bg-wri-gold text-white font-bold text-xs rounded-full flex items-center justify-center">
                                                {filters.length}
                                            </span>
                                        </div>
                                    )}
                            </button>
                        )}
                    </Tab>
                ))}
            </Tab.List>
            <Tab.Panels>
                <Tab.Panel>
                    {data && !isLoading && (
                        <>
                            <SearchPanel
                                filters={filters}
                                setFilters={setFilters}
                                data={data}
                                setQuery={setQuery}
                            />

                            <Pagination
                                setQuery={setQuery}
                                query={query}
                                data={data}
                            />
                        </>
                    )}
                    {isLoading && (
                        <div className="w-full flex justify-center">
                            <Spinner />
                        </div>
                    )}
                </Tab.Panel>
                <Tab.Panel>
                    <FiltersPanel filters={filters} setFilters={setFilters} />
                </Tab.Panel>
            </Tab.Panels>
        </Tab.Group>
    )
}
