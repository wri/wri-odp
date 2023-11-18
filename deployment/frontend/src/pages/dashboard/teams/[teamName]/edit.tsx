import Container from '@/components/_shared/Container'
import Header from '@/components/_shared/Header'
import Loading from '@/components/_shared/Loading'
import EditTeamForm from '@/components/dashboard/teams/forms/EditTeamForm'
import { getServerAuthSession } from '@/server/auth'
import { api } from '@/utils/api'
import { GetServerSideProps, NextPage } from 'next'
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
            teamName:
                context.params && typeof context.params.teamName === 'string'
                    ? context.params.teamName
                    : null,
        },
    }
}

const EditTeamPage: NextPage<{ teamName: string }> = ({ teamName }) => {
    const {
        data: team,
        isLoading,
        isError,
    } = api.teams.getTeam.useQuery({ id: teamName })
    if (isLoading) return <Loading />
    return (
        <>
            <NextSeo
                title={`Edit ${team?.title ?? team?.name}`}
            />
            <Header />
            {isError && (
                <Container className="mb-20 font-acumin">
                    <h1 className="mb-[2rem] text-[1.57rem] font-semibold">
                        Something went wrong
                    </h1>
                </Container>
            )}
            {!isError && team && <EditTeamForm team={team} />}
        </>
    )
}

export default EditTeamPage
