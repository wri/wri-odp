import classNames from "@/utils/classnames";
import { Disclosure, Transition } from "@headlessui/react";
import { PaperClipIcon } from "@heroicons/react/20/solid";
import {
  ChevronDownIcon,
  GlobeAsiaAustraliaIcon,
  LinkIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/_shared/Table";
import { useLayoutEffect, useRef, useState } from "react";
import { match } from "ts-pattern";

export function Preview() {
  return (
    <div className="mx-auto w-full max-w-[71rem] bg-white px-4 font-acumin shadow sm:px-6 xxl:px-0">
      <div className="p-4 sm:p-8 xxl:p-24">
        <h1 className="font-['Acumin Pro SemiCondensed'] text-3xl font-bold leading-tight text-zinc-800">
          Example Name
        </h1>
        <h2 className="font-['Acumin Pro SemiCondensed'] text-lg font-semibold leading-tight text-stone-500">
          /dataset/name-of-dataset
        </h2>

        <div className="py-8">
          <div className="border-b border-stone-50 py-8">
            <h3 className="font-['Acumin Pro SemiCondensed'] pb-5 text-2xl font-semibold leading-tight text-blue-800">
              Overview
            </h3>
            <div className="grid sm:grid-cols-2">
              <dl className="flex flex-col gap-y-6">
                <SimpleDescription
                  label="Source"
                  text="https://source/to/original/data"
                />
                <SimpleDescription label="Language" text="English" />
                <SimpleDescription label="Team" text="Land and Carbon Lab" />
                <SimpleDescription
                  label="Projects"
                  text="Ecosystem Service Mapping"
                />
                <ListOfItems
                  label="Topics"
                  items={["Climate", "Energy", "Governance", "Action"]}
                />
                <SimpleDescription
                  label="Technical Notes"
                  text="https://source/to/original/data"
                />
                <SimpleDescription label="Featured Dataset" text="No" />
              </dl>
              <dl className="flex flex-col gap-y-6">
                <ListOfItems
                  label="Tags"
                  items={[
                    "WRI",
                    "Tag 2",
                    "Something",
                    "Another tag",
                    "Tag 2",
                    "Something",
                    "Another tag",
                  ]}
                />
                <SimpleDescription
                  label="Temporal Coverage"
                  text="1998 - 2023"
                />
                <SimpleDescription label="Update Frequency" text="bianually" />
                <SimpleDescription
                  label="Citation"
                  text="Kerins, P., E. Nilson, E. Mackres, T. Rashid, B. Guzder-Williams, and S. Brumby. 2020. “Spatial Characterization of Urban Land Use through Machine Learning.” Technical Note. Washington, DC: World Resources Institute."
                />
                <SimpleDescription label="Visibility" text="public" />
                <SimpleDescription
                  label="License"
                  text="Creative Commons Distribution"
                />
              </dl>
            </div>
          </div>
          <div className="border-b border-stone-50 py-8">
            <h3 className="font-['Acumin Pro SemiCondensed'] pb-5 text-2xl font-semibold leading-tight text-blue-800">
              Description
            </h3>
            <dl className="flex flex-col gap-y-6">
              <SimpleDescription
                label="Short Description"
                text="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
              />
              <FullDescription label="Full Description">
                <p>
                  Sed ut perspiciatis unde omnis iste natus error sit voluptatem
                  accusantium doloremque laudantium, totam rem aperiam, eaque
                  ipsa quae ab illo inventore veritatis et quasi architecto
                  beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem
                  quia voluptas sit aspernatur aut odit aut fugit, sed quia
                  consequuntur magni dolores eos qui ratione voluptatem sequi
                  nesciunt. Neque porro quisquam est, qui dolorem ipsum quia
                  dolor sit amet, consectetur, adipisci velit, sed quia non
                  numquam eius modi tempora incidunt ut labore et dolore magnam
                  aliquam quaerat voluptatem. Ut enim ad minima veniam, quis
                  nostrum exercitationem ullam corporis suscipit laboriosam,
                  nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum
                  iure reprehenderit qui in ea voluptate velit esse quam nihil
                  molestiae consequatur, vel illum qui dolorem eum fugiat quo
                  voluptas nulla pariatur?"
                </p>
                <br />
                <p>
                  Sed ut perspiciatis unde omnis iste natus error sit voluptatem
                  accusantium doloremque laudantium, totam rem aperiam, eaque
                  ipsa quae ab illo inventore veritatis et quasi architecto
                  beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem
                  quia voluptas sit aspernatur aut odit aut fugit, sed quia
                  consequuntur magni dolores eos qui ratione voluptatem sequi
                  nesciunt. Neque porro quisquam est, qui dolorem ipsum quia
                  dolor sit amet, consectetur, adipisci velit, sed quia non
                  numquam eius modi tempora incidunt ut labore et dolore magnam
                  aliquam quaerat voluptatem. Ut enim ad minima veniam, quis
                  nostrum exercitationem ullam corporis suscipit laboriosam,
                  nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum
                  iure reprehenderit qui in ea voluptate velit esse quam nihil
                  molestiae consequatur, vel illum qui dolorem eum fugiat quo
                  voluptas nulla pariatur?"
                </p>
                <br />
                <p>
                  Sed ut perspiciatis unde omnis iste natus error sit voluptatem
                  accusantium doloremque laudantium, totam rem aperiam, eaque
                  ipsa quae ab illo inventore veritatis et quasi architecto
                  beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem
                  quia voluptas sit aspernatur aut odit aut fugit, sed quia
                  consequuntur magni dolores eos qui ratione voluptatem sequi
                  nesciunt. Neque porro quisquam est, qui dolorem ipsum quia
                  dolor sit amet, consectetur, adipisci velit, sed quia non
                  numquam eius modi tempora incidunt ut labore et dolore magnam
                  aliquam quaerat voluptatem. Ut enim ad minima veniam, quis
                  nostrum exercitationem ullam corporis suscipit laboriosam,
                  nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum
                  iure reprehenderit qui in ea voluptate velit esse quam nihil
                  molestiae consequatur, vel illum qui dolorem eum fugiat quo
                  voluptas nulla pariatur?"
                </p>
              </FullDescription>
            </dl>
          </div>
          <div className="border-b border-stone-50 py-8 pb-6">
            <h3 className="font-['Acumin Pro SemiCondensed'] pb-5 text-2xl font-semibold leading-tight text-blue-800">
              Points of Contact
            </h3>
            <div className="grid sm:grid-cols-2">
              <dl className="flex flex-col gap-y-6">
                <SimpleDescription label="Author Name" text="John Doe" />
                <SimpleDescription
                  label="Author Email"
                  text="john.doe@wri.org"
                />
              </dl>
              <dl className="flex flex-col gap-y-6">
                <SimpleDescription label="Maintainer Name" text="John Moe" />
                <SimpleDescription
                  label="Maintainer Email"
                  text="john.moe@wri.org"
                />
              </dl>
            </div>
          </div>
          <div className="border-b border-stone-50 py-8 pb-6">
            <h3 className="font-['Acumin Pro SemiCondensed'] pb-5 text-2xl font-semibold leading-tight text-blue-800">
              More details
            </h3>
            <div className="grid sm:grid-cols-2">
              <dl className="flex flex-col gap-y-6">
                <SimpleDescription
                  label="Function"
                  text="This data serves 'x' purpose..."
                />
                <SimpleDescription
                  label="Restrictions"
                  text="Data can only be used without alteration.."
                />
                <SimpleDescription
                  label="Reasons for adding"
                  text="Due to new funding for research."
                />
                <SimpleDescription
                  label="Learn More"
                  text="Please visit our website for more information: LINK TO WEBSITE"
                />
              </dl>
              <dl className="flex flex-col gap-y-6">
                <SimpleDescription
                  label="Cautions"
                  text="Data set is not for use in litigation. While efforts have been made to ensure that these data are accurate and reliable within the state of the art, WRI, cannot assume liability for any damages, or misrepresentations, caused by any inaccuracies in the data, or as a result of the data to be used on a particular system. WRI makes no warranty, expressed or implied, nor does the fact of"
                />
                <SimpleDescription
                  label="Summary"
                  text="My short summary of this data..."
                />
              </dl>
            </div>
          </div>
          <div className="border-b border-stone-50 py-8 pb-6">
            <h3 className="font-['Acumin Pro SemiCondensed'] pb-5 text-2xl font-semibold leading-tight text-blue-800">
              Data files
            </h3>
            <div>
              <Datafile
                name="referencetables.xlsx"
                title="Reference Tables"
                type="upload"
                format="XLSX"
                description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea."
              />
              <Datafile
                name="https://source/to/original/data"
                title="Reference Tables"
                type="link"
                format="XLSX"
                description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea."
              />
              <Datafile
                name="https://source/to/original/data"
                title="Reference Tables"
                type="layer"
                format="XLSX"
                description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FullDescription({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const [showReadMore, setShowReadMore] = useState(false);
  const [readMore, setReadMore] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  useLayoutEffect(() => {
    if (ref.current && ref.current.clientHeight < ref.current.scrollHeight) {
      setShowReadMore(true);
      return;
    }
    setShowReadMore(false);
  }, []);

  return (
    <div>
      <dt className="font-['Acumin Pro SemiCondensed'] text-lg font-semibold leading-tight text-black">
        {label}
      </dt>
      <div
        ref={ref}
        className={classNames(
          "max-h-[180px] overflow-y-hidden font-acumin text-lg font-normal leading-tight text-stone-500 transition",
          readMore ? "max-h-fit" : "",
        )}
      >
        {children}
      </div>
      {showReadMore && (
        <button
          onClick={() => setReadMore(!readMore)}
          className="font-['Acumin Pro SemiCondensed'] flex items-center gap-x-2 py-4 text-lg font-semibold leading-tight text-wri-green"
        >
          Read {readMore ? "less" : "more"}
          <ChevronDownIcon
            className={`${
              readMore ? "rotate-180 transform  transition" : ""
            } h-5 w-5 text-wri-green`}
          />
        </button>
      )}
    </div>
  );
}

function SimpleDescription({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <dt className="font-['Acumin Pro SemiCondensed'] text-lg font-semibold leading-tight text-black">
        {label}
      </dt>
      <dd className="font-['Acumin Pro SemiCondensed'] text-lg font-normal leading-tight text-stone-500">
        {text}
      </dd>
    </div>
  );
}

function ListOfItems({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <dt className="font-['Acumin Pro SemiCondensed'] text-lg font-semibold leading-tight text-black">
        {label}
      </dt>
      <div className="flex flex-wrap gap-3">
        {items.map((item) => (
          <span className="flex items-center gap-x-2 rounded-[3px] border border-blue-800 bg-white px-2 py-0.5">
            <span className="font-['Acumin Pro SemiCondensed'] mt-1 text-[15px] font-normal text-zinc-800">
              {item}
            </span>
            <XMarkIcon className="h-3 w-3 cursor-pointer text-red-600" />
          </span>
        ))}
      </div>
    </div>
  );
}

interface DatafilePreviewProps {
  type: "link" | "upload" | "layer";
  name: string;
  title: string;
  format: string;
  description: string;
}

function Datafile({
  type,
  name,
  title,
  format,
  description,
}: DatafilePreviewProps) {
  return (
    <Disclosure>
      {({ open }) => (
        <>
          <Disclosure.Button
            className={classNames(
              "flex w-full items-center justify-between rounded-sm bg-white px-6 pt-3 shadow transition hover:bg-slate-100",
              open ? "bg-slate-100" : "bg-white",
            )}
          >
            <div
              className={classNames(
                "flex w-full items-center justify-between gap-x-2 pb-3",
                open ? "border-b border-zinc-300" : "",
              )}
            >
              <div className="flex items-center gap-x-2">
                {match(type)
                  .with("upload", () => (
                    <>
                      <PaperClipIcon className="h-6 w-6 text-blue-800" />
                      <span className="text-lg font-light text-black">
                        {name}
                      </span>
                      <span className="text-right font-acumin text-xs font-normal leading-tight text-neutral-500">
                        (3.2 MB)
                      </span>
                    </>
                  ))
                  .with("link", () => (
                    <>
                      <LinkIcon className="h-6 w-6 text-blue-800" />
                      <span className="text-lg font-light text-black">
                        {name}
                      </span>
                    </>
                  ))
                  .otherwise(() => (
                    <>
                      <GlobeAsiaAustraliaIcon className="h-6 w-6 text-blue-800" />
                      <span className="text-lg font-light text-black">
                        {name}
                      </span>
                    </>
                  ))}
              </div>
              <ChevronDownIcon
                className={classNames(
                  "h-4 w-4 text-zinc-300",
                  open ? "rotate-180 transform" : "",
                )}
              />
            </div>
          </Disclosure.Button>
          <Transition
            enter="transition duration-100 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-75 ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0"
          >
            <Disclosure.Panel>
              <div className="grid sm:grid-cols-2 gap-4 bg-slate-100 p-6">
                <SimpleDescription label="Title" text={title} />
                <SimpleDescription label="Format" text={format} />
                <div className="col-span-full">
                  <SimpleDescription label="Description" text={description} />
                </div>
                {type === "upload" && (
                  <div className="col-span-full">
                    <PreviewTable />
                  </div>
                )}
              </div>
            </Disclosure.Panel>
          </Transition>
        </>
      )}
    </Disclosure>
  );
}

const fields = [
  {
    field: "id",
    type: "int(1)",
    null: false,
    key: "MUL",
    default: "NULL",
  },
  {
    field: "id",
    type: "int(1)",
    null: false,
    key: "MUL",
    default: "NULL",
  },
  {
    field: "id",
    type: "int(1)",
    null: false,
    key: "MUL",
    default: "NULL",
  },
  {
    field: "id",
    type: "int(1)",
    null: false,
    key: "MUL",
    default: "NULL",
  },
];

function PreviewTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-neutral-50">
          <TableHead className="font-acumin text-xs font-semibold text-black">
            Field
          </TableHead>
          <TableHead className="font-acumin text-xs font-semibold text-black">
            Type
          </TableHead>
          <TableHead className="font-acumin text-xs font-semibold text-black">
            Null
          </TableHead>
          <TableHead className="font-acumin text-xs font-semibold text-black">
            Key
          </TableHead>
          <TableHead className="font-acumin text-xs font-semibold text-black">
            Default
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {fields.map((field, index) => (
          <TableRow
            key={index}
            className={index % 2 != 0 ? "border-0 bg-[#FDFDFD]" : "border-0 bg-white"}
          >
            <TableCell>{field.field}</TableCell>
            <TableCell>{field.type}</TableCell>
            <TableCell>{field.null ? "YES" : "NO"}</TableCell>
            <TableCell>{field.key}</TableCell>
            <TableCell>{field.default}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
