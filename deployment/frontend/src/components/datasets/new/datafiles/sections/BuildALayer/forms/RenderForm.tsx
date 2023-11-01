import { Button } from "@/components/_shared/Button";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { useForm } from "react-hook-form";

interface InteractionFormProps {
  onNext: () => void;
  onPrev: () => void;
}

export default function RenderForm({ onPrev, onNext }: InteractionFormProps) {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<{ example?: string }>();
  const onSubmit = () => {
    onNext();
  };
  return (
    <>
      <form
        className="flex min-h-[416px] flex-col justify-between px-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="mt-10 grid gap-x-6 gap-y-4">
          <div className="grid grid-cols-12 gap-x-6">
            <label className="col-span-2 text-right font-acumin text-lg font-normal leading-tight text-black">
              Example
            </label>
            <select className="relative col-span-10 block w-full rounded-md border-0 px-5 py-2 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:border-b-2 focus:border-blue-800 focus:bg-slate-100 focus:ring-0 focus:ring-offset-0 sm:text-sm sm:leading-6">
              <option value="raster">Example Option</option>
              <option value="vector">Example Option</option>
            </select>
          </div>
          <div className="grid grid-cols-12 gap-x-6">
            <label className="col-span-2 text-right font-acumin text-lg font-normal leading-tight text-black">
              Example 2
            </label>
            <input
              type="text"
              {...register("example")}
              className="shadow-wri-small col-span-10 block w-full rounded-md border-0 px-5 py-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:border-b-2 focus:border-blue-800 focus:bg-slate-100 focus:ring-0 focus:ring-offset-0 sm:text-sm sm:leading-6"
            />
          </div>
          <div className="relative grid grid-cols-12 gap-x-6">
            <label className="col-span-2 text-right font-acumin text-lg font-normal leading-tight text-black">
              Example 3
            </label>
            <input
              type="number"
              className="shadow-wri-small col-span-10 block w-full rounded-md border-0 px-5 py-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:border-b-2 focus:border-blue-800 focus:bg-slate-100 focus:ring-0 focus:ring-offset-0 sm:text-sm sm:leading-6"
            />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <ExclamationCircleIcon
                className="h-5 w-5 text-neutral-500"
                aria-hidden="true"
              />
            </div>
          </div>
          <div className="relative grid grid-cols-12 gap-x-6">
            <label className="col-span-2 text-right font-acumin text-lg font-normal leading-tight text-black">
              Example 4
            </label>
            <input
              type="number"
              className="shadow-wri-small col-span-10 block w-full rounded-md border-0 px-5 py-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:border-b-2 focus:border-blue-800 focus:bg-slate-100 focus:ring-0 focus:ring-offset-0 sm:text-sm sm:leading-6"
            />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <ExclamationCircleIcon
                className="h-5 w-5 text-neutral-500"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-x-2">
          <Button variant="outline" onClick={() => onPrev()} type="button">
            Back
          </Button>
          <Button type="button" onClick={() => onNext()} className="w-fit">
            Save layer
          </Button>
        </div>
      </form>
    </>
  );
}
