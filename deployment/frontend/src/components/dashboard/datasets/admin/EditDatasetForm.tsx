import { Collaborator, WriDataset } from '@/schema/ckan.schema'
import {
    CapacityUnion,
    DataDictionaryFormType,
    DatasetFormType,
    DatasetSchema,
    ResourceFormType,
} from '@/schema/dataset.schema'
import classNames from '@/utils/classnames'
import { Tab } from '@headlessui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/router'
import { Fragment, useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { OverviewForm } from './metadata/Overview'
import { DescriptionForm } from './metadata/DescriptionForm'
import { PointOfContactForm } from './metadata/PointOfContact'
import { MoreDetailsForm } from './metadata/MoreDetails'
import { OpenInForm } from './metadata/OpenIn'
import { CustomFieldsForm } from './metadata/CustomFields'
import {
    capacityOptions,
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
import { useSession } from 'next-auth/react'
import { match } from 'ts-pattern'
import { Collaborators } from './metadata/Collaborators'
import dynamic from 'next/dynamic'
const Modal = dynamic(() => import('@/components/_shared/Modal'), {
    ssr: false,
})
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { Dialog } from '@headlessui/react'
import { LocationForm } from './metadata/LocationForm'
import { EditRwSection } from './datafiles/EditRwSection'
import form from '@/components/vizzuality/1.3-components/form'
import { VersioningForm } from './metadata/VersioningForm'

function getDiff<T>(dirtyObject: T, changedFields: string[]) {
    for (const key in dirtyObject) {
        const value = dirtyObject[key]
        if (typeof value !== 'boolean') {
            if (Array.isArray(value) && value.length > 0) {
                const arrayChanged: string[] = []
                const changed = getDiff(value, arrayChanged)
                if (changed.length > 0) {
                    changedFields.push(key)
                }
            } else if (typeof value === 'object') {
                //@ts-ignore
                if (Object.keys(value).length > 0) {
                    const objChange: string[] = []
                    const changed = getDiff(value, objChange)
                    if (changed.length > 0) {
                        changedFields.push(key)
                    }
                }
            }
        } else {
            if (value) {
                changedFields.push(key)
            }
        }
    }
    return changedFields
}

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
    const { data: teamUsers } = api.teams.getTeamUsers.useQuery(
        {
            id: dataset.organization?.id ?? dataset.owner_org ?? '',
            capacity: 'admin',
        },
        { enabled: !!dataset.organization?.id }
    )
    const license = possibleLicenses.data?.find(
        (license) => license.id === dataset.license_id
    )
    const session = useSession()
    const { data: collaborators } =
        api.dataset.getDatasetCollaborators.useQuery({
            id: dataset.name,
        })

    const canEditCollaborators = match(session.data?.user.sysadmin ?? false)
        .with(true, () => true)
        .with(false, () => {
            if (dataset.creator_user_id === session.data?.user.id) return true
            if (teamUsers && teamUsers.length > 0) {
                return teamUsers.some(
                    (user: string[]) => user[0] === session.data?.user.id
                )
            }
            return collaborators
                ? collaborators.some(
                      (collaborator) =>
                          collaborator.id === session.data?.user.id &&
                          collaborator.capacity === 'admin'
                  )
                : false
        })
        .otherwise(() => false)

    const resourceForm = dataset.resources.sort((a, b) => {
        const isLayer = (r: any) =>
            r.type === 'layer' ||
            r.type === 'layer-raw' ||
            r.type === 'empty-layer'

        const isALayer = isLayer(a)
        const isBLayer = isLayer(b)

        if (isALayer && isBLayer) {
            return 0
        }

        if (!isALayer && isBLayer) {
            return -1
        }

        if (isALayer && !isBLayer) {
            return 1
        }

        return 0
    }) as unknown as ResourceFormType[]
    const formObj = useForm<DatasetFormType>({
        resolver: zodResolver(DatasetSchema),
        mode: 'onBlur',
        defaultValues: {
            ...dataset,
            id: dataset.id,
            rw_id: dataset.rw_id,
            author_email: dataset?.author_email ? dataset.author_email : null,
            rw_dataset: dataset.rw_id ? !!dataset.rw_id : !!dataset.rw_dataset,
            tags: dataset.tags ? dataset.tags.map((tag) => tag.name) : [],
            temporal_coverage_start: dataset.temporal_coverage_start
                ? Number(dataset.temporal_coverage_start)
                : null,
            temporal_coverage_end: dataset.temporal_coverage_end
                ? Number(dataset.temporal_coverage_end)
                : null,
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
            collaborators: collaborators
                ? collaborators.map((collaborator) => ({
                      package_id: dataset.id,
                      user: {
                          value: collaborator.id,
                          label: collaborator.name,
                      },
                      capacity: capacityOptions.find(
                          (option) => option.value === collaborator.capacity
                      ),
                  }))
                : [],
            resources: resourceForm.map((resource) => {
                const schema = resource.schema as unknown as {
                    value: DataDictionaryFormType
                }
                return {
                    ...resource,
                    schema: resource.schema ? schema.value : undefined,
                }
            }),
            spatial_type: dataset.spatial_address
                ? 'address'
                : dataset.spatial
                ? 'geom'
                : undefined,
        },
    })

    const editDataset = api.dataset.editDataset.useMutation({
        onSuccess: async ({ title, name, visibility_type }) => {
            notify(
                `Successfully edited the "${title ?? name}" dataset`,
                'success'
            )
            window.location.href = '/dashboard/datasets'
        },
        onError: (error) => {
            setErrorMessage(error.message)
        },
    })

    const {
        formState: { dirtyFields, touchedFields },
    } = formObj

    const tabs = [
        { name: 'Metadata', enabled: true },
        { name: 'Data Files', enabled: true },
        { name: 'Layers / Dataset Views', enabled: true },
        { name: 'Collaborators', enabled: canEditCollaborators },
    ]

    return (
        <>
            <Tab.Group>
                <div>
                    <Tab.List
                        className="max-w-screen md:max-w-[1380px] mx-auto px-4 sm:px-6 xxl:px-0"
                        aria-label="Tabs"
                    >
                        <div className="flex-col justify-start flex lg:flex-row gap-y-4 sm:gap-x-8 sm:border-b-2 border-gray-300 w-full">
                            {tabs
                                .filter((tab) => tab.enabled)
                                .map((tab) => (
                                    <Tab key={tab.name} as={Fragment}>
                                        {({ selected }) => (
                                            <div
                                                key={tab.name}
                                                className={classNames(
                                                    'sm:px-8 cursor-pointer border-b-2 sm:border-none text-black text-[22px] font-normal font-acumin whitespace-nowrap',
                                                    selected
                                                        ? 'border-wri-green sm:border-solid text-wri-dark-green sm:border-b-2 -mb-px'
                                                        : 'text-black'
                                                )}
                                                aria-current={
                                                    selected
                                                        ? 'page'
                                                        : undefined
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
                            <form
                                onSubmit={formObj.handleSubmit((data) => {
                                    editDataset.mutate(data)
                                })}
                            >
                                <OverviewForm
                                    formObj={formObj}
                                    editing={true}
                                />
                                <LocationForm formObj={formObj} />
                                <DescriptionForm formObj={formObj} />
                                <PointOfContactForm formObj={formObj} />
                                <MoreDetailsForm formObj={formObj} />
                                <OpenInForm formObj={formObj} />
                                <VersioningForm formObj={formObj} />
                                <CustomFieldsForm formObj={formObj} />
                            </form>
                        </Tab.Panel>
                        <Tab.Panel
                            as="div"
                            className="flex flex-col gap-y-12 mt-8"
                        >
                            <EditDataFilesSection
                                formObj={formObj}
                                dataset={dataset}
                            />
                        </Tab.Panel>
                        <Tab.Panel
                            as="div"
                            className="flex flex-col gap-y-12 mt-8"
                        >
                            <EditRwSection
                                formObj={formObj}
                                dataset={dataset}
                            />
                        </Tab.Panel>
                        {canEditCollaborators && (
                            <Tab.Panel
                                as="div"
                                className="flex flex-col gap-y-12 mt-8"
                            >
                                <Collaborators
                                    formObj={formObj}
                                    dataset={dataset}
                                />
                            </Tab.Panel>
                        )}
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
                {/* <Button type="button" variant="outline"> */}
                <Link
                    href="/dashboard/datasets"
                    className="inline-flex items-center justify-center ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border bg-none hover:bg-amber-400 hover:text-black border-amber-400 font-semibold h-11 px-6 py-4 rounded-[3px] text-base"
                >
                    Cancel
                </Link>
                {/* </Button> */}
                <LoaderButton
                    loading={editDataset.isLoading}
                    type="submit"
                    onClick={formObj.handleSubmit(
                        (data) => {
                            const diffLayerResources =
                                dirtyFields?.resources?.filter(
                                    (r) => !r?.layerObj
                                )

                            const newDirtyFields = {
                                ...dirtyFields,
                                resources: diffLayerResources
                                    ? diffLayerResources
                                    : false,
                            }

                            const changedFields: string[] = []

                            getDiff(newDirtyFields, changedFields)

                            const toBeSavedData: Partial<DatasetFormType> = data

                            const storedDirty =
                                sessionStorage.getItem('dirtyFields')

                            // check if layerobj was updated
                            if (storedDirty) {
                                sessionStorage.removeItem('dirtyFields')
                                return editDataset.mutate(toBeSavedData)
                            } else {
                                const defaultvalues = structuredClone(
                                    formObj.formState.defaultValues
                                )
                                const newData = structuredClone(data)

                                // check if new resource was added
                                if (
                                    newData.resources?.length !==
                                    defaultvalues?.resources?.length
                                ) {
                                    return editDataset.mutate(toBeSavedData)
                                }

                                // check if changefield is just collaborators
                                if (
                                    changedFields.length === 1 &&
                                    changedFields[0] === 'collaborators'
                                ) {
                                    // filter out collaborators and id
                                    const newData = Object.fromEntries(
                                        Object.entries(toBeSavedData).filter(
                                            ([key]) =>
                                                [
                                                    'collaborators',
                                                    'id',
                                                ].includes(key)
                                        )
                                    )

                                    return editDataset.mutate(newData)
                                } else if (
                                    changedFields.length === 2 &&
                                    changedFields.includes('language')
                                ) {
                                    // check for language
                                    // language is set to dirty if `Add another {collaborator | data file} is clicked
                                    // so we need to check if the language is different from the default
                                    const defaultLang = defaultvalues?.language
                                        ? defaultvalues?.language
                                        : { value: '', label: '' }
                                    if (
                                        newData.language?.value !==
                                        defaultLang?.value
                                    ) {
                                        return editDataset.mutate(toBeSavedData)
                                    } else {
                                        if (
                                            changedFields.includes(
                                                'collaborators'
                                            )
                                        ) {
                                            const newData = Object.fromEntries(
                                                Object.entries(
                                                    toBeSavedData
                                                ).filter(([key]) =>
                                                    [
                                                        'collaborators',
                                                        'id',
                                                    ].includes(key)
                                                )
                                            )

                                            return editDataset.mutate(newData)
                                        } else {
                                            return editDataset.mutate(
                                                toBeSavedData
                                            )
                                        }
                                    }
                                } else if (changedFields.length > 0) {
                                    // if by anymeans the changed fields get here and is not empty
                                    return editDataset.mutate(toBeSavedData)
                                } else {
                                    notify(
                                        'No changes to the dataset',
                                        'success'
                                    )
                                    router.push('/dashboard/datasets')
                                }
                            }
                        },
                        (err) => {
                            console.error(err)
                        }
                    )}
                >
                    Update Dataset
                </LoaderButton>
            </div>
        </>
    )
}
