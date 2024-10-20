import { ErrorAlert } from '@/components/_shared/Alerts'
import { Button, LoaderButton } from '@/components/_shared/Button'
import { CreateDatasetTabs } from '@/components/dashboard/datasets/admin/CreateDatasetTabs'
import { CreateDataFilesSection } from '@/components/dashboard/datasets/admin/datafiles/CreateDatafilesSection'
import { CreateLayersSection } from '@/components/dashboard/datasets/admin/datafiles/CreateLayersSection'
import { CustomFieldsForm } from '@/components/dashboard/datasets/admin/metadata/CustomFields'
import { DescriptionForm } from '@/components/dashboard/datasets/admin/metadata/DescriptionForm'
import { MoreDetailsForm } from '@/components/dashboard/datasets/admin/metadata/MoreDetails'
import { OverviewForm } from '@/components/dashboard/datasets/admin/metadata/Overview'
import { PointOfContactForm } from '@/components/dashboard/datasets/admin/metadata/PointOfContact'
import { Preview } from '@/components/dashboard/datasets/admin/preview/Preview'
import { DatasetFormType, DatasetSchema } from '@/schema/dataset.schema'
import { api } from '@/utils/api'
import classNames from '@/utils/classnames'
import notify from '@/utils/notify'
import { slugify } from '@/utils/slugify'
import { Tab } from '@headlessui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { match } from 'ts-pattern'
import { v4 as uuidv4 } from 'uuid'
import { OpenInForm } from './metadata/OpenIn'
import Link from 'next/link'
import { LocationForm } from './metadata/LocationForm'
import dynamic from 'next/dynamic'
const Modal = dynamic(() => import('@/components/_shared/Modal'), {
    ssr: false,
})
import { InformationCircleIcon } from '@heroicons/react/24/outline'
import { Dialog } from '@headlessui/react'
import { VersioningForm } from './metadata/VersioningForm'
import { ErrorMessage } from '@hookform/error-message'

export default function CreateDatasetForm() {
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [isOpen, setIsOpen] = useState(false)
    const router = useRouter()

    const formObj = useForm<DatasetFormType>({
        resolver: zodResolver(DatasetSchema),
        mode: 'onBlur',
        defaultValues: {
            team: {
                value: '',
                label: '',
                id: '',
            },
            update_frequency: {
                value: 'monthly',
                label: 'Monthly',
            },
            visibility_type: {
                value: 'private',
                label: 'Private',
            },
            language: {
                value: '',
                label: '',
            },
            title: '',
            name: '',
            temporal_coverage_start: null,
            temporal_coverage_end: null,
            license_id: {
                value: 'notspecified',
                label: 'License not specified',
            },
            resources: [
                {
                    resourceId: uuidv4(),
                    title: 'Example title',
                    type: 'empty-file',
                    format: '',
                    schema: [],
                },
                {
                    resourceId: uuidv4(),
                    title: 'Example layer',
                    type: 'empty-layer',
                    format: '',
                    schema: [],
                },
            ],
        },
    })

    const createDataset = api.dataset.createDataset.useMutation({
        onSuccess: async ({ title, name, visibility_type }) => {
            notify(
                `Successfully created the "${title ?? name}" dataset`,
                'success'
            )
            setIsOpen(false)
            router.push('/dashboard/datasets')
            formObj.reset()
        },
        onError: (error) => {
            setErrorMessage(error.message)
        },
    })

    const {
        setValue,
        watch,
        trigger,
        formState: { dirtyFields, errors },
    } = formObj

    useEffect(() => {
        if (!dirtyFields['name']) setValue('name', slugify(watch('title')))
    }, [watch('title')])

    return (
        <>
            <Tab.Group
                selectedIndex={selectedIndex}
                onChange={setSelectedIndex}
            >
                <div className="mx-auto w-full mb-5 3xl:max-w-[1380px]">
                    <CreateDatasetTabs currentStep={selectedIndex} />
                </div>
                <Tab.Panels>
                    <Tab.Panel as="div">
                        <form
                            className="flex flex-col gap-y-12"
                            id="create_dataset_form"
                            onSubmit={formObj.handleSubmit((data) => {
                                createDataset.mutate(data)
                            })}
                        >
                            <OverviewForm formObj={formObj} />
                            <LocationForm formObj={formObj} />
                            <DescriptionForm formObj={formObj} />
                            <PointOfContactForm formObj={formObj} />
                            <MoreDetailsForm formObj={formObj} />
                            <OpenInForm formObj={formObj} />
                            <VersioningForm formObj={formObj} />
                            <CustomFieldsForm formObj={formObj} />
                        </form>
                    </Tab.Panel>
                    <Tab.Panel as="div" className="flex flex-col gap-y-12">
                        <CreateDataFilesSection formObj={formObj} />
                    </Tab.Panel>
                    <Tab.Panel as="div" className="flex flex-col gap-y-12">
                        <CreateLayersSection formObj={formObj} />
                    </Tab.Panel>
                    <Tab.Panel as="div">
                        <form
                            className="flex flex-col gap-y-12"
                            id="create_dataset_form"
                            onSubmit={formObj.handleSubmit((data) => {
                                createDataset.mutate(data)
                            })}
                        >
                            <Preview formObj={formObj} />
                        </form>
                    </Tab.Panel>
                </Tab.Panels>
            </Tab.Group>
            <div
                className={classNames(
                    'w-full mx-auto sm:px-6 xxl:px-0 max-w-[1380px]',
                    selectedIndex === 2 ? 'max-w-[71rem]' : ''
                )}
            >
                {errorMessage && (
                    <div className="py-4">
                        <ErrorAlert text={errorMessage} />
                    </div>
                )}
                {Object.keys(formObj.formState.errors).length > 0 && (
                    <div className="py-4">
                        <ErrorAlert
                            text={
                                <div>
                                    The following fields have invalid
                                    information
                                    <ul>
                                        {Object.entries(
                                            formObj.formState.errors
                                        ).map(([key, _value]) => {
                                            return (
                                                <li key={key}>
                                                    {key}:{' '}
                                                    <ErrorMessage
                                                        errors={
                                                            formObj.formState
                                                                .errors
                                                        }
                                                        render={({
                                                            message,
                                                        }) => (
                                                            <>
                                                                {message ??
                                                                    (
                                                                        _value as any
                                                                    )?.value
                                                                        ?.message ??
                                                                    'Invalid data'}
                                                            </>
                                                        )}
                                                        name={key}
                                                    />
                                                </li>
                                            )
                                        })}
                                    </ul>
                                </div>
                            }
                        />
                    </div>
                )}
            </div>
            <div
                className={classNames(
                    'flex-col sm:flex-row mt-5 gap-y-4 mx-auto flex w-full max-w-[1380px] justify-between font-acumin text-2xl font-semibold text-black px-4 xl:px-0',
                    selectedIndex === 3 ? 'max-w-[71rem] xxl:px-0' : ''
                )}
            >
                <Button
                    onClick={() => setIsOpen(true)}
                    variant="muted"
                    type="button"
                    className="w-fit"
                >
                    Save as Draft
                </Button>
                <div className="flex items-center gap-x-2 flex-wrap gap-y-5">
                    <Link
                        href="/dashboard/datasets"
                        className="inline-flex items-center justify-center ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border bg-none hover:bg-amber-400 hover:text-black border-amber-400 font-semibold h-11 px-6 py-4 rounded-[3px] text-base"
                    >
                        Cancel
                    </Link>
                    {selectedIndex !== 0 && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setSelectedIndex(selectedIndex - 1)}
                        >
                            Back
                        </Button>
                    )}
                    {selectedIndex !== 3 && (
                        <Button
                            type="button"
                            onClick={async () => {
                                const ok = await trigger()
                                if (!ok) return
                                setSelectedIndex(selectedIndex + 1)
                            }}
                        >
                            Next:{' '}
                            {match(selectedIndex)
                                .with(0, () => 'Datafiles')
                                .with(1, () => 'Map Visualizations')
                                .otherwise(() => 'Preview')}
                        </Button>
                    )}
                    {selectedIndex === 3 && (
                        <LoaderButton
                            loading={createDataset.isLoading}
                            type="submit"
                            form="create_dataset_form"
                        >
                            Save
                        </LoaderButton>
                    )}
                </div>
                <Modal
                    open={isOpen}
                    setOpen={setIsOpen}
                    className="sm:w-full sm:max-w-lg"
                >
                    <div className="sm:flex sm:items-start">
                        <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                            <InformationCircleIcon
                                className="h-6 w-6 text-green-600"
                                aria-hidden="true"
                            />
                        </div>
                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                            <Dialog.Title
                                as="h3"
                                className="text-base font-semibold leading-6 text-gray-900"
                            >
                                Save as Draft
                            </Dialog.Title>
                            <div className="mt-2">
                                <p className="text-sm text-gray-500">
                                    Are you sure you want to save this dataset
                                    as draft?
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-5 sm:mt-4 gap-x-4 sm:flex sm:flex-row-reverse">
                        <LoaderButton
                            variant="default"
                            loading={createDataset.isLoading}
                            onClick={formObj.handleSubmit((data) => {
                                createDataset.mutate({
                                    ...data,
                                    visibility_type: {
                                        value: 'draft',
                                        label: 'Draft',
                                    },
                                })
                            })}
                        >
                            Save as Draft
                        </LoaderButton>
                        <Button
                            variant="outline"
                            type="button"
                            onClick={() => setIsOpen(false)}
                        >
                            Cancel
                        </Button>
                    </div>
                </Modal>
            </div>
        </>
    )
}
