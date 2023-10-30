import classNames from "@/utils/classnames";
import { match } from "ts-pattern";

export interface InputProps {
  placeholder: string;
  name: string;
  type: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  as?: "input" | "textarea";
  maxWidth?: string;
}

export function Input({
  placeholder,
  name,
  type,
  icon,
  children,
  className,
  as,
  maxWidth = "max-w-[28rem]",
}: InputProps) {
  return (
    <div className={classNames("relative w-full rounded-md", maxWidth)}>
      {match(as)
        .with("textarea", () => (
          <textarea
            placeholder={placeholder}
            name={name}
            className={classNames(
              "block w-full rounded-md border-0 px-5 py-2 text-gray-900 shadow-wri-small ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:border-b-2 focus:border-blue-800 focus:bg-slate-100 focus:ring-0 focus:ring-offset-0 sm:text-sm sm:leading-6",
              className ?? "",
            )}
          ></textarea>
        ))
        .otherwise(() => (
          <input
            placeholder={placeholder}
            name={name}
            type={type}
            className={classNames(
              "block w-full rounded-md border-0 px-5 py-2 text-gray-900 shadow-wri-small ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:border-b-2 focus:border-blue-800 focus:bg-slate-100 focus:ring-0 focus:ring-offset-0 sm:text-sm sm:leading-6",
              className ?? "",
            )}
          ></input>
        ))}
      {children}
      {icon && (
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          {icon}
        </div>
      )}
    </div>
  );
}
