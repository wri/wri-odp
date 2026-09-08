import { ErrorDisplay, InputGroup } from '@/components/_shared/InputGroup';
import { Input } from '@/components/_shared/SimpleInput';
import SimpleSelect from '@/components/_shared/SimpleSelect';
import { TextArea } from '@/components/_shared/SimpleTextArea';
import { type DatasetFormType } from '@/schema/dataset.schema';
import { type UseFormReturn } from 'react-hook-form';
import DefaultTooltip from '@/components/_shared/Tooltip';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

export function GeeAssetForm({
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
            <InputGroup label="Asset ID" required className="whitespace-nowrap">
                <Input
                    placeholder={`ex. ee.ImageCollection("projects/project-name/assets/asset-details…”)`}
                    {...register(`resources.${index}.asset_id`)}
                    type="text"
                    maxWidth="max-w-[70rem]"
                />
                <ErrorDisplay
                    name={`resources.${index}.asset_id`}
                    errors={errors}
                />
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
                label="Asset Type"
                className="whitespace-nowrap"
                required
            >
                <SimpleSelect
                    name={`resources.${index}.asset_type`}
                    id="asset_type"
                    formObj={formObj}
                    placeholder="Select asset type"
                    str
                    options={[
                        { label: 'Raster', value: 'raster' },
                        { label: 'Vector', value: 'vector' },
                    ]}
                />
                <ErrorDisplay
                    name={`resources.${index}.asset_type`}
                    errors={errors}
                />
            </InputGroup>
        </div>
    );
}
