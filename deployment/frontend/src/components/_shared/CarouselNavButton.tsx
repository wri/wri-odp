
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

const sizes = {
  small: 'w-[30px] h-[30px]',
  medium: 'w-[60px] h-[60px]',
};

const CarouselNavButton: React.FC<{
  orientation: 'left' | 'right';
  size?: 'small' | 'medium';
}> = ({ orientation, size }) => {
  return (
    <>
      <button
        className={`bg-white shadow ${sizes[size ?? 'medium']} rounded-full flex justify-center items-center`}
        aria-label="Navigate"
      >
        <ChevronRightIcon className={`w-8 h-8 text-wri-black font-light ${orientation === "right" ? "block" : "hidden"}`} />
        <ChevronLeftIcon className={`w-8 h-8 text-wri-black font-light ${orientation === "left" ? "block" : "hidden"}`} />
      </button>
    </>
  );
};

CarouselNavButton.defaultProps = { orientation: 'left', size: 'medium' };

export default CarouselNavButton;
