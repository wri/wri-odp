import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { Breadcrumbs } from '@/components/_shared/Breadcrumbs'
import Container from '@/components/_shared/Container'
import { TopicFormType, TopicSchema } from '@/schema/topic.schema'
import { LoaderButton } from '@/components/_shared/Button'
import { zodResolver } from '@hookform/resolvers/zod'
import notify from '@/utils/notify'
import { api } from '@/utils/api'
import { ErrorAlert } from '@/components/_shared/Alerts'
import TopicForm from './TopicForm'

export default function EditTopicForm({ topic }: { topic: TopicFormType }) {
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const links = [
        { label: 'Topics', url: '/dashboard/topics', current: false },
        {
            label: 'Edit Topic',
            url: `/dashboard/topics/${topic.name}/edit`,
            current: true,
        },
    ]

    const formObj = useForm<TopicFormType>({
        defaultValues: topic,
        resolver: zodResolver(TopicSchema),
    })

    const editTopic = api.topics.editTopic.useMutation({
        onSuccess: async ({ name }) => {
            notify(`Successfully edited the ${name} organization`, 'success')
            formObj.reset()
        },
        onError: (error) => setErrorMessage(error.message),
    })

    return (
        <>
            <Breadcrumbs links={links} />
            <Container className="mb-20 font-acumin">
                <h1 className="mb-[2rem] text-[1.57rem] font-semibold">
                    Edit Topic
                </h1>

                <form
                    onSubmit={formObj.handleSubmit((data) => {
                        editTopic.mutate(data)
                    })}
                >
                    <div className="w-full py-8 border-b border-blue-800 shadow">
                        <div className="px-2 sm:px-8">
                            <TopicForm formObj={formObj} editing={true} />
                            <div className="col-span-full flex justify-end">
                                <LoaderButton
                                    loading={editTopic.isLoading}
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
