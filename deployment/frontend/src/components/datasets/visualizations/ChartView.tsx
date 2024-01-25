import SimpleSelect from '@/components/_shared/SimpleSelect'
import { Resource, View } from '@/interfaces/dataset.interface'
import { useActiveDatafileCharts } from '@/utils/storeHooks'
import { useEffect, useState } from 'react'
import ChartViewExport from './ChartViewExport'
import { useForm } from 'react-hook-form'
import { InputGroup } from '@/components/_shared/InputGroup'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import dynamic from 'next/dynamic'
const Chart = dynamic(import('@/components/datasets/visualizations/Chart'), {
    ssr: false,
})

export default function ChartView() {
    const [activeChart, setActiveChart] = useState<View | undefined>()
    const { activeDatafileCharts } = useActiveDatafileCharts()

    const viewOptionsSchema = z.object({
        x_tick_angle: z.object({
            value: z.number().or(z.literal('auto')),
            label: z.string(),
        }),
    })

    type ViewOptionSchema = z.infer<typeof viewOptionsSchema>

    const formObj = useForm<ViewOptionSchema>({
        resolver: zodResolver(viewOptionsSchema),
        defaultValues: {},
    })

    const { watch, register, handleSubmit, reset } = formObj

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
        reset({
            x_tick_angle:
                selected.config_obj.form_state.chart.labels.x.angle.value,
        })
    }

    return (
        <div className="px-5 py-5 xl:px-10 xl:py-5">
            <div className="flex justify-between flex-row space-x-2 mb-10">
                <SimpleSelect
                    options={chartOptions}
                    name="selected-chart"
                    placeholder="Select a chart"
                    maxWidth="max-w-[300px]"
                    onChange={onChange}
                />
                <ChartViewExport />
            </div>
            {activeChart?.config_obj && (
                <Chart config={activeChart.config_obj?.config} />
            )}
            <form onSubmit={handleSubmit((data) => { })}>
                <InputGroup
                    label="X axis tick angle"
                    className="sm:grid-cols-1 gap-x-2"
                    labelClassName="xxl:text-sm col-span-full sm:max-w-none whitespace-nowrap sm:text-left"
                >
                    <SimpleSelect
                        id="x-axis-label-orientation"
                        formObj={formObj}
                        name="x_tick_angle"
                        placeholder="E.g. 45º"
                        options={labelAngleOptions}
                    />
                </InputGroup>
            </form>
        </div>
    )
}

const labelAngleOptions = [
    { value: 'auto', label: 'Auto', default: true },
    { value: 0, label: '0º' },
    { value: 45, label: '45º' },
    { value: 90, label: '90º' },
    { value: 135, label: '180º' },
]
