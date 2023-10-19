import { XCircleIcon } from "@heroicons/react/24/outline";

export default function FiltersSelected() {
  return (
    <div className="flex flex-col lg:flex-row gap-y-4 lg:items-center justify-between">
      <div className="flex flex-wrap gap-2">
        <div className="flex h-8 w-fit items-center gap-x-2 rounded-sm bg-neutral-100 hover:bg-neutral-200 transition px-3 py-1 shadow">
          <div className="font-['Acumin Pro SemiCondensed'] text-xs font-semibold leading-none text-black">
            Temporal coverage: 2022 - 2023
          </div>
          <XCircleIcon className="h-4 w-4 text-red-600 cursor-pointer" />
        </div>
        <div className="flex h-8 w-fit items-center gap-x-2 rounded-sm bg-neutral-100 hover:bg-neutral-200 transition px-3 py-1 shadow">
          <div className="font-['Acumin Pro SemiCondensed'] text-xs font-semibold leading-none text-black">
            Resolution: FILTER 2
          </div>
          <XCircleIcon className="h-4 w-4 text-red-600 cursor-pointer" />
        </div>
        <div className="flex h-8 w-fit items-center gap-x-2 rounded-sm bg-neutral-100 hover:bg-neutral-200 transition px-3 py-1 shadow">
          <div className="font-['Acumin Pro SemiCondensed'] text-xs font-semibold leading-none text-black">
            Resolution: FILTER 1
          </div>
          <XCircleIcon className="h-4 w-4 text-red-600 cursor-pointer" />
        </div>
      </div>
      <div className="font-['Acumin Pro SemiCondensed'] text-sm font-normal text-black underline">
        Clear all filters
      </div>
    </div>
  );
}
