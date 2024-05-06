import Papa from 'papaparse'
import { useQuery } from 'react-query'
import { Schema as SchemaFn } from 'tableschema'

export interface Field {
    name: string
    type: string
    format: string
}

export interface Descriptor {
    fields?: Field[]
    missingValues: string[]
}

export const useDataDictionary = (
    file: File,
    resourceId: string,
    onSuccess: (data: any) => void,
    enabled: boolean
) => {
    return useQuery(
        [file, resourceId],
        async () => {
            const rows = await parseCsv(file as File)
            const schema = await SchemaFn.load({})
            await schema.infer(rows.data)
            const descriptor: Descriptor =
                schema.descriptor as unknown as Descriptor
            return descriptor.fields ?? null
        },
        {
            enabled,
            onSuccess: (data) => onSuccess(data),
        }
    )
}

export async function parseCsv(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            download: false,
            header: false,
            dynamicTyping: false,
            skipEmptyLines: true,
            transform: (value: string): string => {
                return value.trim()
            },
            complete: (results: any) => {
                return resolve(results)
            },
            error: (error: any) => {
                return reject(error)
            },
        })
    })
}
