import { Tab } from '@headlessui/react'
import { VisualizationTabs } from './VisualizationTabs'
import MapView from './MapView'
import TabularView from './TabularView'
import ChartView from './ChartView'
import { Dispatch, SetStateAction } from 'react'

export default function Visualizations({
    setIsAddLayers: setisAddLayers,
}: {
    setIsAddLayers: Dispatch<SetStateAction<boolean>>
}) {
    const tabs = [
        { name: 'Map View' },
        { name: 'Tabular View' },
        { name: 'Chart View' },
    ]

    return (
        <div>
            <Tab.Group>
                <Tab.List as="nav" className="flex  w-full">
                    <VisualizationTabs tabs={tabs} />
                </Tab.List>
                <Tab.Panels>
                    <Tab.Panel>
                        <MapView setIsAddLayers={setisAddLayers} />
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
