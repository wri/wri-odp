// @ts-nocheck
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

            // if (key === 'groupId') {
            //     const groupIds = (item as Record<string, string[] | undefined>)
            //         .packageGroup
            //     if (groupIds !== undefined) {
            //         return groupIds.includes(filterValue as string)
            //     }
            // }
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
    spatial_type: 'Spatial Type',
    short_description: ' Short Description',
    notes: 'Description',
    author: 'author',
    author_email: 'Author Email',
    maintainer: 'Maintainer Name',
    maintainer_email: 'Maintainer Email',
    authors: 'Authors',
    author_emails: 'Author Emails',
    maintainers: 'Maintainers',
    maintainer_emails: 'Maintainer Emails',
    learn_more: 'Learn more',
    open_in: 'Open In',
    function: 'Function',
    cautions: 'Cautions',
    methodology: 'Methodology',
    usecases: 'Advanced API Usage',
    restrictions: 'Restrictions',
    reason_for_adding: 'Reason for adding',
    owner_org: 'Team',
}

//@ts-nocheck
export function formatDiff(
    data: Record<string, { old_value: string; new_value: string }> | null
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
                const keyoldNew = data[key]?.old_value ?? data[key]?.new_value
                if (
                    key.includes('display_name') ||
                    key.includes('name') ||
                    (keyoldNew && Object.keys(keyoldNew).includes('name'))
                ) {
                    if (key.includes('display_name')) {
                        continue
                    }
                    let newKey = key.split('[')[0]
                    newKey = newKey === 'groups' ? 'Topics' : newKey

                    outputDiff[newKey] = outputDiff[newKey] || {
                        old_value: [],
                        new_value: [],
                    }
                    if (Object.keys(keyoldNew).includes('name')) {
                        if (data[key]?.old_value) {
                            outputDiff[newKey].old_value.push(
                                data[key]?.old_value['name']
                            )
                        } else {
                            outputDiff[newKey].old_value.push(
                                data[key]?.old_value
                            )
                        }

                        if (data[key]?.new_value) {
                            outputDiff[newKey].new_value.push(
                                data[key]?.new_value['name']
                            )
                        } else {
                            outputDiff[newKey].new_value.push(
                                data[key]?.new_value
                            )
                        }
                    } else {
                        outputDiff[newKey].old_value.push(data[key]?.old_value)

                        outputDiff[newKey].new_value.push(data[key]?.new_value)
                    }
                }
            } else if (key.startsWith('resources[')) {
                if (matchesAnyPattern(key)) {
                    const mainKey = key.split('.')[0]!
                    const subKey = key.split('.').slice(1).join('.')!
                    if (subKey) {
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

                        if (
                            subKey.includes('layerObj') ||
                            subKey.includes('layerRaw')
                        ) {
                            if (!subKey.includes('.')) {
                                const layerold = data[key]?.old_value
                                const layerNew = data[key]?.new_value
                                if (layerold === null || layerold === 'null') {
                                    outputDiff[mainKey].old_value.push(layerold)

                                    outputDiff[mainKey].new_value.push(
                                        layerNew['name']
                                    )
                                } else if (
                                    layerNew === null ||
                                    layerNew === 'null'
                                ) {
                                    outputDiff[mainKey].old_value.push(
                                        layerold['name']
                                    )

                                    outputDiff[mainKey].new_value.push(layerNew)
                                }
                            } else {
                                outputDiff[mainKey].old_value.push(old_value)

                                outputDiff[mainKey].new_value.push(new_value)
                            }
                        }

                        outputDiff[mainKey].old_value.push(old_value)

                        outputDiff[mainKey].new_value.push(new_value)
                    } else {
                        outputDiff[mainKey] = {
                            old_value:
                                data[key]?.old_value === null ||
                                data[key]?.old_value === 'null'
                                    ? null
                                    : data[key]?.old_value['name'] ??
                                      data[key]?.old_value['title'],

                            new_value:
                                data[key]?.new_value === null ||
                                data[key]?.new_value === 'null'
                                    ? null
                                    : data[key]?.new_value['name'] ??
                                      data[key]?.new_value['title'],
                        }
                    }
                }
            } else if (key === 'authors' || key === 'maintainers') {
                const newKey = datasetFormFieldmap[key]!
                const old_value = data[key]?.old_value
                const new_value = data[key]?.new_value
                outputDiff[newKey] = {
                    old_value: old_value
                        ? JSON.parse(old_value)
                        : data[key]?.old_value ?? '',
                    new_value: new_value
                        ? JSON.parse(new_value)
                        : data[key]?.new_value ?? '',
                }
            } else {
                if (key in datasetFormFieldmap) {
                    const newKey = datasetFormFieldmap[key]!

                    outputDiff[newKey] = data[key]
                } else {
                    if (
                        matchesAnyPattern(key) &&
                        !['draft', 'state'].includes(key)
                    ) {
                        const newKey = key.split('_').join(' ')

                        outputDiff[newKey] = data[key]
                    }
                }
            }
        }
    }
    return outputDiff
}
