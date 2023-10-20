import { Button } from "@/components/_shared/Button";
import classNames from "@/utils/classnames";
import { Disclosure, Transition } from "@headlessui/react";
import {
  ChevronDownIcon,
} from "@heroicons/react/20/solid";
import {
    ArrowDownTrayIcon,
  ArrowPathIcon,
  ArrowTopRightOnSquareIcon,
  ClockIcon,
  LightBulbIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";

const datafilesMock = [
  { format: "TIFF", name: "Name of the file", canShow: true, showing: true },
  { format: "CSV", name: "Name of the file", canShow: false, showing: false },
  {
    format: "GeoJSON",
    name: "Name of the file",
    canShow: true,
    showing: false,
  },
];

export function DataFiles() {
  return (
    <div className="flex flex-col py-2 gap-y-4 pr-4 sm:pr-6">
      {datafilesMock.map((datafile) => (
        <DatafileCard datafile={datafile} />
      ))}
    </div>
  );
}

const colors: Record<string, string> = {
  TIFF: "bg-wri-light-green",
  CSV: "bg-wri-light-yellow",
  GeoJSON: "bg-wri-light-blue",
};

interface Datafile {
  format: string;
  name: string;
  showing: boolean;
  canShow: boolean;
}

function DatafileCard({ datafile }: { datafile: Datafile }) {
  return (
    <Disclosure
      as="div"
      className="flex flex-col gap-y-2 border-b-2 border-green-700 p-5 shadow hover:bg-slate-100 transition"
    >
      {({ open }) => (
        <>
          <div
            className={classNames(
              "flex flex-row items-center justify-between",
              open ? "border-b border-neutral-400 pb-2" : "",
            )}
          >
            <div className="flex items-center gap-3">
              <span
                className={classNames(
                  "flex h-7 w-fit items-center justify-center rounded-sm px-3 text-center text-xs font-normal text-black",
                  colors[datafile.format] ?? "bg-gray-400",
                )}
              >
                <span className="my-auto">{datafile.format}</span>
              </span>
              <Disclosure.Button>
                <h3 className="font-acumin text-lg font-semibold leading-loose text-stone-900">
                  {datafile.name}
                </h3>
              </Disclosure.Button>
            </div>
            <div className="flex gap-x-2">
              {datafile.canShow && (
                <>
                  {datafile.showing ? (
                    <Button variant="light" size="sm">
                      <span className="mt-1">Remove Layer</span>
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm">
                      <span>Show Layer</span>
                    </Button>
                  )}
                </>
              )}
              <Disclosure.Button>
                <ChevronDownIcon
                  className={`${
                    open ? "rotate-180 transform  transition" : ""
                  } h-5 w-5 text-purple-500`}
                />
              </Disclosure.Button>
            </div>
          </div>
          <Transition
            enter="transition duration-100 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-75 ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0"
          >
            <Disclosure.Panel className="py-3">
              <p className="font-acumin text-base font-light text-stone-900">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam
                porta sem malesuada magna mollis euismod. Aenean lacinia
                bibendum nulla sed consectetur. Nullam quis risus eget urna
                mollis ornare vel eu leo.
              </p>
              <div className="mt-[0.33rem] flex justify-start gap-x-3">
                <div className="flex flex-row items-center gap-x-1">
                  <ArrowPathIcon className="h-3 w-3 text-blue-800" />
                  <p className="text-xs font-normal leading-snug text-stone-900 sm:text-sm">
                    2 Feb 2023
                  </p>
                </div>
                <div className="flex items-center gap-x-1">
                  <ClockIcon className="h-3 w-3 text-blue-800" />
                  <p className="text-xs font-normal leading-snug text-stone-900 sm:text-sm">
                    2020 - 2023
                  </p>
                </div>
                <div className="flex items-center gap-x-1">
                  <MapPinIcon className="h-3 w-3 text-blue-800" />
                  <p className="text-xs font-normal leading-snug text-stone-900 sm:text-sm">
                    Sub-Regional
                  </p>
                </div>
              </div>
              <div className="flex gap-3 py-4">
                <DownloadButton />
                <LearnMore />
                <OpenIn />
              </div>
            </Disclosure.Panel>
          </Transition>
        </>
      )}
    </Disclosure>
  );
}

function DownloadButton() {
  return (
  <div className="gap-y-2 py-7 px-10 hover:bg-amber-400 transition flex flex-col justify-center items-center bg-white rounded-sm shadow border-2 border-wri-green">
      <ArrowDownTrayIcon className="h-9 w-9" />
      <div className="flex flex-col items-center">
      <div className="text-black text-sm font-normal font-acumin">Download</div>
      <div className="text-black text-xs font-normal font-acumin">2.8 MB</div>
      </div>
    </div>
  )
}

function LearnMore() {
  return (
  <div className="gap-y-2 py-7 px-10 hover:bg-amber-400 transition flex flex-col justify-center items-center bg-white rounded-sm shadow border-2 border-wri-green">
      <LightBulbIcon className="h-9 w-9" />
      <div className="text-black text-sm font-normal font-acumin">Learn More</div>
      <div className="text-black text-xs font-normal font-acumin h-4"></div>
    </div>
  )
}

function OpenIn() {
  return (
  <div className="gap-y-2 py-7 px-10 hover:bg-amber-400 transition flex flex-col justify-center items-center bg-white rounded-sm shadow border-2 border-wri-green">
      <ArrowTopRightOnSquareIcon className="h-9 w-9" />
      <div className="text-black text-sm font-normal font-acumin">Learn More</div>
      <div className="text-black text-xs font-normal font-acumin h-4"></div>
    </div>
  )
}
