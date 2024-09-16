import Topic from '@/interfaces/topic.interface'
import CardsGrid from '../_shared/CardsGrid'
import Container from '../_shared/Container'
import TopicCard from './TopicCard'
import { GroupTree, GroupsmDetails } from '@/schema/ckan.schema'

export default function TopicsSearchResults({
    topics,
    topicDetails,
    count,
  filtered,
}: {
    topics: GroupTree[]
    topicDetails: Record<string, GroupsmDetails>
    count: number
    filtered: boolean
}) {
    return (
        <Container className="mb-28">
            <span className="font-semibold text-xl">{count} {!filtered ? 'top level topics' : 'topics'}</span>
            <CardsGrid<GroupTree>
                className="mt-5"
                items={topics}
                Card={({ item: topic }) => {
                    return (
                        <TopicCard topic={topic} topicDetails={topicDetails} />
                    )
                }}
            />
        </Container>
    )
}
