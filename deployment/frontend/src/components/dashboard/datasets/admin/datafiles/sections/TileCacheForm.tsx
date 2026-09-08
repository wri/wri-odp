import { ErrorDisplay, InputGroup } from '@/components/_shared/InputGroup';
import { Input } from '@/components/_shared/SimpleInput';
import SimpleSelect from '@/components/_shared/SimpleSelect';
import { TextArea } from '@/components/_shared/SimpleTextArea';
import { type DatasetFormType } from '@/schema/dataset.schema';
import { type UseFormReturn } from 'react-hook-form';
import DefaultTooltip from '@/components/_shared/Tooltip';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { SimpleEditor } from '../../metadata/RTE/SimpleEditor';

export function TileCacheForm({
    formObj,
    index,
}: {
    formObj: UseFormReturn<DatasetFormType>;
    index: number;
}) {
    const {
        register,
        formState: { errors },
    } = formObj;
    return (
        <div className="flex flex-col gap-y-4">
            <InputGroup label="Link" required className="whitespace-nowrap">
                <Input
                    placeholder="https://source/to/original/data"
                    {...register(`resources.${index}.url`)}
                    type="text"
                    maxWidth="max-w-[70rem]"
                />
                <ErrorDisplay name={`resources.${index}.url`} errors={errors} />
            </InputGroup>
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
                    placeholder="Describe this downloadable file"
                    {...register(`resources.${index}.description`)}
                    type="text"
                    maxWidth="max-w-[70rem]"
                    icon={
                        <DefaultTooltip content="Describe what this downloadable file contains so users know what to expect before adding it to their download. Avoid repeating dataset-level information. For example, explain if a ZIP archive contains multiple data tables, documentation or supporting resources.">
                            <InformationCircleIcon className="h-5 w-5" />
                        </DefaultTooltip>
                    }
                />
            </InputGroup>
            <InputGroup
                label="Cache Type"
                className="whitespace-nowrap"
                required
            >
                <SimpleSelect
                    name={`resources.${index}.cache_type`}
                    id="cache_type"
                    formObj={formObj}
                    placeholder="Select cache type"
                    str
                    options={[
                        { label: 'Raster', value: 'raster' },
                        { label: 'Vector', value: 'vector' },
                    ]}
                />
                <ErrorDisplay
                    name={`resources.${index}.cache_type`}
                    errors={errors}
                />
            </InputGroup>
            <InputGroup
                label={
                    <span className="flex items-center gap-x-1">
                        Dataset API
                        <DefaultTooltip content="This field will end up in the Data File API section, you can use it to provide code samples that are useful for this particular data, note: using the string {% DATAFILE_URL %} will get replaced to the actual url in the public section">
                            <InformationCircleIcon className="h-5 w-5" />
                        </DefaultTooltip>
                    </span>
                }
                className="mb-2 flex min-h-[320px] flex-col items-start whitespace-nowrap sm:flex-col"
            >
                <SimpleEditor
                    formObj={formObj}
                    name={`resources.${index}.advanced_api_usage`}
                    className="min-h-[320px]"
                    defaultValue=""
                />
            </InputGroup>
        </div>
    );
}
