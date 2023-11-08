import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import CarouselNavButton from "../_shared/CarouselNavButton";
import SubtopicCard from "../topics/SubtopicCard";
import Image from "next/image";
import { AutoCarousel } from "../_shared/AutoCarousel";
import Link from "next/link";

const topics = [
  {
    title: "Subtopic 1",
    numOfDatasets: 163,
    img: "/images/topics/2.png",
  },
  {
    title: "Subtopic 2",
    numOfDatasets: 163,
    img: "/images/topics/3.png",
  },
  {
    title: "Subtopic 3",
    numOfDatasets: 163,
    img: "/images/topics/4.png",
  },
  {
    title: "Subtopic 4",
    numOfDatasets: 163,
    img: "/images/topics/5.png",
  },
  {
    title: "Subtopic 5",
    numOfDatasets: 163,
    img: "/images/topics/6.png",
  },
  {
    title: "Subtopic 6",
    numOfDatasets: 163,
    img: "/images/topics/7.png",
  },
  {
    title: "Subtopic 7",
    numOfDatasets: 163,
    img: "/images/topics/2.png",
  },
  {
    title: "Subtopic 8",
    numOfDatasets: 163,
    img: "/images/topics/3.png",
  },
  {
    title: "Subtopic 9",
    numOfDatasets: 163,
    img: "/images/topics/4.png",
  },
  {
    title: "Subtopic 8",
    numOfDatasets: 163,
    img: "/images/topics/3.png",
  },
  {
    title: "Subtopic 9",
    numOfDatasets: 163,
    img: "/images/topics/4.png",
  },
  {
    title: "Subtopic 8",
    numOfDatasets: 163,
    img: "/images/topics/3.png",
  },
  {
    title: "Subtopic 9",
    numOfDatasets: 163,
    img: "/images/topics/4.png",
  },
  {
    title: "Subtopic 8",
    numOfDatasets: 163,
    img: "/images/topics/3.png",
  },
  {
    title: "Subtopic 9",
    numOfDatasets: 163,
    img: "/images/topics/4.png",
  },
];

export interface TopicProps {
  title: string;
  numOfDatasets: number;
  img: string;
}

function TopicCard({ topic }: { topic: TopicProps }) {
  return (
    <Link href="/topics/x" className="flex w-full flex-col gap-1 pr-4 font-acumin">
      <div className="relative aspect-square h-72 w-full">
        <Image src={`${topic.img}`} alt="higlight" fill />
      </div>
      <p className="font-['Acumin Pro SemiCondensed'] text-xl font-semibold text-black">
        Topic 1
      </p>
      <p className="font-['Acumin Pro SemiCondensed'] w-24 text-base font-semibold text-green-700">
        163 Datasets
      </p>
    </Link>
  );
}

export function TopicsCarousel() {
  return (
    <div className="relative">
      <div className="peer">
        <AutoCarousel name="topics" prevButton={<PrevButton />} nextButton={<NextButton />}>
          {topics.map((topic, index) => (
            <SwiperSlide key={index} className="">
              <TopicCard topic={topic} />
            </SwiperSlide>
          ))}
        </AutoCarousel>
      </div>
    </div>
  );
}

const PrevButton = () => (
  <div
    className={`nav-prev-button--topics absolute top-[40%] z-50 ml-[-1.9rem] hidden -translate-y-2/4 opacity-0 transition-all hover:opacity-100 peer-hover:opacity-100 md:left-0 lg:block`}
  >
    <CarouselNavButton orientation="left" />
  </div>
);

const NextButton = () => (
  <div
    className={`nav-next-button--topics right-[calc(0px + 3.3rem)] absolute top-[40%] z-50 hidden -translate-y-2/4 opacity-0 transition-all hover:opacity-100 peer-hover:opacity-100 md:right-0 lg:block`}
  >
    <CarouselNavButton orientation="right" />
  </div>
);
