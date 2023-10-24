

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Swiper } from 'swiper/react';
import { Navigation } from "swiper/modules";
import { SwiperOptions } from 'swiper/types';

type CarouselProps = {
  children: React.ReactNode;
  identifier: string;
  breakpoints?: {
    [width: number]: SwiperOptions;
    [ratio: string]: SwiperOptions;
  };
}

export default function Carousel({ children, identifier, breakpoints }: CarouselProps) {
  const prevEl = `.nav-prev-button${identifier ? '--' + identifier : ''}`;
  const nextEl = `.nav-next-button${identifier ? '--' + identifier : ''}`;
  // const [swiper, setSwiper] = useState<Swiper | null>(null);;
  return (
    <>
      <Swiper
        modules={[Navigation]}
        spaceBetween={identifier.includes("recent") ? 18 : 40}
        breakpoints={breakpoints ? breakpoints : {
          1: {
            slidesPerView: 1,
            slidesPerGroup: 1,
          },
          460: {
            slidesPerView: 2,
            slidesPerGroup: 2,
          },
          720: {
            slidesPerView: 2,
            slidesPerGroup: 2,
          },
          1200: {
            slidesPerView: 3,
            slidesPerGroup: 3,
          },
          1280: {
            slidesPerView: 4,
            slidesPerGroup: 4,
          },
        }}
        navigation={{
          prevEl: prevEl,
          nextEl: nextEl,
        }}
      >
        {children}
      </Swiper>
    </>
  );
};
