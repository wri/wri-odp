import {
  ArrowUpTrayIcon
} from "@heroicons/react/24/outline";

export interface UploadProps {
  text?: string;
}

export default function UploadButton(props: UploadProps) {
  return (
    <>
    <button
        className="w-full flex aspect-square flex-col items-center justify-center md:gap-y-2 rounded-[0.188rem] border-2 bg-white shadow transition hover:bg-amber-400"
    >
      <ArrowUpTrayIcon className="h-5 w-5 sm:h-9 sm:w-9 text-[#3654A5]" />
      <div className="font-acumin text-xs sm:text-sm font-normal text-black">{props.text ?? 'Upload a file'}</div>
    </button>
    </>
  );
}
