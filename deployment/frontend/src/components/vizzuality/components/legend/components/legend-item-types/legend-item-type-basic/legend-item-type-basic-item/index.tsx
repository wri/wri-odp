// @ts-nocheck
import React from 'react';
import PropTypes from 'prop-types';
import Image from "next/image";

class LegendItem extends React.PureComponent {
  static propTypes = {
    size: PropTypes.number,
    color: PropTypes.string,
    name: PropTypes.string,
    icon: PropTypes.string, // triangle, circle, square, line
    hideIcon: PropTypes.bool
  };

  static defaultProps = {
    size: 12,
    color: 'transparent',
    name: '',
    icon: 'square',
    hideIcon: false
  };

  getIconHtml = (iconName) => {
    const { name, hideIcon, color, size, icon } = this.props;

    if (hideIcon) {
      return null;
    }

    if (iconName === 'triangle') {
      return (
        <div
          className={`block mr-[5px] mt-[2px] w-0 h-0 border-x-[6px] border-solid border-b-[9px] border-black`}
          style={{
            boderRightWidth: (size / 2),
            boderLeftWidth: (size / 2),
            boderBottomWidth: size,
            borderBottomColor: color
          }}
        />
      );
    }

    if (iconName === 'line') {
      return (<div className={`block mr-[5px] mt-[2px] h-[2px]`} style={{ width: size, backgroundColor: color }} />);
    }

    if (iconName === 'square' || iconName === 'circle') {
      return (
        <div
          className={`block mr-[5px] mt-[2px] ${iconName === 'square' ? 'shrink-0 w-[12px] h-[12px]' : 'rounded-[100%]'}`}
          style={{ width: size, height: size, backgroundColor: color }}
        />
      );
    }

    return (
      <div className="relative w-[14px] h-[14px] flex-shrink-0 block mr-[5px] mt-[2px]">
        <Image
          src={icon}
          alt={name}
          fill
          className='block w-[14px] h-[14px]'
          style={{
            maxWidth: "100%",
            height: "auto"
          }} />
      </div>
    );
  };

  render() {
    const { name, icon } = this.props;

    return (
      <div className="flex items-start justify-start text-[12px]">
        {this.getIconHtml(icon)}

        <span className="block">
          {name}
        </span>
      </div>
    );
  }
}

export default LegendItem;
