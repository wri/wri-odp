import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import classNames from '@/utils/classnames';

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipPortal = TooltipPrimitive.Portal;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
    React.ElementRef<typeof TooltipPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
    <TooltipPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={classNames(
            'z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
            className ?? ''
        )}
        {...props}
    />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

const DefaultTooltip = ({
    children,
    content,
    disabled = false,
    side = 'top',
    contentClassName = '',
    open,
    onOpenChange,
    delayDuration = 100,
}: {
    children: React.ReactNode;
    content: React.ReactNode | string;
    disabled?: boolean;
    side?: 'top' | 'bottom' | 'left' | 'right';
    contentClassName?: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    delayDuration?: number;
}) => {
    if (disabled) return <>{children}</>;
    return (
        <TooltipProvider delayDuration={delayDuration}>
            <Tooltip open={open} onOpenChange={onOpenChange}>
                <TooltipTrigger asChild>{children}</TooltipTrigger>
                <TooltipPrimitive.Portal>
                    <TooltipContent
                        className={`bg-white whitespace-normal ${contentClassName}`}
                        side={side}
                    >
                        <p className="max-w-sm">{content}</p>
                    </TooltipContent>
                </TooltipPrimitive.Portal>
            </Tooltip>
        </TooltipProvider>
    );
};
export {
    DefaultTooltip,
    Tooltip,
    TooltipTrigger,
    TooltipContent,
    TooltipProvider,
    TooltipPortal,
};
export default DefaultTooltip;
