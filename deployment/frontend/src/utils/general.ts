/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
export function formatDate(inputDate: string): string {
    const date = new Date(inputDate)
    const day = date.getDate()
    const month = date.toLocaleString('default', { month: 'short' })
    const year = date.getFullYear()

    return `${day} ${month} ${year}`
}

export function searchArrayForKeyword<T>(arr: T[], keyword: string): T[] {
    const results: T[] = []
    for (const obj of arr) {
        for (const key in obj) {
            if (
                typeof obj[key] === 'string' &&
                (obj[key] as string).includes(keyword)
            ) {
                results.push(obj)
                break
            }
        }
    }
    return results
}

export function filterObjects<T>(
    arrayObject: T[],
    filterObject: Record<string, string>
): T[] {
    return arrayObject.filter((item) => {
        return Object.keys(filterObject).every((key) => {
            const filterValue = filterObject[key]
            const itemValue = (item as Record<string, string>)[key]

            if (key === 'groupId') {
                const groupIds = (item as Record<string, string[] | undefined>)
                    .packageGroup
                if (groupIds !== undefined) {
                    return groupIds.includes(filterValue as string)
                }
            }
            if (key === 'timestamp') {
                return isWithinTimeframe(itemValue!, filterValue!)
            }
            return filterValue === itemValue
        })
    })
}

export function getKeyValues<T, K extends keyof T>(
    array: T[],
    key: K,
    index: K
): { id: string; label: string }[] {
    const o: {
        id: string
        label: string
    }[] = array.map((item, i) => ({
        id: item[index] as string,
        label: item[key] as string,
    }))

    return o
}

export function getKeyValues2<T, K extends keyof T>(
    array: T[],
    key: K,
    index: K
): { id: string; label: T[K] | string }[] {
    const keyValueMap = new Map<string, string>()
    const result: { id: string; label: string }[] = []

    array.forEach((item, i) => {
        const keyValue = item[key]
        if (!keyValueMap.has(keyValue as string)) {
            keyValueMap.set(keyValue as string, item[index] as string)
            result.push({
                id: item[index] as string,
                label: item[key] as string,
            })
        }
    })
    return result
}

function isWithinTimeframe(isoTimestamp: string, timeframe: string): boolean {
    const timestamp = new Date(isoTimestamp).getTime()
    const now = Date.now()
    const millisecondsInDay = 24 * 60 * 60 * 1000 // 1 day
    const millisecondsInWeek = 7 * millisecondsInDay
    const millisecondsInMonth = 30 * millisecondsInDay // Assuming a month is 30 days
    const millisecondsInYear = 365 * millisecondsInDay // Assuming a year is 365 days

    switch (timeframe) {
        case 'day':
            return now - timestamp < millisecondsInDay
        case 'week':
            return now - timestamp < millisecondsInWeek
        case 'month':
            return now - timestamp < millisecondsInMonth
        case 'year':
            return now - timestamp < millisecondsInYear
        default:
            return true
    }
}

// Function to test if any pattern matches the string
export function matchesAnyPattern(item: string): boolean {
    const patterns: RegExp[] = [
        /resource\[\d+\]\.connector/,
        /modified/,
        /datastore_active/,
        /rw_id/,
        /new/,
        /preview/,
        /hash/,
        /total_record_count/,
    ]
    return !patterns.some((pattern) => pattern.test(item))
}

export const datasetFormFieldmap: Record<string, string> = {
    title: 'Title',
    url: 'Source',
    language: 'Language',
    team: 'Team',
    project: 'Project',
    application: 'Application',
    topics: 'Topics',
    technical_notes: 'Technical notes',
    tags: 'Tags',
    temporal_coverage_start: 'Temporal Coverage',
    update_frequency: 'Update Frequency',
    visibility_type: 'Visibility',
    license_id: 'License',
    featured_dataset: 'Featured dataset',
    featured_image: 'Featured image',
    spatial: 'spatial',
    short_description: ' Short Description',
    notes: 'Description',
    author: 'author',
    author_email: 'Author Emai',
    maintainer: 'Maintainer Name',
    maintainer_email: 'Maintainer Email',
    learn_more: 'Learn more',
    function: 'function',
    restrictions: 'Restrictions',
    reason_for_adding: 'Reason for adding',
    owner_org: 'Team',
}

export function formatDiff(
    data: Record<string, { old_value: string; new_value: string }>
) {
    const outputDiff: Record<
        string,
        { old_value: string | string[]; new_value: string | string[] }
    > = {}
    if (data) {
        for (const key in data) {
            if (
                !key.startsWith('resource') &&
                (key.match(/\[\d+\]\.\w+/) || key.match(/\[\d+\]/))
            ) {
                if (
                    key.includes('display_name') ||
                    //@ts-ignore
                    Object.keys(data[key]?.old_value).includes('display_name')
                ) {
                    let newKey = key.split('[')[0]
                    newKey = newKey === 'groups' ? 'Topics' : newKey
                    //@ts-ignore
                    outputDiff[newKey] = outputDiff[newKey] || {
                        old_value: [],
                        new_value: [],
                    }
                    if (
                        //@ts-ignore
                        Object.keys(data[key]?.old_value).includes(
                            'display_name'
                        )
                    ) {
                        //@ts-ignore
                        outputDiff[newKey].old_value.push(
                            //@ts-ignore
                            data[key]?.old_value['display_name']
                        )
                        //@ts-ignore
                        outputDiff[newKey].new_value.push(data[key]?.new_value)
                    } else {
                        //@ts-ignore
                        outputDiff[newKey].old_value.push(data[key]?.old_value)
                        //@ts-ignore
                        outputDiff[newKey].new_value.push(data[key]?.new_value)
                    }
                }
            } else if (key.startsWith('resources[')) {
                if (matchesAnyPattern(key)) {
                    const mainKey = key.split('.')[0]!
                    const subKey = key.split('.').slice(1).join('.')!
                    console.log('MAINKEY, SUBKEY: ', mainKey, subKey)
                    if (subKey) {
                        //@ts-ignore
                        outputDiff[mainKey] = outputDiff[mainKey] || {
                            old_value: [],
                            new_value: [],
                        }
                        const old_value = `${subKey
                            .split('_')
                            .join(' ')}: ${JSON.stringify(
                            data[key]?.old_value,
                            null,
                            2
                        )}`
                        const new_value = `${subKey
                            .split('_')
                            .join(' ')}: ${JSON.stringify(
                            data[key]?.new_value,
                            null,
                            2
                        )}`
                        //@ts-ignore
                        outputDiff[mainKey].old_value.push(old_value)
                        //@ts-ignore
                        outputDiff[mainKey].new_value.push(new_value)
                    } else {
                        outputDiff[mainKey] = {
                            //@ts-ignore
                            old_value: data[key]?.old_value,
                            //@ts-ignore
                            new_value: data[key]?.new_value,
                        }
                    }
                }
            } else {
                if (key in datasetFormFieldmap) {
                    const newKey = datasetFormFieldmap[key]!
                    //@ts-ignore
                    outputDiff[newKey] = data[key]
                } else {
                    if (
                        matchesAnyPattern(key) &&
                        !['draft', 'state'].includes(key)
                    ) {
                        const newKey = key.split('_').join(' ')
                        //@ts-ignore
                        outputDiff[newKey] = data[key]
                    }
                }
            }
        }
    }
    return outputDiff
}
