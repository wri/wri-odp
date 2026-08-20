import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { XMarkIcon } from '@heroicons/react/24/outline';
import classNames from '@/utils/classnames';
import {
    Controller,
    type FieldValues,
    type Path,
    type PathValue,
    type UseFormReturn,
    useForm,
} from 'react-hook-form';

export interface Option<V> {
    label: string;
    value: V;
    default?: boolean;
    disbaled?: boolean;
}

interface SimpleSelectProps<T extends FieldValues, V extends object> {
    options: PathValue<T, Path<T> & Option<V>>[];
    placeholder?: string;
    className?: string;
    maxWidth?: string;
    formObj?: UseFormReturn<T>;
    name: Path<T>;
    id?: string;
    allowClear?: boolean;
}

export default function SimpleSelect<T extends FieldValues, V extends object>({
    options,
    placeholder,
    className,
    maxWidth = 'xl:max-w-[28rem]',
    formObj,
    name,
    id,
    allowClear = false,
    onChange: _onChange = (val) => {},
    disabled,
    str,
}: SimpleSelectProps<T, V> & {
    onChange?: (val: any) => void;
    disabled?: boolean;
    str?: boolean;
}) {
    const { control } = formObj ?? useForm();
    return (
        <Controller
            control={control}
            name={name}
            defaultValue={
                options.find((option) => option.default) ??
                ({
                    value: '',
                    label: '',
                } as PathValue<T, Path<T> & Option<V>>)
            }
            render={({ field: { onChange: setSelected, value: selected } }) => {
                const selectedFull = options.find(
                    (o) => o.value === (str ? selected : selected?.value)
                );
                const hasSelection = str
                    ? selected !== undefined && selected !== null && selected !== ''
                    : !!selected?.value;
                return (
                    <Listbox
                        value={selected}
                        onChange={(e) => {
                            if (_onChange && e != null) {
                                _onChange(e.value);
                            }
                            setSelected(str ? e.value : e);
                        }}
                        disabled={disabled}
                    >
                        {({ open }) => (
                            <>
                                <div
                                    className={classNames(
                                        'relative w-full',
                                        maxWidth
                                    )}
                                >
                                    <Listbox.Button
                                        id={id}
                                        className={classNames(
                                            'relative text-left block w-full rounded-md border-0 px-5 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:border-b-2 focus:border-blue-800 focus:bg-slate-100 focus:ring-0 focus:ring-offset-0 sm:text-sm sm:leading-6',
                                            className ?? '',
                                            !placeholder ? 'min-h-[2.5rem]' : ''
                                        )}
                                    >
                                        <span className="flex items-center gap-2 truncate">
                                            <span
                                                className={classNames(
                                                    selected && selected.label
                                                        ? ''
                                                        : 'text-zinc-500',
                                                    'truncate'
                                                )}
                                            >
                                                {selected &&
                                                selectedFull &&
                                                (str ? true : selected.label)
                                                    ? selectedFull.label
                                                          .charAt(0)
                                                          .toUpperCase() +
                                                      selectedFull.label.slice(
                                                          1
                                                      )
                                                    : placeholder}
                                            </span>
                                            {selected?.visibility ===
                                                'private' &&
                                                selected?.value !=
                                                    'private' && <>&#128274;</>}
                                        </span>
                                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                            <ChevronDownIcon
                                                className="h-5 w-5 text-gray-400"
                                                aria-hidden="true"
                                            />
                                        </span>
                                    </Listbox.Button>
                                    {allowClear && hasSelection && !disabled && (
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-7 flex items-center pr-1 text-gray-400 hover:text-gray-700"
                                            onClick={(event) => {
                                                event.preventDefault();
                                                event.stopPropagation();
                                                _onChange(undefined);
                                                setSelected(
                                                    str
                                                        ? ('' as PathValue<T, Path<T>>)
                                                        : (undefined as PathValue<T, Path<T>>)
                                                );
                                            }}
                                            aria-label="Clear selection"
                                            title="Clear selection"
                                        >
                                            <XMarkIcon className="h-4 w-4" />
                                        </button>
                                    )}

                                    <Transition
                                        show={open}
                                        as={Fragment}
                                        leave="transition ease-in duration-100"
                                        leaveFrom="opacity-100"
                                        leaveTo="opacity-0"
                                    >
                                        <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                            {options.map((option) => (
                                                <Listbox.Option
                                                    key={option.value}
                                                    disabled={option.disabled}
                                                    className={({ active }) =>
                                                        classNames(
                                                            active
                                                                ? 'bg-blue-800 text-white'
                                                                : 'text-gray-900',
                                                            `relative cursor-default select-none py-2 pl-3 pr-9 ${option.disabled ? 'opacity-50' : ''}`
                                                        )
                                                    }
                                                    value={option}
                                                >
                                                    {({ selected, active }) => (
                                                        <>
                                                            <span
                                                                className={classNames(
                                                                    selected
                                                                        ? 'font-semibold'
                                                                        : 'font-normal',
                                                                    'block truncate'
                                                                )}
                                                            >
                                                                {option.label}
                                                                {option?.visibility &&
                                                                option.visibility ===
                                                                    'private' &&
                                                                option.value !=
                                                                    'private' ? (
                                                                    <span className="ml-1">
                                                                        {' '}
                                                                        &#128274;
                                                                    </span>
                                                                ) : (
                                                                    ''
                                                                )}
                                                            </span>
                                                        </>
                                                    )}
                                                </Listbox.Option>
                                            ))}
                                        </Listbox.Options>
                                    </Transition>
                                </div>
                            </>
                        )}
                    </Listbox>
                );
            }}
        />
    );
}
