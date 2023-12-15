import { Tab } from '@headlessui/react'
import { VisualizationTabs } from './VisualizationTabs'
import MapView from './MapView'
import ChartView from './ChartView'
import { Dispatch, SetStateAction } from 'react'
import { useRouter } from 'next/router'
import { WriDataset } from '@/schema/ckan.schema'
import { DataExplorer } from '@/components/data-explorer/DataExplorer'

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
        <div className='h-full grow flex flex-col'>
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
                    <Tab.Panel className="h-full grow flex flex-col justify-center">
                        <DataExplorer datasetId="4272db62-5a42-47d1-89b3-9501be874940" />
                    </Tab.Panel>
                    <Tab.Panel>
                        <ChartView />
                    </Tab.Panel>
                </Tab.Panels>
            </Tab.Group>
        </div>
    )
}
