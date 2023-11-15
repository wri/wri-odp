//function that replaces the first ocorrence of groups to topic
export function replaceNames(error: string) {
    return error
        .replace('group', 'topic')
        .replace('groups', 'topic')
        .replace('Group', 'Topic')
        .replace('Groups', 'Topic')
        .replace('organization', 'team')
        .replace('organizations', 'teams')
        .replace('Organization', 'Team')
        .replace('Organizations', 'Teams')
}
