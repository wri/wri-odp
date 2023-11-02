import {
  ArrowsPointingInIcon,
  ChatBubbleLeftRightIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { Input } from "@/components/_shared/SimpleInput";
import { InputGroup } from "@/components/_shared/InputGroup";
import { Disclosure, Transition } from "@headlessui/react";
import { MetadataAccordion } from "./MetadataAccordion";

export function PointOfContactForm() {
  return (
    <MetadataAccordion
      label={
        <>
          <ChatBubbleLeftRightIcon className="h-7 w-7" />
          Point of Contact
        </>
      }
    >
      <Disclosure.Panel className="grid grid-cols-1 items-start gap-x-24 py-5 md:grid-cols-2">
        <div className="flex flex-col justify-start gap-y-4">
          <InputGroup label="Author Name" required>
            <Input name="author_name" placeholder="Example Man" type="text" />
          </InputGroup>
          <InputGroup label="Author Email" required>
            <Input
              name="author_email"
              placeholder="Global Forest Watch"
              type="email"
            ></Input>
          </InputGroup>
        </div>
        <div className="flex flex-col justify-start gap-y-4">
          <InputGroup label="Maintainer Name" required>
            <Input
              name="maintainer_name"
              placeholder="Another name"
              type="text"
            />
          </InputGroup>
          <InputGroup label="Maintainer Email" required>
            <Input
              name="maintainer_email"
              placeholder="anotheremail@gmail.com"
              type="email"
            ></Input>
          </InputGroup>
        </div>
      </Disclosure.Panel>
    </MetadataAccordion>
  );
}
