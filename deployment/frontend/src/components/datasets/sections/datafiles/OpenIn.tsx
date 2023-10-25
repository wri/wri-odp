import Modal from "@/components/_shared/Modal";
import { Tab } from "@headlessui/react";
import {
  ArrowTopRightOnSquareIcon,
  ClipboardIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";
import { DatasetTabs } from "../../DatasetTabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/_shared/Tooltip";

export function OpenInButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full flex aspect-square flex-col items-center justify-center md:gap-y-2 rounded-sm border-2 border-wri-green bg-white shadow transition hover:bg-amber-400"
      >
        <ArrowTopRightOnSquareIcon className="h-5 w-5 sm:h-9 sm:w-9" />
        <div className="font-acumin text-xs sm:text-sm font-normal text-black">
          Open In
        </div>
        <div className="h-4 font-acumin text-xs font-normal text-black"></div>
      </button>
      <OpenInModal open={open} setOpen={setOpen} />
    </>
  );
}

function OpenInModal({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const tabs = [
    { name: "Power BI" },
    { name: "Tableau" },
    { name: "Google Earth Engine" },
    { name: "Some other tool" },
  ];
  return (
    <Modal open={open} setOpen={setOpen} className="max-w-[64rem]">
      <div className="flex flex-col gap-y-4 p-5 font-acumin">
        <div className="font-['Acumin Pro SemiCondensed'] text-3xl font-normal text-black">
          Open In
        </div>
        <Tab.Group>
          <Tab.List as="nav" className="mt-6 flex border-b border-zinc-300">
            <DatasetTabs tabs={tabs} />
          </Tab.List>
          <Tab.Panels as="div" className="max-h-[18rem] overflow-y-auto">
            <Tab.Panel>
              <div className="font-['Acumin Pro SemiCondensed'] flex flex-col gap-y-3 text-justify text-sm font-normal text-black">
                <div className="font-['Acumin Pro SemiCondensed'] text-base font-normal text-zinc-800">
                  Copy the following URL and Insert it into lorem ipsum mipsum
                </div>
                <div className="flex h-12 items-center justify-between rounded-sm border border-zinc-300 bg-white px-4">
                  <div className="font-acumin text-base font-normal text-black">
                    https://www.google.com/search?q=abstract%20api
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <ClipboardIcon className="h-5 w-5 text-blue-800" />
                      </TooltipTrigger>
                      <TooltipContent className="bg-neutral-200">
                        <p>Copy to clipboard</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="font-['Acumin Pro SemiCondensed'] text-base font-normal text-zinc-800">
                  Then do lorem ipsum mipsum..
                </div>
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </Modal>
  );
}
