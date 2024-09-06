import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/_shared/Table'
import { DatasetFormType } from '@/schema/dataset.schema'
import { UseFormReturn, useFieldArray } from 'react-hook-form'

export function DataDictionaryTable({
    formObj,
    resourceIndex,
}: {
    formObj: UseFormReturn<DatasetFormType>
    resourceIndex: number
}) {
    const { control, watch, register } = formObj
    const { fields } = useFieldArray({
        control, // control props comes from useForm (optional: if you are using FormContext)
        name: `resources.${resourceIndex}.schema`, // unique name for your Field Array
    })
    if (fields.length === 0) return <></>
    return (
        <Table>
            <TableHeader>
                <TableRow className="bg-neutral-50">
                    <TableHead className="font-acumin text-xs font-semibold text-black">
                        Field
                    </TableHead>
                    <TableHead className="font-acumin text-xs font-semibold text-black">
                        Label
                    </TableHead>
                    <TableHead className="font-acumin text-xs font-semibold text-black">
                        Type
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
                                    `resources.${resourceIndex}.schema.${index}.id`
                                )}
                                disabled
                                type="text"
                                className="p-0 border-0 ring-0 ring-offset-0"
                            />
                        </TableCell>
                        <TableCell>
                            <input
                                type="text"
                                {...register(
                                    `resources.${resourceIndex}.schema.${index}.info.label`
                                )}
                                className="p-0 border-0 ring-0 ring-offset-0"
                            />
                        </TableCell>
                        <TableCell>
                            <select
                                {...register(
                                    `resources.${resourceIndex}.schema.${index}.info.type_override`
                                )}
                                className="p-0 border-0 ring-0 ring-offset-0 w-full"
                            >
                                <option value="text">String</option>
                                <option value="numeric">Number</option>
                                <option value="timestamp">Datetime</option>
                            </select>
                        </TableCell>
                        <TableCell>
                            <input
                                type="text"
                                {...register(
                                    `resources.${resourceIndex}.schema.${index}.info.default`
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
