import { Button } from '@/components/_shared/Button'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/_shared/Popover'
import { Resource, ViewState } from '@/interfaces/dataset.interface'
import { PopoverClose } from '@radix-ui/react-popover'
import { useState } from 'react'
import ViewCard from './ViewCard'

let uniqueId = 0
const getUniqueInternalId = () => {
    return uniqueId++
}

export default function ViewPanel({ datafile }: { datafile: Resource }) {
    const ogViews = datafile._views

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
                        provider: 'datastore',
                        id: datafile.id,
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
                        {datafile.datastore_active && (
                            /* TODO - Button cannot be descend of button */
                            <PopoverClose className="w-full">
                                <Button
                                    variant="ghost"
                                    className="w-full"
                                    onClick={addNewChartView}
                                >
                                    <div className="text-left w-full">
                                        Chart
                                    </div>
                                </Button>
                            </PopoverClose>
                        )}
                    </PopoverContent>
                </Popover>
            </div>

            <div>
                <h2 className="text-base mb-2">
                    {views.filter((v) => v._state != 'new').length} Views
                </h2>
                {views.map((view: ViewState) => {
                    return (
                        <ViewCard
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
                    )
                })}
            </div>
        </div>
    )
}
