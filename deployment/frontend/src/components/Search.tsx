import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import Link from 'next/link'
import { useRouter } from 'next/router'
import classNames from '@/utils/classnames'
import { SearchInput } from '@/schema/search.schema'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Filter } from '@/interfaces/search.interface'
import { XMarkIcon } from '@heroicons/react/24/outline'

export default function Search({
    setFilters,
    filters,
}: {
    setFilters: Dispatch<SetStateAction<Filter[]>>
    filters: Filter[]
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

    const { handleSubmit, register, reset } = useForm<searchFormType>({
        resolver: zodResolver(searchSchema),
        defaultValues: { search: '' },
    })

    useEffect(() => {
        setIsSearch(getIsSearching())
    }, [filters])

    return (
        <section
            id="search"
            className="flex h-[245px] w-full flex-col bg-cover bg-center bg-no-repeat font-acumin"
            style={{
                backgroundImage: 'url(/images/bg.png)',
            }}
        >
            <div className="w-full bg-wri-green">
                <div className="mx-auto flex max-w-8xl gap-x-2 px-8  text-[1.063rem] font-semibold text-white xxl:px-0">
                    <div
                        className={classNames(
                            'p-4',
                            pathname === '/search'
                                ? 'bg-wri-dark-green'
                                : 'bg-wri-green'
                        )}
                    >
                        <Link href="/search">Explore data</Link>
                    </div>
                    <div
                        className={classNames(
                            'p-4',
                            pathname === '/search_advanced'
                                ? 'bg-wri-dark-green'
                                : 'bg-wri-green'
                        )}
                    >
                        <Link href="/search_advanced">Advanced search</Link>
                    </div>
                </div>
            </div>
            <div className="mx-auto my-auto flex w-full max-w-[1380px] space-x-4 px-4 font-acumin sm:px-6 xxl:px-0">
                <form
                    onSubmit={handleSubmit((data) => {
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
                                            (filter) => filter.key == 'search'
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
                    })}
                    className="relative flex w-full max-w-[819px] items-start justify-start gap-x-6 pl-8 px-4"
                >
                    <input
                        placeholder="Search data"
                        className="h-14 rounded-sm block w-full border-0 px-5 py-2 text-gray-900 shadow-wri-small ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 border-b-2 border-blue-800 focus:bg-slate-100 focus:ring-0 focus:ring-offset-0 sm:text-sm sm:leading-6"
                        {...register('search')}
                    />
                    <div className="absolute right-8 top-[1rem]">
                        {!isSearch ? (
                            <button type="submit">
                                <MagnifyingGlassIcon className="h-5 w-5 text-wri-black" />
                            </button>
                        ) : (
                            <button
                                onClick={(e) => {
                                    reset()
                                }}
                            >
                                <XMarkIcon className="h-5 w-5 text-wri-black" />
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </section>
    )
}
