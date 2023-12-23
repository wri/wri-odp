import { Tab } from '@headlessui/react'
import { VisualizationTabs } from './VisualizationTabs'
import MapView from './MapView'
import { Dispatch, SetStateAction, useState } from 'react'
import { useRouter } from 'next/router'
import { DataExplorer } from '@/components/data-explorer/DataExplorer'

export type TabularResource = {
    provider: string
    id: string
}

export default function Visualizations({
    tabularResource,
}: {
    tabularResource: TabularResource | null
}) {
    const router = useRouter()
    const [prevTabularResource, setPrevTabularResource] =
        useState(tabularResource)
    const [selectedIndex, setSelectedIndex] = useState(0)
    const tabs = [
        { name: 'Map View', enabled: true },
        { name: 'Tabular View', enabled: !!tabularResource },
    ]

    if (!tabularResource && prevTabularResource) {
        setPrevTabularResource(null)
        setSelectedIndex(selectedIndex === 2 ? 2 : 0)
    }
    if (tabularResource && !prevTabularResource) {
        setPrevTabularResource(tabularResource)
        setSelectedIndex(1)
    }

    return (
        <div className="h-full grow flex flex-col">
            <Tab.Group
                selectedIndex={selectedIndex}
                onChange={(index) => {
                    router.replace(
                        {
                            query: { ...router.query, index },
                        },
                        undefined,
                        { shallow: true }
                    )
                    setSelectedIndex(index)
                }}
            >
                <Tab.List as="nav" className="flex  w-full">
                    <VisualizationTabs tabs={tabs} />
                </Tab.List>
                <Tab.Panels className="grow flex flex-col">
                    <Tab.Panel>
                        <MapView />
                    </Tab.Panel>
                    <Tab.Panel className="h-full grow flex flex-col justify-center">
                        {tabularResource && (
                            <DataExplorer tabularResource={tabularResource} />
                        )}
                    </Tab.Panel>
                </Tab.Panels>
            </Tab.Group>
        </div>
    )
}
