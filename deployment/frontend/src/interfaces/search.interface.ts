export type Facets = Record<
    string,
    {
        title: string
        items: { name: string; display_name: string; count: number }[]
    }
>

export interface Filter {
    title: string // E.g. Team
    key: String // E.g. organization
    label: string // E.g. My Organization
    value: string // E.g. my-organization
}
