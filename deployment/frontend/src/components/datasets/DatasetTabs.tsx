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

export function DatasetTabs({ tabs }: { tabs: { name: string }[] }) {
  const prevEl = `.nav-prev-button--tabs`;
  const nextEl = `.nav-next-button--tabs`;
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
            <Tab as={Fragment}>
              {({ selected }: { selected: boolean }) => (
                <button
                  className={classNames(
                    selected
                      ? "border-wri-green text-wri-green"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                    "whitespace-nowrap border-b-2 px-6 font-acumin font-semibold transition",
                  )}
                >
                  {tab.name}
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
