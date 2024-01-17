import { Button } from '@/components/_shared/Button'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/_shared/Popover'
import { Resource, View } from '@/interfaces/dataset.interface'
import { ChartBarIcon } from '@heroicons/react/20/solid'
import { PopoverClose } from '@radix-ui/react-popover'
import { useState } from 'react'
import ChartViewEditor from './ChartViewEditor'

type ViewState = View & { _state: 'new' | 'saved' | 'edit' }

export default function ViewPanel({ datafile }: { datafile: Resource }) {
    const ogViews = datafile._views

    const [views, setViews] = useState<ViewState[]>(
        ogViews ? ogViews.map((view) => ({ ...view, _state: 'saved' })) : []
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
                        {datafile.datastore_active && (
                            /* TODO - Button cannot be descend of button */
                            <PopoverClose className="w-full">
                                <Button
                                    variant="ghost"
                                    className="w-full"
                                    onClick={() =>
                                        setViews((prev) => [
                                            ...prev,
                                            {
                                                config: {
                                                    provider: 'datastore',
                                                    id: datafile.id,
                                                    props: {
                                                        data: [],
                                                        layout: {},
                                                    },
                                                },
                                                title: '',
                                                description: '',
                                                view_type: 'chart',
                                                _state: 'new',
                                            },
                                        ])
                                    }
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
                {views.map((view: ViewState, i: number) => {
                    return (
                        <ViewCard
                            view={view}
                            datafile={datafile}
                            key={`view-${i}`}
                        />
                    )
                })}
            </div>
        </div>
    )
}

function ViewCard({
    view: _ogView,
    datafile,
}: {
    view: ViewState
    datafile: Resource
}) {
    const [mode, setMode] = useState(_ogView._state)
    const [view, setView] = useState<View>(_ogView)

    return (
        <div>
            {mode != 'new' && (
                <div className="w-full px-6 py-5 shadow-md">
                    <h2 className="flex items-center">
                        {view.view_type == 'chart' && (
                            <>
                                <ChartBarIcon className="w-6 text-wri-dark-blue mr-2 text-base" />{' '}
                                {view.title || 'Chart View'}
                            </>
                        )}
                    </h2>
                </div>
            )}

            {['new', 'edit'].includes(mode) && view.view_type == 'chart' && (
                <ChartViewEditor view={view} setView={setView} />
            )}
        </div>
    )
}
