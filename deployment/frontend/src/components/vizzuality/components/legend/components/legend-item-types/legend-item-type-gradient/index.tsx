import { LegendTypeProps } from '../interfaces/legend-types';

export default function LegendTypeGradient(
	{ activeLayer }: Readonly<LegendTypeProps> = {
		activeLayer: {
			legendConfig: {
        type: 'gradient',
				items: [],
			},
		},
	}
) {
	const { legendConfig } = activeLayer;

	const items = legendConfig?.items.filter(
		(item) => item.color !== 'transparent'
	);
	const itemTransparent = legendConfig?.items.find(
		(item) => item.color === 'transparent'
	);
	const gradient = items?.map((item) => item.color);

	return !legendConfig || legendConfig.type !== 'gradient' ? null : (
		<div className="c-legend-type-gradient">
			<div className="flex">
				{itemTransparent && (
					<div
						style={{
							width: `${(1 / legendConfig.items.length) * 100}%`,
						}}
						className="icon-gradient-transparent block h-[5px] mt-[10px] mb-[5px] "
					/>
				)}
				<div
					className="block h-[5px] mt-[10px] mb-[5px]"
					style={{
						width: `${
							(items.length / legendConfig.items.length) * 100
						}%`,
						backgroundImage: `linear-gradient(to right, ${gradient.join(
							','
						)})`,
					}}
				/>
			</div>
			<ul className="flex m-0 p-0 list-none text-[12px]">
				{legendConfig.items.map(({ name, color, value }) =>
					name || value ? (
						<li
							key={`legend-gradient-item-${color}-${value}-${name}`}
							className="p-0 m-0 grow shrink basis-auto before:content-none"
						>
							<span className="block font-[inherit] text-center first:text-left last:text-rigth">
								{name || value}
							</span>
						</li>
					) : null
				)}
			</ul>
		</div>
	);
}
