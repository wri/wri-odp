import { Dispatch, SetStateAction } from 'react'
import SimpleSelect from '../_shared/SimpleSelect'
import { SearchInput } from '@/schema/search.schema'

export default function SortBy({
    count,
    setQuery,
}: {
    count: number
    setQuery: Dispatch<SetStateAction<SearchInput>>
}) {
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
                        onChange={(val) =>
                            setQuery((prev) => ({
                                ...prev,
                                page: { ...prev.page, rows: Number(val) },
                            }))
                        }
                        placeholder="Select"
                        name="show"
                        options={[
                            { value: '2', label: '2', default: true }, //TODO: remove
                            { value: '10', label: '10', default: true },
                            { value: '20', label: '20' },
                            { value: '30', label: '30' },
                        ]}
                    />
                </div>
                <div className="flex items-center gap-x-3">
                    <div className="font-['Acumin Pro SemiCondensed'] text-sm font-normal text-black">
                        Sort by
                    </div>
                    <SimpleSelect
                        name="sort_by"
                        onChange={(val) =>
                            setQuery((prev) => ({ ...prev, sortBy: val }))
                        }
                        placeholder="Sort by"
                        options={[
                            {
                                value: 'relevance asc',
                                label: 'Relevance',
                                default: true,
                            },
                            { value: 'name asc', label: 'Name ASC' },
                            { value: 'name desc', label: 'Name DESC' },
                            {
                                value: 'last_modified asc',
                                label: 'Last Modified',
                            },
                            {
                                value: 'dataset_featured asc',
                                label: 'Featured',
                            },
                            { value: 'wri_data asc', label: 'WRI Data' },
                        ]}
                    />
                </div>
            </div>
        </div>
    )
}
