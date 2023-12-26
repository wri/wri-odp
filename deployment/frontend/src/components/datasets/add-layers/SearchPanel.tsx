import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/20/solid'
import DatasetCard from '../sections/RelatedDatasets'
import Select from '@/components/_shared/Select'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { Filter } from '@/interfaces/search.interface'
import { useRouter } from 'next/router'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { WriDataset } from '@/schema/ckan.schema'
import FiltersSelected from '@/components/search/FiltersSelected'
import { Pagination } from 'swiper/modules'
import SimpleSelect from '@/components/_shared/SimpleSelect'
import { SearchInput } from '@/schema/search.schema'

export default function SearchPanel({
    filters,
    setFilters,
    data,
    setQuery,
}: {
    filters: Filter[]
    setFilters: Dispatch<SetStateAction<Filter[]>>
    data: { datasets: WriDataset[]; count: number }
    setQuery: Dispatch<SetStateAction<SearchInput>>
}) {
    const getIsSearching = () => {
        const filter = filters?.find((f) => f.key == 'search')

        return !!filter
    }

    const [isSearch, setIsSearch] = useState(getIsSearching())

    const router = useRouter()
    const { pathname } = router

    const searchSchema = z.object({ search: z.string() })
    type searchFormType = z.infer<typeof searchSchema>

    const { handleSubmit, register, reset, watch } = useForm<searchFormType>({
        resolver: zodResolver(searchSchema),
        defaultValues: {
            search: filters?.find((f) => f.key == 'search')?.value ?? '',
        },
    })

    useEffect(() => {
        setIsSearch(getIsSearching())

        if (watch('search') != filters.find((f) => f.key == 'search')?.value) {
            reset({ search: '' })
        }
    }, [filters])

    type Option = { value: string; label: string; default?: boolean }

    const showOptions: Option[] = [
        { value: '10', label: '10' },
        { value: '20', label: '20' },
        { value: '30', label: '30' },
    ]

    showOptions.forEach((o) => {
        if (o.value == "10") o.default = true
    })

    return (
        <div className="pr-6">
            <div className="relative py-4">
                <form
                    onSubmit={handleSubmit((data) => {
                        if (
                            watch('search') !=
                            filters.find((f) => f.key == 'search')?.value
                        ) {
                            setFilters((prev) => {
                                const newFilters = [...prev]
                                const searchFilter = newFilters.find(
                                    (filter) => filter.key == 'search'
                                )

                                if (searchFilter) {
                                    if (data.search) {
                                        searchFilter.value = data.search
                                        searchFilter.label = data.search
                                        setIsSearch(true)
                                    } else {
                                        newFilters.splice(
                                            newFilters.findIndex(
                                                (filter) =>
                                                    filter.key == 'search'
                                            ),
                                            1
                                        )
                                        setIsSearch(false)
                                    }
                                } else if (data.search) {
                                    newFilters.push({
                                        title: 'Search',
                                        key: 'search',
                                        label: data.search,
                                        value: data.search,
                                    })
                                    setIsSearch(true)
                                }

                                return newFilters
                            })
                        }
                    })}
                    className="relative flex w-full items-start justify-start gap-x-6"
                >
                    <input
                        className="block w-full rounded-md border-b border-wri-green py-3 pl-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-black focus:ring-2 focus:ring-inset focus:ring-wri-green sm:text-sm sm:leading-6"
                        placeholder="Search data"
                        {...register('search')}
                    />

                    {!isSearch ||
                    watch('search') !=
                        filters?.find((f) => f.key == 'search')?.value ? (
                        <button
                            type="submit"
                            className="w-5 h-5 text-black absolute top-4 right-4"
                        >
                            <MagnifyingGlassIcon />
                        </button>
                    ) : (
                        <button
                            className="w-5 h-5 text-black absolute top-4 right-4"
                            onClick={(e) => {
                                e.preventDefault()
                                setFilters((prev) => {
                                    const newFilters = [...prev]
                                    newFilters.splice(
                                        newFilters.findIndex(
                                            (filter) => filter.key == 'search'
                                        ),
                                        1
                                    )
                                    return newFilters
                                })
                                setIsSearch(false)

                                reset({ search: '' })
                            }}
                        >
                            <XMarkIcon />
                        </button>
                    )}
                </form>
                <div className="mt-3">
                    <FiltersSelected
                        filters={filters}
                        setFilters={setFilters}
                    />
                </div>
            </div>
            <div>
                <div className="flex justify-between items-center">
                    <span className="text-base font-semibold">
                        {data?.count ?? '0'} Datasets
                    </span>
                    <div className="flex items-center gap-x-3">
                        <div className="font-['Acumin Pro SemiCondensed'] text-sm font-normal text-black">
                            Show
                        </div>
                        <SimpleSelect
                            className="min-w-[75px]"
                            onChange={(val) =>
                                setQuery((prev) => ({
                                    ...prev,
                                    page: { ...prev.page, rows: Number(val) },
                                }))
                            }
                            placeholder="Select"
                            name="show"
                            options={showOptions}
                        />
                    </div>
                </div>
                <div className="flex flex-col gap-y-4 py-2">
                    {data.datasets.map((dataset) => (
                        <DatasetCard dataset={dataset} key={dataset.id} />
                    ))}
                </div>
            </div>
        </div>
    )
}
