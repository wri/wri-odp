import { Button } from '@/components/_shared/Button'
import { ErrorDisplay, InputGroup } from '@/components/_shared/InputGroup'
import { Input } from '@/components/_shared/SimpleInput'
import SimpleSelect from '@/components/_shared/SimpleSelect'
import classNames from '@/utils/classnames'
import { MinusCircleIcon } from '@heroicons/react/24/outline'
import { useRef, useState } from 'react'
import { UseFormReturn, useFieldArray } from 'react-hook-form'

export default function ChartFilters({
    formObj,
    columnsOptions,
}: {
    formObj: UseFormReturn<any>
    columnsOptions: any
}) {
    const [column, setColumn] = useState()
    const {
        register,
        formState: { errors },
        setValue,
        watch,
        control,
    } = formObj

    const { fields, append, remove } = useFieldArray({
        control,
        name: `config.query.filters`,
    })

    return (
        <div className="grow flex flex-col space-y-4 mt-5">
            <div className="flex">
                <InputGroup
                    label="Filters"
                    className="sm:grid-cols-1 gap-x-2 grow"
                    labelClassName="xxl:text-sm col-span-full sm:max-w-none whitespace-nowrap sm:text-left"
                >
                    <SimpleSelect
                        id="filter-column"
                        name="filter-column"
                        placeholder="Choose column"
                        options={columnsOptions}
                        onChange={(selected) => setColumn(selected)}
                    />
                </InputGroup>
                <Button
                    variant="outline"
                    className="ml-2 mt-5"
                    type="button"
                    onClick={() => {
                        if (column) {
                            append({ column })
                        }
                    }}
                >
                    Add
                </Button>
            </div>
            <div>
                <div className="space-y-5">
                    {fields.map((filter, i) => {
                        return (
                            <div key={filter.id}>
                                <div className="border border-gray-100 p-5">
                                    <div className="flex justify-between">
                                        <span className="text-xs">
                                            {watch(
                                                `config.query.filters.${i}.column`
                                            )}
                                        </span>
                                        <input
                                            {...register(
                                                `config.query.filters.${i}.column`
                                            )}
                                            type="hidden"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                remove(i)
                                            }}
                                        >
                                            <MinusCircleIcon className="h-6 w-6 text-red-500" />
                                        </button>
                                    </div>
                                    <div className="flex space-x-2">
                                        <InputGroup
                                            label="Operation"
                                            className="sm:grid-cols-1 gap-x-2 grow mt-5"
                                            labelClassName="xxl:text-sm col-span-full sm:max-w-none whitespace-nowrap sm:text-left"
                                            required={true}
                                        >
                                            <SimpleSelect
                                                formObj={formObj}
                                                id="filter-column"
                                                name={`config.query.filters.${i}.operation`}
                                                placeholder="E.g. >="
                                                options={filterOptions}
                                            />
                                            <ErrorDisplay
                                                name={`config.query.filters.${i}.operation`}
                                                errors={errors}
                                            />
                                        </InputGroup>

                                        <InputGroup
                                            label="Value"
                                            required={true}
                                            className="sm:grid-cols-1 gap-x-2 grow mt-5"
                                            labelClassName="xxl:text-sm col-span-full sm:max-w-none whitespace-nowrap sm:text-left"
                                        >
                                            <Input
                                                {...register(
                                                    `config.query.filters.${i}.value`
                                                )}
                                            />
                                        </InputGroup>
                                    </div>
                                </div>
                                {i !=
                                    watch('config.query.filters').length -
                                    1 && (
                                        <div className="flex justify-around">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                className={classNames(
                                                    watch(
                                                        `config.query.filters.${i}.link`
                                                    ) == 'OR' &&
                                                    'bg-wri-slate font-semibold'
                                                )}
                                                onClick={() =>
                                                    setValue(
                                                        `config.query.filters.${i}.link`,
                                                        'OR'
                                                    )
                                                }
                                            >
                                                OR
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                className={classNames(
                                                    watch(
                                                        `config.query.filters.${i}.link`
                                                    ) == 'AND' &&
                                                    'bg-wri-slate font-semibold'
                                                )}
                                                onClick={() =>
                                                    setValue(
                                                        `config.query.filters.${i}.link`,
                                                        'AND'
                                                    )
                                                }
                                            >
                                                AND
                                            </Button>
                                        </div>
                                    )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

const filterOptions = [
    { value: '=', label: '=', default: true },
    { value: '!=', label: '!=' },
    { value: '>', label: '>' },
    { value: '>=', label: '>=' },
    { value: '<', label: '<' },
    { value: '<=', label: '<=' },
]
