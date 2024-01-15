import React from 'react';
import { SortableHandle } from '../../../../react-sortable-hoc/src';

const LegendItemDrag = () => (
	<span className="absolute cursor-move top-[19px] left-[8px]">
		<svg
			version="1.1"
			xmlns="http://www.w3.org/2000/svg"
			width="14"
			height="14"
			viewBox="0 0 19 32"
		>
			<title>drag-dots</title>
			<path d="M3.2 12.8c1.767 0 3.2 1.433 3.2 3.2s-1.433 3.2-3.2 3.2c-1.767 0-3.2-1.433-3.2-3.2s1.433-3.2 3.2-3.2z"></path>
			<path d="M16 12.8c1.767 0 3.2 1.433 3.2 3.2s-1.433 3.2-3.2 3.2c-1.767 0-3.2-1.433-3.2-3.2s1.433-3.2 3.2-3.2z"></path>
			<path d="M3.2 0c1.767 0 3.2 1.433 3.2 3.2s-1.433 3.2-3.2 3.2c-1.767 0-3.2-1.433-3.2-3.2s1.433-3.2 3.2-3.2z"></path>
			<path d="M16 0c1.767 0 3.2 1.433 3.2 3.2s-1.433 3.2-3.2 3.2c-1.767 0-3.2-1.433-3.2-3.2s1.433-3.2 3.2-3.2z"></path>
			<path d="M3.2 25.6c1.767 0 3.2 1.433 3.2 3.2s-1.433 3.2-3.2 3.2c-1.767 0-3.2-1.433-3.2-3.2s1.433-3.2 3.2-3.2z"></path>
			<path d="M16 25.6c1.767 0 3.2 1.433 3.2 3.2s-1.433 3.2-3.2 3.2c-1.767 0-3.2-1.433-3.2-3.2s1.433-3.2 3.2-3.2z"></path>
		</svg>
	</span>
);

export default SortableHandle(LegendItemDrag);
