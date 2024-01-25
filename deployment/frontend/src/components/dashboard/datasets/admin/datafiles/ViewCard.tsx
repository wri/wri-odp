import { ChartBarIcon } from '@heroicons/react/20/solid'
import ChartViewEditor from './ChartViewEditor'
import { api } from '@/utils/api'
import { toast } from 'react-toastify'
import { PencilSquareIcon } from '@heroicons/react/24/outline'
import { DefaultTooltip } from '@/components/_shared/Tooltip'
import { Resource, View, ViewState } from '@/interfaces/dataset.interface'
import { useState } from 'react'

export default function ViewCard({
    view: _ogView,
    datafile,
    onCancelOrDelete: onCancel,
}: {
    view: ViewState
    datafile: Resource
    onCancelOrDelete: (mode: string) => void
}) {
    const [mode, setMode] = useState(_ogView._state)
    const [view, setView] = useState<View>(_ogView)

    const createMutation = api.dataset.createResourceView.useMutation()
    const updateMutation = api.dataset.updateResourceView.useMutation()

    const onSave = (mode: string, view: View) => {
        if (mode == 'new') {
            createMutation.mutate(
                {
                    ...view,
                    resource_id: datafile.id,
                },
                {
                    onError: (e) => {
                        toast(e.message, { type: 'error' })
                    },
                    onSuccess: () => {
                        toast('The new view was successfully created')
                        setMode('saved')
                    },
                }
            )
        } else if (mode == 'edit' && view.id) {
            updateMutation.mutate(
                {
                    ...view,
                    id: view.id,
                    resource_id: datafile.id,
                },
                {
                    onError: (e) => {
                        toast(e.message, { type: 'error' })
                    },
                    onSuccess: () => {
                        toast('The view was successfully updated')
                        setMode('saved')
                    },
                }
            )
        }
    }

    return (
        <div>
            {!['new'].includes(mode) && (
                <button
                    className="w-full px-6 py-5 shadow-md hover:bg-slate-100 group flex justify-between items-center"
                    onClick={() => {
                        if (mode == 'edit') {
                            setMode('saved')
                        } else if (mode == 'saved') {
                            setMode('edit')
                        }
                    }}
                >
                    <h2 className="flex items-center">
                        {view.config_obj.type == 'chart' && (
                            <>
                                <ChartBarIcon className="w-6 text-wri-dark-blue mr-2 text-base" />{' '}
                                {view.title || 'Chart View'}
                            </>
                        )}
                    </h2>
                    <DefaultTooltip content="Edit">
                        <PencilSquareIcon className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all" />
                    </DefaultTooltip>
                </button>
            )}

            {['new', 'edit'].includes(mode) &&
                view.config_obj.type == 'chart' && (
                    <ChartViewEditor
                        // @ts-ignore
                        mode={mode}
                        onCancelOrDelete={onCancel}
                        onSave={onSave}
                        view={view}
                        setView={setView}
                    />
                )}
        </div>
    )
}
