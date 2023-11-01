import {
  ArrowsPointingInIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { Input } from "@/components/_shared/SimpleInput";
import { InputGroup } from "@/components/_shared/InputGroup";
import { Disclosure } from "@headlessui/react";
import SimpleSelect from "@/components/_shared/SimpleSelect";
import TagsSelect from "../SelectTags";
import { TopicsSelect } from "../SelectTopics";
import { MetadataAccordion } from "./MetadataAccordion";

export function OverviewForm() {
  return (
    <MetadataAccordion
      label={
        <>
          <ArrowsPointingInIcon className="h-7 w-7" />
          Overview
        </>
      }
    >
      <Disclosure.Panel className="grid grid-cols-1 items-start gap-x-12 gap-y-4 py-5 lg:grid-cols-2 xxl:gap-x-24">
        <div className="flex flex-col justify-start gap-y-4">
          <InputGroup label="Title" required>
            <Input name="title" placeholder="My dataset" type="text" />
          </InputGroup>
          <InputGroup label="Url" required>
            <Input
              name="url"
              placeholder="name-of-dataset"
              type="text"
              className="!pl-[5.3rem] lg:pl-[4.8rem]"
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
              icon={<ExclamationCircleIcon className="h-4 w-4 text-gray-300" />}
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
          <InputGroup label="Projects">
            <Input
              name="projects"
              placeholder="ex. Ecosystem Service Mapping"
              type="text"
            />
          </InputGroup>
          <InputGroup label="Application">
            <Input
              name="application"
              placeholder="ex. Global Forest Watch"
              type="text"
            />
          </InputGroup>
          <InputGroup label="Topics">
            <TopicsSelect />
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
            <TagsSelect
              placeholder="Select tags"
              className="flex h-[7rem] flex-col"
              options={[
                { value: "tag_1", label: "Tag 1" },
                { value: "tag_2", label: "Tag 2" },
                { value: "tag_3", label: "Tag 3" },
              ]}
            />
          </InputGroup>
          <InputGroup label="Temporal Coverage">
            <div className="flex flex-col items-center justify-between gap-5 lg:flex-row xxl:w-[28rem]">
              <Input
                name="temporal_coverage_start"
                placeholder="Start"
                type="date"
              />
              <span className="hidden xxl:block">to</span>
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
          <div className="space-y-5 h-[48px] flex items-center justify-end">
            <div className="relative flex justify-end">
              <div className="flex h-6 items-center">
                <input
                  id="featured_dataset"
                  aria-describedby="comments-description"
                  name="featured_dataset"
                  type="checkbox"
                  className="h-5 w-5 rounded border-gray-300 shadow text-blue-800 focus:ring-blue-800"
                />
              </div>
              <div className="ml-3 text-sm leading-6">
                <label
                  htmlFor="featured_dataset"
                  className="text-zinc-800 text-lg font-light font-acumin flex items-center gap-x-2"
                >

                  Featured dataset
                <ExclamationCircleIcon className="mb-auto mt-0.5 h-5 w-5 text-zinc-800" />
                </label>
              </div>
            </div>
          </div>
        </div>
      </Disclosure.Panel>
    </MetadataAccordion>
  );
}
