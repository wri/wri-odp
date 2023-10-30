import {
  ArrowUpTrayIcon,
  FolderPlusIcon,
  LinkIcon,
  Square3Stack3DIcon,
} from "@heroicons/react/24/outline";
import { Tab } from "@headlessui/react";
import classNames from "@/utils/classnames";

export function UploadTab() {
  return (
    <Tab>
      {({ selected }) => (
        <button
          className={classNames(
            "group flex aspect-square w-full flex-col items-center justify-center rounded-sm border-b-2 border-amber-400 bg-neutral-100 shadow transition hover:bg-amber-400 md:gap-y-2",
            selected ? "bg-amber-400" : "",
          )}
        >
          <ArrowUpTrayIcon className="h-5 w-5 text-blue-800 sm:h-9 sm:w-9" />
          <div className={classNames("font-acumin text-xs font-normal text-black group-hover:font-bold sm:text-sm", selected ? "font-bold" : "")}>
            Upload a file
          </div>
        </button>
      )}
    </Tab>
  );
}

export function LinkExternalTab() {
  return (
    <Tab>
      {({ selected }) => (
        <button
          className={classNames(
            "group flex aspect-square w-full flex-col items-center justify-center rounded-sm border-b-2 border-amber-400 bg-neutral-100 shadow transition hover:bg-amber-400 md:gap-y-2",
            selected ? "bg-amber-400" : "",
          )}
        >
          <LinkIcon className="h-5 w-5 text-blue-800 sm:h-9 sm:w-9" />
          <div className={classNames("font-acumin text-xs font-normal text-black group-hover:font-bold sm:text-sm", selected ? "font-bold" : "")}>
            Link External File
          </div>
        </button>
      )}
    </Tab>
  );
}

export function BuildLayerTab() {
  return (
    <Tab>
      {({ selected }) => (
        <button
          className={classNames(
            "group flex aspect-square w-full flex-col items-center justify-center rounded-sm border-b-2 border-amber-400 bg-neutral-100 shadow transition hover:bg-amber-400 md:gap-y-2",
            selected ? "bg-amber-400" : "",
          )}
        >
          <Square3Stack3DIcon className="h-5 w-5 text-blue-800 sm:h-9 sm:w-9" />
          <div className={classNames("font-acumin text-xs font-normal text-black group-hover:font-bold sm:text-sm", selected ? "font-bold" : "")}>
            Build a layer
          </div>
        </button>
      )}
    </Tab>
  );
}
