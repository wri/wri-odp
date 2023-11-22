import { UpdateFrequencyUnion, VisibilityTypeUnion } from "@/schema/dataset.schema"

export const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'French' },
    { value: 'pt', label: 'Portuguese' },
]

export const updateFrequencyOptions: { value: UpdateFrequencyUnion, label: string }[] = [
    {
        value: 'biannually',
        label: 'Biannually',
    },
    {
        value: 'quarterly',
        label: 'Quarterly',
    },
    {
        value: 'daily',
        label: 'Daily',
    },
    {
        value: 'hourly',
        label: 'Hourly',
    },
    {
        value: 'as_needed',
        label: 'As needed',
    },
    {
        value: 'monthly',
        label: 'Monthly',
    },
    { value: 'weekly', label: 'Weekly' },
    { value: 'annually', label: 'Annually' },
]

export const visibilityOptions: { value: VisibilityTypeUnion, label: string}[] = [
    { value: 'public', label: 'Public' },
    { value: 'internal', label: 'Internal Use' },
    {
        value: 'private',
        label: 'Private',
    },
]
