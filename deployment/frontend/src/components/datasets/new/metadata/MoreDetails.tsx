import {
  ExclamationCircleIcon,
  SquaresPlusIcon,
} from "@heroicons/react/24/outline";
import { Disclosure, Transition } from "@headlessui/react";
import { Input } from "@/components/_shared/SimpleInput";
import { InputGroup } from "@/components/_shared/InputGroup";
import { MetadataAccordion } from "./MetadataAccordion";

export function MoreDetailsForm() {
  return (
    <MetadataAccordion
      label={
        <>
          <SquaresPlusIcon className="h-7 w-7" />
          More Details
        </>
      }
    >
      <Disclosure.Panel className="grid grid-cols-1 items-start gap-x-24 py-5 md:grid-cols-2">
        <div className="flex flex-col justify-start gap-y-4">
          <InputGroup label="Function" className="items-start">
            <Input
              placeholder="This data serves X porpuse"
              name="function"
              type="text"
              as="textarea"
              className="h-28"
            />
          </InputGroup>
          <InputGroup label="Restrictions" className="items-start">
            <Input
              placeholder="Data can only be used without alteration"
              name="restrictions"
              type="text"
              as="textarea"
              className="h-28"
            />
          </InputGroup>
          <InputGroup label="Reason for adding" className="items-start">
            <Input
              placeholder="Due to new funding for research"
              name="reason_for_adding"
              type="text"
              as="textarea"
              className="h-28"
            />
          </InputGroup>
          <InputGroup label="Learn more" className="items-start">
            <Input
              placeholder="Please visit our website for more information: LINK TO WEBSITE"
              name="learn_more"
              type="text"
              as="textarea"
              className="h-28"
            />
          </InputGroup>
        </div>
        <div className="flex flex-col justify-start gap-y-4">
          <InputGroup label="Cautions" className="items-start">
            <Input
              placeholder=""
              name="cautions"
              type="text"
              as="textarea"
              className="h-64"
              icon={
                <ExclamationCircleIcon className="mb-auto mt-2 h-5 w-5 text-gray-300" />
              }
            />
          </InputGroup>
          <InputGroup label="Summary" className="items-start">
            <Input
              placeholder="My short summary of this data"
              name="learn_more"
              type="text"
              as="textarea"
              className="h-64"
            />
          </InputGroup>
        </div>
      </Disclosure.Panel>
    </MetadataAccordion>
  );
}
