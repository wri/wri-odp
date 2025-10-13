import CardsGrid from '../_shared/CardsGrid'
import Container from '../_shared/Container'
import ApplicationCard from './ApplicationCard'
import { type Application } from '@/schema/ckan.schema'

export default function ApplicationSearchResults({
    applications,
    count,
    filtered,
}: {
    applications: Application[]
    count: number
    filtered: boolean
}) {
    return (
        <Container className="mb-28">
            <span className="font-semibold text-xl">{count} Applications</span>
            <CardsGrid<Application>
                className="mt-5"
                items={applications}
                Card={({ item: application }) => {
                    return <ApplicationCard application={application} />
                }}
            />
        </Container>
    )
}
