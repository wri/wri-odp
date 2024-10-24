import { InputGroup, ErrorDisplay } from '@/components/_shared/InputGroup'
import { Input } from '@/components/_shared/SimpleInput'
import SimpleSelect from '@/components/_shared/SimpleSelect'
import { useFields } from '@/components/data-explorer/queryHooks'
import {
    ViewState,
    type ChartViewConfig,
    type View,
} from '@/interfaces/dataset.interface'
import { queryDatastore } from '@/utils/datastore'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSession } from 'next-auth/react'
import { type Dispatch, type SetStateAction, useState } from 'react'
import { useForm } from 'react-hook-form'
import { ErrorAlert } from '@/components/_shared/Alerts'

import { ChartFormType, chartSchema } from '@/schema/view.schema'
import DeleteViewDialog from './DeleteViewDialog'
import {
    InformationCircleIcon,
    PencilSquareIcon,
} from '@heroicons/react/24/outline'

import dynamic from 'next/dynamic'
import { getGradientColor } from '@/utils/colors'
import ChartFilters from './ChartFilters'
import DataDialog from './DataDialog'
import { Accordion } from '../dashboard/datasets/admin/datafiles/sections/BuildALayer/Accordion'
import { queryRw } from '@/utils/rw'
import { DefaultTooltip } from '../_shared/Tooltip'
import { WriDataset } from '@/schema/ckan.schema'
import { Button, LoaderButton } from '../_shared/Button'
import { Transform } from 'plotly.js'
const Chart = dynamic(
    () => import('@/components/datasets/visualizations/Chart'),
    {
        ssr: false,
    }
)

const withEmptyOption = (ar?: any[]) => {
    if (ar) {
        return [
            {
                label: 'None',
                value: undefined,
            },
            ...ar,
        ]
    }
    return []
}

export default function ChartViewEditor({
    view,
    setView,
    onCancelOrDelete,
    onSave,
    mode,
    dataset,
}: {
    view: View
    setView: Dispatch<SetStateAction<View>>
    onCancelOrDelete: (mode: string) => void
    onSave: (
        mode: string,
        view: View,
        onError: () => void,
        onSuccess: () => void
    ) => void
    mode: ViewState['_state']
    dataset: WriDataset
}) {
    const session = useSession()

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isDataDialogOpen, setIsDataDialogOpen] = useState(false)

    const [isPreviewLoading, setIsPreviewLoading] = useState(false)
    const [isSaveLoading, setIsSaveLoading] = useState(false)

    const [sql] = useState('')

    const [error, setError] = useState<
        { title: string; text: string } | undefined
    >(undefined)

    const {
        data: fields,
        isLoading: isFieldsLoading,
        error: fieldsError,
    } = useFields({
        id: view.config_obj.config.id,
        provider: view.config_obj.config.provider,
    })

    const formState = view.config_obj.form_state
    const config = formState?.config
    const chart = config?.chart
    const colors = chart?.colors
    const tooltips = chart?.tooltips
    const tooltipsEnabled = tooltips?.enabled

    const formObj = useForm<ChartFormType>({
        resolver: zodResolver(chartSchema),
        defaultValues: {
            ...formState,
            config: {
                ...config,
                chart: {
                    ...chart,
                    colors: {
                        ...colors,
                        starting: colors?.starting ?? '#1dab58',
                        ending: colors?.ending ?? '#1dab58',
                    },
                    tooltips: {
                        ...tooltips,
                        enabled: tooltipsEnabled ?? {
                            value: true,
                            label: 'Yes',
                        },
                    },
                },
            },
        },
    })

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isDirty },
        reset,
        setValue,
    } = formObj

    const onSubmit = async (formData: ChartFormType) => {
        //  Reset error message
        setError(undefined)
        setIsPreviewLoading(true)

        try {
            const chartProps: ChartViewConfig['props'] = {
                data: [],
                layout: {},
            }
            const chartType = formData.config.chart.type.value

            /*
             * Query configuration
             *
             */
            const dimensionColName = formData.config.query.dimension.value
            let categoryColName = formData.config.query.category?.value || ''
            if (chartType == 'pie') {
                categoryColName = ''
            }
            const isGrouped = !!categoryColName
            const measureColName = formData.config.query.measure.value
            const columns: string[] = [dimensionColName, measureColName]
            if (categoryColName) {
                columns.push(categoryColName)
            }
            let aggregate = formData.config.query.aggregate?.value
            const filters = formData.config.query.filters

            const query = {
                pagination: { pageIndex: 0, pageSize: 32000 },
                columns,
                sorting: [],
                resourceId: view.config_obj.config.id,
                filters:
                    filters?.map((f) => ({
                        column: f.column,
                        operation: f.operation.value,
                        value: f.value,
                        link: f.link,
                    })) ?? [],
                groupBy: aggregate
                    ? columns.filter((c) => c != measureColName)
                    : [],
                aggregate: aggregate
                    ? { fn: aggregate, column: measureColName }
                    : undefined,
            }

            // TODO: add loading indicator for this query
            let tableData
            let sql

            if (view.config_obj.config.provider == 'datastore') {
                const { data, sql: querySql } = await queryDatastore(
                    query,
                    session.data
                )

                tableData = data
                sql = querySql
            } else if (view.config_obj.config.provider == 'rw') {
                const data = await queryRw({
                    ...query,
                    datasetId: view.config_obj.config.id,
                    tableName: fields?.tableName ?? '',
                    provider: '',
                })

                tableData = data
            }

            /*
             * Chart configuration
             *
             */
            const data: Plotly.Data[] = []
            const layout: Partial<Plotly.Layout> = {
                title: { text: formData.title },
                xaxis: {
                    title: { text: formData.config.chart.labels?.x?.text },
                    tickangle:
                        formData.config.chart.labels?.x?.angle?.value ?? 'auto',
                },
                yaxis: {
                    title: { text: formData.config.chart.labels?.y?.text },
                    tickangle:
                        formData.config.chart.labels?.y?.angle?.value ?? 'auto',
                },
                showlegend: true,
                legend: {
                    title: { text: formData.config.chart.legends.title },
                },
            }

            // Sorting
            const sortByCol = formData.config.chart?.sorting?.by?.value
            const sortOrder = formData.config.chart?.sorting?.order?.value

            if (sortByCol && sortOrder) {
                tableData.sort((rowA: any, rowB: any) => {
                    const sortByColName =
                        sortByCol == 'data' ? measureColName : dimensionColName

                    const sample = rowA[sortByColName][0]

                    const isNumeric = !isNaN(parseFloat(sample))

                    rowA = rowA[sortByColName]
                    rowB = rowB[sortByColName]

                    if (isNumeric) {
                        if (sortOrder == 'DESC') {
                            return parseFloat(rowB) - parseFloat(rowA)
                        } else {
                            return parseFloat(rowA) - parseFloat(rowB)
                        }
                    } else {
                        if (sortOrder == 'DESC') {
                            return rowB.localeCompare(rowA)
                        } else {
                            return rowA.localeCompare(rowB)
                        }
                    }
                })
            }

            // Tooltips
            const tooltipsEnabled =
                formData.config.chart.tooltips?.enabled?.value

            const tooltipsFormat = formData.config.chart.tooltips?.format?.value

            //  Ungrouped bar chart = each bar should be a trace
            //  and colors are applied with layout.colorway
            if (chartType == 'bar' && !isGrouped) {
                categoryColName = dimensionColName
                const uniqueCategories = [
                    ...new Set(
                        tableData.map((row: any) => row[dimensionColName])
                    ),
                ]
                const uniqueCategoriesQty = uniqueCategories.length
                const startingColor = formData.config.chart.colors.starting
                const endingColor = formData.config.chart.colors.ending

                // @ts-ignore
                const colors = uniqueCategories.map((value: any, i: number) => {
                    return getGradientColor(
                        startingColor,
                        endingColor,
                        i / uniqueCategoriesQty
                    )
                })

                layout.colorway = colors
            } else if (['bar', 'scatter'].includes(chartType) && isGrouped) {
                const uniqueCategories = [
                    ...new Set(
                        tableData.map((row: any) => row[categoryColName])
                    ),
                ]
                const uniqueCategoriesQty = uniqueCategories.length
                const startingColor = formData.config.chart.colors.starting
                const endingColor = formData.config.chart.colors.ending

                // @ts-ignore
                const colors = uniqueCategories.map((value: any, i: number) => {
                    return getGradientColor(
                        startingColor,
                        endingColor,
                        i / uniqueCategoriesQty
                    )
                })

                layout.colorway = colors
            }

            let categories = []
            if (categoryColName) {
                const categoryNames = tableData.map(
                    (row: any) => row[categoryColName]
                )
                const uniqueCategoryNames = [...new Set(categoryNames)]

                for (let categoryName of uniqueCategoryNames) {
                    let categoryData = tableData.filter(
                        (row: any) => row[categoryColName] == categoryName
                    )

                    const dimensionAr = categoryData.map(
                        (row: any) => row[dimensionColName]
                    )
                    const measureAr = categoryData.map(
                        (row: any) => row[measureColName]
                    )

                    categories.push({
                        name: categoryName,
                        x: dimensionAr,
                        y: measureAr,
                    })
                }
            } else {
                const category: any = { name: undefined }
                const dimensionAr = tableData.map(
                    (row: any) => row[dimensionColName]
                )
                category.x = dimensionAr

                const measureAr = tableData.map(
                    (row: any) => row[measureColName]
                )
                category.y = measureAr

                categories.push(category)
            }

            for (let category of categories) {
                const trace: Plotly.Data = { type: chartType, transforms: [] }
                trace.name = category.name || measureColName

                if (['bar', 'scatter'].includes(chartType)) {
                    trace.x = category.x
                    trace.y = category.y
                } else if (['pie'].includes(chartType)) {
                    trace.labels = category.x
                    trace.values = category.y
                }

                if (['pie'].includes(chartType)) {
                    const dataPointsQty = category.x.length
                    const startingColor = formData.config.chart.colors.starting
                    const endingColor = formData.config.chart.colors.ending

                    // @ts-ignore
                    const colors = category.x.map((value: any, i: number) => {
                        return getGradientColor(
                            startingColor,
                            endingColor,
                            i / dataPointsQty
                        )
                    })

                    trace.marker = {
                        color: colors,
                        colors: colors,
                    }
                } else if (
                    ['scatter'].includes(chartType) &&
                    !categoryColName
                ) {
                    trace.marker = {
                        color: formData.config.chart.colors.starting,
                    }
                }

                if (!tooltipsEnabled) {
                    trace.hoverinfo = 'none'
                } else if (tooltipsFormat) {
                    trace.yhoverformat = tooltipsFormat
                }

                data.push(trace)
            }

            chartProps.data = data
            chartProps.layout = layout

            setView((prev) => ({
                ...prev,
                title: formData.title,
                // description: formData.description,
                config_obj: {
                    ...prev.config_obj,
                    form_state: formData,
                    config: { ...prev.config_obj.config, props: chartProps },
                },
            }))

            /*
             * Only allow saving when chart preview was
             * successfully updated. Reset makes the form
             * no longer dirty + resets the initial values
             *
             */
            reset(formData)
        } catch (e) {
            // @ts-ignore
            setError({ title: 'Error', text: e?.message as string })
        }

        setIsPreviewLoading(false)
    }

    return (
        <div className="min-h-[600px] mt-10">
            <h2 className="text-lg mb-5">
                {mode == 'new' && (
                    <>
                        <span className="text-wri-dark-blue">+</span> Add a
                        chart view
                    </>
                )}
                {mode == 'edit' && (
                    <>
                        <PencilSquareIcon className="w-4 inline" /> Edit the
                        chart view
                    </>
                )}
            </h2>
            <form
                onSubmit={handleSubmit(onSubmit, (e) => {
                    console.log(e)
                })}
                className="mt-5 flex sm:space-x-10 stretch flex-col xl:flex-row"
            >
                <div className="sm:min-w-[450px]">
                    {!isFieldsLoading && !fieldsError && (
                        <div className="h-full">
                            <div className="flex flex-col h-full space-y-4">
                                <div className="flex flex-col h-full space-y-4 xl:overflow-y-scroll pr-2 xl:h-[475px] xl:max-h-[475px]">
                                    <InputGroup
                                        label="Title"
                                        className="sm:grid-cols-1 gap-x-2"
                                        labelClassName="xxl:text-sm col-span-full sm:max-w-none whitespace-nowrap sm:text-left"
                                        required={true}
                                    >
                                        <Input {...register('title')} />
                                        <ErrorDisplay
                                            name="title"
                                            errors={errors}
                                        />
                                    </InputGroup>
                                    <InputGroup
                                        label="Type"
                                        className="sm:grid-cols-1 gap-x-2"
                                        labelClassName="w-full xxl:text-sm col-span-full sm:max-w-none whitespace-nowrap sm:text-left"
                                        required={true}
                                    >
                                        <SimpleSelect
                                            id="type"
                                            formObj={formObj}
                                            name="config.chart.type"
                                            placeholder="Select chart type"
                                            options={chartTypeOptions}
                                        />
                                        <ErrorDisplay
                                            name="config.chart.type.value"
                                            errors={errors}
                                        />
                                    </InputGroup>
                                    <Accordion text="Data">
                                        <div className="grow flex flex-col space-y-4">
                                            <InputGroup
                                                label="X-axis"
                                                className="sm:grid-cols-1 gap-x-2"
                                                labelClassName="xxl:text-sm col-span-full sm:max-w-none whitespace-nowrap sm:text-left"
                                                required={true}
                                                info="X-axis colum name"
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
                                                        ) ?? []
                                                    }
                                                    onChange={(selected) => {
                                                        const measure = watch(
                                                            'config.query.measure'
                                                        )?.value

                                                        const category = watch(
                                                            'config.query.category'
                                                        )?.value

                                                        if (
                                                            measure &&
                                                            measure == selected
                                                        ) {
                                                            setValue(
                                                                'config.query.measure',
                                                                {
                                                                    label: '',
                                                                    value: '',
                                                                }
                                                            )
                                                        }

                                                        if (
                                                            category &&
                                                            category == selected
                                                        ) {
                                                            setValue(
                                                                'config.query.category',
                                                                {
                                                                    label: '',
                                                                    value: '',
                                                                }
                                                            )
                                                        }
                                                    }}
                                                />
                                                <ErrorDisplay
                                                    name="config.query.dimension.value"
                                                    errors={errors}
                                                />
                                            </InputGroup>

                                            <InputGroup
                                                label="Y-axis"
                                                className="sm:grid-cols-1 gap-x-2"
                                                labelClassName="xxl:text-sm col-span-full sm:max-w-none whitespace-nowrap sm:text-left"
                                                required={true}
                                                info="Y-axis column name"
                                            >
                                                <SimpleSelect
                                                    id="measure"
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
                                                            })) ?? []
                                                    }
                                                    onChange={(selected) => {
                                                        const category = watch(
                                                            'config.query.category'
                                                        )?.value

                                                        if (
                                                            category &&
                                                            category == selected
                                                        ) {
                                                            setValue(
                                                                'config.query.category',
                                                                {
                                                                    label: '',
                                                                    value: '',
                                                                }
                                                            )
                                                        }
                                                    }}
                                                />
                                                <ErrorDisplay
                                                    name="config.query.measure.value"
                                                    errors={errors}
                                                />
                                            </InputGroup>
                                            {watch('config.chart.type')
                                                ?.value != 'pie' && (
                                                    <InputGroup
                                                        label="Category column"
                                                        className="sm:grid-cols-1 gap-x-2"
                                                        labelClassName="xxl:text-sm col-span-full sm:max-w-none whitespace-nowrap sm:text-left"
                                                        info="Used for data point grouping"
                                                    >
                                                        <SimpleSelect
                                                            id="category"
                                                            formObj={formObj}
                                                            name="config.query.category"
                                                            placeholder="E.g. Country"
                                                            options={
                                                                withEmptyOption(
                                                                    fields?.columns
                                                                        .filter(
                                                                            (f) =>
                                                                                watch(
                                                                                    'config.query.dimension'
                                                                                )
                                                                                    ?.value !=
                                                                                f.key &&
                                                                                watch(
                                                                                    'config.query.measure'
                                                                                )
                                                                                    ?.value !=
                                                                                f.key
                                                                        )
                                                                        .map(
                                                                            (
                                                                                field
                                                                            ) => ({
                                                                                label: field.name,
                                                                                value: field.key,
                                                                            })
                                                                        )
                                                                ) ?? []
                                                            }
                                                        />
                                                    </InputGroup>
                                                )}
                                            <InputGroup
                                                label="Aggregation function"
                                                className="sm:grid-cols-1 gap-x-2"
                                                labelClassName="xxl:text-sm col-span-full sm:max-w-none whitespace-nowrap sm:text-left"
                                                info="Aggegate the y-axis values by this function"
                                            >
                                                <SimpleSelect
                                                    id="aggregate"
                                                    formObj={formObj}
                                                    name="config.query.aggregate"
                                                    placeholder="E.g. SUM"
                                                    options={aggregateOptions}
                                                />
                                            </InputGroup>
                                        </div>
                                        <ChartFilters
                                            formObj={formObj}
                                            columnsOptions={
                                                fields?.columns.map(
                                                    (field) => ({
                                                        label: field.name,
                                                        value: field.key,
                                                    })
                                                ) ?? []
                                            }
                                        />
                                    </Accordion>
                                    {!['pie'].includes(
                                        watch('config.chart.type')?.value
                                    ) && (
                                            <Accordion text="Sorting">
                                                <div className="grow flex flex-col space-y-4">
                                                    <InputGroup
                                                        label="Sort by"
                                                        className="sm:grid-cols-1 gap-x-2"
                                                        labelClassName="xxl:text-sm col-span-full sm:max-w-none whitespace-nowrap sm:text-left"
                                                    >
                                                        <SimpleSelect
                                                            id="sort-by"
                                                            formObj={formObj}
                                                            name="config.chart.sorting.by"
                                                            placeholder="Data or Labels"
                                                            options={
                                                                watch(
                                                                    'config.chart.type'
                                                                )?.value ==
                                                                    'scatter' &&
                                                                    watch(
                                                                        'config.query.category'
                                                                    )?.value
                                                                    ? sortByOptions.filter(
                                                                        (o) =>
                                                                            o.value !=
                                                                            'data'
                                                                    )
                                                                    : sortByOptions
                                                            }
                                                        />
                                                        <ErrorDisplay
                                                            name="config.chart.sorting.by"
                                                            errors={errors}
                                                        />
                                                    </InputGroup>

                                                    <InputGroup
                                                        label="Sort oder"
                                                        className="sm:grid-cols-1 gap-x-2"
                                                        labelClassName="xxl:text-sm col-span-full sm:max-w-none whitespace-nowrap sm:text-left"
                                                    >
                                                        <SimpleSelect
                                                            id="sort-order"
                                                            formObj={formObj}
                                                            name="config.chart.sorting.order"
                                                            placeholder="Ascending or Descending"
                                                            options={
                                                                sortOrderOptions
                                                            }
                                                        />
                                                        <ErrorDisplay
                                                            name="config.chart.sorting.order"
                                                            errors={errors}
                                                        />
                                                    </InputGroup>
                                                </div>
                                            </Accordion>
                                        )}
                                    {!['pie'].includes(
                                        watch('config.chart.type')?.value
                                    ) && (
                                            <Accordion text="Labels">
                                                <div className="grow flex flex-col space-y-4">
                                                    <InputGroup
                                                        label="X axis label"
                                                        className="sm:grid-cols-1 gap-x-2"
                                                        labelClassName="xxl:text-sm col-span-full sm:max-w-none whitespace-nowrap sm:text-left"
                                                    >
                                                        <Input
                                                            {...register(
                                                                'config.chart.labels.x.text'
                                                            )}
                                                        />
                                                        <ErrorDisplay
                                                            name="config.chart.labels.x.text"
                                                            errors={errors}
                                                        />
                                                    </InputGroup>
                                                    <InputGroup
                                                        label="X axis tick angle"
                                                        className="sm:grid-cols-1 gap-x-2"
                                                        labelClassName="xxl:text-sm col-span-full sm:max-w-none whitespace-nowrap sm:text-left"
                                                    >
                                                        <SimpleSelect
                                                            id="x-axis-label-orientation"
                                                            formObj={formObj}
                                                            name="config.chart.labels.x.angle"
                                                            placeholder="E.g. 45º"
                                                            options={
                                                                labelAngleOptions
                                                            }
                                                        />
                                                    </InputGroup>
                                                    <InputGroup
                                                        label="Y axis label"
                                                        className="sm:grid-cols-1 gap-x-2"
                                                        labelClassName="xxl:text-sm col-span-full sm:max-w-none whitespace-nowrap sm:text-left"
                                                    >
                                                        <Input
                                                            {...register(
                                                                'config.chart.labels.y.text'
                                                            )}
                                                        />
                                                        <ErrorDisplay
                                                            name="config.chart.labels.y.text"
                                                            errors={errors}
                                                        />
                                                    </InputGroup>
                                                    <InputGroup
                                                        label="Y axis tick angle"
                                                        className="sm:grid-cols-1 gap-x-2"
                                                        labelClassName="xxl:text-sm col-span-full sm:max-w-none whitespace-nowrap sm:text-left"
                                                    >
                                                        <SimpleSelect
                                                            id="y-axis-tick-angle"
                                                            formObj={formObj}
                                                            name="config.chart.labels.y.angle"
                                                            placeholder="E.g. 45º"
                                                            options={
                                                                labelAngleOptions
                                                            }
                                                        />
                                                    </InputGroup>
                                                </div>
                                            </Accordion>
                                        )}
                                    <Accordion text="Legends">
                                        <div className="grow flex flex-col space-y-4">
                                            <InputGroup
                                                label="Title"
                                                className="sm:grid-cols-1 gap-x-2"
                                                labelClassName="xxl:text-sm col-span-full sm:max-w-none whitespace-nowrap sm:text-left"
                                            >
                                                <Input
                                                    {...register(
                                                        'config.chart.legends.title'
                                                    )}
                                                />
                                                <ErrorDisplay
                                                    name="config.chart.legends.title"
                                                    errors={errors}
                                                />
                                            </InputGroup>
                                        </div>
                                    </Accordion>

                                    {!['pie'].includes(
                                        watch('config.chart.type')?.value
                                    ) && (
                                            <Accordion text="Tooltips">
                                                <div className="grow flex flex-col space-y-4">
                                                    <InputGroup
                                                        label="Enabled"
                                                        className="sm:grid-cols-1 gap-x-2"
                                                        labelClassName="xxl:text-sm col-span-full sm:max-w-none whitespace-nowrap sm:text-left"
                                                    >
                                                        <SimpleSelect
                                                            id="legends-enabled"
                                                            formObj={formObj}
                                                            name="config.chart.tooltips.enabled"
                                                            placeholder=""
                                                            options={
                                                                tooltipsEnabledOptions
                                                            }
                                                        />
                                                    </InputGroup>
                                                    <InputGroup
                                                        label="Format"
                                                        className="sm:grid-cols-1 gap-x-2"
                                                        labelClassName="xxl:text-sm col-span-full sm:max-w-none whitespace-nowrap sm:text-left"
                                                    >
                                                        <SimpleSelect
                                                            id="legends-enabled"
                                                            formObj={formObj}
                                                            name="config.chart.tooltips.format"
                                                            placeholder="E.g. 0.0%"
                                                            options={
                                                                tooltipsFormattingOptions
                                                            }
                                                        />
                                                        <ErrorDisplay
                                                            name="config.chart.legends.format"
                                                            errors={errors}
                                                        />
                                                    </InputGroup>
                                                </div>
                                            </Accordion>
                                        )}
                                    <Accordion text="Colors">
                                        <div className="grow flex flex-col space-y-4">
                                            <InputGroup
                                                label="Starting color"
                                                className="sm:grid-cols-1 gap-x-2"
                                                labelClassName="xxl:text-sm col-span-full sm:max-w-none whitespace-nowrap sm:text-left"
                                            >
                                                <input
                                                    type="color"
                                                    {...register(
                                                        'config.chart.colors.starting'
                                                    )}
                                                />
                                            </InputGroup>

                                            <InputGroup
                                                label="Ending color"
                                                className="sm:grid-cols-1 gap-x-2"
                                                labelClassName="xxl:text-sm col-span-full sm:max-w-none whitespace-nowrap sm:text-left"
                                            >
                                                <input
                                                    type="color"
                                                    {...register(
                                                        'config.chart.colors.ending'
                                                    )}
                                                />
                                            </InputGroup>
                                        </div>
                                    </Accordion>
                                </div>
                                <div className="flex justify-end space-x-2">
                                    <Button
                                        type="button"
                                        onClick={() =>
                                            mode == 'new'
                                                ? onCancelOrDelete(mode)
                                                : setIsDeleteDialogOpen(true)
                                        }
                                        variant="outline"
                                    >
                                        {mode == 'new' ? 'Cancel' : 'Delete'}
                                    </Button>
                                    <DefaultTooltip
                                        content={
                                            'You can only save after updating the preview'
                                        }
                                        disabled={!isDirty}
                                    >
                                        <div>
                                            <LoaderButton
                                                type="button"
                                                name="save"
                                                className="bg-wri-light-yellow"
                                                disabled={isDirty}
                                                onClick={() => {
                                                    setIsSaveLoading(true)
                                                    onSave(
                                                        mode,
                                                        view,
                                                        () => {
                                                            setIsSaveLoading(
                                                                false
                                                            )
                                                        },
                                                        () => {
                                                            setIsSaveLoading(
                                                                false
                                                            )
                                                        }
                                                    )
                                                }}
                                                loading={isSaveLoading}
                                            >
                                                {mode == 'new'
                                                    ? 'Add to Views'
                                                    : 'Update View'}
                                                {isDirty ? (
                                                    <InformationCircleIcon
                                                        className={`transition-all h-5 w-5 text-red-500 ml-1 mb-1 ml-1`}
                                                        aria-hidden="true"
                                                    />
                                                ) : null}
                                            </LoaderButton>
                                        </div>
                                    </DefaultTooltip>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="w-full h-full shadow-md p-10">
                    <LoaderButton
                        type="submit"
                        className="bg-wri-light-yellow mb-5 float-right"
                        loading={isPreviewLoading}
                    >
                        Update Preview
                    </LoaderButton>
                    {!error && <Chart config={view.config_obj.config} />}
                    {error && <ErrorAlert {...error} />}
                </div>
            </form>

            <DeleteViewDialog
                isOpen={isDeleteDialogOpen}
                setIsOpen={setIsDeleteDialogOpen}
                id={view.id ?? ''}
                onDelete={() => onCancelOrDelete(mode)}
                provider={view.config_obj.config.provider}
                dataset={dataset}
            />

            <DataDialog
                isOpen={isDataDialogOpen}
                setIsOpen={setIsDataDialogOpen}
                sql={sql}
            />
        </div>
    )
}

const chartTypeOptions = [
    { value: 'bar', label: 'Bar', default: true },
    { value: 'scatter', label: 'Line' },
    { value: 'pie', label: 'Pie' },
]

const aggregateOptions = [
    { value: '', label: 'None' },
    { value: 'SUM', label: 'Sum' },
    { value: 'AVG', label: 'Average' },
    { value: 'COUNT', label: 'Count' },
]

const sortByOptions = [
    { value: '', label: 'None' },
    { value: 'data', label: 'Data' },
    { value: 'labels', label: 'Labels' },
]

const sortOrderOptions = [
    { value: 'ASC', label: 'Ascending', default: true },
    { value: 'DESC', label: 'Descending' },
]

const labelAngleOptions = [
    { value: 'auto', label: 'Auto', default: true },
    { value: 0, label: '0º' },
    { value: 45, label: '45º' },
    { value: 90, label: '90º' },
    { value: 180, label: '180º' },
]

const tooltipsEnabledOptions = [
    { value: false, label: 'No' },
    { value: true, label: 'Yes', default: true },
]

const tooltipsFormattingOptions = [
    { value: '', label: 'None' },
    { value: '.0f', label: '0' },
    { value: '.1f', label: '0.0' },
    { value: '.2f', label: '0.00' },
    { value: '.3f', label: '0.000' },
    { value: '.4f', label: '0.0000' },
    { value: '.0%', label: '0%' },
    { value: '.1%', label: '0.0%' },
    { value: '.2%', label: '0.00%' },
]
