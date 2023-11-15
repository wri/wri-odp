import { SearchInput } from '@/schema/search.schema'
import {
    ChevronDoubleLeftIcon,
    ChevronDoubleRightIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
} from '@heroicons/react/20/solid'
import {
    Dispatch,
    Fragment,
    SetStateAction,
    useEffect,
    useRef,
    useState,
} from 'react'

export default function Pagination({
    setQuery,
    query,
    data,
}: {
    setQuery: Dispatch<SetStateAction<SearchInput>>
    query: SearchInput
    data: any
}) {
    const [currentPage, setCurrentPage] = useState(
        query.page.start / query.page.rows + 1
    )

    const nPages =
        data?.count && query?.page?.rows
            ? Math.ceil(data?.count / query?.page?.rows)
            : 1

    const goToNextPage = () => {
        if (currentPage + 1 <= nPages) setCurrentPage((prev) => prev + 1)
    }

    const goToPreviousPage = () => {
        if (currentPage - 1 >= 1) setCurrentPage((prev) => prev - 1)
    }

    useEffect(() => {
        /*
         * If show number is changed, check if current page is
         * greater than the number of pages. If that's the case
         * then go to first page, otherwise go to last possible
         * page
         *
         */
        if (query.page.start / query.page.rows + 1 > nPages) {
            setCurrentPage(1)
        } else {
            setCurrentPage(Math.ceil(query.page.start / query.page.rows) + 1)
        }
    }, [query.page.rows])

    /*
     * Whenever page or show number changes, update query
     *
     */
    useEffect(() => {
        const destination = (currentPage - 1) * query.page.rows
        setQuery((prev) => ({
            ...prev,
            page: { ...prev.page, start: destination },
        }))
    }, [currentPage, query.page.rows])

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
                                setCurrentPage((prev) =>
                                    prev - 5 >= 1 ? prev - 5 : 1
                                )
                            }
                            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-black  ring-inset  hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                        >
                            <span className="sr-only">Jump 5 pages behind</span>
                            <ChevronDoubleLeftIcon
                                className="h-5 w-5"
                                aria-hidden="true"
                            />
                        </button>
                        <button
                            onClick={() => goToPreviousPage()}
                            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-black  ring-inset  hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                        >
                            <span className="sr-only">Previous</span>
                            <ChevronLeftIcon
                                className="h-5 w-5"
                                aria-hidden="true"
                            />
                        </button>
                        {/* Current: "z-10 bg-amber-400 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400", Default: "text-black  ring-inset  hover:bg-gray-50 focus:outline-offset-0" */}

                        {[...new Array(3).keys()].map((relativePage) => {
                            let offset = 0
                            if (currentPage > 1) {
                                offset = -1
                            }

                            const absolutePage =
                                relativePage + currentPage + offset

                            const CurrentPageButton = () => (
                                <button
                                    aria-current="page"
                                    className="relative z-10 inline-flex items-center bg-amber-400 px-4 py-2 text-sm font-semibold focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
                                >
                                    {absolutePage}
                                </button>
                            )

                            const PageButton = ({ page }: { page: number }) => (
                                <button
                                    onClick={() => setCurrentPage(page)}
                                    className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-black  ring-inset  hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                                >
                                    {page}
                                </button>
                            )

                            const Ellipsis = () => (
                                <span className="py-2 px-4">...</span>
                            )

                            return (
                                <Fragment key={`pagination-${absolutePage}`}>
                                    {nPages > 3 &&
                                        currentPage >= 3 &&
                                        relativePage == 0 && (
                                            <>
                                                <PageButton page={1} />
                                                <Ellipsis />
                                            </>
                                        )}
                                    {absolutePage <= nPages &&
                                        (absolutePage == currentPage ? (
                                            <CurrentPageButton />
                                        ) : (
                                            <PageButton page={absolutePage} />
                                        ))}
                                    {nPages > 3 &&
                                        currentPage <= nPages - 2 &&
                                        relativePage == 2 && (
                                            <>
                                                <Ellipsis />
                                                <PageButton page={nPages} />
                                            </>
                                        )}
                                </Fragment>
                            )
                        })}
                        <button
                            onClick={() => goToNextPage()}
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
                                setCurrentPage((prev) =>
                                    prev + 5 <= nPages ? prev + 5 : nPages
                                )
                            }
                            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-black  ring-inset  hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                        >
                            <span className="sr-only">Jump 5 pages ahead</span>
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
