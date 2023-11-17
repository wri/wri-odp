import Header from '@/components/_shared/Header'
import CreateTopicForm from '@/components/dashboard/topics/forms/CreateTopicForm'
import { NextSeo } from 'next-seo'

export default function NewTopicPage() {
    return (
        <>
            <NextSeo title={`Create Topic`} />
            <Header />
            <CreateTopicForm />
        </>
    )
}
