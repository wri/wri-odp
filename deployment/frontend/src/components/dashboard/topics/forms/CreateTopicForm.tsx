import { useForm } from 'react-hook-form'
import { useEffect, useState } from 'react'
import { slugify } from '@/utils/slugify'
import TopicForm from './TopicForm'
import { Breadcrumbs } from '@/components/_shared/Breadcrumbs'
import Container from '@/components/_shared/Container'
import { TopicFormType, TopicSchema } from '@/schema/topic.schema'
import { LoaderButton } from '@/components/_shared/Button'
import { zodResolver } from '@hookform/resolvers/zod'
import { api } from '@/utils/api'
import notify from '@/utils/notify'
import { ErrorAlert } from '@/components/_shared/Alerts'
import { useRouter } from 'next/router'

const links = [
    { label: 'Topics', url: '/dashboard/teams', current: false },
    { label: 'Create a topic', url: '/dashboard/teams/new', current: true },
]

export default function CreateTopicForm() {
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const router = useRouter()
    const formObj = useForm<TopicFormType>({
        resolver: zodResolver(TopicSchema),
    })

    const createTopic = api.topics.createTopic.useMutation({
        onSuccess: async ({ name, title }) => {
            notify(`Successfully created the ${title ?? name} topic`, 'success')
            router.push('/dashboard/topics')
            formObj.reset()
        },
        onError: (error) => {
            let errorMessage = error.message
            if (
                error.message.includes('Topic name already exists in database')
            ) {
                errorMessage =
                    'Topic name already exists in database or there is a team with this name'
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
                    Create a topic
                </h1>

                <form
                    onSubmit={formObj.handleSubmit((data) => {
                        createTopic.mutate(data)
                    })}
                >
                    <div className="w-full py-8 border-b border-blue-800 shadow">
                        <div className="px-2 sm:px-8">
                            <TopicForm formObj={formObj} />
                            <div className="col-span-full flex justify-end">
                                <LoaderButton
                                    loading={createTopic.isLoading}
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
