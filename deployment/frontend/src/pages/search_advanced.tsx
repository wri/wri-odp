import Search from '@/components/Search'
import { ErrorAlert } from '@/components/_shared/Alerts'
import Footer from '@/components/_shared/Footer'
import Header from '@/components/_shared/Header'
import Pagination from '@/components/datasets/Pagination'
import Spinner from '@/components/_shared/Spinner'
import DatasetHorizontalCard from '@/components/search/DatasetHorizontalCard'
import FilteredSearchLayout from '@/components/search/FilteredSearchLayout'
import FiltersSelected from '@/components/search/FiltersSelected'
import SortBy from '@/components/search/SortBy'
import { Filter } from '@/interfaces/search.interface'
import { SearchInput } from '@/schema/search.schema'
import { api } from '@/utils/api'
import notify from '@/utils/notify'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

export function getServerSideProps({ query }: { query: any }) {
    const initialFilters = query.search
        ? JSON.parse(query.search as string)
        : []
    const initialPage = query.page
        ? JSON.parse(query.page as string)
        : { start: 0, rows: 10 }
    const initialSortBy = query.sort_by
        ? JSON.parse(query.sort_by as string)
        : 'relevance asc'

    return { props: { initialFilters, initialPage, initialSortBy } }
}

export default function SearchPage({
    initialFilters,
    initialPage,
    initialSortBy,
}: any) {
    const router = useRouter()
    const session = useSession()

    /**
     * Query used to show results
     *
     */
    const [query, setQuery] = useState<SearchInput>({
        search: '',
        page: initialPage,
        sortBy: initialSortBy,
    })

    const [filters, setFilters] = useState<Filter[]>(initialFilters)

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

        keys.forEach((key) => {
            let keyFq

            const keyFilters = filters.filter((f) => f.key == key)
            if ((key as string) == 'temporal_coverage_start') {
                if (keyFilters.length > 0) {
                    const temporalCoverageStart = keyFilters[0]

                    keyFq = `[${temporalCoverageStart?.value} TO *]`
                }
            } else if ((key as string) == 'temporal_coverage_end') {
                if (keyFilters.length > 0) {
                    const temporalCoverageEnd = keyFilters[0]

                    keyFq = `[${temporalCoverageEnd?.value} TO *]`
                }
            } else {
                keyFq = keyFilters.map((kf) => `"${kf.value}"`).join(' OR ')
            }

            if (keyFq) fq[key as string] = keyFq
        })

        setQuery((prev) => {
            return {
                ...prev,
                fq,
                search: filters.find((e) => e?.key == 'search')?.value ?? '',
            }
        })
    }, [filters])

    /*
     * Update URL query params when page or filters change
     *
     */
    useEffect(() => {
        router.push(
            {
                pathname: router.pathname,
                query: {
                    search: JSON.stringify(filters),
                    page: JSON.stringify(query.page),
                    sort_by: JSON.stringify(query.sortBy),
                },
            },
            undefined,
            {
                shallow: true,
            }
        )
    }, [filters, query.page, query.sortBy])

    return (
        <>
            <Header />
            <Search filters={filters} setFilters={setFilters} />
            {session.status == 'loading' && (
                <div className="flex w-full justify-center mt-20">
                    <Spinner />
                </div>
            )}
            {session.status != 'loading' && (
                <FilteredSearchLayout setFilters={setFilters} filters={filters}>
                    <SortBy
                        count={data?.count ?? 0}
                        setQuery={setQuery}
                        query={query}
                    />
                    <FiltersSelected
                        filters={filters}
                        setFilters={setFilters}
                    />
                    <div className="grid grid-cols-1 @7xl:grid-cols-2 gap-4 py-4">
                        {data?.datasets.map((dataset, number) => (
                            <DatasetHorizontalCard
                                key={`dataset-card-${dataset.name}`}
                                dataset={dataset}
                            />
                        ))}
                        {isLoading && (
                            <div className="mx-auto">
                                <Spinner />
                            </div>
                        )}
                    </div>
                    {
                        <Pagination
                            setQuery={setQuery}
                            query={query}
                            data={data}
                        />
                    }
                </FilteredSearchLayout>
            )}
            <Footer />
        </>
    )
}
