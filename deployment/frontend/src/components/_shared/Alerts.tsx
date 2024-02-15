import { XCircleIcon } from "@heroicons/react/20/solid";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

export function ErrorAlert({
  text,
  title = "There was an error",
}: {
  text: string;
  title?: string;
}) {
  return (
    <div className="rounded-md bg-red-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">{title}</h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{text}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function InfoAlert({
  text,
  title = "There was an error",
}: {
  text: string | React.ReactNode;
  title?: string;
}) {
  return (
    <div className="rounded-md bg-green-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <InformationCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-green-800">{title}</h3>
          <div className="mt-2 text-sm text-green-700">
            <p>{text}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
