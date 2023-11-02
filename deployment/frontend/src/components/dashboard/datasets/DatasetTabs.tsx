import classNames from "@/utils/classnames";
import { Tab } from "@headlessui/react";
import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from "@heroicons/react/20/solid";
import { Fragment } from "react";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { PlusSmallIcon, PlusCircleIcon } from '@heroicons/react/24/outline'

type TabProps = {
  name: string;
  title: string;
  id?: string;
  content: JSX.Element;
};

export default function DatasetTabs({ tabs }: { tabs: TabProps[] }) {
  const prevEl = `.nav-prev-button--tabs`;
  const nextEl = `.nav-next-button--tabs`;
  return (
    <>
      <Swiper
        className="flex dataset-tabs w-full"
        modules={[Navigation]}
        spaceBetween={0}
        slidesPerView="auto"
        navigation={{
          prevEl: prevEl,
          nextEl: nextEl,
        }}
      >
        {tabs.map((tab) => (
          <SwiperSlide key={tab.name} className=" max-w-8xl">
            <Tab key={tab.title} className="  text-black font-normal text-base   accent-white ">
              {({ selected }) => (
                <div
                  className={`font-normal  px-6 py-4 focus:outline-0  border-b-2  w-full lg:px-12 2xl:px-14 ${selected ? " border-b-wri-dark-green border-b-2 text-wri-green" : ""
                    } `}
                >
                  {tab.title === 'Add dataset' ? (
                    <div className='flex'>
                      <div className='flex  items-center justify-center w-4 h-4 rounded-full  bg-wri-gold mr-2 mt-[0.2rem]'>
                        <PlusSmallIcon className='w-3 h-3 text-white' />
                      </div>
                      <span>{tab.title}</span>
                    </div>
                  ) : (<span>{tab.title}</span>)
                  }

                </div>
              )}
            </Tab>
          </SwiperSlide>
        ))}
      </Swiper>
      <button className="nav-prev-button--tabs">
        <ChevronDoubleLeftIcon
          className="h-6 w-6 text-black"
        />
      </button>
      <button className="nav-next-button--tabs">
        <ChevronDoubleRightIcon
          className="h-6 w-6 text-black"
        />
      </button>
    </>
  );
}
