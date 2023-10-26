import Image from "next/image";
import { Button } from "../_shared/Button";
import { EnvelopeIcon } from "@heroicons/react/24/outline";

export function HomeFooter() {
  return (
    <>
      <section className="bg-green-700">
        <div className="default-container mx-auto flex justify-between py-12">
          <div className="flex flex-col gap-y-1">
            <h4 className="font-acumin text-2xl font-bold text-white">
              Some CTA here? Lorem ipsum dolor. Etiam porta sem malesuada magna.
            </h4>
            <h5 className="font-acumin text-xl font-normal text-gray-200">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </h5>
          </div>
          <Button>Read More</Button>
        </div>
      </section>
      <div className="mx-auto flex w-full default-container flex-col pb-16">
        <div className="flex flex-col items-center gap-y-4 pt-16 font-bold text-wri-black sm:flex-row sm:items-start">
          <div className="mb-6 flex w-full flex-col items-center gap-y-4 sm:mb-0 sm:items-start">
            <p className="text-base font-bold">ABOUT WRI</p>
            <p className=" font-normal">About us</p>
            <p className=" font-normal">Our Work</p>
            <p className=" font-normal">Our Approach</p>
          </div>
          <div className="mb-6 flex w-full flex-col items-center gap-y-4  sm:mb-0 sm:items-start">
            <p className="text-base font-bold">USEFUL LINKS</p>
            <p className=" font-normal">About us</p>
            <p className=" font-normal">Our Work</p>
            <p className=" font-normal">Our Approach</p>
          </div>
          <div className="flex w-full flex-col items-center gap-y-4 sm:items-start">
            <p className="text-base font-bold">GET STARTED</p>
            <p className=" font-normal">About us</p>
            <p className=" font-normal">Our Work</p>
            <p className=" font-normal">Our Approach</p>
          </div>
          <div className="mt-10 flex w-full shrink flex-col items-center gap-y-4 sm:mt-0 sm:w-1/2 sm:items-start ml-auto">
            <p className="text-base font-bold sm:text-[1.375rem]">
              STAY UP TO DATE WITH THE NEWS{" "}
            </p>
            <div className="flex w-full flex-col gap-x-2 gap-y-4 lg:flex-row">
              <div className="flex w-full min-w-fit flex-row items-center gap-x-2 rounded-sm py-2 pl-1 outline  outline-1 lg:w-[337px]">
                <div className=" my-auto">
                  <EnvelopeIcon className="h-5 w-5 text-wri-gray" />
                </div>
                <div className="shrink grow basis-auto">
                  <input
                    type="text"
                    placeholder="Enter your email address"
                    className=" w-full text-xs font-normal placeholder:text-xs focus:outline-none"
                  />
                </div>
              </div>
              <div className="rounded-sm bg-wri-gold px-4 py-2 text-center text-[0.875rem] font-bold  text-wri-black sm:px-6 xxl:w-[139px] 2xl:px-10">
                SUBSCRIBE
              </div>
            </div>
            <div className="flex flex-row gap-5">
              <div className="relative h-5 w-5 ">
                <Image src="/icons/fb.svg" alt="" fill />
              </div>
              <div className="relative h-5 w-5 ">
                <Image src="/icons/x.svg" alt={""} fill />
              </div>
              <div className="relative h-5 w-5 ">
                <Image src="/icons/linkedin.svg" alt={""} fill />
              </div>
              <div className="relative h-5 w-5 ">
                <Image src="/icons/mail.svg" alt={""} fill />
              </div>
            </div>
          </div>
        </div>
        <div className="items mx-auto flex w-full flex-col gap-y-8 pt-16 sm:flex-row sm:gap-y-4">
          <div className=" relative mx-auto h-16 w-52 sm:ml-0 sm:h-20 sm:w-56">
            <Image
              src="/images/WRI_logo_4c.png"
              alt="Picture of the author"
              fill
            />
          </div>
          <div className="mt-auto flex items-end gap-x-1  text-base font-normal sm:ml-auto">
            <span>
              Powered by{" "}
              <a href="#" className=" text-wri-green">
                Portal.js
              </a>{" "}
              from
            </span>
            <div className=" relative h-6 w-24">
              <Image src="/images/datopian.png" alt="" fill></Image>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
