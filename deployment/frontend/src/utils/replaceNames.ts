//function that replaces the first ocorrence of groups to topic
export function replaceNames(error: string, replaceTeam?: boolean) {
    return error
        .replace('organization', 'team')
        .replace('organizations', 'teams')
        .replace('Organization', 'Team')
        .replace('Organizations', 'Teams')
        .replace('group', replaceTeam ? 'team' : 'topic')
        .replace('groups', replaceTeam ? 'teams': 'topics')
        .replace('Group', replaceTeam ? 'Team' : 'Topic')
        .replace('Groups', replaceTeam ? 'Teams' : 'Topics')
}
