import { Accordion } from "../Accordion";
import { Tab } from "@headlessui/react";
import {
  ArrowUpTrayIcon,
  FolderPlusIcon,
  LinkIcon,
  Square3Stack3DIcon,
  GlobeAsiaAustraliaIcon,
  PaperClipIcon,
  MinusCircleIcon,
} from "@heroicons/react/24/outline";
import classNames from "@/utils/classnames";
import { LinkExternalForm } from "./sections/LinkExternalForm";
import { UploadForm } from "./sections/UploadForm";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { PlusCircleIcon } from "@heroicons/react/20/solid";
import { DataFileAccordion } from "./DatafileAccordion";
import { match } from "ts-pattern";
import { BuildALayer } from "./sections/BuildALayer/BuildALayerSection";

export function CreateDataFilesSection() {
  const { control, register } = useForm({
    defaultValues: {
      resources: [
        {
          name: "referencetables.xlsx",
          size: "3.2MB",
          type: "upload",
        },
        {
          name: "https://source/to/original/data",
          type: "link",
        },
        {
          name: "https://source/to/original/data",
          type: "layer",
        },
      ],
    },
  });
  const { fields, append, prepend, remove, swap, move, insert } = useFieldArray(
    {
      control, // control props comes from useForm (optional: if you are using FormContext)
      name: "resources",
    },
  );
  return (
    <>
      {fields.map((field, index) => (
        <AddDataFile index={index} field={field} remove={() => remove(index)} />
      ))}
      <div className="mx-auto w-full max-w-[1380px] px-4 sm:px-6 xxl:px-0">
        <button
          onClick={() =>
            append({
              name: "referencetables.xlsx",
              size: "3.2MB",
              type: "upload",
            })
          }
          className="ml-auto flex items-center justify-end gap-x-1"
        >
          <PlusCircleIcon className="h-5 w-5 text-amber-400" />
          <span className="font-['Acumin Pro SemiCondensed'] text-lg font-normal leading-tight text-black">
            Add another data file
          </span>
        </button>
      </div>
    </>
  );
}

interface FieldType {
  id: string;
  name: string;
  size?: string;
  type: string;
}

function AddDataFile({
  remove,
  field,
  index,
}: {
  remove: () => void;
  index: number;
  field: FieldType;
}) {
  const [uploadSelected, setUploadSelected] = useState(false);
  return (
    <DataFileAccordion
      icon={<FolderPlusIcon className="h-7 w-7" />}
      title={`Data File ${index + 1}`}
      preview={
        <div className="flex items-center justify-between bg-stone-50 px-8 py-3">
          {match(field.type)
            .with("upload", () => (
              <>
                <div className="flex items-center gap-x-2">
                  <PaperClipIcon className="h-6 w-6 text-blue-800" />
                  <span className="font-['Acumin Pro SemiCondensed'] text-lg font-light text-black">
                    {field.name}
                  </span>
                  <span className="font-['Acumin Pro SemiCondensed'] mt-0.5 text-right text-xs font-normal leading-tight text-neutral-500">
                    (3.2 MB)
                  </span>
                </div>
                <button onClick={() => remove()}>
                  <MinusCircleIcon className="h-6 w-6 text-red-500" />
                </button>
              </>
            ))
            .with("link", () => (
              <>
                <div className="flex items-center gap-x-2">
                  <LinkIcon className="h-6 w-6 text-blue-800" />
                  <span className="font-['Acumin Pro SemiCondensed'] text-lg font-light text-black">
                    {field.name}
                  </span>
                </div>
                <button onClick={() => remove()}>
                  <MinusCircleIcon className="h-6 w-6 text-red-500" />
                </button>
              </>
            ))
            .otherwise(() => (
              <>
                <div className="flex items-center gap-x-2">
                  <GlobeAsiaAustraliaIcon className="h-6 w-6 text-blue-800" />
                  <span className="font-['Acumin Pro SemiCondensed'] text-lg font-light text-black">
                    {field.name}
                  </span>
                </div>
                <button onClick={() => remove()}>
                  <MinusCircleIcon className="h-6 w-6 text-red-500" />
                </button>
              </>
            ))}
        </div>
      }
    >
      <Tab.Group>
        {!uploadSelected && (
          <Tab.List
            as="div"
            className="grid max-w-[35rem] grid-cols-2 sm:grid-cols-3 gap-3 py-4 "
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
            <Tab className="hidden"></Tab>
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
            <UploadForm removeFile={() => setUploadSelected(!uploadSelected)} />
          </div>
        ) : (
          <Tab.Panels as="div" className="mt-2">
            <Tab.Panel className="hidden"></Tab.Panel>
            <Tab.Panel>
              <LinkExternalForm />
            </Tab.Panel>
            <Tab.Panel>
              <BuildALayer />
            </Tab.Panel>
          </Tab.Panels>
        )}
      </Tab.Group>
    </DataFileAccordion>
  );
}
