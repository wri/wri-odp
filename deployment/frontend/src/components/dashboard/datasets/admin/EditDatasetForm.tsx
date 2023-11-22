import { WriDataset } from '@/schema/ckan.schema'
import { DatasetFormType, DatasetSchema } from '@/schema/dataset.schema'
import classNames from '@/utils/classnames'
import { Tab } from '@headlessui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/router'
import { Fragment, useState } from 'react'
import { useForm } from 'react-hook-form'
import { OverviewForm } from './metadata/Overview'
import { DescriptionForm } from './metadata/DescriptionForm'
import { PointOfContactForm } from './metadata/PointOfContact'
import { MoreDetailsForm } from './metadata/MoreDetails'
import { OpenInForm } from './metadata/OpenIn'
import { CustomFieldsForm } from './metadata/CustomFields'
import {
    languageOptions,
    updateFrequencyOptions,
    visibilityOptions,
} from './formOptions'
import { api } from '@/utils/api'
import notify from '@/utils/notify'
import { Button, LoaderButton } from '@/components/_shared/Button'
import Link from 'next/link'
import { ErrorAlert } from '@/components/_shared/Alerts'
import { EditDataFilesSection } from './datafiles/EditDataFilesSection'

const tabs = [
    { name: 'Metadata' },
    { name: 'Data Files' },
    { name: 'Collaborators' },
]

//change image
//change title
//change some rich text field
// add another open in
// remove an extra
// change language
// remove topic
// add tag
// change temporal coverage

export default function EditDatasetForm({ dataset }: { dataset: WriDataset }) {
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const router = useRouter()
    const possibleLicenses = api.dataset.getLicenses.useQuery()
    const license = possibleLicenses.data?.find(
        (license) => license.id === dataset.license_id
    )

    const formObj = useForm<DatasetFormType>({
        resolver: zodResolver(DatasetSchema),
        mode: 'onBlur',
        defaultValues: {
            ...dataset,
            id: dataset.id,
            tags: dataset.tags ? dataset.tags.map((tag) => tag.name) : [],
            temporal_coverage_start: Number(dataset.temporal_coverage_start),
            temporal_coverage_end: Number(dataset.temporal_coverage_end),
            update_frequency: updateFrequencyOptions.find(
                (option) => option.value === dataset.update_frequency
            ),
            language: languageOptions.find(
                (option) => option.value === dataset.language
            ),
            topics: dataset.groups
                ? dataset.groups.map((group) => group.name)
                : [],
            team: dataset.organization
                ? {
                      value: dataset.organization.name,
                      label: dataset.organization.title,
                      id: dataset.organization.id,
                  }
                : { value: '', label: 'No Team', id: '' },
            license_id: license
                ? { value: license.id, label: license.title }
                : undefined,
            visibility_type: visibilityOptions.find(
                (option) => option.value === dataset.visibility_type
            ),
            resources: dataset.resources.map((resource) => ({
                ...resource,
                schema: resource.schema ? resource.schema.value : undefined,
            })),
        },
    })

    const editDataset = api.dataset.editDataset.useMutation({
        onSuccess: async ({ title, name, visibility_type }) => {
            notify(
                `Successfully edited the "${title ?? name}" dataset`,
                'success'
            )
            router.push('/dashboard/datasets')
            formObj.reset()
        },
        onError: (error) => {
            setErrorMessage(error.message)
        },
    })

    return (
        <form
            onSubmit={formObj.handleSubmit((data) => {
                console.log('Data', data)
                editDataset.mutate(data)
            })}
        >
            <Tab.Group>
                <div>
                    <Tab.List
                        className="max-w-[1380px] mx-auto px-4 sm:px-6 xxl:px-0"
                        aria-label="Tabs"
                    >
                        <div className="flex-col justify-start flex sm:flex-row gap-y-4 sm:gap-x-8 sm:border-b-2 border-gray-300 w-full">
                            {tabs.map((tab) => (
                                <Tab as={Fragment}>
                                    {({ selected }) => (
                                        <div
                                            key={tab.name}
                                            className={classNames(
                                                'sm:px-8 border-b-2 sm:border-none text-black text-[22px] font-normal font-acumin whitespace-nowrap',
                                                selected
                                                    ? 'border-wri-green sm:border-solid text-wri-dark-green sm:border-b-2 -mb-px'
                                                    : 'text-black'
                                            )}
                                            aria-current={
                                                selected ? 'page' : undefined
                                            }
                                        >
                                            {tab.name}
                                        </div>
                                    )}
                                </Tab>
                            ))}
                        </div>
                    </Tab.List>
                    <Tab.Panels>
                        <Tab.Panel
                            as="div"
                            className="flex flex-col gap-y-12 mt-8"
                        >
                            <OverviewForm formObj={formObj} />
                            <DescriptionForm formObj={formObj} />
                            <PointOfContactForm formObj={formObj} />
                            <MoreDetailsForm formObj={formObj} />
                            <OpenInForm formObj={formObj} />
                            <CustomFieldsForm formObj={formObj} />
                        </Tab.Panel>
                        <Tab.Panel
                            as="div"
                            className="flex flex-col gap-y-12 mt-8"
                        >
                            <EditDataFilesSection formObj={formObj} />
                        </Tab.Panel>
                    </Tab.Panels>
                </div>
            </Tab.Group>
            <div
                className={classNames(
                    'w-full mx-auto sm:px-6 xxl:px-0 max-w-[1380px]'
                )}
            >
                {errorMessage && (
                    <div className="py-4">
                        <ErrorAlert text={errorMessage} />
                    </div>
                )}
            </div>
            <div className="flex-col sm:flex-row mt-5 gap-y-4 mx-auto flex w-full max-w-[1380px] gap-x-4 justify-end font-acumin text-2xl font-semibold text-black px-4  sm:px-6 xxl:px-0">
                <Button type="button" variant="outline">
                    <Link href="/dashboard/datasets">Cancel</Link>
                </Button>
                <LoaderButton loading={editDataset.isLoading} type="submit">
                    Update Dataset
                </LoaderButton>
            </div>
        </form>
    )
}
