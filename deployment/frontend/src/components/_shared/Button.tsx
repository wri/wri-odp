import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import classNames from '@/utils/classnames'

const buttonVariants = cva(
    'inline-flex items-center justify-center ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    {
        variants: {
            variant: {
                default:
                    'bg-amber-400 text-stone-900 font-bold font-acumin hover:bg-yellow-500',
                light: 'bg-orange-300 hover:bg-orange-400 text-stone-900 font-bold font-acumin',
                muted: 'bg-amber-100 hover:bg-amber-400 text-stone-900 font-bold font-acumin',
                gray: 'bg-stone-200 hover:bg-stone-300 border border-amber-400 hover:border-amber-300 text-stone-900 font-bold font-acumin',
                destructive:
                    'bg-red-600 text-white hover:bg-red-800',
                outline:
                    'border bg-none hover:bg-amber-400 hover:text-black border-amber-400 font-semibold',
                secondary:
                    'bg-secondary text-secondary-foreground hover:bg-secondary/80',
                ghost: 'hover:bg-accent hover:text-accent-foreground',
                link: 'text-primary underline-offset-4 hover:underline',
            },
            size: {
                default: 'h-11 px-6 py-4 rounded-[3px] text-base',
                sm: 'h-8 rounded-md px-4 py-3 text-sm',
                lg: 'h-[60px] px-8',
                icon: 'h-10 w-10',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
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
                className={classNames(
                    buttonVariants({ variant, size, className })
                )}
                ref={ref}
                {...props}
            />
        )
    }
)

const LoaderButton = React.forwardRef<
    HTMLButtonElement,
    ButtonProps & { loading: boolean; spinnerClassnames?: string }
>(
    (
        {
            className,
            variant,
            size,
            asChild = false,
            loading,
            spinnerClassnames,
            ...props
        },
        ref
    ) => {
        if (loading) {
            return (
                <button
                    className={classNames(
                        buttonVariants({ variant, size, className })
                    )}
                    disabled={true}
                    ref={ref}
                    {...props}
                >
                    <svg
                        className={classNames(
                            'h-5 w-5 animate-spin mr-2',
                            spinnerClassnames ?? ''
                        )}
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                    </svg>
                    Loading
                </button>
            )
        }
        return (
            <button
                className={classNames(
                    buttonVariants({ variant, size, className })
                )}
                ref={ref}
                {...props}
            />
        )
    }
)

Button.displayName = 'Button'

export { Button, LoaderButton, buttonVariants }
