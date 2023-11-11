import { ErrorDisplay, InputGroup } from "@/components/_shared/InputGroup";
import { Input } from "@/components/_shared/SimpleInput";
import SimpleSelect from "@/components/_shared/SimpleSelect";
import { TextArea } from "@/components/_shared/SimpleTextArea";
import { DatasetFormType } from "@/schema/dataset.schema";
import { UseFormReturn } from "react-hook-form";

export function LinkExternalForm({
  formObj,
  index
}: {
    formObj: UseFormReturn<DatasetFormType>
    index: number;
  }) {
  const { register, formState: { errors } } = formObj
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
          formObj={formObj}
          name={`resources.${index}.format`}
          maxWidth="max-w-[70rem]"
          options={[
            { value: "csv", label: "CSV" },
            { value: "json", label: "JSON" },
            { value: "xml", label: "XML" },
          ]}
        ></SimpleSelect>
      </InputGroup>
    </div>
  );
}
