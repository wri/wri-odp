import classNames from "@/utils/classnames";
import * as React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  placeholder: string;
  name?: string;
  type: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  maxWidth?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, type, maxWidth, icon, placeholder, children, ...props },
    ref,
  ) => {
    return (
      <div className={classNames("relative w-full rounded-md", maxWidth)}>
        <input
          placeholder={placeholder}
          type={type}
          ref={ref}
          {...props}
          className={classNames(
            "shadow-wri-small block w-full rounded-md border-0 px-5 py-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:border-b-2 focus:border-blue-800 disabled:bg-gray-100 focus:bg-slate-100 focus:ring-0 focus:ring-offset-0 sm:text-sm sm:leading-6",
            className ?? "",
          )}
        ></input>
        {children}
        {icon && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            {icon}
          </div>
        )}
      </div>
    );
  },
);
