import { useForm } from 'react-hook-form'
import { use, useState } from 'react'
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
import Link from 'next/link'
import { RouterOutput } from '@/server/api/root'
import { Tab } from '@headlessui/react'
import { Fragment } from 'react'
import classNames from '@/utils/classnames'
import { Members } from '../metadata/Members'

type TeamOutput = RouterOutput['teams']['getTeam']

export default function EditTeamForm({ team }: { team: TeamOutput }) {
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
        defaultValues: {
            ...team,
            parent: {
                value: team.groups[0]?.name ?? '',
                label: team.groups[0]?.name ?? '',
            },
            members: team.users?.map((member) => ({
                user: {
                    value: member.name,
                    label: member.name,
                },
                team_id: team.id,
                capacity: {
                    value: (member as any).capacity,
                    label: (member as any).capacity,
                },
            })),
        },
        resolver: zodResolver(TeamSchema),
    })

    const utils = api.useContext()
    const editTeam = api.teams.editTeam.useMutation({
        onSuccess: async ({ name, title }) => {
            await utils.teams.getTeam.invalidate({ id: name })
            notify(`Successfully edited the ${title ?? name} team`, 'success')
            router.push('/dashboard/teams')
        },
        onError: (error) => setErrorMessage(error.message),
    })

    const deleteTeam = api.teams.deleteTeam.useMutation({
        onSuccess: async () => {
            await utils.teams.getTeam.invalidate({ id: team.name })
            setDeleteOpen(false)
            notify(
                `Successfully deleted the ${team.title ?? team.name} team`,
                'error'
            )
            router.push('/dashboard/teams')
        },
        onError: (error) => {
            setDeleteOpen(false)
            setErrorMessage(error.message)
        },
    })

    const tabs = [
        { name: 'Metadata', enabled: true },
        { name: 'Members', enabled: true },
    ]

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
                <Tab.Group>
                    <div>
                        <Tab.List
                            className="max-w-[1380px] mx-auto px-4 sm:px-6 xxl:px-0"
                            aria-label="Tabs"
                        >
                            <div className="flex-col justify-start flex sm:flex-row gap-y-4 sm:gap-x-8 sm:border-b-2 border-gray-300 w-full">
                                {tabs
                                    .filter((tab) => tab.enabled)
                                    .map((tab) => (
                                        <Tab as={Fragment}>
                                            {({ selected }) => (
                                                <div
                                                    key={tab.name}
                                                    className={classNames(
                                                        'sm:px-8 cursor-pointer border-b-2 sm:border-none text-black text-[22px] font-normal font-acumin whitespace-nowrap',
                                                        selected
                                                            ? 'border-wri-green sm:border-solid text-wri-dark-green sm:border-b-2 -mb-px'
                                                            : 'text-black'
                                                    )}
                                                    aria-current={
                                                        selected
                                                            ? 'page'
                                                            : undefined
                                                    }
                                                >
                                                    {tab.name}
                                                </div>
                                            )}
                                        </Tab>
                                    ))}
                            </div>
                        </Tab.List>
                        <Tab.Panels>
                            <Tab.Panel>

                                    <form
                                        onSubmit={formObj.handleSubmit((data) => {
                                            editTeam.mutate(data)
                                        })}
                                    >
                                        <div className="w-full py-8 border-b border-blue-800 shadow">
                                            <div className="px-2 sm:px-8">
                                                <TeamForm
                                                    formObj={formObj}
                                                    editing={true}
                                                />
                                            </div>
                                        </div>
                                        {errorMessage && (
                                            <div className="py-4">
                                                <ErrorAlert text={errorMessage} />
                                            </div>
                                        )}
                                    </form>
                            </Tab.Panel>
                            <Tab.Panel
                                    as="div"
                                    className="flex flex-col gap-y-12 mt-8"
                                >
                                    <Members
                                        team={team}
                                        formObj={formObj}
                                    />
                            </Tab.Panel>
                        </Tab.Panels>
                    </div>
                </Tab.Group>
                <div className="flex-col sm:flex-row mt-5 gap-y-4 mx-auto flex w-full max-w-[1380px] gap-x-4 justify-end font-acumin text-2xl font-semibold text-black px-4  sm:px-6 xxl:px-0">
                    <Button
                        type="button"
                        variant="outline"
                    >
                        <Link href="/dashboard/teams">
                            Cancel
                        </Link>
                    </Button>
                    <LoaderButton
                        loading={editTeam.isLoading}
                        type="submit"
                        onClick={formObj.handleSubmit((data) => {
                            editTeam.mutate(data)
                        })}
                    >
                        Save
                    </LoaderButton>
                </div>
            </Container>
        </>
    )
}
