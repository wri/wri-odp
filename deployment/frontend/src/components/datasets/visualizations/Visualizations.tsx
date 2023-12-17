import { Tab } from '@headlessui/react'
import { VisualizationTabs } from './VisualizationTabs'
import MapView from './MapView'
import ChartView from './ChartView'
import { Dispatch, SetStateAction } from 'react'
import { useRouter } from 'next/router'
import { WriDataset } from '@/schema/ckan.schema'
import { DataExplorer } from '@/components/data-explorer/DataExplorer'

export type TabularResource = {
    provider: string
    id: string
}

export default function Visualizations({
    setIsAddLayers,
    dataset,
    tabularResource,
}: {
    setIsAddLayers: Dispatch<SetStateAction<boolean>>
    dataset: WriDataset
    tabularResource: TabularResource | null
}) {
    const router = useRouter()
    const tabs = [
        { name: 'Map View', enabled: true },
        { name: 'Tabular View', enabled: !!tabularResource },
        { name: 'Chart View', enabled: true },
    ].filter((tab) => tab.enabled)

    return (
        <div className="h-full grow flex flex-col">
            <Tab.Group
                onChange={(index) => {
                    router.replace(
                        {
                            query: { ...router.query, index },
                        },
                        undefined,
                        { shallow: true }
                    )
                }}
            >
                <Tab.List as="nav" className="flex  w-full">
                    <VisualizationTabs tabs={tabs} />
                </Tab.List>
                <Tab.Panels className="grow flex flex-col">
                    <Tab.Panel>
                        <MapView setIsAddLayers={setIsAddLayers} />
                    </Tab.Panel>
                    {tabularResource && (
                        <Tab.Panel className="h-full grow flex flex-col justify-center">
                            <DataExplorer
                                tabularResource={tabularResource}
                            />
                        </Tab.Panel>
                    )}
                    <Tab.Panel>
                        <ChartView />
                    </Tab.Panel>
                </Tab.Panels>
            </Tab.Group>
        </div>
    )
}
