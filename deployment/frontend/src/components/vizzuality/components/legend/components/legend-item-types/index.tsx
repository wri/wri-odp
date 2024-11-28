// @ts-nocheck
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';

import Spinner from '../../../tooltip';

import LegendItemTypeBasic from './legend-item-type-basic';
import LegendItemTypeChoropleth from './legend-item-type-choropleth';
import LegendItemTypeGradient from './legend-item-type-gradient';
import LegendItemTypeProportional from './legend-item-type-proportional';

export const substitution = (originalStr: string, params: any = {}): string => {
  let str = originalStr;

  Object.keys(params).forEach((key) => {
    const value = params[key] as string;
    const isObject = value != null
      && typeof value === 'object'
      && Object.prototype.toString.call(value) === '[object Object]';

    if (Array.isArray(value) || isObject) {
      str = str
        .replace(new RegExp(`"{{${key}}}"`, 'g'), JSON.stringify(value))
        .replace(new RegExp(`'{{${key}}}'`, 'g'), JSON.stringify(value))
        .replace(new RegExp(`\`{{${key}}}\``, 'g'), JSON.stringify(value))
        .replace(new RegExp(`"{${key}}"`, 'g'), JSON.stringify(value))
        .replace(new RegExp(`'{${key}}'`, 'g'), JSON.stringify(value))
        .replace(new RegExp(`\`{${key}}\``, 'g'), JSON.stringify(value));
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      str = str
        .replace(new RegExp(`"{{${key}}}"`, 'g'), value)
        .replace(new RegExp(`'{{${key}}}'`, 'g'), value)
        .replace(new RegExp(`\`{{${key}}}\``, 'g'), value)
        .replace(new RegExp(`"{${key}}"`, 'g'), value)
        .replace(new RegExp(`'{${key}}'`, 'g'), value)
        .replace(new RegExp(`\`{${key}}\``, 'g'), value);
    }

    str = str
      .replace(new RegExp(`{{${key}}}`, 'g'), value.toString())
      .replace(new RegExp(`{${key}}`, 'g'), value.toString());
  });
  return str;
};

/**
 * Params should have this format => { where1: { { key:'xxx', key2:'xxx' } }},
 * Keys to search should be in this format {{key}}
 * @param {String} originalStr
 * @param {Object} params
 */
export const concatenation = (originalStr: string, params: any = {}): string => {
  let result = originalStr;

  Object.keys(params).forEach((key) => {
    let sql = `${Object.keys(params[key])
      .map((k) => {
        const value = params[key][k];

        if (Array.isArray(value) && !!value.length) {
          const mappedValue = value.map((v) => (typeof v !== 'number' ? `'${v}'` : v));
          return `${k} IN (${mappedValue.join(', ')})`;
        }

        if (!Array.isArray(value) && value) {
          return typeof value !== 'number' ? `${k} = '${value}'` : `${k} = ${value}`;
        }

        return null;
      })
      .filter((value) => !!value)
      .join(' AND ')}`;

    if (sql && key.startsWith('where')) sql = `WHERE ${sql}`;
    else if (sql && key.startsWith('and')) sql = `AND ${sql}`;
    else sql = '';

    result = substitution(result, { [key]: sql });
  });

  return result;
};

export const replace = (
  originalStr: string,
  params: any = {},
  sqlParams: any = {},
): string => {
  let str = originalStr;

  if (typeof str === 'string') {
    str = substitution(str, params);
    str = concatenation(str, sqlParams);
  }

  return str;
};

class LegendItemTypes extends PureComponent {
  static propTypes = {
    // Props
    children: PropTypes.node,
    activeLayer: PropTypes.object
  }

  static defaultProps = {
    // Props
    children: [],
    activeLayer: {}
  }

  state = {
    activeLayer: {},
    loading: false
  }

  componentDidMount() {
    const { activeLayer } = this.props;
    const { legendConfig } = activeLayer || {};
    const { params = {}, sqlParams = {} } = legendConfig || {};

    const parsedConfig = replace(JSON.stringify(legendConfig), params, sqlParams);
    const { url } = JSON.parse(parsedConfig);

    if (url) {
      this.fetchLegend(url);
    }
  }

  componentDidUpdate(prevProps) {
    const { activeLayer: prevActiveLayer } = prevProps;
    const { legendConfig: prevLegendConfig } = prevActiveLayer;
    const { params: prevParams = {}, sqlParams: prevSqlParams = {} } = prevLegendConfig;

    const { activeLayer: nextActiveLayer } = this.props;
    const { legendConfig: nextLegendConfig } = nextActiveLayer;
    const { params: nextParams = {}, sqlParams: nextSqlParams = {} } = nextLegendConfig;


    if (!isEqual(nextParams, prevParams) || !isEqual(nextSqlParams, prevSqlParams)) {
      const stringifyConfig = replace(JSON.stringify(nextLegendConfig), nextParams, nextSqlParams);
      const parsedConfig = JSON.parse(stringifyConfig);
      const { url } = parsedConfig || {};

      if (url) {
        this.fetchLegend(url);
      }
    }
  }

  fetchLegend = (url) => {
    const { activeLayer } = this.props;
    const { legendConfig } = activeLayer || {};
    const { dataParse } = legendConfig || {};
    this.setState({ loading: true });

    fetch(url)
      .then((response) => {
        if (response.ok) return response.json();
      })
      .then((response) => {
        const parsedActiveLayer = typeof dataParse === 'function' ? dataParse(activeLayer, response) : response;
        this.setState({ activeLayer: parsedActiveLayer, loading: false });
      })
      .catch(() => {
        this.setState({ loading: false });
      });

  }

  render() {
    const { children, activeLayer: propsActiveLayer } = this.props;
    const { loading, activeLayer: stateActiveLayer } = this.state;
    const activeLayer = !isEmpty(stateActiveLayer) ? stateActiveLayer : propsActiveLayer;

    const { legendConfig } = activeLayer || {};
    const { url } = legendConfig || {};
    const shouldRender = !url || (url && !isEmpty(stateActiveLayer));

    return (
      <div className="background-[#fff] mt-[8px]">
        {(url && loading) && (
          <Spinner
            position="relative"
            style={{
              box: { width: 20, height: 20 }
            }}
          />
        )}

        {shouldRender && !!React.Children.count(children) &&
          React.Children.map(children, child => (React.isValidElement(child) && typeof child.type !== 'string' ?
            React.cloneElement(child, { ...this.props })
            :
            child
        ))}

        {/* If there is no children defined, let's use the components we have */}
        {(shouldRender && !React.Children.count(children)) && <LegendItemTypeBasic {...this.props} />}
        {(shouldRender && !React.Children.count(children)) && <LegendItemTypeChoropleth {...this.props} />}
        {(shouldRender && !React.Children.count(children)) && <LegendItemTypeGradient {...this.props} />}
        {(shouldRender && !React.Children.count(children)) && <LegendItemTypeProportional {...this.props} />}

      </div>
    );
  }
}

export default LegendItemTypes;

export {
  LegendItemTypeBasic,
  LegendItemTypeChoropleth,
  LegendItemTypeGradient,
  LegendItemTypeProportional
};
