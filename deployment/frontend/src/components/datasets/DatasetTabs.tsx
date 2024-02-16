import classNames from "@/utils/classnames";
import { Tab } from "@headlessui/react";
import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from "@heroicons/react/20/solid";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export function DatasetTabs({ tabs }: { tabs: { name: string, count?: number, highlighted?: boolean }[] }) {
  const prevEl = `.nav-prev-button--tabs`;
  const nextEl = `.nav-next-button--tabs`;
  console.log('TABS', tabs)
  return (
    <>
      <Swiper
        className="flex dataset-tabs"
        modules={[Navigation]}
        spaceBetween={0}
        slidesPerView="auto"
        navigation={{
          prevEl: prevEl,
          nextEl: nextEl,
        }}
      >
        {tabs.map((tab) => (
          <SwiperSlide key={tab.name} className="">
            <Tab as="div">
              {({ selected }: { selected: boolean }) => (
                <button
                  className={classNames(
                    selected
                      ? "border-wri-green text-wri-green"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                    "whitespace-nowrap border-b-2 px-6 font-acumin font-semibold transition",
                    tab.highlighted ? "bg-yellow-200" : ""
                  )}
                >
                  {tab.name}
                  {tab.count && (
                    <span className=" ml-1 inline-flex items-center px-1.5 py-0.2 rounded-full text-xs font-medium bg-wri-gold text-gray-800">
                      {tab.count}
                    </span>
                  )}
                </button>
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
