import Container from '@/components/_shared/Container'
import Header from '@/components/_shared/Header'
import Loading from '@/components/_shared/Loading'
import EditTopicForm from '@/components/dashboard/topics/forms/EditTopicForm'
import { getServerAuthSession } from '@/server/auth'
import { api } from '@/utils/api'
import { GetServerSideProps, NextPage } from 'next'

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getServerAuthSession(context)

    if (!session) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            },
        }
    }

    return {
        props: {
            session,
            topicName:
                context.params && typeof context.params.topicName === 'string'
                    ? context.params.topicName
                    : null,
        },
    }
}

const EditTeamPage: NextPage<{ topicName: string }> = ({ topicName }) => {
    const {
        data: topic,
        isLoading,
        isError,
    } = api.topics.getTopic.useQuery({ id: topicName })
    if (isLoading) return <Loading />
    return (
        <>
            <Header />
            {isError && (
                <Container className="mb-20 font-acumin">
                    <h1 className="mb-[2rem] text-[1.57rem] font-semibold">
                        Something went wrong
                    </h1>
                </Container>
            )}
            {!isError && topic && <EditTopicForm topic={topic} />}
        </>
    )
}

export default EditTeamPage
