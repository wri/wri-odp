import classNames from "@/utils/classnames";

export function InputGroup({
  label,
  className,
  labelClassname,
  children,
  required = false,
}: {
  label: string | React.ReactNode;
  className?: string;
  labelClassname?: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div
      className={classNames(
        "grid sm:grid-cols-8 justify-between gap-x-14",
        className ?? "",
      )}
    >
      {typeof label === "string" ? (
      <span className={classNames("col-span-2 text-left font-acumin xxl:text-lg font-normal leading-tight text-black sm:max-w-[5rem]", labelClassname ?? "")}>
        {label} {required && <span className="text-red-500">*</span>}
      </span>) : <>{label}</> }
      <div className="col-span-6 h-full w-full">{children}</div>
    </div>
  );
}
