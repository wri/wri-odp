import { Resource, View, ViewState } from '@/interfaces/dataset.interface'
import ViewCard from './ViewCard'
import { useState } from 'react'
import { api } from '@/utils/api'
import { toast } from 'react-toastify'
import { WriDataset } from '@/schema/ckan.schema'

export function RwViewCard({
    view: _ogView,
    dataset,
    onCancelOrDelete,
}: {
    view: ViewState
    dataset: WriDataset
    onCancelOrDelete: (mode: string) => void
}) {
    const [mode, setMode] = useState(_ogView._state)
    const [view, setView] = useState<View>(_ogView)

    const createMutation = api.rw.createDatasetView.useMutation()
    const updateMutation = api.rw.updateDatasetView.useMutation()

    const onSave = (
        mode: string,
        view: View,
        onError: () => void,
        onSuccess: () => void
    ) => {
        if (mode == 'new') {
            createMutation.mutate(
                {
                    view: {
                        ...view,
                        resource_id: dataset?.rw_id ?? '',
                    },
                    ckanDatasetId: dataset.id,
                },
                {
                    onError: (e) => {
                        toast(e.message, { type: 'error' })
                        onError()
                    },
                    onSuccess: () => {
                        toast('The new view was successfully created')
                        setMode('saved')
                        onSuccess()
                    },
                }
            )
        } else if (mode == 'edit' && view.id) {
            updateMutation.mutate(
                {
                    view: {
                        ...view,
                        id: view.id,
                        resource_id: dataset?.rw_id ?? '',
                    },
                    ckanDatasetId: dataset.id,
                },
                {
                    onError: (e) => {
                        toast(e.message, { type: 'error' })
                        onError()
                    },
                    onSuccess: () => {
                        toast('The view was successfully updated')
                        setMode('saved')
                        onSuccess()
                    },
                }
            )
        }
    }

    return (
        <ViewCard
            view={view}
            setView={setView}
            onCancelOrDelete={onCancelOrDelete}
            mode={mode}
            setMode={setMode}
            onSave={onSave}
            dataset={dataset}
        />
    )
}
