import Search from '@/components/Search';
import Footer from '@/components/_shared/Footer';
import Header from '@/components/_shared/Header';
import Pagination from '@/components/datasets/Pagination';
import Spinner from '@/components/_shared/Spinner';
import DatasetHorizontalCard from '@/components/search/DatasetHorizontalCard';
import FilteredSearchLayout from '@/components/search/FilteredSearchLayout';
import FiltersSelected from '@/components/search/FiltersSelected';
import SortBy from '@/components/search/SortBy';
import { type Filter } from '@/interfaces/search.interface';
import { type SearchInput } from '@/schema/search.schema';
import { api } from '@/utils/api';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { NextSeo } from 'next-seo';
import { env } from '@/env.mjs';
import { appRouter } from '@/server/api/root';
import { createServerSideHelpers } from '@trpc/react-query/server';
import superjson from 'superjson';
import {
    type GetServerSidePropsContext,
    type InferGetServerSidePropsType,
} from 'next';
import { getServerAuthSession } from '@/server/auth';
import { advance_search_query } from '@/utils/apiUtils';
import { Breadcrumbs } from '@/components/_shared/Breadcrumbsv2';

interface Option {
    value: string;
    label: string;
}

function filterCount(key: string, filters: Filter[]): number {
    return filters.filter((f) => f.key === key).length;
}

function defaultSelectedTagOptions(filters: Filter[]): string[] {
    const f = filters.filter((f) => f.key === 'tags').map((f) => f.label);
    return f;
}

function queryParamString(
    value: string | string[] | undefined
): string | undefined {
    if (typeof value === 'string') return value;
    if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
    return undefined;
}

function parseJsonParam<T>(raw: string | undefined, fallback: T): T {
    if (raw === undefined || raw === '') return fallback;
    return JSON.parse(raw) as T;
}

function isFilterArray(value: unknown): value is Filter[] {
    return (
        Array.isArray(value) &&
        value.every(
            (item) =>
                item !== null &&
                typeof item === 'object' &&
                typeof (item as Filter).key === 'string' &&
                typeof (item as Filter).value === 'string'
        )
    );
}

function isPageParam(
    value: unknown
): value is { start: number; rows: number } {
    return (
        value !== null &&
        typeof value === 'object' &&
        typeof (value as { start?: unknown }).start === 'number' &&
        typeof (value as { rows?: unknown }).rows === 'number'
    );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
    const { query, res } = context;

    let initialFilters: Filter[] = [];
    let initialPage = { start: 0, rows: 10 };
    let initialSortBy = 'score desc';

    try {
        const parsedFilters = parseJsonParam<unknown>(
            queryParamString(query.search),
            []
        );
        const parsedPage = parseJsonParam<unknown>(
            queryParamString(query.page),
            { start: 0, rows: 10 }
        );
        const parsedSortBy = parseJsonParam<unknown>(
            queryParamString(query.sort_by),
            'score desc'
        );

        if (!isFilterArray(parsedFilters)) {
            throw new Error('Invalid search filters');
        }
        if (!isPageParam(parsedPage)) {
            throw new Error('Invalid page');
        }
        if (typeof parsedSortBy !== 'string') {
            throw new Error('Invalid sort_by');
        }

        initialFilters = parsedFilters;
        initialPage = parsedPage;
        initialSortBy = parsedSortBy;
    } catch {
        // Bots / junk URLs use plain-text ?search=... instead of the JSON
        // filter array the UI writes. Avoid 500s from JSON.parse.
        res.statusCode = 400;
        return {
            props: {
                badRequest: true as const,
                trpcState: null,
                initialFilters: [],
                initialPage: { start: 0, rows: 10 },
                initialSortBy: 'score desc',
            },
        };
    }

    const session = await getServerAuthSession(context);
    const helpers = createServerSideHelpers({
        router: appRouter,
        ctx: { session, ip: undefined },
        transformer: superjson,
    });

    const searchQuery = advance_search_query(initialFilters);

    await helpers.dataset.getAllDataset.prefetch({
        ...searchQuery,
        page: initialPage,
        sortBy: initialSortBy,
        removeUnecessaryDataInResources: true,
    });

    return {
        props: {
            badRequest: false as const,
            trpcState: helpers.dehydrate(),
            initialFilters,
            initialPage,
            initialSortBy,
        },
    };
}

export default function SearchPage(
    props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
    if (props.badRequest) {
        return (
            <>
                <Header />
                <NextSeo title="Bad Request" noindex={true} />
                <main className="mx-auto max-w-3xl px-4 py-16 text-center">
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Bad Request
                    </h1>
                    <p className="mt-3 text-gray-600">
                        Invalid search parameters.
                    </p>
                </main>
                <Footer />
            </>
        );
    }

    return <SearchPageContent {...props} />;
}

function SearchPageContent({
    initialFilters,
    initialPage,
    initialSortBy,
}: {
    initialFilters: Filter[];
    initialPage: { start: number; rows: number };
    initialSortBy: string;
}) {
    const router = useRouter();
    const session = useSession();

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
    });
    const [filters, setFilters] = useState<Filter[]>(initialFilters);

    const [facetSelectedCount, setFacetSelectedCount] = useState<
        Record<string, number>
    >({
        project: filterCount('project', filters) || 0,
        organization: filterCount('organization', filters) || 0,
        groups: filterCount('groups', filters) || 0,
        tags: filterCount('tags', filters) || 0,
        update_frequency: filterCount('update_frequency', filters) || 0,
        res_format: filterCount('res_format', filters) || 0,
        license_id: filterCount('license_id', filters) || 0,
        language: filterCount('language', filters) || 0,
        wri_data: filterCount('wri_data', filters) || 0,
        visibility_type: filterCount('visibility_type', filters) || 0,
    });
    const [value, setValue] = useState<string[]>(
        defaultSelectedTagOptions(filters) || []
    );

    const { data, isLoading } = api.dataset.getAllDataset.useQuery(query);

    /*
     * Whenever filters is updated, update the query's fq
     *
     */
    useEffect(() => {
        const keys = [...new Set(filters.map((f) => f.key))].filter(
            (key) => key != 'search'
        );

        const fq: any = {};
        let extLocationQ = '';
        let extAddressQ = '';
        const extGlobalQ = 'include';

        keys.forEach((key) => {
            let keyFq;

            const keyFilters = filters.filter((f) => f.key == key);

            if (key == 'temporal_coverage_start') {
                if (keyFilters.length > 0) {
                    const temporalCoverageStart = keyFilters[0];
                    const temporalCoverageEnd = filters.find(
                        (f) => f.key == 'temporal_coverage_end'
                    )?.value;

                    keyFq = `[${temporalCoverageStart?.value} TO *]`;

                    // if (temporalCoverageEnd) {
                    //     keyFq = `[* TO ${temporalCoverageEnd}]`
                    // }
                }
            } else if (key == 'temporal_coverage_end') {
                if (keyFilters.length > 0) {
                    const temporalCoverageEnd = keyFilters[0];
                    const temporalCoverageStart = filters.find(
                        (f) => f.key == 'temporal_coverage_start'
                    )?.value;

                    keyFq = `[* TO ${temporalCoverageEnd?.value}]`;

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
                );
                const metadataModifiedSince = metadataModifiedSinceFilter
                    ? metadataModifiedSinceFilter.value + 'T00:00:00Z'
                    : '*';

                const metadataModifiedBeforeFilter = filters.find(
                    (f) => f.key === 'metadata_modified_before'
                );
                const metadataModifiedBefore = metadataModifiedBeforeFilter
                    ? metadataModifiedBeforeFilter.value + 'T23:59:59Z'
                    : '*';

                fq.metadata_modified = `[${metadataModifiedSince} TO ${metadataModifiedBefore}]`;
            } else if (key == 'spatial') {
                const coordinates = keyFilters[0]?.value;
                const address = keyFilters[0]?.label;

                // @ts-ignore
                if (coordinates) extLocationQ = coordinates.join(',');
                if (address) extAddressQ = address;
            } else if (key == 'extGlobalQ') {
                const extGlobalQFilter = filters.find(
                    (f) => f.key == 'extGlobalQ'
                );
                if (extGlobalQFilter?.value === 'exclude') {
                    fq['!spatial_address'] = 'Global';
                }
                if (extGlobalQFilter?.value === 'only') {
                    fq.spatial_address = 'Global';
                }
            } else {
                keyFq = keyFilters.map((kf) => `"${kf.value}"`).join(' OR ');
            }

            if (keyFq) fq[key] = keyFq;
        });

        delete fq.metadata_modified_since;
        delete fq.metadata_modified_before;
        delete fq.spatial;
        delete fq.extGlobalQ;

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
            };
        });
    }, [filters]);

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
        );
    }, [filters, query.page, query.sortBy]);
    const links = [{ label: 'Search', url: '/search', current: true }];

    return (
        <>
            <Header />
            <NextSeo
                title="Search"
                description={`Explore WRI Open Data Catalog, WRI Data Explorer`}
                openGraph={{
                    title: `Search`,
                    description: `Explore WRI Open Data Catalog, WRI Data Explorer`,
                    url: `${env.NEXT_PUBLIC_NEXTAUTH_URL}/search`,
                }}
            />
            <Breadcrumbs links={links} />
            <Search filters={filters} setFilters={setFilters} />
            {session.status == 'loading' && (
                <div className="flex w-full justify-center mt-20">
                    <Spinner />
                </div>
            )}
            {session.status != 'loading' && (
                <FilteredSearchLayout
                    setFilters={setFilters}
                    filters={filters}
                    facetSelectedCount={facetSelectedCount}
                    setFacetSelectedCount={setFacetSelectedCount}
                    value={value}
                    setValue={setValue}
                >
                    <SortBy
                        count={data?.count ?? 0}
                        setQuery={setQuery}
                        query={query}
                    />
                    <FiltersSelected
                        filters={filters}
                        setFilters={setFilters}
                        setFacetSelectedCount={setFacetSelectedCount}
                        setValue={setValue}
                    />
                    <div className="grid grid-cols-1 @7xl:grid-cols-2 gap-4 py-4">
                        {data?.datasets.map((dataset, number) => (
                            <DatasetHorizontalCard
                                key={`dataset-card-${dataset.name}`}
                                dataset={dataset}
                            />
                        ))}
                        {isLoading && (
                            <div className="mx-auto h-[2898px] lg:h-[2406px]">
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
                    primary: [
                        { title: 'Explore Topics', href: '/topics' },
                        { title: 'Explore Teams', href: '/teams' },

                        {
                            title: 'Explore Applications',
                            href: '/applications',
                        },
                    ],
                }}
            />
        </>
    );
}
