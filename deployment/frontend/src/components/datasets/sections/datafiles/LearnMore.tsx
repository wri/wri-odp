import { Button } from "@/components/_shared/Button";
import Modal from "@/components/_shared/Modal";
import { Tab } from "@headlessui/react";
import {
  ArrowPathIcon,
  ArrowTopRightOnSquareIcon,
  ClockIcon,
  FingerPrintIcon,
  LightBulbIcon,
  MapPinIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";
import { DatasetTabs } from "../../DatasetTabs";

export function LearnMoreButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full flex aspect-square flex-col items-center justify-center md:gap-y-2 rounded-sm border-2 border-wri-green bg-white shadow transition hover:bg-amber-400"
      >
        <LightBulbIcon className="w-5 h-5 sm:h-9 sm:w-9" />
        <div className="font-acumin text-xs sm:text-sm font-normal text-black">
          Learn More
        </div>
        <div className="h-4 font-acumin text-xs font-normal text-black"></div>
      </button>
      <LearnMoreModal open={open} setOpen={setOpen} />
    </>
  );
}

function LearnMoreModal({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const tabs = [{ name: "About" }, { name: "Methodology" }];
  return (
    <Modal open={open} setOpen={setOpen} className="max-w-[64rem]">
      <div className="flex flex-col gap-y-4 p-5 font-acumin">
        <span className="mr-auto flex h-7 w-fit items-center justify-center rounded-sm bg-wri-light-green px-3 text-center text-xs font-normal text-black">
          <span className="my-auto">TIFF</span>
        </span>
        <h2 className="font-['Acumin Pro SemiCondensed'] text-3xl font-normal text-black">
          Data File 1 Name.tiff
        </h2>
        <p className="font-['Acumin Pro SemiCondensed'] text-base font-light text-stone-900">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam porta
          sem malesuada magna mollis euismod. Aenean lacinia bibendum nulla sed
          consectetur. Nullam quis risus eget urna mollis ornare vel eu leo.
        </p>
        <div className="flex gap-x-8">
          <div className="flex items-center gap-x-1">
            <FingerPrintIcon className="h-4 w-4 text-blue-800" />
            <div>
              <div className="text-sm font-semibold text-neutral-700">
                Created
              </div>
              <div className="text-sm font-light text-stone-900">
                {" "}
                2 Feb 2023
              </div>
            </div>
          </div>
          <div className="flex items-center gap-x-1">
            <ArrowPathIcon className="h-4 w-4 text-blue-800" />
            <div>
              <div className="text-sm font-semibold text-neutral-700">
                Last Updated
              </div>
              <div className="text-sm font-light text-stone-900">
                {" "}
                2 Feb 2023
              </div>
            </div>
          </div>
          <div className="flex items-center gap-x-1">
            <ClockIcon className="h-4 w-4 text-blue-800" />
            <div>
              <div className="text-sm font-semibold text-neutral-700">
                Temporal Coverage
              </div>
              <div className="text-sm font-light text-stone-900">
                2020 - 2023
              </div>
            </div>
          </div>
          <div className="flex items-center gap-x-1">
            <MapPinIcon className="h-4 w-4 text-blue-800" />
            <div>
              <div className="text-sm font-semibold text-neutral-700">
                Location
              </div>
              <div className="text-sm font-light text-stone-900">
                Sub-Regional
              </div>
            </div>
          </div>
        </div>
        <Tab.Group>
          <Tab.List as="nav" className="mt-6 flex border-b border-zinc-300">
            <DatasetTabs tabs={tabs} />
          </Tab.List>
          <Tab.Panels as="div" className="max-h-[18rem] overflow-y-auto">
            <Tab.Panel>
              <div className="font-['Acumin Pro SemiCondensed'] text-justify text-sm font-normal text-black">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam. Lorem ipsum dolor sit amet, consectetur
                adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua. Ut enim ad minim veniam. Lorem ipsum dolor
                sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                incididunt ut labore et dolore magna aliqua. Ut enim ad minim
                veniam.
                <br />
                <br />
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam. Lorem ipsum dolor sit amet, consectetur
                adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua. Ut enim ad minim veniam. Lorem ipsum dolor
                sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                incididunt ut labore et dolore magna aliqua. Ut enim ad minim
                veniam.
                <br />
                <br />
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam. Lorem ipsum dolor sit amet, consectetur
                adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua. Ut enim ad minim veniam. Lorem ipsum dolor
                sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                incididunt ut labore et dolore magna aliqua. Ut enim ad minim
                veniam.
              </div>
              <div className="flex flex-col gap-y-2 py-2">
                <div className="flex items-center gap-x-1">
                  <ArrowTopRightOnSquareIcon className="h-4 w-4 text-blue-800" />
                  <span className="font-['Acumin Pro SemiCondensed'] text-sm font-normal text-wri-green underline">
                    Link to read more 1
                  </span>
                </div>
                <div className="flex items-center gap-x-1">
                  <ArrowTopRightOnSquareIcon className="h-4 w-4 text-blue-800" />
                  <span className="font-['Acumin Pro SemiCondensed'] text-sm font-normal text-wri-green underline">
                    Link to read more 2
                  </span>
                </div>
              </div>
            </Tab.Panel>
            <Tab.Panel>
              <p className="text-sm font-normal text-black">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam. Lorem ipsum dolor sit amet, consectetur
                adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua. Ut enim ad minim veniam. Lorem ipsum dolor
                sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                incididunt ut labore et dolore magna aliqua. Ut enim ad minim
                veniam.
              </p>
              <h4 className="font-['Acumin Pro SemiCondensed'] py-5 text-base font-semibold text-black">
                Subtitle 1
              </h4>
              <p className="text-sm font-normal text-black">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam. Lorem ipsum dolor sit amet, consectetur
                adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua. Ut enim ad minim veniam. Lorem ipsum dolor
                sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                incididunt ut labore et dolore magna aliqua. Ut enim ad minim
                veniam.
                <br />
                <br />
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam. Lorem ipsum dolor sit amet, consectetur
                adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua. Ut enim ad minim veniam. Lorem ipsum dolor
                sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                incididunt ut labore et dolore magna aliqua. Ut enim ad minim
                veniam. Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                sed do eiusmod tempor incididunt ut labore et dolore magna
                aliqua. Ut enim ad minim veniam.
              </p>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </Modal>
  );
}
