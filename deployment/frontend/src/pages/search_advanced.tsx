import Search from '@/components/Search'
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
import { appRouter } from '@/server/api/root'
import { createServerSideHelpers } from '@trpc/react-query/server'
import superjson from 'superjson'
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next'
import { getServerAuthSession } from '@/server/auth'
import { advance_search_query } from '@/utils/apiUtils'
import { log } from 'console'

export async function getServerSideProps(
    context: GetServerSidePropsContext<{ query: any }>
) {
    const { query } = context
    const initialFilters = query.search
        ? JSON.parse(query.search as string)
        : []
    const initialPage = query.page
        ? JSON.parse(query.page as string)
        : { start: 0, rows: 10 }
    const initialSortBy = query.sort_by
        ? JSON.parse(query.sort_by as string)
        : 'relevance asc'

    const session = await getServerAuthSession(context)
    const helpers = createServerSideHelpers({
        router: appRouter,
        ctx: { session },
        transformer: superjson,
    })

    const searchQuery = advance_search_query(initialFilters as Filter[])

    await helpers.dataset.getAllDataset.prefetch({
        ...searchQuery,
        page: initialPage,
        sortBy: initialSortBy,
        removeUnecessaryDataInResources: true,
    })

    return {
        props: {
            trpcState: helpers.dehydrate(),
            initialFilters,
            initialPage,
            initialSortBy,
        },
    }
}

export default function SearchPage(
    props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
    const { initialFilters, initialPage, initialSortBy } = props
    const router = useRouter()
    const session = useSession()

    /**
     * Query used to show results
     *
     */
    const [query, setQuery] = useState<SearchInput>({
        search: '',
        extLocationQ: '',
        extAddressQ: '',
        extGlobalQ: 'include',
        fq: {},
        page: initialPage,
        sortBy: initialSortBy,
        removeUnecessaryDataInResources: true,
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
        let extGlobalQ = 'include'

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

                    // if (temporalCoverageEnd) {
                    //     keyFq = `[* TO ${temporalCoverageEnd}]`
                    // }
                }
            } else if ((key as string) == 'temporal_coverage_end') {
                if (keyFilters.length > 0) {
                    const temporalCoverageEnd = keyFilters[0]
                    const temporalCoverageStart = filters.find(
                        (f) => f.key == 'temporal_coverage_start'
                    )?.value

                    keyFq = `[* TO ${temporalCoverageEnd?.value}]`

                    // if (temporalCoverageStart) {
                    //     keyFq = `[${temporalCoverageStart} TO *]`
                    // }
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
            } else if (key == 'extGlobalQ') {
                const extGlobalQFilter = filters.find(
                    (f) => f.key == 'extGlobalQ'
                )
                if (extGlobalQFilter && extGlobalQFilter.value === 'exclude') {
                    fq['!spatial_address'] = 'Global'
                }
                if (extGlobalQFilter && extGlobalQFilter.value === 'only') {
                    fq['spatial_address'] = 'Global'
                }
            } else {
                keyFq = keyFilters.map((kf) => `"${kf.value}"`).join(' OR ')
            }

            if (keyFq) fq[key as string] = keyFq
        })

        delete fq.metadata_modified_since
        delete fq.metadata_modified_before
        delete fq.spatial
        delete fq.extGlobalQ

        setQuery((prev) => {
            return {
                ...prev,
                fq,
                search: filters.find((e) => e?.key == 'search')?.value ?? '',
                extLocationQ,
                extAddressQ,
                extGlobalQ:
                    (filters.find((e) => e?.key == 'extGlobalQ')?.value as
                        | 'only'
                        | 'exclude'
                        | 'include') ?? 'include',
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
