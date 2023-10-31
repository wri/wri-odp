import { Accordion } from "../Accordion";
import { Tab } from "@headlessui/react";
import {
  ArrowUpTrayIcon,
  FolderPlusIcon,
  LinkIcon,
  Square3Stack3DIcon,
} from "@heroicons/react/24/outline";
import classNames from "@/utils/classnames";
import { LinkExternalForm } from "./sections/LinkExternalForm";
import { UploadForm } from "./sections/UploadForm";
import { useState } from "react";

export function CreateDataFilesSection() {
  const [uploadSelected, setUploadSelected] = useState(false);
  return (
    <Accordion
      icon={<FolderPlusIcon className="h-7 w-7" />}
      title="Add a data file"
    >
      <Tab.Group>
        {!uploadSelected && (
          <Tab.List
            as="div"
            className="grid max-w-[35rem] grid-cols-3 gap-x-3 py-4 "
          >
            <button
              onClick={() => setUploadSelected(!uploadSelected)}
              className={classNames(
                "group flex aspect-square w-full flex-col items-center justify-center rounded-sm border-b-2 border-amber-400 bg-neutral-100 shadow transition hover:bg-amber-400 md:gap-y-2",
                uploadSelected ? "bg-amber-400" : "",
              )}
            >
              <ArrowUpTrayIcon className="h-5 w-5 text-blue-800 sm:h-9 sm:w-9" />
              <div
                className={classNames(
                  "font-acumin text-xs font-normal text-black group-hover:font-bold sm:text-sm",
                  uploadSelected ? "font-bold" : "",
                )}
              >
                Upload a file
              </div>
            </button>
            <Tab className="hidden">
            </Tab>
            <Tab>
              {({ selected }) => (
                <button
                  className={classNames(
                    "group flex aspect-square w-full flex-col items-center justify-center rounded-sm border-b-2 border-amber-400 bg-neutral-100 shadow transition hover:bg-amber-400 md:gap-y-2",
                    selected ? "bg-amber-400" : "",
                  )}
                >
                  <LinkIcon className="h-5 w-5 text-blue-800 sm:h-9 sm:w-9" />
                  <div
                    className={classNames(
                      "font-acumin text-xs font-normal text-black group-hover:font-bold sm:text-sm",
                      selected ? "font-bold" : "",
                    )}
                  >
                    Link External File
                  </div>
                </button>
              )}
            </Tab>
            <Tab>
              {({ selected }) => (
                <button
                  className={classNames(
                    "group flex aspect-square w-full flex-col items-center justify-center rounded-sm border-b-2 border-amber-400 bg-neutral-100 shadow transition hover:bg-amber-400 md:gap-y-2",
                    selected ? "bg-amber-400" : "",
                  )}
                >
                  <Square3Stack3DIcon className="h-5 w-5 text-blue-800 sm:h-9 sm:w-9" />
                  <div
                    className={classNames(
                      "font-acumin text-xs font-normal text-black group-hover:font-bold sm:text-sm",
                      selected ? "font-bold" : "",
                    )}
                  >
                    Build a layer
                  </div>
                </button>
              )}
            </Tab>
          </Tab.List>
        )}
        {uploadSelected ? (
          <div className="mt-2">
            <UploadForm removeFile={() => setUploadSelected(!uploadSelected)}/>
          </div>
        ) : (
          <Tab.Panels as="div" className="mt-2">
            <Tab.Panel className="hidden">
            </Tab.Panel>
            <Tab.Panel>
              <LinkExternalForm />
            </Tab.Panel>
          </Tab.Panels>
        )}
      </Tab.Group>
    </Accordion>
  );
}
