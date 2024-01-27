import { Tab } from '@headlessui/react'
import { VisualizationTabs } from './VisualizationTabs'
import MapView from './MapView'
import { useEffect, useState } from 'react'
import { useActiveCharts, useVizIndex } from '@/utils/storeHooks'
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
    const [prevTabularResource, setPrevTabularResource] =
        useState(tabularResource)
    const { vizIndex, setVizIndex } = useVizIndex()
    const { activeCharts } = useActiveCharts()
    const [prevActiveCharts, setPrevActiveCharts] = useState([])

    const tabs = [
        { name: 'Map View', enabled: true },
        { name: 'Tabular View', enabled: !!tabularResource },
        { name: 'Chart View', enabled: activeCharts?.length }, // TODO: verify this
    ]

    useEffect(() => {
        if (activeCharts?.length && !prevActiveCharts.length) {
            // Charts view was enabled, focus it
            const index = tabs.findIndex((t) => t.name == 'Chart View')
            setVizIndex(index)
        } else if (!activeCharts?.length && prevActiveCharts.length && vizIndex == 2) {
            setVizIndex(0)
        }

        setPrevActiveCharts(activeCharts)
    }, [activeCharts])

    useEffect(() => {
        if (tabularResource && !prevTabularResource) {
            const index = tabs.findIndex((t) => t.name == 'Tabular View')
            setVizIndex(index)
        } else if (!tabularResource && vizIndex == 1) {
            setVizIndex(0)
        }

        setPrevActiveCharts(activeCharts)
    }, [tabularResource])

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
