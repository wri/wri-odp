type Only<T, U> = {
    [P in keyof T]: T[P]
} & {
    [P in keyof U]?: never
}

type Either<T, U> = Only<T, U> | Only<U, T>

export interface CkanResponse<T> {
    help: string
    success: boolean
    error?: {
        __type: string
        message: string
    }
    result: Either<T, { errors: any; error_summary: any }>
}
