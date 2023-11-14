import { useForm } from 'react-hook-form'
import { useState } from 'react'
import TeamForm from './TeamForm'
import { Breadcrumbs } from '@/components/_shared/Breadcrumbs'
import Container from '@/components/_shared/Container'
import { TeamFormType, TeamSchema } from '@/schema/team.schema'
import { LoaderButton, Button } from '@/components/_shared/Button'
import { zodResolver } from '@hookform/resolvers/zod'
import notify from '@/utils/notify'
import { api } from '@/utils/api'
import { ErrorAlert } from '@/components/_shared/Alerts'
import { useRouter } from 'next/router'
import Modal from '@/components/_shared/Modal'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { Dialog } from '@headlessui/react'

export default function EditTeamForm({ team }: { team: TeamFormType }) {
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const router = useRouter()
    const links = [
        { label: 'Teams', url: '/dashboard/teams', current: false },
        {
            label: 'Edit team',
            url: `/dashboard/teams/${team.name}/edit`,
            current: true,
        },
    ]

    const formObj = useForm<TeamFormType>({
        defaultValues: team,
        resolver: zodResolver(TeamSchema),
    })

    const editTeam = api.teams.editTeam.useMutation({
        onSuccess: async ({ name, title }) => {
            notify(`Successfully deleted the ${title ? title : name ?? ''} team`, 'error')
            router.push('/dashboard/teams')
        },
        onError: (error) => setErrorMessage(error.message),
    })

    const deleteTeam = api.teams.deleteTeam.useMutation({
        onSuccess: async ({ name, title }) => {
            setDeleteOpen(false)
            notify(`Successfully deleted the ${title ?? name} team`, 'error')
            router.push('/dashboard/teams')
        },
        onError: (error) => {
            setDeleteOpen(false)
            setErrorMessage(error.message)
        },
    })

    return (
        <>
            <Modal
                open={deleteOpen}
                setOpen={setDeleteOpen}
                className="sm:w-full sm:max-w-lg"
            >
                <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                        <ExclamationTriangleIcon
                            className="h-6 w-6 text-red-600"
                            aria-hidden="true"
                        />
                    </div>
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                        <Dialog.Title
                            as="h3"
                            className="text-base font-semibold leading-6 text-gray-900"
                        >
                            Delete Team
                        </Dialog.Title>
                        <div className="mt-2">
                            <p className="text-sm text-gray-500">
                                Are you sure you want to delete this team?
                            </p>
                        </div>
                    </div>
                </div>
                <div className="mt-5 sm:mt-4 gap-x-4 sm:flex sm:flex-row-reverse">
                    <LoaderButton
                        variant="destructive"
                        loading={deleteTeam.isLoading}
                        onClick={() => deleteTeam.mutate({ id: team.name })}
                    >
                        Delete Team
                    </LoaderButton>
                    <Button
                        variant="outline"
                        type="button"
                        onClick={() => setDeleteOpen(false)}
                    >
                        Cancel
                    </Button>
                </div>
            </Modal>
            <Breadcrumbs links={links} />
            <Container className="mb-20 font-acumin">
                <div className="flex justify-between">
                    <h1 className="mb-[2rem] text-[1.57rem] font-semibold">
                        Edit team
                    </h1>
                    <Button
                        variant="destructive"
                        onClick={() => setDeleteOpen(true)}
                    >
                        Delete Team
                    </Button>
                </div>

                <form
                    onSubmit={formObj.handleSubmit((data) => {
                        editTeam.mutate(data)
                    })}
                >
                    <div className="w-full py-8 border-b border-blue-800 shadow">
                        <div className="px-2 sm:px-8">
                            <TeamForm formObj={formObj} editing={true} />
                            <div className="col-span-full flex justify-end">
                                <LoaderButton
                                    loading={editTeam.isLoading}
                                    type="submit"
                                >
                                    Save
                                </LoaderButton>
                            </div>
                        </div>
                    </div>
                    {errorMessage && (
                        <div className="py-4">
                            <ErrorAlert text={errorMessage} />
                        </div>
                    )}
                </form>
            </Container>
        </>
    )
}
