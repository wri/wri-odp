import { UseQueryOptions, useQuery } from 'react-query'

export function useColumns(
    type: string,
    connector_url: string,
    enabled: boolean,
    onSuccess?: (data: string[]) => void
) {
    //react-query hook that fetches the columns from the connector_url
    //and returns the columns in the format that the form expects
    const queryObj = useQuery(
        ['columns', connector_url],
        async () => {
            const response = await fetch(encodeURI(connector_url))
            const data = await response.json()
            if (type === 'carto') return Object.keys(data.rows[0]) as string[]
            if (type === 'featureservice')
                return data.fields.map((field: any) => field.name) as string[]
            return [] as string[]
        },
        { enabled, onSuccess: (data) => onSuccess && onSuccess(data) }
    )
    return queryObj
}
