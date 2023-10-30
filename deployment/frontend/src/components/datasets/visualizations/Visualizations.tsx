import { Tab } from '@headlessui/react'
import { VisualizationTabs } from './VisualizationTabs'
import MapView from './MapView'
import TabularView from './TabularView'

export default function Visualizations() {
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
                        <MapView />
                    </Tab.Panel>
                    <Tab.Panel>
                        <TabularView />
                    </Tab.Panel>
                    <Tab.Panel></Tab.Panel>
                </Tab.Panels>
            </Tab.Group>
        </div>
    )
}
