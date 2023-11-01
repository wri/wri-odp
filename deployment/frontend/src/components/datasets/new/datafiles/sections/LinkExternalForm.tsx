import { InputGroup } from "@/components/_shared/InputGroup";
import { Input } from "@/components/_shared/SimpleInput";
import SimpleSelect from "@/components/_shared/SimpleSelect";

export function LinkExternalForm() {
  return (
    <div className="flex flex-col gap-y-4">
      <InputGroup label="Link" required className="whitespace-nowrap">
        <Input
          placeholder="https://source/to/original/data"
          name="url"
          type="text"
          maxWidth="max-w-[70rem]"
        />
      </InputGroup>
      <InputGroup label="Title" required className="whitespace-nowrap">
        <Input
          placeholder="Some name"
          name="title"
          type="text"
          maxWidth="max-w-[70rem]"
        />
      </InputGroup>
      <InputGroup label="Description" className="whitespace-nowrap">
        <Input
          placeholder="Add description"
          name="title"
          as="textarea"
          type="text"
          maxWidth="max-w-[70rem]"
        />
      </InputGroup>
      <InputGroup label="Format" className="whitespace-nowrap">
        <SimpleSelect
          placeholder="Select format"
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
