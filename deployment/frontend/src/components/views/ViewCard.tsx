import { ChartBarIcon } from '@heroicons/react/20/solid'
import ChartViewEditor from './ChartViewEditor'
import { PencilSquareIcon } from '@heroicons/react/24/outline'
import { DefaultTooltip } from '@/components/_shared/Tooltip'
import { View, ViewState } from '@/interfaces/dataset.interface'
import { Dispatch, SetStateAction } from 'react'

export default function ViewCard({
    view,
    setView,
    onCancelOrDelete,
    mode,
    setMode,
    onSave,
}: {
    view: View
    setView: Dispatch<SetStateAction<View>>
    onCancelOrDelete: (mode: string) => void
    mode: ViewState["_state"]
    setMode: Dispatch<SetStateAction<ViewState['_state']>>
    onSave: (mode: string, view: View) => void
}) {
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
                        mode={mode}
                        onCancelOrDelete={onCancelOrDelete}
                        onSave={onSave}
                        view={view}
                        setView={setView}
                    />
                )}
        </div>
    )
}
