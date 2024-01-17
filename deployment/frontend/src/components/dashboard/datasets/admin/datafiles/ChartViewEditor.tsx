import { Button } from '@/components/_shared/Button'
import { InputGroup } from '@/components/_shared/InputGroup'
import { Input } from '@/components/_shared/SimpleInput'
import SimpleSelect from '@/components/_shared/SimpleSelect'
import { useFields } from '@/components/data-explorer/queryHooks'
import { ChartViewConfig, Resource, View } from '@/interfaces/dataset.interface'
import { queryDatastore } from '@/utils/datastore'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSession } from 'next-auth/react'
import dynamic from 'next/dynamic'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Accordion } from './sections/BuildALayer/Accordion'

const ChartView = dynamic(
    () => import('@/components/datasets/visualizations/ChartView')
)

export default function ChartViewEditor({
    view,
    setView,
}: {
    view: View
    setView: Dispatch<SetStateAction<View>>
}) {
    const session = useSession()

    const {
        data: fields,
        isLoading: isFieldsLoading,
        error: fieldsError,
    } = useFields({ id: view.config.id, provider: view.config.provider })

    const formObj = useForm<ChartFormType>({
        resolver: zodResolver(chartSchema),
        defaultValues: {}, // TODO - based on view.config.props
    })

    const { register, handleSubmit, watch } = formObj

    const onSubmit = async (formData: ChartFormType) => {
        const chartProps: ChartViewConfig['props'] = { data: [], layout: {} }
        const chartType = formData.config.chart.type.value
        const data: Plotly.Data = { type: chartType }

        /*
         * Query configuration
         *
         */
        const dimensionName = formData.config.query.dimension.value
        const categoryName = formData.config.query.category?.value
        const valueName = formData.config.query.measure.value
        const columns: string[] = [dimensionName, valueName]
        if (categoryName) {
            columns.push(categoryName)
        }

        const sortBy = formData.config.query.sort_by

        const query = {
            pagination: { pageIndex: 0, pageSize: 32000 },
            columns,
            sorting: sortBy?.value ? [{ id: sortBy.value, desc: false }] : [],
            resourceId: view.config.id,
            filters: [],
            groupBy: [],
        }

        // TODO: add loading indicator for this query
        const tableData = await queryDatastore(query, session.data)

        /*
         * Chart configuration
         *
         */
        const dimensionAr = tableData.map((row) => row[dimensionName])
        const valueAr = tableData.map((row) => row[valueName])

        if (['bar', 'scatter'].includes(chartType)) {
            data.x = dimensionAr
            data.y = valueAr
        }

        chartProps.data = [data]

        setView((prev) => ({
            ...prev,
            title: formData.title,
            // description: formData.description,
            config: { ...prev.config, props: chartProps },
        }))
    }

    return (
        <div className="min-h-[600px]">
            <h2 className="text-lg mb-5">
                <span className="text-wri-dark-blue">+</span> Add a chart view
            </h2>
            <div className="flex space-x-10 stretch">
                <div className="min-w-[500px]">
                    {!isFieldsLoading && !fieldsError && (
                        <form
                            className="h-full"
                            onSubmit={handleSubmit(onSubmit, (e) => {
                                console.log(e)
                            })}
                        >
                            <div className="flex flex-col h-full space-y-4">
                                <div className="flex flex-col h-full space-y-4 overflow-y-scroll pr-2 h-[475px]">
                                    <InputGroup
                                        label="Title"
                                        className="sm:grid-cols-1 gap-x-2"
                                        labelClassName="xxl:text-sm col-span-full sm:max-w-none whitespace-nowrap sm:text-left"
                                    >
                                        <Input {...register('title')} />
                                    </InputGroup>
                                    <Accordion text="Data">
                                        <div className="grow flex flex-col space-y-4">
                                            <InputGroup
                                                label="Type"
                                                className="sm:grid-cols-1 gap-x-2"
                                                labelClassName="xxl:text-sm col-span-full sm:max-w-none whitespace-nowrap sm:text-left"
                                            >
                                                <SimpleSelect
                                                    id="type"
                                                    formObj={formObj}
                                                    name="config.chart.type"
                                                    placeholder="Select chart type"
                                                    options={chartTypeOptions}
                                                />
                                            </InputGroup>
                                            <InputGroup
                                                label="Dimension column"
                                                className="sm:grid-cols-1 gap-x-2"
                                                labelClassName="xxl:text-sm col-span-full sm:max-w-none whitespace-nowrap sm:text-left"
                                            >
                                                <SimpleSelect
                                                    id="dimension"
                                                    formObj={formObj}
                                                    name="config.query.dimension"
                                                    placeholder="E.g. Year"
                                                    options={
                                                        fields?.columns.map(
                                                            (field) => ({
                                                                label: field.name,
                                                                value: field.key,
                                                            })
                                                        ) || []
                                                    }
                                                />
                                            </InputGroup>
                                            <InputGroup
                                                label="Category column"
                                                className="sm:grid-cols-1 gap-x-2"
                                                labelClassName="xxl:text-sm col-span-full sm:max-w-none whitespace-nowrap sm:text-left"
                                            >
                                                <SimpleSelect
                                                    id="category"
                                                    formObj={formObj}
                                                    name="config.query.category"
                                                    placeholder="E.g. Country"
                                                    options={
                                                        fields?.columns
                                                            .filter(
                                                                (f) =>
                                                                    watch(
                                                                        'config.query.dimension'
                                                                    )?.value !=
                                                                    f.key
                                                            )
                                                            .map((field) => ({
                                                                label: field.name,
                                                                value: field.key,
                                                            })) || []
                                                    }
                                                />
                                            </InputGroup>
                                            <InputGroup
                                                label="Value column"
                                                className="sm:grid-cols-1 gap-x-2"
                                                labelClassName="xxl:text-sm col-span-full sm:max-w-none whitespace-nowrap sm:text-left"
                                            >
                                                <SimpleSelect
                                                    id="category"
                                                    formObj={formObj}
                                                    name="config.query.measure"
                                                    placeholder="E.g. GDP"
                                                    options={
                                                        fields?.columns
                                                            .filter(
                                                                (f) =>
                                                                    watch(
                                                                        'config.query.dimension'
                                                                    )?.value !=
                                                                    f.key
                                                            )
                                                            .map((field) => ({
                                                                label: field.name,
                                                                value: field.key,
                                                            })) || []
                                                    }
                                                />
                                            </InputGroup>
                                            <InputGroup
                                                label="Sort by"
                                                className="sm:grid-cols-1 gap-x-2"
                                                labelClassName="xxl:text-sm col-span-full sm:max-w-none whitespace-nowrap sm:text-left"
                                            >
                                                <SimpleSelect
                                                    id="category"
                                                    formObj={formObj}
                                                    name="config.query.sort_by"
                                                    placeholder="Sort by"
                                                    options={[
                                                        {
                                                            label: 'None',
                                                            value: undefined,
                                                        },
                                                        ...(fields?.columns.map(
                                                            (field) => ({
                                                                label: field.name,
                                                                value: field.key,
                                                            })
                                                        ) || []),
                                                    ]}
                                                />
                                            </InputGroup>
                                        </div>
                                    </Accordion>
                                </div>
                                <div className="flex justify-end">
                                    <Button
                                        type="submit"
                                        className="bg-wri-light-yellow"
                                    >
                                        Update Preview
                                    </Button>
                                </div>
                            </div>
                        </form>
                    )}
                </div>
                <div className="w-full h-full shadow-md p-10">
                    <ChartView config={view.config} />
                </div>
            </div>
        </div>
    )
}

const chartTypeOptions = [
    { value: 'bar', label: 'Bar' },
    { value: 'scatter', label: 'Line' },
]

const chartSchema = z.object({
    title: z.string(),
    // description: z.string(),
    config: z.object({
        chart: z.object({
            type: z.object({
                value: z.enum(['bar', 'scatter']),
                label: z.string(),
            }),
        }),
        query: z.object({
            dimension: z.object({ value: z.string(), label: z.string() }),
            category: z
                .object({ value: z.string(), label: z.string() })
                .optional(),
            measure: z.object({ value: z.string(), label: z.string() }),
            sort_by: z
                .object({ value: z.string().optional(), label: z.string() })
                .optional(),
        }),
    }),
})

type ChartFormType = z.infer<typeof chartSchema>
