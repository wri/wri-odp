"use client";

import * as React from "react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/_shared/Command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/_shared/Popover";
import classNames from "@/utils/classnames";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import { match } from "ts-pattern";
import { Button } from "@/components/_shared/Button";

const topics = [
  {
    value: "climate",
    label: "Climate",
    selected: true,
    children: [
      {
        value: "climate_child_1",
        label: "Climate child 1",
        selected: true,
      },
      {
        value: "climate_child_2",
        label: "Climate child 2",
        selected: true,
      },
      {
        value: "climate_child_3",
        label: "Climate child 3",
        selected: true,
      },
      {
        value: "climate_child_4",
        label: "Climate child 4",
        selected: true,
      },
    ],
  },
  {
    value: "energy",
    label: "Energy",
    selected: true,
    children: [
      {
        value: "energy_1",
        label: "Energy child 1",
        selected: true,
      },
      {
        value: "energy_2",
        label: "Energy child 2",
        selected: true,
      },
      {
        value: "another_topic",
        label: "Another topic",
        selected: false,
        children: [
          {
            value: "1",
            label: "Another topic child 1",
            selected: false,
          },
          {
            value: "2",
            label: "Another topic child 2",
            selected: false,
          },
          {
            value: "3",
            label: "Another topic child 3",
            selected: false,
          },
        ],
      },
    ],
  },
];

interface Topic {
  value: string;
  label: string;
  selected: boolean;
  children?: Topic[];
}

export function TopicsSelect() {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");

  function BuildHierarchy(topic: Topic, level: number): React.ReactNode {
    const paddingLeft = match(level)
      .with(0, () => "")
      .with(1, () => "pl-6")
      .with(2, () => "pl-10")
      .otherwise(() => "pl-14");
    return (
      <div key={topic.value}>
        <CommandItem
          value={topic.value}
          className={classNames(
            "hover:bg-blue-800 hover:text-white group",
            paddingLeft,
          )}
          onSelect={(currentValue) => {
            setValue(currentValue === value ? "" : currentValue);
            setOpen(false);
          }}
        >
          <CheckIcon
            className={classNames(
              "mr-2 h-4 w-4 text-blue-800 group-hover:text-white",
              topic.selected ? "opacity-100" : "opacity-0",
            )}
          />
          <div
            className={classNames(
              topic.children
                ? "font-acumin text-base font-normal text-black group-hover:text-white"
                : "font-acumin text-base font-normal text-neutral-600 group-hover:text-white",
            )}
          >
            {topic.label}
          </div>
        </CommandItem>
        {topic.children &&
          topic.children.map((child: Topic) =>
            BuildHierarchy(child, level + 1),
          )}
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="relative flex h-[7rem] w-full flex-row items-start justify-between rounded-md border-0 px-5 py-3 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 hover:bg-white focus:border-b-2 focus:border-blue-800 focus:bg-slate-100 focus:ring-0 focus:ring-offset-0 sm:text-sm sm:leading-6"
        >
          <div className="flex w-full items-start justify-between">
            <span className="font-acumin text-base font-light text-zinc-400">
              Start typing in a topic or select topics from the dropdown
            </span>
            <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full md:w-[28rem] lg:w-[20rem] xl:w-[28rem] bg-white p-0">
        <Command>
          <div className="flex items-center justify-between px-3 pb-1 pt-3">
            <span className="font-acumin text-base font-semibold text-black">
              Topics
            </span>
            <div className="flex items-center gap-x-3">
              <span className="font-acumin text-xs font-normal text-zinc-800 underline">
                Select All
              </span>
              <span className="font-acumin text-xs font-normal text-zinc-800 underline">
                Clear
              </span>
            </div>
          </div>
          <CommandInput placeholder="Search framework..." />
          <CommandEmpty>No framework found.</CommandEmpty>
          <div className="pr-3">
            <CommandGroup className="max-h-[300px] overflow-y-auto">
              {topics.map((topic) => BuildHierarchy(topic, 0))}
            </CommandGroup>
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
