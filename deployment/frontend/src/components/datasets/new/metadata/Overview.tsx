import {
  ArrowsPointingInIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { Input } from "../../SimpleInput";
import SimpleSelect from "../../SimpleSelect";
import { Disclosure, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { InputGroup } from "./InputGroup";

export function OverviewForm() {
  return (
    <Disclosure
      as="div"
      className="mx-auto w-full max-w-[1380px] px-4 sm:px-6 xxl:px-0"
    >
      {({ open }) => (
        <>
          <div className="w-full border-b border-blue-800 bg-white shadow">
            <div className="px-8">
              <Disclosure.Button className="w-full col-span-full flex justify-between border-b border-stone-50 py-5">
                <h3 className="flex w-full items-center gap-x-2 font-acumin text-xl font-semibold text-blue-800">
                  <ArrowsPointingInIcon className="h-7 w-7" />
                  Overview
                </h3>
                <ChevronDownIcon
                  className={`${
                    open ? "rotate-180 transform  transition" : ""
                  } h-5 w-5 text-blue-800`}
                />
              </Disclosure.Button>
              <Transition
                enter="transition duration-100 ease-out"
                enterFrom="transform scale-95 opacity-0"
                enterTo="transform scale-100 opacity-100"
                leave="transition duration-75 ease-out"
                leaveFrom="transform scale-100 opacity-100"
                leaveTo="transform scale-95 opacity-0"
              >
                <Disclosure.Panel className="grid grid-cols-1 items-start gap-x-24 py-5 md:grid-cols-2">
                  <div className="flex flex-col justify-start gap-y-4">
                    <InputGroup label="Title" required>
                      <Input
                        name="title"
                        placeholder="My dataset"
                        type="text"
                      />
                    </InputGroup>
                    <InputGroup label="Url" required>
                      <Input
                        name="url"
                        placeholder="name-of-dataset"
                        type="text"
                        className="!pl-[4.8rem]"
                      >
                        <span className="absolute inset-y-0 left-5 flex items-center pr-3 sm:text-sm sm:leading-6">
                          /dataset/
                        </span>
                      </Input>
                    </InputGroup>
                    <InputGroup label="Source">
                      <Input
                        name="source"
                        placeholder="ex. https://source/to/original/data"
                        type="text"
                        icon={
                          <ExclamationCircleIcon className="h-4 w-4 text-gray-300" />
                        }
                      />
                    </InputGroup>
                    <InputGroup label="Language">
                      <SimpleSelect
                        placeholder="Language"
                        options={[
                          { value: "eng", label: "English" },
                          { value: "fr", label: "French" },
                          { value: "pt", label: "Portuguese" },
                        ]}
                      />
                    </InputGroup>
                    <InputGroup label="Team">
                      <SimpleSelect
                        placeholder="Name of team"
                        options={[
                          { value: "team_1", label: "Team 1" },
                          { value: "team_2", label: "Team 2" },
                          { value: "team_3", label: "Team 3" },
                        ]}
                      />
                    </InputGroup>
                    <InputGroup label="Topics">
                      <SimpleSelect
                        placeholder="Select topics"
                        options={[
                          { value: "topic_1", label: "Topic 1" },
                          { value: "topic_2", label: "Topic 2" },
                          { value: "topic_3", label: "Topic 3" },
                        ]}
                      />
                    </InputGroup>
                    <InputGroup label="Technical Notes" required>
                      <Input
                        name="technical_notes"
                        placeholder="https://source/to/original/data"
                        type="text"
                      />
                    </InputGroup>
                  </div>
                  <div className="flex flex-col justify-start gap-y-4">
                    <InputGroup label="Tags">
                      <SimpleSelect
                        placeholder="Select tags"
                        options={[
                          { value: "tag_1", label: "Tag 1" },
                          { value: "tag_2", label: "Tag 2" },
                          { value: "tag_3", label: "Tag 3" },
                        ]}
                      />
                    </InputGroup>
                    <InputGroup label="Temporal Coverage">
                      <div className="flex w-[28rem] items-center justify-between gap-x-5">
                        <Input
                          name="temporal_coverage_start"
                          placeholder="Start"
                          type="date"
                        />
                        <span>to</span>
                        <Input
                          name="temporal_coverage_end"
                          placeholder="End"
                          type="date"
                        />
                      </div>
                    </InputGroup>
                    <InputGroup label="Update Frequency">
                      <SimpleSelect
                        placeholder="Select update frequency"
                        options={[
                          { value: "monthly", label: "Monthly", default: true },
                          { value: "weekly", label: "Weekly" },
                          { value: "yearly", label: "Yearly" },
                        ]}
                      />
                    </InputGroup>
                    <InputGroup label="Citation" className="items-start">
                      <Input
                        placeholder=""
                        name="citation"
                        type="text"
                        as="textarea"
                        className="h-44"
                        icon={
                          <ExclamationCircleIcon className="mb-auto mt-2 h-5 w-5 text-gray-300" />
                        }
                      />
                    </InputGroup>
                    <InputGroup label="Visbility" required>
                      <SimpleSelect
                        placeholder="Select visiblity"
                        options={[
                          { value: "public", label: "Public" },
                          { value: "private", label: "Private", default: true },
                        ]}
                      />
                    </InputGroup>
                    <InputGroup label="License">
                      <SimpleSelect
                        placeholder="Select license"
                        options={[
                          {
                            value: "creative_commons",
                            label: "Creative Commons",
                            default: true,
                          },
                          { value: "gnu", label: "GNU" },
                          { value: "openbsd", label: "OpenBSD" },
                        ]}
                      />
                    </InputGroup>
                  </div>
                </Disclosure.Panel>
              </Transition>
            </div>
          </div>
        </>
      )}
    </Disclosure>
  );
}
