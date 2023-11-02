import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import classNames from "@/utils/classnames"
 
const buttonVariants = cva(
  "inline-flex items-center justify-center ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-amber-400 text-stone-900 font-bold font-acumin hover:bg-yellow-500",
        light: "bg-orange-300 hover:bg-orange-400 text-stone-900 font-bold font-acumin",
        muted: "bg-amber-100 hover:bg-amber-400 text-stone-900 font-bold font-acumin",
        gray: "bg-stone-200 hover:bg-stone-300 border border-amber-400 hover:border-amber-300 text-stone-900 font-bold font-acumin",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border bg-none hover:bg-amber-400 hover:text-black border-amber-400 font-semibold",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-6 py-4 rounded-[3px] text-base",
        sm: "h-8 rounded-md px-4 py-3 text-sm",
        lg: "h-[60px] px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
 
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}
 
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        className={classNames(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"
 
export { Button, buttonVariants }
