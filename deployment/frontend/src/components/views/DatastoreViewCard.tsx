import { Resource, View, ViewState } from '@/interfaces/dataset.interface'
import ViewCard from './ViewCard'
import { useState } from 'react'
import { api } from '@/utils/api'
import { toast } from 'react-toastify'

export function DatastoreViewCard({
    view: _ogView,
    datafile,
    onCancelOrDelete,
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
        <ViewCard
            view={view}
            setView={setView}
            onCancelOrDelete={onCancelOrDelete}
            mode={mode}
            setMode={setMode}
            onSave={onSave}
        />
    )
}