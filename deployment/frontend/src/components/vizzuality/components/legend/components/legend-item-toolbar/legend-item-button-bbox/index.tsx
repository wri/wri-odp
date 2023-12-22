// @ts-nocheck
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Tooltip from '../../../../tooltip';

class LegendItemButtonBBox extends PureComponent {
  static propTypes = {
    activeLayer: PropTypes.object,
    tooltipOpened: PropTypes.bool,
    icon: PropTypes.string,
    focusStyle: PropTypes.object,
    defaultStyle: PropTypes.object,
    tooltipText: PropTypes.string,
    scrolling: PropTypes.bool,
    onChangeBBox: PropTypes.func
  }

  static defaultProps = {
    activeLayer: {},
    icon: '',
    focusStyle: {},
    defaultStyle: {},
    tooltipOpened: false,
    tooltipText: '',
    scrolling: false,

    onChangeBBox: () => {}
  }

  state = {
    visible: false
  }

  componentWillReceiveProps(nextProps) {
    const { scrolling } = nextProps;

    if (scrolling) {
      this.setState({ visible: false });
    }
  }


  render(): any {
    const { activeLayer, tooltipOpened, icon, focusStyle, defaultStyle, tooltipText } = this.props;
    const { visible } = this.state;
    if (activeLayer.layerConfig && !activeLayer.layerConfig.bbox) {
      return null;
    }

    return (
      <Tooltip
        overlay={tooltipText || 'Fit to bounds'}
        overlayClassName="c-rc-tooltip -default"
        placement="top"
        trigger={tooltipOpened ? '' : 'hover'}
        mouseLeaveDelay={0}
        destroyTooltipOnHide
        onVisibleChange={v => this.setState({ visible: v })}
        visible={visible}
      >
        <button
          type="button"
          className="inline-block p-0 bg-transparent outline-none border-0 cursor-pointer"
          aria-label="Fit to bounds"
          onClick={() => this.props.onChangeBBox(activeLayer)}
        >
          <Icon name={icon || 'icon-bbox'} className="-small" style={visible ? focusStyle : defaultStyle} />
        </button>
      </Tooltip>
    );
  }
}

export default LegendItemButtonBBox;
