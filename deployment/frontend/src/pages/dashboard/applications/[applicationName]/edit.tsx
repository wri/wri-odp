import Container from '@/components/_shared/Container'
import Header from '@/components/_shared/Header'
import Loading from '@/components/_shared/Loading'
import EditApplicationForm from '@/components/dashboard/applications/forms/EditApplicationForm'
import { getServerAuthSession } from '@/server/auth'
import { api } from '@/utils/api'
import { type GetServerSideProps, type NextPage } from 'next'
import { NextSeo } from 'next-seo'

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
            applicationName:
                context.params &&
                typeof context.params.applicationName === 'string'
                    ? context.params.applicationName
                    : null,
        },
    }
}

const EditApplicationPage: NextPage<{ applicationName: string }> = ({
    applicationName,
}) => {
    const {
        data: application,
        isLoading,
        isError,
    } = api.applications.getApplication.useQuery({ id: applicationName })
    if (isLoading) return <Loading />
    return (
        <>
            <NextSeo
                title={`Edit ${application?.title ?? application?.name}`}
            />
            <Header />
            {isError && (
                <Container className="mb-20 font-acumin">
                    <h1 className="mb-[2rem] text-[1.57rem] font-semibold">
                        Something went wrong
                    </h1>
                </Container>
            )}
            {!isError && application && (
                <EditApplicationForm application={application} />
            )}
        </>
    )
}

export default EditApplicationPage
