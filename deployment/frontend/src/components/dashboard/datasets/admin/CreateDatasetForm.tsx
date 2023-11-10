import { ErrorAlert } from '@/components/_shared/Alerts'
import { Button } from '@/components/_shared/Button'
import { CreateDatasetTabs } from '@/components/dashboard/datasets/admin/CreateDatasetTabs'
import { CreateDataFilesSection } from '@/components/dashboard/datasets/admin/datafiles/CreateDatafilesSection'
import { CustomFieldsForm } from '@/components/dashboard/datasets/admin/metadata/CustomFields'
import { DescriptionForm } from '@/components/dashboard/datasets/admin/metadata/DescriptionForm'
import { MoreDetailsForm } from '@/components/dashboard/datasets/admin/metadata/MoreDetails'
import { OverviewForm } from '@/components/dashboard/datasets/admin/metadata/Overview'
import { PointOfContactForm } from '@/components/dashboard/datasets/admin/metadata/PointOfContact'
import { Preview } from '@/components/dashboard/datasets/admin/preview/Preview'
import { DatasetFormType, DatasetSchema } from '@/schema/dataset.schema'
import classNames from '@/utils/classnames'
import { slugify } from '@/utils/slugify'
import { Tab } from '@headlessui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { match } from 'ts-pattern'

export default function CreateDatasetForm() {
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [selectedIndex, setSelectedIndex] = useState(0)

    const formObj = useForm<DatasetFormType>({
        resolver: zodResolver(DatasetSchema),
        mode: 'onBlur',
        defaultValues: {
            title: '',
            name: '',
            resources: [
                {
                    title: '',
                    type: 'empty',
                }
            ]
        },
    })

    const {
        setValue,
        watch,
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
                <div className="mx-auto w-full 3xl:max-w-[1380px]">
                    <CreateDatasetTabs currentStep={selectedIndex} />
                </div>
                {errorMessage && (
                    <div className="py-4">
                        <ErrorAlert text={errorMessage} />
                    </div>
                )}
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
                    'flex-col sm:flex-row gap-y-4 mx-auto flex w-full max-w-[1380px] justify-between font-acumin text-2xl font-semibold text-black px-4 xl:px-0',
                    selectedIndex === 2 ? 'max-w-[71rem] xxl:px-0' : ''
                )}
            >
                <Button variant="muted" className="w-fit">
                    Save as Draft
                </Button>
                <div className="flex items-center gap-x-2">
                    <Button variant="outline">Cancel</Button>
                    {selectedIndex !== 2 && (
                        <Button
                            onClick={() => setSelectedIndex(selectedIndex + 1)}
                        >
                            Next:{' '}
                            {match(selectedIndex)
                                .with(0, () => 'Datafiles')
                                .otherwise(() => 'Preview')}
                        </Button>
                    )}
                </div>
            </div>
        </>
    )
}
