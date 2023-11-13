import { useForm } from 'react-hook-form'
import { useEffect, useState } from 'react'
import { slugify } from '@/utils/slugify'
import TeamForm from './TeamForm'
import { Breadcrumbs } from '@/components/_shared/Breadcrumbs'
import Container from '@/components/_shared/Container'
import { TeamFormType, TeamSchema } from '@/schema/team.schema'
import { LoaderButton } from '@/components/_shared/Button'
import { zodResolver } from '@hookform/resolvers/zod'
import { api } from '@/utils/api'
import notify from '@/utils/notify'
import { ErrorAlert } from '@/components/_shared/Alerts'
import { useRouter } from 'next/router'

const links = [
    { label: 'Teams', url: '/dashboard/teams', current: false },
    { label: 'Create a team', url: '/dashboard/teams/new', current: true },
]

export default function CreateTeamForm() {
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const router = useRouter()
    const formObj = useForm<TeamFormType>({
        resolver: zodResolver(TeamSchema),
    })

    const createTeam = api.teams.createTeam.useMutation({
        onSuccess: async ({ name, title }) => {
            notify(`Successfully created the ${title ?? name} team`, 'success')
            router.push('/dashboard/teams')
            formObj.reset()
        },
        onError: (error) => setErrorMessage(error.message),
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
                    Create a team
                </h1>

                <form
                    onSubmit={formObj.handleSubmit((data) => {
                        createTeam.mutate(data)
                    })}
                >
                    <div className="w-full py-8 border-b border-blue-800 shadow">
                        <div className="px-2 sm:px-8">
                            <TeamForm formObj={formObj} />
                            <div className="col-span-full flex justify-end">
                                <LoaderButton
                                    loading={createTeam.isLoading}
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
