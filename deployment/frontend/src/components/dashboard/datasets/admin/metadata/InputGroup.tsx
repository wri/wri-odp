import classNames from "@/utils/classnames";

export function InputGroup({
  label,
  className,
  children,
  required = false,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div
      className={classNames(
        "flex items-center justify-between sm:gap-x-14",
        className ?? "",
      )}
    >
      <span className="max-w-[4.6rem] text-left font-acumin text-lg font-normal leading-tight text-black">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </div>
  );
}
