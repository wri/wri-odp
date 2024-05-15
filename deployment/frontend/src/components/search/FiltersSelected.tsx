import { Filter } from '@/interfaces/search.interface'
import { XCircleIcon } from '@heroicons/react/24/outline'
import { Dispatch, SetStateAction } from 'react'

export default function FiltersSelected({
    filters,
    setFilters,
    setFacetSelectedCount,
    setValue,
}: {
    filters: Filter[]
    setFilters: Dispatch<SetStateAction<Filter[]>>
    setFacetSelectedCount: Dispatch<SetStateAction<Record<string, number>>>
    setValue: Dispatch<SetStateAction<string[]>>
}) {
    return (
        <div className="flex flex-col lg:flex-row gap-y-4 lg:items-center justify-between">
            <div className="flex flex-wrap gap-2">
                {filters.map((f) => (
                    <div className="flex h-8 w-fit items-center gap-x-2 rounded-sm bg-neutral-100 hover:bg-neutral-200 transition px-3 py-1 shadow">
                        <div className="font-['Acumin Pro SemiCondensed'] text-xs font-semibold leading-none text-black">
                            {f.title}: {f.label}
                        </div>
                        <button
                            onClick={() => {
                                setFilters((prev) => {
                                    const newFilters = [...prev]
                                    newFilters.splice(
                                        newFilters.findIndex(
                                            (of) =>
                                                f.key == of.key &&
                                                of.value == f.value
                                        ),
                                        1
                                    )
                                    return newFilters
                                })
                                setFacetSelectedCount((prev) => {
                                    const newFacetSelectedCount = { ...prev }
                                    newFacetSelectedCount[f.key] -= 1
                                    return newFacetSelectedCount
                                })

                                setValue((prev) => {
                                    return prev.filter(
                                        (value) => value !== f.label
                                    )
                                })
                            }}
                        >
                            <XCircleIcon className="h-4 w-4 text-red-600 cursor-pointer" />
                        </button>
                    </div>
                ))}
            </div>
            {filters.length ? (
                <button
                    onClick={() => {
                        setFilters([])
                    }}
                    className="font-['Acumin Pro SemiCondensed'] text-sm font-normal text-black underline"
                >
                    Clear all filters
                </button>
            ) : null}
        </div>
    )
}
