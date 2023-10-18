import { FC } from "react";

export default function CardsGrid<T extends unknown>({
  Card,
  items,
  className,
}: {
  Card: FC<{ item: T }>;
  items: Array<T>;
  className?: string;
}) {
  return (
    <div className={`grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 sm:gap-x-8 2xl:gap-x-10 gap-y-12 ${className}`}>
      {items.map((item, i) => {
        return <Card item={item} key={i} />;
      })}
    </div>
  );
}
