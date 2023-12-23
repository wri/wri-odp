// @ts-nocheck
import { LegendTypeProps } from '../interfaces/legend-types';

export default function LegendTypeChoropleth(
	{ activeLayer }: Readonly<LegendTypeProps> = {
		activeLayer: {
			legendConfig: {
				type: 'choropleth',
				items: [],
			},
		},
	}
) {
	const { legendConfig } = activeLayer;

	return !legendConfig || legendConfig.type !== 'choropleth' ? null : (
		<div className="pt-[10px] px-0 pb-0 flex-col mt-[10px] xs:flex-row xs:mt-[initial]">
			<ul className="flex m-0 list-none p-0">
				{legendConfig.items.map(({ color }, i) => (
					<li
						className={`
            m-0 
            leading-[21px]
            xs:leading-[initial]
            xs:m-[initial]
            shrink 
            basis-[auto]
            grow p-0
            `}
						key={`legend-choropleth-item-${color}-${i}`}
					>
						{/* TODO: xs:position-initial is applying instead of relative I don't know how to fix it yet  */}
						<div
							className={`
                xs:block
                xs:h-[5px]
                xs:mb-[5px]
                xs:w-full
                xs:position-initial
                inline-block
                h-[12px]
                w-full
                mb-0
                relative
                top-[1px]
              `}
							style={{ 'background-color': color }}
						/>
					</li>
				))}
			</ul>
			<ul className="flex m-0 list-none p-0">
				{legendConfig.items
					.filter((i) => i.value || i.name)
					.map(({ name, value, color, styles = {} }, i) => (
						<li
							className={`
            m-0 
            leading-[21px]
            xs:leading-[initial]
            xs:m-[initial] 
            shrink 
            flex
            items-center
            basis-[auto]
            grow p-0
            `}
							key={`legend-choropleth-item-${color}-${i}`}
							style={{
								width: `${100 / legendConfig.items.length}%`,
							}}
						>
							<span
								className={`
              text-[12px]
              xs:block
              xs:ml-[0]
              inline-block 
              text-center
              w-full
              ml-[5px]
              `}
								style={styles}
							>
								{name || value}
							</span>
						</li>
					))}
			</ul>
		</div>
	);
}
