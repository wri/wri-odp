import SimpleSelect from '@/components/_shared/SimpleSelect'
import { Resource, View } from '@/interfaces/dataset.interface'
import { useActiveDatafileCharts } from '@/utils/storeHooks'
import { useEffect, useState } from 'react'
import Chart from './Chart'

export default function ChartView() {
    const [activeChart, setActiveChart] = useState<View | undefined>()
    const { activeDatafileCharts } = useActiveDatafileCharts()

    // TODO: we should group options by datafile
    const chartOptions = activeDatafileCharts
        ?.map((df: Resource) => df._views)
        .flat()
        .filter((v: View) => v?.config_obj?.type == 'chart')
        .map((v: View) => ({ label: v.title, value: v }))

    if (chartOptions?.length) {
        chartOptions[0].default = true
    }

    useEffect(() => {
        const defaultChart = chartOptions.find((co: any) => co.default)

        if (defaultChart) {
            setActiveChart(defaultChart.value)
        }
    }, [])

    const onChange = (selected: View) => {
        setActiveChart(selected)
    }

    return (
        <div className="px-10 py-5">
            <SimpleSelect
                options={chartOptions}
                name="selected-chart"
                placeholder="Select a chart"
                maxWidth="max-w-[300px]"
                onChange={onChange}
            />
            {activeChart?.config_obj && (
                <Chart config={activeChart.config_obj?.config} />
            )}
        </div>
    )
}
