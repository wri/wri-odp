export default interface Topic {
    id?: string;
    name: string;
    title: string;
    image: string;
    description: string;
    num_datasets: number;
    num_subtopics: number;
    users?: Array<any>;
    // eslint-disable-next-line semi
}

export interface TopicHierarchy {
    id: string;
    name: string;
    title: string;
    children: TopicHierarchy[];
}
