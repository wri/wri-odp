import Container from '../_shared/Container'
import { InputGroup } from '../_shared/InputGroup'
import Select from '../_shared/SimpleSelect'
import { Input } from '../_shared/SimpleInput'
import UploadButton from '../datasets/sections/datafiles/Upload'
import { Breadcrumbs } from '../_shared/Breadcrumbs'
import SimpleSelect from '../_shared/SimpleSelect'
import { TextArea } from '../_shared/SimpleTextArea'
import { useForm } from 'react-hook-form'
import { useEffect } from 'react'
import { slugify } from '@/utils/slugify'
import { Button } from '../_shared/Button'

const links = [
    { label: 'Dashboard', url: '/dashboard', current: false },
    { label: 'Topics', url: '/dashboard/topics', current: false },
    { label: 'Create a topic', url: '/topics/new', current: true },
]

export function CreateTopic() {
    const {
        register,
        setValue,
        watch,
        formState: { dirtyFields },
    } = useForm<{ title: string; url: string }>({
        defaultValues: {
            title: '',
            url: '',
        },
    })
    useEffect(() => {
        if (!dirtyFields['url']) setValue('url', slugify(watch('title')))
    }, [watch('title')])
    return (
        <>
            <Breadcrumbs links={links} />
            <Container className="mb-20 font-acumin">
                <h1 className="mb-[2rem] text-[1.57rem] font-semibold">
                    Create a topic
                </h1>
                <div className="w-full border-b border-blue-800 shadow">
                    <div className="px-2 sm:px-8">
                        <div className="grid grid-cols-1 items-start gap-x-12 gap-y-4 py-5 lg:grid-cols-2 xxl:gap-x-24">
                            <div className="flex flex-col justify-start gap-y-4">
                                <InputGroup label="Title" required>
                                    <Input
                                        {...register('title')}
                                        placeholder="My topic"
                                        type="text"
                                    />
                                </InputGroup>
                                <InputGroup label="URL" required>
                                    <Input
                                        placeholder="name-of-topic"
                                        {...register('url')}
                                        type="text"
                                        className="pl-[4.6rem] lg:pl-[4rem]"
                                    >
                                        <span className="absolute inset-y-0 left-5 flex items-center pr-3 sm:text-sm sm:leading-6">
                                            /topics/
                                        </span>
                                    </Input>
                                </InputGroup>
                                <InputGroup
                                    label="Image"
                                    className="justify-start items-start gap-x-[2.7rem]"
                                >
                                    <div className="col-span-full lg:col-span-2">
                                        <div className="w-[11rem]">
                                            <UploadButton text="Upload an image" />
                                        </div>
                                    </div>
                                </InputGroup>
                            </div>
                            <div className="flex flex-col justify-start gap-y-4">
                                <InputGroup
                                    label="Description"
                                    labelClassName="pt-[0.9rem]"
                                    className="items-start"
                                >
                                    <TextArea
                                        placeholder="Description"
                                        name="Description"
                                        type="text"
                                        className="h-[8.4rem]"
                                    />
                                </InputGroup>
                                <InputGroup
                                    label="Parent"
                                    labelClassName="pt-[0.9rem]"
                                    className="items-start"
                                >
                                    <SimpleSelect
                                        options={[
                                            {
                                                label: 'Parent 1',
                                                value: 'PARENT_1',
                                            },
                                        ]}
                                        placeholder="Select a parent"
                                    />
                                </InputGroup>
                            </div>
                            <div className="col-span-full w-full flex justify-end">
                                <Button>Save</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </>
    )
}
