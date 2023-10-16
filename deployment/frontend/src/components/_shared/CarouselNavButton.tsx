
import { ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/20/solid";

const sizes = {
  small: 'w-[30px] h-[30px]',
  medium: 'w-[50px] h-[50px]',
};

const CarouselNavButton: React.FC<{
  orientation: 'left' | 'right';
  size?: 'small' | 'medium';
}> = ({ orientation, size }) => {
  return (
    <>
      <button
        className={`bg-white shadow ${sizes[size]} rounded-full flex justify-center items-center`}
      >
        <ArrowRightIcon className={`w-6 h-6 text-black ${orientation === "right" ? "block" : "hidden"}`} />
        <ArrowLeftIcon className={`w-6 h-6 text-black ${orientation === "left" ? "block" : "hidden"}`} />
      </button>
    </>
  );
};

CarouselNavButton.defaultProps = { orientation: 'left', size: 'medium' };

export default CarouselNavButton;