import { Resource, View, ViewState } from '@/interfaces/dataset.interface'
import ViewCard from './ViewCard'
import { useState } from 'react'
import { api } from '@/utils/api'
import { toast } from 'react-toastify'
import { WriDataset } from '@/schema/ckan.schema'

export function DatastoreViewCard({
    view: _ogView,
    datafile,
    onCancelOrDelete,
    dataset,
}: {
    view: ViewState
    datafile: Resource
    onCancelOrDelete: (mode: string) => void
    dataset: WriDataset
}) {
    const [mode, setMode] = useState(_ogView._state)
    const [view, setView] = useState<View>(_ogView)

    const createMutation = api.dataset.createResourceView.useMutation()
    const updateMutation = api.dataset.updateResourceView.useMutation()

    const onSave = (mode: string, view: View, onError: () => void, onSuccess: () => void) => {
        if (mode == 'new') {
            createMutation.mutate(
                {
                    view: {
                        ...view,
                        resource_id: datafile.id,
                    },
                    ckanDatasetId: dataset.id,
                },
                {
                    onError: (e) => {
                        toast(e.message, { type: 'error' })
                        onError()
                    },
                    onSuccess: () => {
                        toast('The new view was successfully created', {
                            type: 'success',
                        })
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
                        resource_id: datafile.id,
                    },
                    ckanDatasetId: dataset.id,
                },
                {
                    onError: (e) => {
                        toast(e.message, { type: 'error' })
                        onError()
                    },
                    onSuccess: () => {
                        toast('The view was successfully updated', {
                            type: 'success',
                        })
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
