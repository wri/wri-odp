import Image from "next/image";
import { Button } from "../_shared/Button";
import { ChevronLeftIcon } from "@heroicons/react/20/solid";

export function Hero() {
  return (
    <div className="mb-8 lg:mb-16 mt-10 grid lg:grid-cols-5 font-acumin max-w-[1440px] mx-auto">
      <div className="relative lg:col-span-2 h-[18.5rem]">
        <Image alt="Topic name" fill={true} src="/images/topics/1.png" />
        <div className="h-[68px] w-56 rounded-t-[3px] bg-white z-10 bottom-0 absolute flex items-center justify-center">
          <Button>
            <ChevronLeftIcon className="mb-1 mr-1 h-6 w-6" />
            <span>See all topics</span>
          </Button>
        </div>
      </div>
      <div className="lg:col-span-3 py-6 lg:py-11 px-6 flex flex-col gap-y-2">
        <div className="text-black text-[33px] font-bold">Topic 1</div>
        <div className="max-w-[578.85px] text-black text-lg font-light">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam. Ut enim ad minim veniam.</div>
        <div className="flex items-center gap-3">
          <div className="text-black text-base font-light">363 Datasets</div>
          <div className="w-[1px] h-[18px] border border-black"></div>
          <div className="text-black text-base font-light">6 Subtopics</div>
        </div>

      </div>
    </div>
  );
}
