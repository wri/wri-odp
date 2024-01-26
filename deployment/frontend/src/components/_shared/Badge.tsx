import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
 
import classNames from "@/utils/classnames"
 
const badgeVariants = cva(
  "inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        running:
          "border-transparent bg-blue-800 text-white hover:bg-blue-800/80",
        success:
          "border-transparent bg-emerald-800 text-white hover:bg-emerald-800/80",
        warning:
          "border-transparent bg-yellow-800 text-destructive-foreground shadow hover:bg-yellow-800/80",
        destructive:
          "border-transparent bg-red-800 text-destructive-foreground shadow hover:bg-red-800/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)
 
export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}
 
function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={classNames(badgeVariants({ variant }), className)} {...props} />
  )
}
 
export { Badge, badgeVariants }
