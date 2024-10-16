import React, { useRef } from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import type { SearchInput } from '@/schema/search.schema'
import Spinner from '@/components/_shared/Spinner'

export default function TeamsSearch({
    setQuery,
    query,
    isLoading,
}: {
    setQuery: React.Dispatch<React.SetStateAction<string>>
    query: string
    isLoading: boolean
}) {
    return (
        <section
            id="search"
            className="bg-cover bg-center bg-no-repeat w-full flex flex-col justify-center font-acumin h-[245px]"
            style={{
                backgroundImage: 'url(/images/bg.png)',
            }}
        >
            <form
                onSubmit={(e) => console.log(e)}
                className="w-full px-8 xxl:px-0 max-w-8xl mx-auto"
            >
                <div className="relative flex w-full max-w-[819px] items-start justify-start gap-x-6 xxl:pl-8 2xl:px-0">
                    <input
                        onChange={(e) => setQuery(e.target.value)}
                        value={query}
                        name="search"
                        placeholder="Search teams"
                        aria-label="search"
                        className="h-14 rounded-sm block w-full border-0 px-5 py-2 text-gray-900 shadow-wri-small ring-1 ring-inset ring-gray-300 placeholder:text-gray-900 placeholder:text-base border-b-2 border-blue-800 focus:bg-slate-100 focus:ring-0 focus:ring-offset-0 sm:text-sm sm:leading-6"
                    />
                    {isLoading ? (
                        <Spinner className="absolute right-8 top-[1rem] h-5 w-5 text-wri-black" />
                    ) : (
                        <button
                            type="submit"
                            aria-label="submit"
                            className=" my-auto"
                        >
                            <MagnifyingGlassIcon className="absolute right-8 top-[1rem] h-5 w-5 text-wri-black" />
                        </button>
                    )}
                </div>
            </form>
        </section>
    )
}
