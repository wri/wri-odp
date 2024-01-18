export default interface Topic {
    id?: string
    name: string
    title: string
    image: string
    description: string
    num_datasets: number
    num_subtopics: number
    users?: Array<any>
}

export interface TopicHierarchy {
    id: string;
    name: string;
    title: string
    children: TopicHierarchy[];
}
