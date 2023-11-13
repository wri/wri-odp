import { ErrorAlert } from '@/components/_shared/Alerts'
import { Button, LoaderButton } from '@/components/_shared/Button'
import { CreateDatasetTabs } from '@/components/dashboard/datasets/admin/CreateDatasetTabs'
import { CreateDataFilesSection } from '@/components/dashboard/datasets/admin/datafiles/CreateDatafilesSection'
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

export default function CreateDatasetForm() {
    const datasetId = uuidv4()
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [selectedIndex, setSelectedIndex] = useState(0)
    const router = useRouter()

    const formObj = useForm<DatasetFormType>({
        resolver: zodResolver(DatasetSchema),
        mode: 'onBlur',
        defaultValues: {
            id: datasetId,
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
            temporalCoverageEnd: null,
            temporalCoverageStart: null,
            license: {
                value: 'notspecified',
                label: 'License not specified',
            },
            resources: [
                {
                    resourceId: uuidv4(),
                    title: 'Example title',
                    type: 'empty',
                    format: {
                        value: '',
                        label: '',
                    },
                    dataDictionary: [],
                },
            ],
        },
    })

    const createDataset = api.dataset.createDataset.useMutation({
        onSuccess: async ({ name }) => {
            notify(`Successfully created the ${name} dataset`, 'success')
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

    console.log(errors)
    useEffect(() => {
        if (!dirtyFields['name']) setValue('name', slugify(watch('title')))
    }, [watch('title')])

    return (
        <form
            onSubmit={formObj.handleSubmit((data) => {
                createDataset.mutate(data)
            })}
        >
            <Tab.Group
                selectedIndex={selectedIndex}
                onChange={setSelectedIndex}
            >
                <div className="mx-auto w-full mb-5 3xl:max-w-[1380px]">
                    <CreateDatasetTabs currentStep={selectedIndex} />
                </div>
                <Tab.Panels>
                    <Tab.Panel as="div" className="flex flex-col gap-y-12">
                        <OverviewForm formObj={formObj} />
                        <DescriptionForm formObj={formObj} />
                        <PointOfContactForm formObj={formObj} />
                        <MoreDetailsForm formObj={formObj} />
                        <CustomFieldsForm formObj={formObj} />
                    </Tab.Panel>
                    <Tab.Panel as="div" className="flex flex-col gap-y-12">
                        <CreateDataFilesSection formObj={formObj} />
                    </Tab.Panel>
                    <Tab.Panel as="div" className="flex flex-col gap-y-12">
                        <Preview formObj={formObj} />
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
            </div>
            <div
                className={classNames(
                    'flex-col sm:flex-row mt-5 gap-y-4 mx-auto flex w-full max-w-[1380px] justify-between font-acumin text-2xl font-semibold text-black px-4 xl:px-0',
                    selectedIndex === 2 ? 'max-w-[71rem] xxl:px-0' : ''
                )}
            >
                <Button
                    onClick={formObj.handleSubmit((data) => {
                        createDataset.mutate({
                            ...data,
                            visibility_type: { value: 'draft', label: 'Draft' },
                        })
                    })}
                    variant="muted"
                    type="button"
                    className="w-fit"
                >
                    Save as Draft
                </Button>
                <div className="flex items-center gap-x-2">
                    {selectedIndex !== 0 && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setSelectedIndex(selectedIndex - 1)}
                        >
                            Back
                        </Button>
                    )}
                    {selectedIndex !== 2 && (
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
                                .otherwise(() => 'Preview')}
                        </Button>
                    )}
                    {selectedIndex === 2 && (
                        <LoaderButton
                            loading={createDataset.isLoading}
                            type="submit"
                        >
                            Save
                        </LoaderButton>
                    )}
                </div>
            </div>
        </form>
    )
}
