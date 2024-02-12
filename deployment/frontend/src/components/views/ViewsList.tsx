import { Button } from '@/components/_shared/Button'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/_shared/Popover'
import { Resource, View, ViewState } from '@/interfaces/dataset.interface'
import { PopoverClose } from '@radix-ui/react-popover'
import { useState } from 'react'
import { DatastoreViewCard } from './DatastoreViewCard'
import { RwViewCard } from './RwViewCard'
import { WriDataset } from '@/schema/ckan.schema'
import { DefaultTooltip } from '../_shared/Tooltip'
import { InformationCircleIcon } from '@heroicons/react/24/outline'

let uniqueId = 0
const getUniqueInternalId = () => {
    return uniqueId++
}

type DatastoreViewsListProps = {
    provider: 'datastore'
    datafile: Resource
    dataset: WriDataset
}

type RwViewsListProps = {
    provider: 'rw'
    rwDatasetId: string
    views: View[]
    dataset: WriDataset
}

type ViewsListProps = DatastoreViewsListProps | RwViewsListProps

export default function ViewsList(props: ViewsListProps) {
    let ogViews: View[]
    let datafile: Resource | null = null
    let rwDatasetId: string | null = null

    if (props?.provider == 'datastore') {
        datafile = props?.datafile
        ogViews = datafile._views ?? []
    } else {
        ogViews = props?.views ?? []
        rwDatasetId = props?.rwDatasetId
    }

    const [views, setViews] = useState<ViewState[]>(
        ogViews
            ? ogViews.map((view) => ({
                ...view,
                _state: 'saved',
                _id: getUniqueInternalId(),
            }))
            : []
    )

    const addNewChartView = () => {
        setViews((prev) => [
            ...prev,
            {
                config_obj: {
                    type: 'chart',
                    config: {
                        provider: props.provider,
                        id:
                            props.provider == 'datastore'
                                ? datafile?.id ?? ''
                                : props.rwDatasetId,
                        props: {
                            data: [],
                            layout: {},
                        },
                    },
                    form_state: {},
                },
                title: '',
                description: '',
                view_type: 'custom',
                _state: 'new',
                _id: getUniqueInternalId(),
            },
        ])
    }

    const isCanCreateChartview = !!(
        (datafile && datafile.datastore_active) ||
        rwDatasetId
    )

    return (
        <div>
            <div className="w-full flex justify-end">
                <Popover>
                    <PopoverTrigger>
                        <Button variant="outline" className="">
                            + Add a view
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full md:w-[10rem] lg:w-[10rem] xl:w-[10rem] bg-white p-0">
                        {
                            // TODO: is rwDatasetId enough? Is the provider needed?
                            /* TODO: Button cannot be descend of button */
                        }
                        <PopoverClose className="w-full">
                            <DefaultTooltip
                                content={'Data file must be in DataStore '}
                                disabled={isCanCreateChartview}
                            >
                                <div className='flex items-center'>
                                    <Button
                                        variant="ghost"
                                        className="w-full"
                                        onClick={addNewChartView}
                                        disabled={!isCanCreateChartview}
                                    >
                                        <div className="text-left w-full">
                                            Chart
                                        </div>
                                    </Button>
                                    {!isCanCreateChartview ? (
                                        <InformationCircleIcon
                                            className={`transition-all h-8 w-8 text-red-500 ml-1 l-1 mr-5`}
                                            aria-hidden="true"
                                        />
                                    ) : null}
                                </div>
                            </DefaultTooltip>
                        </PopoverClose>
                    </PopoverContent>
                </Popover>
            </div>

            <div>
                <h2 className="text-base mb-2">
                    {views.filter((v) => v._state != 'new').length} Views
                </h2>
                {views.map((view: ViewState) => {
                    return datafile ? (
                        <DatastoreViewCard
                            dataset={props.dataset}
                            view={view}
                            datafile={datafile}
                            key={`view-${datafile.id}-${view._id}`}
                            onCancelOrDelete={(mode) => {
                                if (mode == 'new') {
                                    setViews((prev) => {
                                        let newViews = [...prev]

                                        newViews = newViews.filter(
                                            (v) => v._id != view._id
                                        )

                                        return newViews
                                    })
                                } else if (mode == 'edit') {
                                    setViews((prev) => {
                                        let newViews = [...prev]

                                        newViews = newViews.filter(
                                            (v) => v._id != view._id
                                        )

                                        return newViews
                                    })
                                }
                            }}
                        />
                    ) : (
                        <RwViewCard
                            dataset={props.dataset}
                            view={view}
                            key={`view-dataset-${view._id}`}
                            onCancelOrDelete={(mode) => {
                                if (mode == 'new') {
                                    setViews((prev) => {
                                        let newViews = [...prev]

                                        newViews = newViews.filter(
                                            (v) => v._id != view._id
                                        )

                                        return newViews
                                    })
                                } else if (mode == 'edit') {
                                    setViews((prev) => {
                                        let newViews = [...prev]

                                        newViews = newViews.filter(
                                            (v) => v._id != view._id
                                        )

                                        return newViews
                                    })
                                }
                            }}
                        />
                    )
                })}
            </div>
        </div>
    )
}
