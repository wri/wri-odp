import Header from '@/components/_shared/Header'
import CreateTopicForm from '@/components/dashboard/topics/forms/CreateTopicForm'
import { NextSeo } from 'next-seo'
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next'
import { getServerAuthSession } from '@/server/auth'

export async function getServerSideProps(context: GetServerSidePropsContext) {
    const session = await getServerAuthSession(context)

    if (!session || !session.user.sysadmin) {
        return {
            redirect: {
                destination: '/dashboard',
                permanent: false,
            },
        }
    }

    return {
        props: {
            session,
        },
    }
}

export default function NewTopicPage() {
    return (
        <>
            <NextSeo title={`Create Topic`} />
            <Header />
            <CreateTopicForm />
        </>
    )
}
