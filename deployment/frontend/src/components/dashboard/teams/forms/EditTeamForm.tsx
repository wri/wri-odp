import { useForm } from 'react-hook-form'
import { useEffect, useState } from 'react'
import { slugify } from '@/utils/slugify'
import TeamForm from './TeamForm'
import { Breadcrumbs } from '@/components/_shared/Breadcrumbs'
import Container from '@/components/_shared/Container'
import { TeamFormType, TeamSchema } from '@/schema/team.schema'
import { LoaderButton } from '@/components/_shared/Button'
import { zodResolver } from '@hookform/resolvers/zod'
import notify from '@/utils/notify'
import { api } from '@/utils/api'
import { ErrorAlert } from '@/components/_shared/Alerts'

export default function EditTeamForm({ team }: { team: TeamFormType }) {
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const links = [
        { label: 'Teams', url: '/dashboard/x/teams', current: false },
        {
            label: 'Edit team',
            url: `/dashboard/x/teams/${team.name}/edit`,
            current: true,
        },
    ]

    const formObj = useForm<TeamFormType>({
        defaultValues: team,
        resolver: zodResolver(TeamSchema),
    })

    const editTeam = api.teams.editTeam.useMutation({
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
                    Edit team
                </h1>

                <form
                    onSubmit={formObj.handleSubmit((data) => {
                        editTeam.mutate(data)
                    })}
                >
                    <div className="w-full py-8 border-b border-blue-800 shadow">
                        <div className="px-2 sm:px-8">
                            <TeamForm formObj={formObj} editing={true} />
                            <div className="col-span-full flex justify-end">
                                <LoaderButton
                                    loading={editTeam.isLoading}
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
