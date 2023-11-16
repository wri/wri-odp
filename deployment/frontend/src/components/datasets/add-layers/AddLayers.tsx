import classNames from '@/utils/classnames'
import { Tab } from '@headlessui/react'
import { Fragment } from 'react'
import SearchPanel from './SearchPanel'
import FiltersPanel from './FiltersPanel'

export default function AddLayers() {
    const addLayerTabs = [{ name: 'Search' }, { name: 'Filters' }]

    return (
        <Tab.Group>
            <Tab.List as="nav" className="flex w-full gap-x-2 @sm:pr-8 pr-4">
                {addLayerTabs.map((tab) => (
                    <Tab as="div">
                        {({ selected }: { selected: boolean }) => (
                            <button
                                className={classNames(
                                    selected
                                        ? 'border-wri-green text-wri-green'
                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                                    'whitespace-nowrap border-b-2 px-6 font-acumin font-semibold transition'
                                )}
                            >
                                {tab.name}
                            </button>
                        )}
                    </Tab>
                ))}
            </Tab.List>
            <Tab.Panels>
                <Tab.Panel>
                    <SearchPanel />
                </Tab.Panel>
                <Tab.Panel>
                    <FiltersPanel />
                </Tab.Panel>
            </Tab.Panels>
        </Tab.Group>
    )
}
