import CardsGrid from '../_shared/CardsGrid';
import Container from '../_shared/Container';
import TeamCard from './TeamCard';
import { type GroupTree, type GroupsmDetails } from '@/schema/ckan.schema';
import { type Organization as CkanOrg } from '@portaljs/ckan';

type Organization = CkanOrg & { numSubTeams: number };

export default function TeamsSearchResults({
    teams,
    teamsDetails,
    subTeamCounts,
    count,
    filtered,
}: {
    teams: GroupTree[] | Organization[];
    teamsDetails: Record<string, GroupsmDetails>;
    subTeamCounts?: Record<string, number>;
    count: number;
    filtered: boolean;
}) {
    return (
        <Container className="mb-28">
            <span className="font-semibold text-xl">
                {count} {!filtered ? 'Top-Level Teams' : 'Teams'}
            </span>
            <CardsGrid<GroupTree | Organization>
                className="mt-5 mb-5"
                items={teams}
                Card={({ item: team }) => {
                    return (
                        <TeamCard
                            team={team}
                            teamsDetails={teamsDetails}
                            subTeamCounts={subTeamCounts}
                        />
                    );
                }}
            />
        </Container>
    );
}
