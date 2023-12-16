import { LegendTypeProps } from '../interfaces/legend-types';
import LegendItem from './legend-item-type-basic-item';

export default function LegendTypeBasic(
  { activeLayer, mode }: Readonly<LegendTypeProps & { mode?: string }> = {
		activeLayer: {
			legendConfig: {
				type: 'basic',
				items: [],
			},
		},
	}
) {

  const { legendConfig } = activeLayer;

  return !legendConfig || legendConfig.type !== 'basic' ? null : (
    <div className="c-legend-type-basic">
      <ul className={`${mode} m-0 p-0 list-none`}>
        {legendConfig.items.map(item => (
          <li key={`legend-basic-item-${item.name}`} className='p-0'>
            <LegendItem {...item} />
            {!!item.items && !!item.items.length && (
              <ul className="pt-[8px] mb-0 mr-0 ml-[10px]">
                {item.items.map(it => (
                  <li key={`legend-basic-item-${it.name}`}>
                    <LegendItem style={{ borderBottom: 0 }} {...it} />
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

