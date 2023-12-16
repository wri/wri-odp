import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

class LegendLayersTooltip extends PureComponent {
	static propTypes = {
		// Layers
		layers: PropTypes.array.isRequired,
		activeLayer: PropTypes.object.isRequired,
		// Callback to call when the layer changes with
		// the ID of the dataset and the ID of the layer
		onChangeLayer: PropTypes.func.isRequired,
	};

	render() {
		const { layers, activeLayer } = this.props;

		return (
			<div>
				Layers
				<ul className="mt-[8px] mx-0 mb-0">
					{layers.map(l => (
						<li
							key={l.id}
							className={` 
								before:top-[4px] 
								before:absolute 
								before:left-0 before:w-[8px] before:h-[8px] 
								before:bg-[#32864b] 
								before:rounded-[50%]
								hover:text-[#32864b]
								${/*mt-[4px] mx-0 mb-0*/null}
								space-y-1/2
								mt-[4px] mx-0 mb-0
								first:m-0
								relative cursor-pointer pl-[16px]
								${classnames({
								'before:block': l.id === activeLayer.id,
								'before:hidden': l.id !== activeLayer.id,
								})}
								`}
							onClick={() => this.props.onChangeLayer(l)}
						>
							{l.name}
						</li>
						)
					)}
				</ul>
			</div>
		);
	}
}

export default LegendLayersTooltip;
