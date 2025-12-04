export type Facets = Record<
    string,
    {
        title: string;
        items: {
            name: string;
            display_name: string;
            count: number;
            type?: string;
        }[];
    }
>;

export type FacetsCount = Record<string, Record<string, number>>;

export interface Filter {
    title: string; // E.g. Team
    key: string; // E.g. organization
    label: string; // E.g. My Organization
    value: string; // E.g. my-organization
}
