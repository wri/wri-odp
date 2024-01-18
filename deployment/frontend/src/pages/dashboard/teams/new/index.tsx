import Header from '@/components/_shared/Header'
import CreateTeamForm from '@/components/dashboard/teams/forms/CreateTeamForm'
import { NextSeo } from 'next-seo'

export default function NewTeamPage() {
    return (
        <>
            <NextSeo title={`Create Team`} />
            <Header />
            <CreateTeamForm />
        </>
    )
}
