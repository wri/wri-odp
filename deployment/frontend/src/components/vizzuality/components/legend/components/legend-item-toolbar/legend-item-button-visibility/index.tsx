// @ts-nocheck
import React, { PureComponent, useState } from 'react';
import PropTypes from 'prop-types';
import Tooltip from '../../../../tooltip';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

export interface LegendItemButtonVisibilityProps {
  activeLayer: Object,
  visibility: boolean,
  onChangeVisibility: (activeLayer, visibility: boolean) => void,
  iconShow: string,
  iconHide: string,
  focusStyle: Object,
  defaultStyle: Object,
  tooltipOpened: boolean,
  tooltipText: string,
  scrolling: boolean,
}  

function LegendItemButtonVisibilityFn(props: LegendItemButtonVisibilityProps = {
  activeLayer: {},
  visibility: true,
  iconShow: '',
  iconHide: '',
  focusStyle: {},
  defaultStyle: {},
  tooltipOpened: false,
  tooltipText: '',
  scrolling: false,
  onChangeVisibility: () => {}
}) {
  const [ visible, setState ] = useState(false);
  return (<></>);
}

class LegendItemButtonVisibility extends PureComponent {
  static propTypes = {
    activeLayer: PropTypes.object,
    visibility: PropTypes.bool,
    onChangeVisibility: PropTypes.func,
    iconShow: PropTypes.string,
    iconHide: PropTypes.string,
    focusStyle: PropTypes.object,
    defaultStyle: PropTypes.object,
    tooltipOpened: PropTypes.bool,
    tooltipText: PropTypes.string,
    scrolling: PropTypes.bool
  }

  static defaultProps = {
    activeLayer: {},
    visibility: true,
    iconShow: '',
    iconHide: '',
    focusStyle: {},
    defaultStyle: {},
    tooltipOpened: false,
    tooltipText: '',
    scrolling: false,

    onChangeVisibility: () => {}
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

  render() {
    const { activeLayer, visibility, tooltipOpened, iconShow, iconHide, focusStyle, defaultStyle, tooltipText } = this.props;
    const { visible } = this.state;

    return (
      <Tooltip
        overlay={tooltipText || (visibility ? 'Hide layer' : 'Show layer')}
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
          onClick={() => this.props.onChangeVisibility(activeLayer, !visibility)}
          aria-label="Toggle the visibility"
        >
          {visibility ? <EyeIcon width={16} /> : <EyeSlashIcon width={16} /> }
        </button>
      </Tooltip>
    );
  }
}

export default LegendItemButtonVisibility;
