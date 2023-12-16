import RCTooltip from 'rc-tooltip/lib';
import { TooltipProps } from 'rc-tooltip/lib/Tooltip';

export default function Tooltip(props: Readonly<TooltipProps>) {
	return (
		<RCTooltip
			{...props}
			showArrow={true}
			overlayClassName={`${props.overlayClassName} default-tooltip`}
			backgroundColor="transparent"
		>
			{props.children}
		</RCTooltip>
	);
}
