import { ErrorDisplay, InputGroup } from '@/components/_shared/InputGroup'
import { Input } from '@/components/_shared/SimpleInput'
import SimpleSelect from '@/components/_shared/SimpleSelect'
import { TextArea } from '@/components/_shared/SimpleTextArea'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/_shared/Table'
import { MinusCircleIcon, PaperClipIcon } from '@heroicons/react/24/outline'
import { DatasetFormType } from '@/schema/dataset.schema'
import { UseFormReturn, useFieldArray } from 'react-hook-form'
import { convertBytes } from '@/utils/convertBytes'
import Spinner from '@/components/_shared/Spinner'
import FormatInput from '../FormatInput'
import { DataDictionaryTable } from '../DataDictionaryTable'

export function UploadForm({
    removeFile,
    formObj,
    index,
    dataDictionaryLoading,
}: {
    removeFile: () => void
    formObj: UseFormReturn<DatasetFormType>
    index: number
    dataDictionaryLoading: boolean
}) {
    const {
        register,
        formState: { errors },
        watch,
    } = formObj
    const datafile = watch(`resources.${index}`)
    return (
        <div className="flex flex-col gap-y-4 font-acumin">
            <div className="flex w-full justify-between bg-slate-100 px-6 py-3">
                <div className="flex items-center gap-x-2">
                    <PaperClipIcon className="h-6 w-6 text-blue-800" />
                    <span className="text-lg font-light text-black">
                        {datafile.name}
                    </span>
                    <span className="text-right font-acumin text-xs font-normal leading-tight text-neutral-500">
                        {datafile.size ? convertBytes(datafile.size) : 'N/A'}
                    </span>
                </div>
                <div className="flex items-center justify-center gap-x-3">
                    <div className="relative h-6 w-6">
                        {!datafile.name && (
                            <img
                                src="/icons/upload_loading.svg"
                                alt=""
                                className="absolute inset-0 h-full w-full animate-spin object-cover"
                            />
                        )}
                        <span
                            className="absolute left-1.5 top-2 font-acumin text-[0.475rem] font-medium leading-tight text-black"
                            id={`${datafile.resourceId}_upload_progress`}
                        ></span>
                    </div>
                    <button onClick={() => removeFile()}>
                        <MinusCircleIcon className="h-6 w-6 text-red-500" />
                    </button>
                </div>
            </div>
            <InputGroup label="Title" required className="whitespace-nowrap">
                <Input
                    placeholder="Some name"
                    {...register(`resources.${index}.title`)}
                    type="text"
                    maxWidth="max-w-[70rem]"
                />
                <ErrorDisplay
                    name={`resources.${index}.title`}
                    errors={errors}
                />
            </InputGroup>
            <InputGroup label="Description" className="whitespace-nowrap">
                <TextArea
                    placeholder="Add description"
                    {...register(`resources.${index}.description`)}
                    type="text"
                    maxWidth="max-w-[70rem]"
                />
            </InputGroup>
            <InputGroup label="Format" className="whitespace-nowrap">
                <FormatInput
                    formObj={formObj}
                    name={`resources.${index}.format`}
                />
            </InputGroup>
            {dataDictionaryLoading && watch(`resources.${index}.schema`) ? (
                <Spinner />
            ) : (
                <DataDictionaryTable formObj={formObj} resourceIndex={index} />
            )}
        </div>
    )
}
