import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/_shared/Button";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";

const sourceSchema = z
  .object({
    type: z.enum(["raster", "vector"]),
    minzoom: z.number().min(0).max(22).default(0),
    maxzoom: z.number().min(0).max(22).default(22),
    tiles: z.string().url(),
  })
  //Make sure that maxZoom is always bigger than minZoom
  .refine((obj) => obj.maxzoom >= obj.minzoom, {
    path: ["zoom"],
    message: "maxZoom must be bigger than minZoom",
  });

export type SourceFormType = z.infer<typeof sourceSchema>;

export default function SourceForm({
  onNext,
  defaultValues,
}: {
  onNext: (data: SourceFormType) => void;
  defaultValues: SourceFormType | null;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SourceFormType & { zoom?: string }>({
    defaultValues: defaultValues || undefined,
    resolver: zodResolver(sourceSchema),
  });
  const onSubmit = (data: SourceFormType) => onNext(data);

  return (
    <>
      <form className="flex flex-col px-4 min-h-[416px] justify-between" onSubmit={handleSubmit(onSubmit)}>
        <div className="mt-10 grid gap-x-6 gap-y-4">
          <div className="grid grid-cols-12 gap-x-6">
            <label className="lg:col-span-2 col-span-full lg:text-right text-left font-acumin text-lg font-normal leading-tight text-black">
              Type of data
            </label>
            <select
              {...register("type")}
              className="relative lg:col-span-10 col-span-full block w-full rounded-md border-0 px-5 py-2 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:border-b-2 focus:border-blue-800 focus:bg-slate-100 focus:ring-0 focus:ring-offset-0 sm:text-sm sm:leading-6"
            >
              <option value="raster">Raster</option>
              <option value="vector">Vector</option>
            </select>
          </div>
          <div className="grid grid-cols-12 gap-x-6">
            <label className="lg:col-span-2 col-span-full lg:text-right text-left font-acumin text-lg font-normal leading-tight text-black">
              Tiles of your data
            </label>
            <input
              type="text"
              defaultValue="https://tiles.globalforestwatch.org/umd_tree_cover_loss/v1.10/tcd_30/{z}/{x}/{y}.png"
              {...register("tiles")}
              className="shadow-wri-small lg:col-span-10 col-span-full block w-full rounded-md border-0 px-5 py-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:border-b-2 focus:border-blue-800 focus:bg-slate-100 focus:ring-0 focus:ring-offset-0 sm:text-sm sm:leading-6"
            />
            <p>{errors.tiles?.message}</p>
          </div>
          <div className="relative grid grid-cols-12 gap-x-6">
            <label className="lg:col-span-2 col-span-full lg:text-right text-left font-acumin text-lg font-normal leading-tight text-black">
              Min zoom
            </label>
            <input
              type="number"
              {...register("minzoom", { valueAsNumber: true })}
              defaultValue={1}
              className="shadow-wri-small lg:col-span-10 col-span-full block w-full rounded-md border-0 px-5 py-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:border-b-2 focus:border-blue-800 focus:bg-slate-100 focus:ring-0 focus:ring-offset-0 sm:text-sm sm:leading-6"
            />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <ExclamationCircleIcon
                className="h-5 w-5 text-neutral-500"
                aria-hidden="true"
              />
            </div>
            <p className="text-red-600">{errors.minzoom?.message}</p>
            <p className="text-red-600">{errors.zoom?.message}</p>
          </div>
          <div className="relative grid grid-cols-12 gap-x-6">
            <label className="lg:col-span-2 col-span-full lg:text-right text-left font-acumin text-lg font-normal leading-tight text-black">
              Max zoom
            </label>
            <input
              type="number"
              defaultValue={20}
              {...register("maxzoom", { valueAsNumber: true })}
              className="shadow-wri-small lg:col-span-10 col-span-full block w-full rounded-md border-0 px-5 py-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:border-b-2 focus:border-blue-800 focus:bg-slate-100 focus:ring-0 focus:ring-offset-0 sm:text-sm sm:leading-6"
            />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <ExclamationCircleIcon
                className="h-5 w-5 text-neutral-500"
                aria-hidden="true"
              />
            </div>
            <p className="text-red-600">{errors.maxzoom?.message}</p>
            <p className="text-red-600">{errors.zoom?.message}</p>
          </div>
        </div>
          <Button type="submit" className="mt-4 ml-auto w-fit">
            Next: Legend
          </Button>
      </form>
    </>
  );
}
