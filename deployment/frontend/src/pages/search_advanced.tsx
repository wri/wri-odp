import Search from '@/components/Search'
import { ErrorAlert } from '@/components/_shared/Alerts'
import Footer from '@/components/_shared/Footer'
import Header from '@/components/_shared/Header'
import Pagination from '@/components/_shared/Pagination'
import DatasetHorizontalCard from '@/components/search/DatasetHorizontalCard'
import FilteredSearchLayout from '@/components/search/FilteredSearchLayout'
import FiltersSelected from '@/components/search/FiltersSelected'
import SortBy from '@/components/search/SortBy'
import { Filter } from '@/interfaces/search.interface'
import { SearchInput } from '@/schema/search.schema'
import { api } from '@/utils/api'
import notify from '@/utils/notify'
import { useEffect, useState } from 'react'

export default function SearchPage() {
    /**
     * Query used to show results
     *
     */
    const [query, setQuery] = useState<SearchInput>({
        search: '',
        page: { start: 0, rows: 10 },
        sortBy: "relevance asc"
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

        keys.forEach((key) => {
            const keyFilters = filters.filter((f) => f.key == key)
            const keyFq = keyFilters.map((kf) => `"${kf.value}"`).join(' OR ')
            fq[key as string] = keyFq
        })

        setQuery((prev) => {
            return {
                ...prev,
                fq,
                search: filters.find((e) => e?.key == 'search')?.value ?? '',
            }
        })
    }, [filters])

    return (
        <>
            <Header />
            <Search filters={filters} setFilters={setFilters} />
            <FilteredSearchLayout setFilters={setFilters} filters={filters}>
                <SortBy count={data?.count ?? 0} setQuery={setQuery} />
                <FiltersSelected filters={filters} setFilters={setFilters} />
                <div className="grid grid-cols-1 @7xl:grid-cols-2 gap-4 py-4">
                    {data?.datasets.map((dataset, number) => (
                        <DatasetHorizontalCard
                            key={`dataset-card-${dataset.name}`}
                            dataset={dataset}
                        />
                    ))}
                </div>
                <Pagination setQuery={setQuery} query={query} data={data} />
            </FilteredSearchLayout>
            <Footer />
        </>
    )
}
