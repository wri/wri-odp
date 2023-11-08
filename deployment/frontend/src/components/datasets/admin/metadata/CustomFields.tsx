import {
  FolderPlusIcon,
  MinusCircleIcon,
} from "@heroicons/react/24/outline";
import { Disclosure } from "@headlessui/react";
import { Input } from "@/components/_shared/SimpleInput";
import { InputGroup } from "@/components/_shared/InputGroup";
import { PlusCircleIcon } from "@heroicons/react/20/solid";
import { MetadataAccordion } from "./MetadataAccordion";

function CustomField() {
  return (
    <div className="flex items-center gap-x-2">
      <div className="grid grow grid-cols-1 items-start gap-x-24 py-5 md:grid-cols-2">
        <InputGroup label="Custom Field">
          <Input placeholder="" name="custom_field" type="text" />
        </InputGroup>
        <InputGroup label="Value">
          <Input placeholder="" name="value" type="text" />
        </InputGroup>
      </div>
      <MinusCircleIcon className="h-5 w-5 text-red-600" />
    </div>
  );
}

export function CustomFieldsForm() {
  return (
    <MetadataAccordion
      label={
        <>
          <FolderPlusIcon className="h-7 w-7" />
          Custom Fields
        </>
      }
    >
      <Disclosure.Panel className="py-5">
        <CustomField />
        <CustomField />
        <CustomField />
        <div className="flex items-center justify-end gap-x-1">
          <PlusCircleIcon className="h-5 w-5 text-amber-400" />
          <div className="font-['Acumin Pro SemiCondensed'] text-xl font-normal leading-tight text-black">
            Add a custom field
          </div>
        </div>
      </Disclosure.Panel>
    </MetadataAccordion>
  );
}
