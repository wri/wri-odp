import classNames from "@/utils/classnames";

export function InputGroup({
  label,
  className,
  labelClassName,
  children,
  required = false,
}: {
  label: string;
  className?: string;
  labelClassName?: string,
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div
      className={classNames(
        "md:flex items-center justify-between gap-x-14",
        className ?? "",
      )}
    >
      <span
        className={classNames(
          "w-[4rem] text-left font-acumin text-lg font-normal leading-tight text-black",
          labelClassName ?? ""
        )}
      >
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </div>
  );
}
