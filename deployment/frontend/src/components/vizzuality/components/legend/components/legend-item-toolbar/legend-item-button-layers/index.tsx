// @ts-nocheck
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import sortBy from 'lodash/sortBy';
import Tooltip from '../../../../tooltip';
import LegendLayersTooltip from './legend-item-button-layers-tooltip';

class LegendItemButtonLayers extends PureComponent {
	static propTypes = {
		layers: PropTypes.array,
		activeLayer: PropTypes.object,
		icon: PropTypes.string,
		focusStyle: PropTypes.object,
		defaultStyle: PropTypes.object,
		tooltipText: PropTypes.string,
		tooltipOpened: PropTypes.bool,
		scrolling: PropTypes.bool,

		onChangeLayer: PropTypes.func,
		onTooltipVisibilityChange: PropTypes.func,
	};

	static defaultProps = {
		layers: [],
		activeLayer: {},
		icon: '',
		focusStyle: {},
		defaultStyle: {},
		tooltipOpened: false,
		tooltipText: null,
		scrolling: false,

		onChangeLayer: () => {},
		onTooltipVisibilityChange: () => {},
	};

	state = {
		visibilityHover: false,
		visibilityClick: false,
		multiLayersActive: this.props.i === 0 && this.props.layers.length > 1,
	};

	componentWillReceiveProps(nextProps) {
		const { scrolling, i: prevIndex } = this.props;
		const { i: nextIndex } = nextProps;

		if (scrolling || prevIndex !== nextIndex) {
			this.onTooltipVisibilityChange(false);
		}
	}

	onTooltipVisibilityChange = (visibility) => {
		const { onTooltipVisibilityChange } = this.props;
		const { multiLayersActive } = this.state;

		this.setState({
			visibilityHover: false,
			visibilityClick: visibility,
			...(multiLayersActive && {
				multiLayersActive: false,
			}),
		});

		onTooltipVisibilityChange(visibility);
	};

	/**
	 * HELPERS
	 * - getTimelineLayers
	 */
	getTimelineLayers = () => {
		const { layers } = this.props;

		return sortBy(
			layers.filter((l) => l.layerConfig.timeline),
			(l) => l.layerConfig.order
		);
	};

	render() {
		const {
			layers,
			activeLayer,
			icon,
			focusStyle,
			defaultStyle,
			tooltipText,
			onChangeLayer,
			tooltipOpened,
		} = this.props;
		const { visibilityClick, visibilityHover, multiLayersActive } =
			this.state;
		const timelineLayers = this.getTimelineLayers();

		if (layers.length === 1 || timelineLayers.length) {
			return null;
		}

		return (
			<Tooltip
				overlay={
					<LegendLayersTooltip
						layers={layers}
						activeLayer={activeLayer}
						onChangeLayer={onChangeLayer}
					/>
				}
				overlayClassName="c-rc-tooltip -default -layers"
				placement="top"
				trigger={['click']}
				visible={visibilityClick}
				onVisibleChange={this.onTooltipVisibilityChange}
				destroyTooltipOnHide
			>
				<Tooltip
					visible={
						multiLayersActive ||
						(!visibilityClick && visibilityHover)
					}
					overlay={tooltipText || `${layers.length} layers`}
					overlayClassName="c-rc-tooltip -default"
					placement="top"
					trigger={tooltipOpened ? '' : 'hover'}
					onVisibleChange={(visibility) =>
						this.setState({
							visibilityHover: visibility,
							multiLayersActive: false,
						})
					}
					destroyTooltipOnHide
				>
					<button
						type="button"
						className="inline-block p-0 bg-transparent outline-none border-0 cursor-pointer"
						aria-label="Select other layer"
					>
						{/* TODO ADJUST THIS COMPONENT TO USE THE HEROICON LIB <Icon name={icon || 'icon-layers'} className="-small" style={visibilityHover || visibilityClick ? focusStyle : defaultStyle} /> */}
						<svg
							version="1.1"
							xmlns="http://www.w3.org/2000/svg"
							className="w-[14px] h-[14px]"
							viewBox="0 0 34 32"
						>
							<title>layers2</title>
							<path d="M27.616 17.497l3.643 2.503-14.556 10-14.556-10 3.641-2.501 10.916 7.501 10.913-7.503zM31.255 12l-14.553 10-14.56-10 14.56-10 14.553 10z"></path>
						</svg>
					</button>
				</Tooltip>
			</Tooltip>
		);
	}
}

export default LegendItemButtonLayers;
