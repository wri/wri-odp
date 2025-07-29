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
import { z } from 'zod'
import { useSession } from 'next-auth/react'

const links = [
    { label: 'Teams', url: '/dashboard/teams', current: false },
    { label: 'Create a Team', url: '/dashboard/teams/new', current: true },
]

export default function CreateTeamForm() {
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const router = useRouter()
    const possibleParents = api.teams.getAllTeams.useQuery()
    const { data: session } = useSession()
    const sysadmin = session?.user?.sysadmin ?? false

    const TeamSchemaRefine = TeamSchema.superRefine((val, ctx) => {
        if (val.visibility.value === 'public' && val.parent) {
            const parent = possibleParents.data?.find(
                (team) => team.name === val.parent?.value
            )
            const visibility = parent?.visibility
            const isPrivate = parent && visibility === 'private'
            if (isPrivate) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['visibility'],
                    message:
                        'Team visibility cannot be set to public if selected parent Team is private.',
                })
            }
        }

        if (!sysadmin && val.parent) {
            const parent = possibleParents.data?.find(
                (team) => team.name === val.parent?.value
            )
            const capacity = parent?.capacity
            const isAdmin = parent && !['admin', 'editor'].includes(capacity)
            if (isAdmin) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['parent'],
                    message:
                        'User does not have admin access to create a SubTeam',
                })
            }
        }
    })
    const formObj = useForm<TeamFormType>({
        resolver: zodResolver(TeamSchemaRefine),
    })

    const createTeam = api.teams.createTeam.useMutation({
        onSuccess: async ({ name, title }) => {
            notify(`Successfully created the ${title ?? name} Team`, 'success')
            router.push('/dashboard/teams')
            formObj.reset()
        },
        onError: (error) => {
            let errorMessage = error.message
            if (
                error.message.includes('Team name already exists in database')
            ) {
                errorMessage =
                    '[!] A page with this URL already exists. Please choose a different URL.'
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
                    Create a Team
                </h1>

                <form
                    onSubmit={formObj.handleSubmit((data) => {
                        createTeam.mutate(data)
                    })}
                >
                    <div className="w-full py-8 border-b border-blue-800 shadow">
                        <div className="px-2 sm:px-8">
                            <TeamForm formObj={formObj} sysadmin={sysadmin} />
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
