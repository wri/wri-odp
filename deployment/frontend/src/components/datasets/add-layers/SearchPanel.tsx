import { MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import DatasetCard from '../sections/RelatedDatasets'
import Select from '@/components/_shared/Select'

export default function SearchPanel() {
    return (
        <div className="pr-6">
            <div className="relative py-4">
                <input
                    className="block w-full rounded-md border-b border-wri-green py-3 pl-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-black focus:ring-2 focus:ring-inset focus:ring-wri-green sm:text-sm sm:leading-6"
                    placeholder="Search data"
                />
                <MagnifyingGlassIcon className="w-5 h-5 text-black absolute top-[30px] right-4" />
            </div>
            <div>
                <div className="flex justify-between items-center">
                    <span className="text-base font-semibold">
                        {6} Datasets
                    </span>
                    <div className="flex items-center gap-x-3">
                        <div className="font-['Acumin Pro SemiCondensed'] text-sm font-normal text-black">
                            Show
                        </div>
                        <Select
                            options={[
                                { id: 1, label: '1' },
                                { id: 2, label: '2' },
                                { id: 3, label: '3' },
                            ]}
                        />
                    </div>
                </div>
                <div className="flex flex-col gap-y-4 py-2">
                    {[0, 1, 2, 3, 4, 5].map((dataset) => (
                        <DatasetCard
                            dataset={{
                                name: 'Test',
                                temporal_coverage_start: '',
                                temporal_coverage_end: '',
                                num_resources: 0,
                                num_tags: 0,
                                open_in: [],
                                id: '123',
                                resources: [],
                            }}
                            key={dataset}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
