import { BeakerIcon } from '@heroicons/react/24/outline';
import { Disclosure } from '@headlessui/react';
import { ErrorDisplay, InputGroup } from '@/components/_shared/InputGroup';
import { MetadataAccordion } from './MetadataAccordion';
import { type UseFormReturn } from 'react-hook-form';
import { type DatasetFormType } from '@/schema/dataset.schema';
import { SimpleEditor } from './RTE/SimpleEditor';
import { Input } from '@/components/_shared/SimpleInput';

export function MethodologyForm({
    formObj,
}: {
    formObj: UseFormReturn<DatasetFormType>;
}) {
    const {
        register,
        watch,
        formState: { errors },
    } = formObj;

    return (
        <MetadataAccordion
            label={
                <>
                    <BeakerIcon className="h-7 w-7" />
                    Methodology
                </>
            }
        >
            <Disclosure.Panel className="flex flex-col gap-y-8 pb-12 pt-5">
                <InputGroup
                    label="Methodology"
                    className="mb-2 flex min-h-[320px] flex-col items-start whitespace-nowrap sm:flex-col"
                >
                    <SimpleEditor
                        formObj={formObj}
                        name="methodology"
                        className="min-h-[320px]"
                        defaultValue=""
                    />
                </InputGroup>

                <InputGroup
                    label="Technical note"
                    required={
                        watch('visibility_type')?.value
                            ? watch('visibility_type').value === 'public'
                            : false
                    }
                >
                    <Input
                        {...register('technical_notes')}
                        placeholder="https://source/to/original/data"
                        type="text"
                    />
                    <ErrorDisplay name="technical_notes" errors={errors} />
                </InputGroup>
            </Disclosure.Panel>
        </MetadataAccordion>
    );
}
