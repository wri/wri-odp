import { SearchInput } from '@/schema/search.schema'
import {
    ChevronDoubleLeftIcon,
    ChevronDoubleRightIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
} from '@heroicons/react/20/solid'
import { Dispatch, SetStateAction } from 'react'

export default function Pagination({
    setQuery,
    query,
    data,
}: {
    setQuery: Dispatch<SetStateAction<SearchInput>>
    query: SearchInput
    data: any
}) {
    const nPages =
        data?.count && query?.page?.rows
            ? Math.ceil(data?.count / query?.page?.rows)
            : 1

    return (
        <div className="flex items-center justify-between bg-white py-3">
            <div className="flex sm:flex-1 sm:items-center sm:justify-between mx-auto">
                <div>
                    <nav
                        className="isolate inline-flex -space-x-px rounded-md"
                        aria-label="Pagination"
                    >
                        <button
                            onClick={() =>
                                setQuery((prev) => ({
                                    ...prev,
                                    page: { ...prev.page, start: 0 },
                                }))
                            }
                            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-black  ring-inset  hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                        >
                            <span className="sr-only">First</span>
                            <ChevronDoubleLeftIcon
                                className="h-5 w-5"
                                aria-hidden="true"
                            />
                        </button>
                        <button
                            onClick={() =>
                                setQuery((prev) => {
                                    const destination =
                                        prev.page.start - prev.page.rows

                                    return {
                                        ...prev,
                                        page: {
                                            ...prev.page,
                                            start:
                                                destination >= 0
                                                    ? destination
                                                    : 0,
                                        },
                                    }
                                })
                            }
                            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-black  ring-inset  hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                        >
                            <span className="sr-only">Previous</span>
                            <ChevronLeftIcon
                                className="h-5 w-5"
                                aria-hidden="true"
                            />
                        </button>
                        {/* Current: "z-10 bg-amber-400 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400", Default: "text-black  ring-inset  hover:bg-gray-50 focus:outline-offset-0" */}

                        {[...new Array(nPages).keys()].map((p) =>
                            p * query.page.rows == query.page.start ? (
                                <button
                                    aria-current="page"
                                    className="relative z-10 inline-flex items-center bg-amber-400 px-4 py-2 text-sm font-semibold focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
                                >
                                    {p + 1}
                                </button>
                            ) : (
                                <button
                                    onClick={() =>
                                        setQuery((prev) => ({
                                            ...prev,
                                            page: {
                                                ...prev.page,
                                                start: p * prev.page.rows,
                                            },
                                        }))
                                    }
                                    className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-black  ring-inset  hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                                >
                                    {p + 1}
                                </button>
                            )
                        )}
                        <button
                            onClick={() =>
                                setQuery((prev) => {
                                    const destination =
                                        prev.page.start + prev.page.rows

                                    return {
                                        ...prev,
                                        page: {
                                            ...prev.page,
                                            start:
                                                destination <= data.count
                                                    ? destination
                                                    : prev.page.start,
                                        },
                                    }
                                })
                            }
                            className="relative inline-flex items-center rounded-r-md px-2 py-2 text-black  ring-inset  hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                        >
                            <span className="sr-only">Next</span>
                            <ChevronRightIcon
                                className="h-5 w-5"
                                aria-hidden="true"
                            />
                        </button>
                        <button
                            onClick={() =>
                                setQuery((prev) => {
                                    const destination =
                                        (nPages - 1) * prev.page.rows

                                    return {
                                        ...prev,
                                        page: {
                                            ...prev.page,
                                            start: destination,
                                        },
                                    }
                                })
                            }
                            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-black  ring-inset  hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                        >
                            <span className="sr-only">Last</span>
                            <ChevronDoubleRightIcon
                                className="h-5 w-5"
                                aria-hidden="true"
                            />
                        </button>
                    </nav>
                </div>
            </div>
        </div>
    )
}
