import Topic from '@/interfaces/topic.interface'
import CardsGrid from '../_shared/CardsGrid'
import Container from '../_shared/Container'
import TopicCard from './TopicCard'
import { GroupTree, GroupsmDetails } from '@/schema/ckan.schema'

const topics: Array<Topic> = [
    {
        name: 'topic-1',
        title: 'Topic 1',
        image: '/images/placeholders/topics/topic1.png',
        num_datasets: 32,
        num_subtopics: 6,
        description:
            'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Inventore maxime ut aspernatur laborum quod architecto, repellat commodi, iure suscipit, perspiciatis vitae dolor eveniet saepe aliquid? Quae labore incidunt odit reprehenderit?',
    },
    {
        name: 'topic-2',
        title: 'Topic 2',
        image: '/images/placeholders/topics/topic2.png',
        num_datasets: 32,
        num_subtopics: 6,
        description:
            'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Inventore maxime ut aspernatur laborum quod architecto, repellat commodi, iure suscipit, perspiciatis vitae dolor eveniet saepe aliquid? Quae labore incidunt odit reprehenderit?',
    },
    {
        name: 'topic-3',
        title: 'Topic 3',
        image: '/images/placeholders/topics/topic3.png',
        num_datasets: 32,
        num_subtopics: 6,
        description:
            'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Inventore maxime ut aspernatur laborum quod architecto, repellat commodi, iure suscipit, perspiciatis vitae dolor eveniet saepe aliquid? Quae labore incidunt odit reprehenderit?',
    },
    {
        name: 'topic-4',
        title: 'Topic 4',
        image: '/images/placeholders/topics/topic4.png',
        num_datasets: 32,
        num_subtopics: 6,
        description:
            'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Inventore maxime ut aspernatur laborum quod architecto, repellat commodi, iure suscipit, perspiciatis vitae dolor eveniet saepe aliquid? Quae labore incidunt odit reprehenderit?',
    },
    {
        name: 'topic-5',
        title: 'Topic 5',
        image: '/images/placeholders/topics/topic5.png',
        num_datasets: 32,
        num_subtopics: 6,
        description:
            'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Inventore maxime ut aspernatur laborum quod architecto, repellat commodi, iure suscipit, perspiciatis vitae dolor eveniet saepe aliquid? Quae labore incidunt odit reprehenderit?',
    },
    {
        name: 'topic-6',
        title: 'Topic 6',
        image: '/images/placeholders/topics/topic6.png',
        num_datasets: 32,
        num_subtopics: 6,
        description:
            'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Inventore maxime ut aspernatur laborum quod architecto, repellat commodi, iure suscipit, perspiciatis vitae dolor eveniet saepe aliquid? Quae labore incidunt odit reprehenderit?',
    },
    {
        name: 'topic-7',
        title: 'Topic 7',
        image: '/images/placeholders/topics/topic7.png',
        num_datasets: 32,
        num_subtopics: 6,
        description:
            'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Inventore maxime ut aspernatur laborum quod architecto, repellat commodi, iure suscipit, perspiciatis vitae dolor eveniet saepe aliquid? Quae labore incidunt odit reprehenderit?',
    },
    {
        name: 'topic-8',
        title: 'Topic 8',
        image: '/images/placeholders/topics/topic8.png',
        num_datasets: 32,
        num_subtopics: 6,
        description:
            'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Inventore maxime ut aspernatur laborum quod architecto, repellat commodi, iure suscipit, perspiciatis vitae dolor eveniet saepe aliquid? Quae labore incidunt odit reprehenderit?',
    },
    {
        name: 'topic-9',
        title: 'Topic 9',
        image: '/images/placeholders/topics/topic1.png',
        num_datasets: 32,
        num_subtopics: 6,
        description:
            'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Inventore maxime ut aspernatur laborum quod architecto, repellat commodi, iure suscipit, perspiciatis vitae dolor eveniet saepe aliquid? Quae labore incidunt odit reprehenderit?',
    },
    {
        name: 'topic-10',
        title: 'Topic 10',
        image: '/images/placeholders/topics/topic2.png',
        num_datasets: 32,
        num_subtopics: 6,
        description:
            'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Inventore maxime ut aspernatur laborum quod architecto, repellat commodi, iure suscipit, perspiciatis vitae dolor eveniet saepe aliquid? Quae labore incidunt odit reprehenderit?',
    },
    {
        name: 'topic-11',
        title: 'Topic 11',
        image: '/images/placeholders/topics/topic3.png',
        num_datasets: 32,
        num_subtopics: 6,
        description:
            'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Inventore maxime ut aspernatur laborum quod architecto, repellat commodi, iure suscipit, perspiciatis vitae dolor eveniet saepe aliquid? Quae labore incidunt odit reprehenderit?',
    },
    {
        name: 'topic-12',
        title: 'Topic 12',
        image: '/images/placeholders/topics/topic4.png',
        num_datasets: 32,
        num_subtopics: 6,
        description:
            'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Inventore maxime ut aspernatur laborum quod architecto, repellat commodi, iure suscipit, perspiciatis vitae dolor eveniet saepe aliquid? Quae labore incidunt odit reprehenderit?',
    },
    {
        name: 'topic-13',
        title: 'Topic 13',
        image: '/images/placeholders/topics/topic5.png',
        num_datasets: 32,
        num_subtopics: 6,
        description:
            'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Inventore maxime ut aspernatur laborum quod architecto, repellat commodi, iure suscipit, perspiciatis vitae dolor eveniet saepe aliquid? Quae labore incidunt odit reprehenderit?',
    },
    {
        name: 'topic-14',
        title: 'Topic 14',
        image: '/images/placeholders/topics/topic6.png',
        num_datasets: 32,
        num_subtopics: 6,
        description:
            'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Inventore maxime ut aspernatur laborum quod architecto, repellat commodi, iure suscipit, perspiciatis vitae dolor eveniet saepe aliquid? Quae labore incidunt odit reprehenderit?',
    },
]

export default function TopicsSearchResults({
    topics,
    topicDetails,
    count,
}: {
    topics: GroupTree[]
    topicDetails: Record<string, GroupsmDetails>
    count: number
}) {
    return (
        <Container className="mb-28">
            <span className="font-semibold text-xl">{count} topics</span>
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
