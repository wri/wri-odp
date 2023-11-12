import { InputGroup } from '@/components/_shared/InputGroup'
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
                <SimpleSelect
                    placeholder="Select format"
                    name={`resources.${index}.format`}
                    maxWidth="max-w-[70rem]"
                    options={[
                        { value: 'csv', label: 'CSV' },
                        { value: 'json', label: 'JSON' },
                        { value: 'xml', label: 'XML' },
                    ]}
                ></SimpleSelect>
            </InputGroup>
            {dataDictionaryLoading &&
            watch(`resources.${index}.dataDictionary`) ? (
                <Spinner />
            ) : (
                <PreviewTable formObj={formObj} resourceIndex={index} />
            )}
        </div>
    )
}

function PreviewTable({
    formObj,
    resourceIndex,
}: {
    formObj: UseFormReturn<DatasetFormType>
    resourceIndex: number
}) {
    const { control, watch, register } = formObj
    const { fields } = useFieldArray({
        control, // control props comes from useForm (optional: if you are using FormContext)
        name: `resources.${resourceIndex}.dataDictionary`, // unique name for your Field Array
    })
    console.log('Fields', fields) 
    return (
        <Table>
            <TableHeader>
                <TableRow className="bg-neutral-50">
                    <TableHead className="font-acumin text-xs font-semibold text-black">
                        Field
                    </TableHead>
                    <TableHead className="font-acumin text-xs font-semibold text-black">
                        Type
                    </TableHead>
                    <TableHead className="font-acumin text-xs font-semibold text-black">
                        Null
                    </TableHead>
                    <TableHead className="font-acumin text-xs font-semibold text-black">
                        Key
                    </TableHead>
                    <TableHead className="font-acumin text-xs font-semibold text-black">
                        Default
                    </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {fields.map((field, index) => (
                    <TableRow
                        key={index}
                        className={
                            index % 2 != 0
                                ? 'border-0 bg-[#FDFDFD]'
                                : 'border-0'
                        }
                    >
                        <TableCell>
                            <input
                                {...register(
                                    `resources.${resourceIndex}.dataDictionary.${index}.field`
                                )}
                                type="text"
                                className="p-0 border-0 ring-0 ring-offset-0"
                            />
                        </TableCell>
                        <TableCell>
                            <input
                                type="text"
                                {...register(
                                    `resources.${resourceIndex}.dataDictionary.${index}.type`
                                )}
                                className="p-0 border-0 ring-0 ring-offset-0"
                            />
                        </TableCell>
                        <TableCell>
                            <select
                                {...register(
                                    `resources.${resourceIndex}.dataDictionary.${index}.null`
                                )}
                                className="p-0 border-0 ring-0 ring-offset-0 appearance-none bg-none"
                            >
                                <option value="YES">YES</option>
                                <option value="NO">NO</option>
                            </select>
                        </TableCell>
                        <TableCell>
                            <input
                                type="text"
                                {...register(
                                    `resources.${resourceIndex}.dataDictionary.${index}.key`
                                )}
                                className="p-0 border-0 ring-0 ring-offset-0"
                            />
                        </TableCell>
                        <TableCell>
                            <input
                                type="text"
                                {...register(
                                    `resources.${resourceIndex}.dataDictionary.${index}.default`
                                )}
                                className="p-0 border-0 ring-0 ring-offset-0"
                            />
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
