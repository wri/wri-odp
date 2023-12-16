import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import SortableElement from '../../../../react-sortable-hoc/src/SortableElement/index';

// Components
import LegendItemDrag from '../legend-item-drag';

class LegendListItem extends PureComponent {
  static propTypes = {
    dataset: PropTypes.string,
    layers: PropTypes.arrayOf(PropTypes.shape({})),
    sortable: PropTypes.bool,
    children: PropTypes.node,
    toolbar: PropTypes.node,
    title: PropTypes.node
  }

  static defaultProps = {
    dataset: '',
    layers: [],
    sortable: true,
    children: [],
    toolbar: [],
    title: []
  }

  render() {
    const { layers, sortable, children, toolbar, title, ...props } = this.props;
    const activeLayer = layers.find(l => l.active) || layers[0];

    return (
      <li
        className={`
          c-legend-item list-none border-b-[1px] 
          border-solid relative z-10 
          last:border-b-0
          flex items-center justify-between w-full text-[12px] bg-[rgba(#fff, 0.75)]
          ${classnames({'-sortable': sortable})}
        `}
      >
        <div
          className={`    
          w-full
          p-[15px]
          mb-[15px]
          ${classnames({
            'pl-[28px]': sortable
          })}
        `}
        >
          {sortable &&
            <LegendItemDrag />
          }

          <div className="grow">
            <header className="flex justify-between items-start mt-[8px] first:mt-0">
              <h3 className='text-[#393f44] font-bold grow shrink text-[14px] mx-0 mt-0 mb-[3px]'>
                {React.isValidElement(title) && typeof title.type !== 'string' ?
                  React.cloneElement(title, { ...props, layers, activeLayer }) :
                  (activeLayer && activeLayer.name)
                }
              </h3>
              {React.isValidElement(toolbar) && typeof toolbar.type !== 'string' &&
                React.cloneElement(toolbar, { ...props, layers, activeLayer })
              }
            </header>

            {React.Children.map(children, child => (React.isValidElement(child) && typeof child.type !== 'string' ?
              React.cloneElement(child, { layers, activeLayer })
              :
              child
            ))}

          </div>
        </div>
      </li>
    );
  }
}

export default SortableElement(({ layerGroup, ...props }) =>
  <LegendListItem key={props.dataset} {...layerGroup} {...props} />);
