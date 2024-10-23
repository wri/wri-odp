import classNames from '@/utils/classnames'
import { Tab } from '@headlessui/react'
import { Fragment } from 'react'

export function VisualizationTabs({
    tabs,
}: {
    tabs: { name: string; enabled: boolean }[]
}) {
    const singleTab = tabs.filter((tab) => tab.enabled).length === 1
    return (
        <>
            {tabs.map((tab, i) => (
                <Tab as={Fragment} key={`visualization-tab-${tab.name}`}>
                    {({ selected }: { selected: boolean }) => (
                        <button
                            className={classNames(
                                'whitespace-nowrap border-b-[3px] not-last:border-r py-5 px-2 font-acumin font-semibold transition w-full text-lg leading-5',
                                selected
                                    ? 'border-b-wri-dark-blue text-wri-dark-blue'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 border-zinc-300',
                                tab.enabled ? '' : 'hidden',
                                singleTab ? 'cursor-default' : 'cursor-text'
                            )}
                        >
                            {tab.name}
                        </button>
                    )}
                </Tab>
            ))}
        </>
    )
}
