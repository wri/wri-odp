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
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { NextSeo } from 'next-seo'
import { env } from '@/env.mjs'

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
                fq,
                search: filters.find((e) => e?.key == 'search')?.value ?? '',
                extLocationQ,
                extAddressQ,
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
            <NextSeo
                title="Advanced Search"
                description={`Explore WRI Open Data Catalog`}
                openGraph={{
                    title: `Explore Data`,
                    description: `Explore WRI Open Data Catalog`,
                    url: `${env.NEXT_PUBLIC_NEXTAUTH_URL}/search_advanced`,
                    images: [
                        {
                            url: `${env.NEXT_PUBLIC_NEXTAUTH_URL}/images/WRI_logo_4c.png`,
                            width: 800,
                            height: 600,
                            alt: 'Og Image Alt',
                        },
                    ],
                }}
                twitter={{
                    handle: '@WorldResources',
                    site: `${env.NEXT_PUBLIC_NEXTAUTH_URL}`,
                    cardType: 'summary_large_image',
                }}
            />
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
            <Footer
                links={{
                    primary: { title: 'Explore Teams', href: '/teams' },
                    secondary: { title: 'Explore Topics', href: '/topics' },
                }}
            />
        </>
    )
}
