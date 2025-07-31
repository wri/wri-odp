import { useForm } from 'react-hook-form'
import { useEffect, useState } from 'react'
import { slugify } from '@/utils/slugify'
import ApplicationForm from './ApplicationForm'
import { Breadcrumbs } from '@/components/_shared/Breadcrumbs'
import Container from '@/components/_shared/Container'
import { ApplicationFormType, ApplicationSchema } from '@/schema/application.schema'
import { LoaderButton } from '@/components/_shared/Button'
import { zodResolver } from '@hookform/resolvers/zod'
import { api } from '@/utils/api'
import notify from '@/utils/notify'
import { ErrorAlert } from '@/components/_shared/Alerts'
import { useRouter } from 'next/router'

const links = [
    { label: 'Applications', url: '/dashboard/applications', current: false },
    { label: 'Create an Application', url: '/dashboard/applications/new', current: true },
]

export default function CreateApplicationForm() {
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const router = useRouter()
    const formObj = useForm<ApplicationFormType>({
        resolver: zodResolver(ApplicationSchema),
    })

    const createApplication = api.applications.createApplication.useMutation({
        onSuccess: async ({ name, title }) => {
            notify(`Successfully created the ${title ?? name} Application`, 'success')
            router.push('/dashboard/applications')
            formObj.reset()
        },
        onError: (error) => {
            let errorMessage = error.message
            if (
                error.message.includes('Application name already exists in database')
            ) {
                errorMessage =
                    'Application name already exists in database or there is a Team/Topic with this name'
            }

            setErrorMessage(errorMessage)
        },
    })

    const {
        setValue,
        watch,
        formState: { dirtyFields },
    } = formObj

    useEffect(() => {
        if (!dirtyFields['name']) setValue('name', slugify(watch('title')))
    }, [watch('title')])

    return (
        <>
            <Breadcrumbs links={links} />
            <Container className="mb-20 font-acumin">
                <h1 className="mb-[2rem] text-[1.57rem] font-semibold">
                    Create an Application
                </h1>

                <form
                    onSubmit={formObj.handleSubmit((data) => {
                        createApplication.mutate(data)
                    })}
                >
                    <div className="w-full py-8 border-b border-blue-800 shadow">
                        <div className="px-2 sm:px-8">
                            <ApplicationForm formObj={formObj} />
                            <div className="col-span-full flex justify-end">
                                <LoaderButton
                                    loading={createApplication.isLoading}
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
