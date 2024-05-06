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

export default function RedirectedSearchInput() {
    const router = useRouter()
    const { pathname } = router
    const searchSchema = z.object({ search: z.string() })
    type searchFormType = z.infer<typeof searchSchema>

    const { handleSubmit, register, reset } = useForm<searchFormType>({
        resolver: zodResolver(searchSchema),
        defaultValues: { search: '' },
    })

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
                        router.push({
                            pathname: '/search_advanced',
                            query: `search=%5B%7B%22title%22%3A%22Search%22%2C%22key%22%3A%22search%22%2C%22label%22%3A%22${encodeURIComponent(
                                data.search
                            )}%22%2C%22value%22%3A%22${encodeURIComponent(
                                data.search
                            )}%22%7D%5D`,
                        })
                    })}
                    className="relative flex w-full max-w-[819px] items-start justify-start gap-x-6 pl-8 px-4"
                >
                    <input
                        placeholder="Search data"
                        aria-label='search'
                        className="h-14 rounded-sm block w-full border-0 px-5 py-2 text-gray-900 shadow-wri-small ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 border-b-2 border-blue-800 focus:bg-slate-100 focus:ring-0 focus:ring-offset-0 sm:text-sm sm:leading-6"
                        {...register('search')}
                    />
                    <div className="absolute right-8 top-[1rem]">
                        <button type="submit" aria-label='submit search query'>
                            <MagnifyingGlassIcon className="h-5 w-5 text-wri-black" />
                        </button>
                    </div>
                </form>
            </div>
        </section>
    )
}
