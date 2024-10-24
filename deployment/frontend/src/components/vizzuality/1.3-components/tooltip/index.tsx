// @ts-nocheck
import React from 'react';
import PropTypes from 'prop-types';
import RCTooltip from 'rc-tooltip/lib';

export class Tooltip extends React.PureComponent {
  static propTypes = {
    children: PropTypes.node
  };

  static defaultProps = {
    children: []
  };

  render() {
    const { children } = this.props;
    return (
      <RCTooltip
        {...this.props}
      >
        {children}
      </RCTooltip>
    );
  }
}

export default Tooltip;
