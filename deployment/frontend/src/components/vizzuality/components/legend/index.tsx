import { arrayMoveImmutable } from 'array-move';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';

import LegendList from './components/legend-list';

class Legend extends PureComponent {
	static propTypes = {
		/** Title */
		title: PropTypes.string,
		/** Sortable */
		sortable: PropTypes.bool,
		/** Max width */
		maxWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
		/** Max height */
		maxHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
		/** Should the legend be expanded by default? */
		expanded: PropTypes.bool,
		/** Should the legend be collapsable */
		collapsable: PropTypes.bool,
		/** `onChangeOrder = (layerGroupsIds) => {}`
		 * @arg {Array} layerGroupIds The new order
		 */
		onChangeOrder: PropTypes.func,
		/** Children for render */
		children: PropTypes.node,
	};

	static defaultProps = {
		title: 'Legend',
		sortable: true,
		expanded: true,
		collapsable: true,
		maxWidth: null,
		maxHeight: null,
		children: [],
		onChangeOrder: (ids) => console.info(ids),
	};

	constructor(props) {
		super(props);
		const { expanded } = props;
		this.state = { expanded };
	}

	/**
	 * UI EVENTS
	 * onToggleLegend
	 * onSortEnd
	 */
	onToggleLegend = (bool) => {
		this.setState({ expanded: bool });
	};

	onSortEnd = ({ oldIndex, newIndex }) => {
		const { onChangeOrder, children } = this.props;
		const layers = [...children.map((c) => c.props.layerGroup.dataset)];
		const layersDatasets = arrayMoveImmutable(layers, oldIndex, newIndex);

		onChangeOrder(layersDatasets);
	};

	render() {
		const { title, sortable, collapsable, maxWidth, maxHeight, children } =
			this.props;

		const { expanded } = this.state;

		if (!children || !React.Children.count(children)) {
			return null;
		}

		return (
			<div style={{ maxWidth }}>
				{/* LEGEND OPENED */}
				<div
					className={`
					flex
					flex-col
					flex-nowrap
					h-0
					max-h-[300px]
					overflow-hidden	
					opacity-0
					${classnames({
						'h-auto opacity-100 overflow-auto': expanded,
					})}`}
					style={{ maxHeight }}
				>
					{/* Toggle button */}
					{collapsable && (
						<button
							type="button"
							className="
							absolute 
							right-0 
							w-[32px]
							h-[27px]
							flex
							border-0
							top-[-27px]
							cursor-pointer
							align-center
							bg-white
							focus:outline-none
							justify-center
							items-center
							"
							onClick={() => this.onToggleLegend(false)}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="12"
								height="13"
								viewBox="0 0 12 13"
								fill="none"
							>
								<path
									d="M2.25 4.4707L6 8.5332L9.75 4.4707"
									stroke="black"
									strokeWidth="1.5"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
						</button>
					)}

					{expanded && (
						<LegendList
						// REMOVE ANY SPACE IN BEGIN, END and inside each class for the helperClass property 
						// BECAUSE THE SortableContainer use classList.add to add the classes
						// And this method throws error when the class is a blank string
							helperClass="relative
								z-[10]
								list-none
								border-b
								border-[1px]
								border-solid
								border-[rgba(26,28,34,0.1)] 
								justify-between
								bg-[rgba(#0000F,0.75)]
								w-full
								text-[12px]
								last:border-b-[100%]"
							onSortStart={
								(_, event) => event.preventDefault() // It fixes user select in Safari and IE
							}
							onSortEnd={this.onSortEnd}
							axis="y"
							lockAxis="y"
							lockToContainerEdges
							lockOffset="50%"
							useDragHandle
							sortable={sortable}
						>
							{React.Children.map(children, (child, index) =>
								React.isValidElement(child) &&
								child.type === 'LegendItemList'
									? React.cloneElement(child, {
											sortable,
											index,
									  })
									: child
							)}
						</LegendList>
					)}
				</div>

				{/* LEGEND CLOSED */}
				<button
					type="button"
					className={`
						w-full 
						justify-between 
						${classnames({
						'flex': !expanded,
						'hidden': expanded,
					})}`}
					onClick={() => this.onToggleLegend(true)}
				>
					<h1 className="
						flex 
						justify-between 
						items-center
						m-0
						w-full
						px-[15px]
						py-[10px]
						text-[11px]
						uppercase 
						">
						{title}

						{/* Toggle button */}
						<div className={`
							w-auto
							h-auto
							p-0
							border-0
							cursor-pointer
							align-center
							bg-white
							focus:outline-none
							`}>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="12"
								height="13"
								viewBox="0 0 12 13"
								fill="none"
							>
								<path
									d="M2.25 4.4707L6 8.5332L9.75 4.4707"
									stroke="black"
									strokeWidth="1.5"
									strokeLinecap="round"
									strokeLinejoin="round"
									transform="rotate(180, 6, 6.5)"
								/>
							</svg>
						</div>
					</h1>
				</button>
			</div>
		);
	}
}

export default Legend;
export {
	LegendItemButtonBBox, LegendItemButtonInfo, LegendItemButtonLayers,
	LegendItemButtonOpacity, LegendItemButtonRemove, LegendItemButtonVisibility, default as LegendItemToolbar
} from './components/legend-item-toolbar';
export { default as LegendListItem } from './components/legend-list-item';

export {
	LegendItemTypeBasic,
	LegendItemTypeChoropleth,
	LegendItemTypeGradient,
	LegendItemTypeProportional, default as LegendItemTypes
} from './components/legend-item-types';
