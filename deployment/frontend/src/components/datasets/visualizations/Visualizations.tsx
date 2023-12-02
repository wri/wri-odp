import { Tab } from '@headlessui/react'
import { VisualizationTabs } from './VisualizationTabs'
import MapView from './MapView'
import TabularView from './TabularView'
import ChartView from './ChartView'
import { Dispatch, SetStateAction } from 'react'
import { useRouter } from 'next/router'
import { WriDataset } from '@/schema/ckan.schema'

export default function Visualizations({
    setIsAddLayers,
    dataset,
}: {
    setIsAddLayers: Dispatch<SetStateAction<boolean>>
    dataset: WriDataset
}) {
    const router = useRouter()
    const tabs = [
        { name: 'Map View' },
        { name: 'Tabular View' },
        { name: 'Chart View' },
    ]

    return (
        <div>
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
                <Tab.Panels>
                    <Tab.Panel>
                        <MapView setIsAddLayers={setIsAddLayers} />
                    </Tab.Panel>
                    <Tab.Panel>
                        <TabularView />
                    </Tab.Panel>
                    <Tab.Panel>
                        <ChartView />
                    </Tab.Panel>
                </Tab.Panels>
            </Tab.Group>
        </div>
    )
}
