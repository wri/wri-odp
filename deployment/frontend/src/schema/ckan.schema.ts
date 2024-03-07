import { Dataset, Resource } from '@/interfaces/dataset.interface'
import type {
    Group,
    Tag,
    Activity as CkanActivity,
    User as CkanUser,
} from '@portaljs/ckan'

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
    result: T
}

export interface User {
    id?: string
    name?: string
    fullname?: string
    created?: string
    about?: null
    activity_streams_email_notifications?: boolean
    sysadmin?: boolean
    state?: 'active' | 'inactive' | 'deleted'
    image_url?: string
    display_name?: string
    email_hash?: string
    number_created_packages?: number
    apikey?: string
    email?: string
    image_display_url?: string
    capacity?: string
}

export interface Activity {
    id: string
    timestamp: string
    user_id: string
    object_id?: string
    activity_type: string
    user_data?: User
    data: Record<
        string,
        {
            title?: string
            owner_org?: string
            groups: {
                id: string
            }[]
        }
    >
}

export interface ActivityDisplay {
    description: string
    time: string
    icon: string
    action: string
    timestamp: string
    actionType: string
    orgId?: string
    packageId?: string
    groupId?: string
    packageGroup?: string[]
}

export interface WriDataset extends Dataset {
    has_chart_views?: boolean
    methodology?: string
    technical_notes?: string
    temporal_coverage_start: string
    temporal_coverage_end: string
    update_frequency:
        | 'annually'
        | 'biannually'
        | 'quarterly'
        | 'monthly'
        | 'weekly'
        | 'daily'
        | 'as_needed'
        | 'hourly'
    visibility_type: 'public' | 'private' | 'internal' | 'draft'
    short_description?: string
    project?: string
    reason_for_adding?: string
    featured_dataset?: boolean
    wri_data?: boolean
    creator_user_id: string
    language?: string
    featured_image?: string
    application?: string
    cautions?: string
    citation?: string
    function?: string
    isopen?: boolean
    rw_id?: string
    learn_more?: string
    restrictions?: string
    open_in: OpenIn[]
    extras?: Extra[]
    spatial?: any
    spatial_address?: string
    connectorUrl?: string
    connectorType?: string
    provider?: string
    tableName?: string
    user?: User
    approval_status?: string
    draft?: boolean
    issue_count?: number
    resources: Resource[]
    rw_dataset?: boolean
    is_approved?: boolean
    release_notes: string
}

export interface Extra {
    key: string
    value: string
}

export interface OpenIn {
    title: string
    url: string
}

export interface Organization {
    id: string
    name: string
    title: string
    display_name?: string
    type?: string
    description?: string
    image_url?: string
    image_display_url?: string
    created?: string
    is_organization: boolean
    package_count?: number
    approval_status?: 'approved'
    state: 'active'
    packages?: Array<Dataset>
    activity_stream?: Array<CkanActivity>
    users?: Array<User>
    tags?: Array<Tag>
}

export interface WriOrganization extends Organization {
    groups?: Group[]
    users?: WriUser[]
    capacity?: string
}

export interface WriUser extends CkanUser {
    capacity?: string
    gravatar_url?: string
    organizations?: WriOrganization[]
}

export interface GroupTree {
    id: string
    name: string
    highlighted: boolean
    children: GroupTree[]
    title?: string
    image_display_url?: string
}

export interface Collaborator {
    package_id: string
    user_id: string
    capacity: 'admin' | 'editor' | 'member'
    modified: string
}

export interface Issue {
    id: number
    number: number
    title: string
    description: string
    dataset_id: string
    user_id: string
    status: string
    resolved: string
    created: string
    visibility: string
    abuse_status: string
    user: string
    comment_count: number
    comments: Comment[]
}

export interface Comment {
    id: number
    comment: string
    user_id: string
    issue_id: number
    created: string
    visibility: string
    abuse_status: string
    user: WriUser
}

export interface FolloweeList {
    type: string
    display_name: string
    dict: WriDataset | WriOrganization | WriUser | Group
}

export interface GroupsmDetails {
    img_url: string
    description: string
    package_count: number
    name: string
}

export interface Member {
    id: string
    name: string
    email: string
    role: string
    team: string
    teamId: string
}

export interface PendingDataset {
    package_id: string
    package_data: WriDataset
    last_modified: string
}
