import Image from "next/image";
import { Button } from "../_shared/Button";
import { ChevronLeftIcon } from "@heroicons/react/20/solid";
import { useState } from "react";
import { ClipboardDocumentIcon } from "@heroicons/react/24/outline";

export function Hero() {
  return (
    <div className="mx-auto mb-8 mt-10 grid max-w-[1440px] font-acumin lg:mb-16 lg:max-h-[18.5rem] lg:grid-cols-5">
      <div className="relative h-[18.5rem] lg:col-span-2">
        <Image alt="Topic name" fill={true} src="/images/topics/1.png" />
        <div className="absolute bottom-0 z-10 flex h-[68px] w-56 items-center justify-center rounded-t-[3px] bg-white">
          <Button>
            <ChevronLeftIcon className="mb-1 mr-1 h-6 w-6" />
            <span>See all topics</span>
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-y-1 px-6 py-6 lg:col-span-3">
        <div className="text-[33px] font-bold text-black">Topic 1</div>
        <div className="max-w-[578.85px] text-lg font-light text-black">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam. Ut enim ad minim veniam.
        </div>
        <div className="flex items-center gap-3">
          <div className="text-base font-light text-black">363 Datasets</div>
          <div className="h-[18px] w-[1px] border border-black"></div>
          <div className="text-base font-light text-black">6 Subtopics</div>
        </div>
        <CopyLink />
      </div>
    </div>
  );
}

function CopyLink() {
  const [clicked, setClicked] = useState(false);
  return (
    <>
      {!clicked ? (
        <Button
          onClick={() => {
            setClicked(!clicked);
            setTimeout(() => {
              setClicked(false);
            }, 3000);
          }}
          variant="outline"
          className="mr-auto mt-3"
        >
          Share Topic
        </Button>
      ) : (
        <button
          onClick={() => setClicked(!clicked)}
          className="mt-3 flex h-auto max-w-[578px] gap-2 rounded-sm border border-amber-400 px-5 py-3"
        >
          <ClipboardDocumentIcon className="h-6 w-6 text-gray-800" />
          <div className="max-w-[30rem]">
            <p className="text-start text-sm font-semibold text-black">
              Link copied to clipboard
            </p>
            <p className="text-start text-sm font-light">
              Make sure that the users who you are sharing the collection with,
              have permissions to see it.
            </p>
          </div>
        </button>
      )}
    </>
  );
}
