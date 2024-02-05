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
import { Fragment, useState } from 'react'
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
import Modal from '@/components/_shared/Modal'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { Dialog } from '@headlessui/react'
import { LocationForm } from './metadata/LocationForm'
import form from '@/components/vizzuality/1.3-components/form'
import { difference, differenceWith, isEqual } from 'lodash'
import {
    convertFormToLayerObj,
    getRawObjFromApiSpec,
} from './datafiles/sections/BuildALayer/convertObjects'
import { useStoreDirtyFields } from '@/utils/storeHooks'

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

    const resourceForm = dataset.resources as unknown as ResourceFormType[]
    const formObj = useForm<DatasetFormType>({
        resolver: zodResolver(DatasetSchema),
        mode: 'onBlur',
        defaultValues: {
            ...dataset,
            id: dataset.id,
            rw_id: dataset.rw_id,
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

    console.log('EDITING ERRORS', formObj.formState.errors)

    const editDataset = api.dataset.editDataset.useMutation({
        onSuccess: async ({ title, name, visibility_type }) => {
            notify(
                `Successfully edited the "${title ?? name}" dataset`,
                'success'
            )
            router.push('/dashboard/datasets')
        },
        onError: (error) => {
            setErrorMessage(error.message)
        },
    })

    const tabs = [
        { name: 'Metadata', enabled: true },
        { name: 'Data Files', enabled: true },
        { name: 'Collaborators', enabled: canEditCollaborators },
    ]

    return (
        <>
            <Tab.Group>
                <div>
                    <Tab.List
                        className="max-w-[1380px] mx-auto px-4 sm:px-6 xxl:px-0"
                        aria-label="Tabs"
                    >
                        <div className="flex-col justify-start flex sm:flex-row gap-y-4 sm:gap-x-8 sm:border-b-2 border-gray-300 w-full">
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
                                    console.log('Data', data)
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
                <Button type="button" variant="outline">
                    <Link href="/dashboard/datasets">Cancel</Link>
                </Button>
                <LoaderButton
                    loading={editDataset.isLoading}
                    type="submit"
                    onClick={formObj.handleSubmit(
                        (data) => {
                            const modifiedKeys = Object.keys(
                                formObj.formState.dirtyFields
                            )

                            const touchedKeys = Object.keys(
                                formObj.formState.touchedFields
                            )

                            modifiedKeys.concat(touchedKeys)

                            let newData: Partial<DatasetFormType> = data

                            if (
                                modifiedKeys.length === 1 &&
                                modifiedKeys[0] === 'collaborators'
                            ) {
                                newData = Object.fromEntries(
                                    Object.entries(data).filter(([key]) =>
                                        modifiedKeys.includes(key)
                                    )
                                )
                            }

                            if (modifiedKeys.length === 0) {
                                router.push('/dashboard/datasets')
                                return
                            } else {
                                editDataset.mutate(newData)
                            }
                        },
                        (err) => {
                            console.log(err)
                        }
                    )}
                >
                    Update Dataset
                </LoaderButton>
            </div>
        </>
    )
}
