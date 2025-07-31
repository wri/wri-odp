import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { Breadcrumbs } from '@/components/_shared/Breadcrumbs'
import Container from '@/components/_shared/Container'
import { ApplicationFormType, ApplicationSchema } from '@/schema/application.schema'
import { LoaderButton, Button } from '@/components/_shared/Button'
import { zodResolver } from '@hookform/resolvers/zod'
import notify from '@/utils/notify'
import { api } from '@/utils/api'
import { ErrorAlert } from '@/components/_shared/Alerts'
import ApplicationForm from './ApplicationForm'
import { useRouter } from 'next/router'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { Dialog, Tab } from '@headlessui/react'
import dynamic from 'next/dynamic';
const Modal = dynamic(() => import('@/components/_shared/Modal'), {
    ssr: false,
});
import Link from 'next/link'
import { RouterOutput } from '@/server/api/root'
import { Fragment } from 'react'
import classNames from '@/utils/classnames'

type ApplicationOutput = RouterOutput["applications"]["getApplication"];

export default function EditApplicationForm({ application }: { application: ApplicationOutput }) {
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const router = useRouter()
    const links = [
        { label: 'Applications', url: '/dashboard/applications', current: false },
        {
            label: 'Edit Application',
            url: `/dashboard/applications/${application.name}/edit`,
            current: true,
        },
    ]

    const formObj = useForm<ApplicationFormType>({
        defaultValues: {
            ...application,
        },
        resolver: zodResolver(ApplicationSchema),
    })

    const utils = api.useContext()
    const editApplication = api.applications.editApplication.useMutation({
        onSuccess: async ({ title, name }) => {
            await utils.applications.getApplication.invalidate({ id: name })
            notify(`Successfully edited the ${title ?? name} Application`, 'success')
            router.push('/dashboard/applications')
            formObj.reset()
        },
        onError: (error) => {
            setErrorMessage(error.message)
        },
    })

    const deleteApplication = api.applications.deleteApplication.useMutation({
        onSuccess: async () => {
            await utils.applications.getApplication.invalidate({ id: application.name })
            notify(
                `Successfully deleted the ${application.title ?? application.name} Team`,
                'error'
            )
            setDeleteOpen(false)
            router.push('/dashboard/applications')
        },
        onError: (error) => {
            setDeleteOpen(false)
            setErrorMessage(error.message)
        },
    })

    const tabs = [
        { name: 'Metadata', enabled: true },
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
                            Delete Application
                        </Dialog.Title>
                        <div className="mt-2">
                            <p className="text-sm text-gray-500">
                                Are you sure you want to delete this Application?
                            </p>
                        </div>
                    </div>
                </div>
                <div className="mt-5 sm:mt-4 gap-x-4 sm:flex sm:flex-row-reverse">
                    <LoaderButton
                        variant="destructive"
                        loading={deleteApplication.isLoading}
                        onClick={() => deleteApplication.mutate({ id: application.name })}
                    >
                        Delete Application
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
                        Edit Application
                    </h1>
                    <Button
                        variant="destructive"
                        onClick={() => setDeleteOpen(true)}
                    >
                        Delete Application
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
                                        editApplication.mutate(data)
                                    })}
                                >
                                    <div className="w-full py-8 border-b border-blue-800 shadow">
                                        <div className="px-2 sm:px-8">
                                            <ApplicationForm formObj={formObj} editing={true} />
                                        </div>
                                    </div>
                                    {errorMessage && (
                                        <div className="py-4">
                                            <ErrorAlert text={errorMessage} />
                                        </div>
                                    )}
                                </form>
                            </Tab.Panel>
                        </Tab.Panels>
                    </div>
                </Tab.Group>
                <div className="flex-col sm:flex-row mt-5 gap-y-4 mx-auto flex w-full max-w-[1380px] gap-x-4 justify-end font-acumin text-2xl font-semibold text-black px-4  sm:px-6 xxl:px-0">
                    <Button type="button" variant="outline">
                        <Link href="/dashboard/applications">Cancel</Link>
                    </Button>
                    <LoaderButton
                        loading={editApplication.isLoading}
                        type="submit"
                        onClick={formObj.handleSubmit((data) => {
                            editApplication.mutate(data)
                        })}
                    >
                        Save
                    </LoaderButton>
                </div>
            </Container>
        </>
    )
}
