import { Tab } from '@headlessui/react'
import { VisualizationTabs } from './VisualizationTabs'
import MapView from './MapView'
import { Dispatch, SetStateAction, useState } from 'react'
import { useRouter } from 'next/router'
import { useVizIndex } from '@/utils/storeHooks'
import { DataExplorer } from '@/components/data-explorer/DataExplorer'
import ChartView from './ChartView'

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
    const { vizIndex, setVizIndex } = useVizIndex()
    const tabs = [
        { name: 'Map View', enabled: true },
        { name: 'Tabular View', enabled: !!tabularResource },
        { name: 'Chart View', enabled: true }, // TODO: verify this
    ]

    if (!tabularResource && prevTabularResource) {
        setPrevTabularResource(null)
        setVizIndex(vizIndex === 2 ? 2 : 0)
    }
    if (tabularResource && !prevTabularResource) {
        setPrevTabularResource(tabularResource)
        setVizIndex(1)
    }

    return (
        <div className="h-full grow flex flex-col">
            <Tab.Group selectedIndex={vizIndex} onChange={setVizIndex}>
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
                    <Tab.Panel>
                        <ChartView />
                    </Tab.Panel>
                </Tab.Panels>
            </Tab.Group>
        </div>
    )
}
