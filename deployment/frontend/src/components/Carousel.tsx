
import { useState } from 'react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Swiper } from 'swiper/react';
import { Navigation } from "swiper/modules";

type FilterCarouselProps = {
  children: React.ReactNode;
  identifier: string;
}

export default function FilterCarousel({ children, identifier }: FilterCarouselProps) {
  const prevEl = `.nav-prev-button${identifier ? '--' + identifier : ''}`;
  const nextEl = `.nav-next-button${identifier ? '--' + identifier : ''}`;
  const [swiper, setSwiper] = useState(null);
  return (
    <>
      <Swiper
        modules={[Navigation]}
        onSwiper={(instance) => setSwiper(instance)}
        breakpoints={{
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
            slidesPerView: 4,
            slidesPerGroup: 4,
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
