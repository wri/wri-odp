import { Navigation } from "swiper/modules";
import { Swiper } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { ReactNode } from "react";

export function AutoCarousel({ children, name, prevButton, nextButton }: { children: ReactNode; name: string, prevButton: ReactNode, nextButton: ReactNode }) {
  const prevEl = `nav-prev-button--${name}`;
  const nextEl = `nav-next-button--${name}`;
  return (
    <div className="relative auto-carousel">
      <div className="peer">
        <Swiper
          className="flex"
          modules={[Navigation]}
          spaceBetween={0}
          slidesPerView="auto"
          navigation={{
            prevEl: `.${prevEl}`,
            nextEl: `.${nextEl}`,
          }}
        >
          {children}
        </Swiper>
      </div>
      {prevButton}
      {nextButton}
    </div>
  );
}
