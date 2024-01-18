import { LegendTypeProps } from "../interfaces/legend-types";

export default function LegendTypeGradient(
	{ activeLayer }: Readonly<LegendTypeProps> = { activeLayer: {
		legendConfig: {
			type: 'proportional',
			items: []
		}
	} }
) {
	const { legendConfig } = activeLayer;
	return !legendConfig || legendConfig.type !== 'proportional' ? null : (
		<ul className="flex m-0 p-0 items-end list-none">
			{legendConfig.items.map(({ name, color, size }) => (
				<li
					key={`legend-proportional-item-${name}`}
					className="
        shrink 
        basis-[auto]
        grow p-0"
				>
					<div
						className="block w-[10px] h-[10px] ml-auto mr-auto mb-[5px] rounded-[100%]"
						style={{
							backgroundColor: color,
							width: size,
							height: size,
						}}
					/>
					<span className="block text-sm text-center">{name}</span>
				</li>
			))}
		</ul>
	);
}
