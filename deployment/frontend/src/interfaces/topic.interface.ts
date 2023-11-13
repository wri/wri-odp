export default interface Topic {
    name: string
    title: string
    image: string
    description: string
    num_datasets: number
    num_subtopics: number
}

export interface TopicHierarchy {
    id: string;
    name: string;
    title: string
    children: TopicHierarchy[];
}
