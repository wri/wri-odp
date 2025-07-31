import { Dispatch, SetStateAction, useState } from 'react'
import SimpleSelect from '../_shared/SimpleSelect'
import { SearchInput } from '@/schema/search.schema'

export default function SortBy({
    count,
    setQuery,
    query,
}: {
    count: number
    setQuery: Dispatch<SetStateAction<SearchInput>>
    query: SearchInput
}) {
    const [initialQuery] = useState(query)

    type Option = { value: string; label: string; default?: boolean }

    const showOptions: Option[] = [
        { value: '10', label: '10' },
        { value: '20', label: '20' },
        { value: '30', label: '30' },
    ]

    showOptions.forEach((o) => {
        if (o.value == initialQuery.page.rows.toString()) o.default = true
    })

    const sortByOptions: Option[] = [
        {
            value: 'score desc',
            label: 'Relevance',
        },
        { value: 'name asc', label: 'Name ASC' },
        { value: 'name desc', label: 'Name DESC' },
        {
            value: 'metadata_modified desc',
            label: 'Last Modified',
        },
        {
            value: 'featured_dataset desc',
            label: 'Featured',
        },
        { value: 'wri_data desc', label: 'WRI Data' },
    ]
    sortByOptions.forEach((o) => {
        if (o.value == initialQuery.sortBy) o.default = true
    })

    return (
        <div className="flex gap-y-2 lg:items-center items-start flex-col lg:flex-row justify-between mb-5 mt-6">
            <div className="font-['Acumin Pro SemiCondensed'] text-xl font-semibold text-black">
                {count} results
            </div>
            <div className="flex items-center gap-x-2">
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
                <div className="flex items-center gap-x-3">
                    <div className="font-['Acumin Pro SemiCondensed'] text-sm font-normal text-black">
                        Sort by
                    </div>
                    <SimpleSelect
                        className="min-w-[125px]"
                        name="sort_by"
                        onChange={(val) =>
                            setQuery((prev) => ({ ...prev, sortBy: val }))
                        }
                        placeholder="Sort by"
                        options={sortByOptions}
                    />
                </div>
            </div>
        </div>
    )
}
