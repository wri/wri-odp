import Team from '@/interfaces/team.interface'
import CardsGrid from '../_shared/CardsGrid'
import Container from '../_shared/Container'
import TeamCard from './TeamCard'
import Pagination from '../_shared/Pagination'
import { GroupTree, GroupsmDetails } from '@/schema/ckan.schema'
import { Organization as CkanOrg } from '@portaljs/ckan'

type Organization = CkanOrg & { numSubTeams: number }

export default function TeamsSearchResults({
    teams,
    teamsDetails,
    count,
    filtered
}: {
    teams: GroupTree[] | Organization[]
    teamsDetails: Record<string, GroupsmDetails>
    count: number
    filtered: boolean
}) {
    return (
        <Container className="mb-28">
            <span className="font-semibold text-xl">{count} {!filtered ? 'top level teams' : 'teams'}</span>
            <CardsGrid<GroupTree | Organization>
                className="mt-5 mb-5"
                items={teams}
                Card={({ item: team }) => {
                    return <TeamCard team={team} teamsDetails={teamsDetails} />
                }}
            />
        </Container>
    )
}
