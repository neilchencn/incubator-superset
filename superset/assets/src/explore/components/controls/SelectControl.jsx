import React from 'react';
import PropTypes from 'prop-types';
import VirtualizedSelect from 'react-virtualized-select';
import Select, { Creatable } from 'react-select';
import ControlHeader from '../ControlHeader';
import { t } from '../../../locales';
import VirtualizedRendererWrap from '../../../components/VirtualizedRendererWrap';
import OnPasteSelect from '../../../components/OnPasteSelect';

const propTypes = {
  choices: PropTypes.array,
  clearable: PropTypes.bool,
  description: PropTypes.string,
  disabled: PropTypes.bool,
  freeForm: PropTypes.bool,
  isLoading: PropTypes.bool,
  label: PropTypes.string,
  multi: PropTypes.bool,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.array]),
  showHeader: PropTypes.bool,
  optionRenderer: PropTypes.func,
  valueRenderer: PropTypes.func,
  valueKey: PropTypes.string,
  options: PropTypes.array,
  placeholder: PropTypes.string,
};

const defaultProps = {
  choices: [],
  clearable: true,
  description: null,
  disabled: false,
  freeForm: false,
  isLoading: false,
  label: null,
  multi: false,
  onChange: () => {},
  onFocus: () => {},
  showHeader: true,
  optionRenderer: opt => opt.label,
  valueRenderer: opt => opt.label,
  valueKey: 'value',
};

const equals = function (ori, array) {
  // if the other array is a falsy value, return
  if (!array) return false;
  // compare lengths - can save a lot of time
  if (ori.length !== array.length) return false;
  for (let i = 0, l = ori.length; i < l; i++) {
    // Check if we have nested arrays
    if (ori[i] instanceof Array && array[i] instanceof Array) {
      // recurse into the nested arrays
      if (!equals(ori[i], array[i])) return false;
    } else if (ori[i] instanceof Object && array[i] instanceof Object) {
      if (!equalsObj(ori[i], array[i])) return false;
    }
  }
  return true;
};

const equalsObj = function (object1, object2) {
  for (const propName in object1) {
    if (object1.hasOwnProperty(propName) !== object2.hasOwnProperty(propName)) {
      return object1;
    } else if (typeof object1[propName] !== typeof object2[propName]) {
      // Check instance type
      // Different types => not equal
      return false;
    }
  }
  for (const propName in object2) {
    if (object1.hasOwnProperty(propName) !== object2.hasOwnProperty(propName)) {
      return false;
    } else if (typeof object1[propName] !== typeof object2[propName]) {
      return false;
    }
    if (!object1.hasOwnProperty(propName)) continue;

    if (object1[propName] instanceof Array && object2[propName] instanceof Array) {
      // recurse into the nested arrays
      if (!object1[propName].equals(object2[propName])) return false;
    } else if (object1[propName] instanceof Object && object2[propName] instanceof Object) {
      if (!object1[propName].equals(object2[propName])) return false;
    } else if (object1[propName] !== object2[propName]) {
      // Normal value comparison for strings and numbers
      return false;
    }
  }

  return true;
};

export default class SelectControl extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = { options: this.getOptions(props) };
    this.onChange = this.onChange.bind(this);
  }
  componentWillReceiveProps(nextProps) {
    if (
      ['groupby', 'columns', 'percent_metrics', 'x', 'y', 'size'].indexOf(this.props.name) >= 0 &&
      !equals(nextProps.options, this.props.options)
    ) {
      const options = this.getOptions(nextProps);
      this.setState({ options, value: [] });
      this.props.onChange(null);
    } else {
      const options = this.getOptions(nextProps);
      this.setState({ options });
      if (
        !nextProps.multi &&
        nextProps.value &&
        typeof nextProps.value !== 'string' &&
        nextProps.value.length > 0
      ) {
        this.props.onChange(nextProps.value[0]);
      }
      if (nextProps.multi && nextProps.value && typeof nextProps.value === 'string') {
        this.props.onChange([nextProps.value]);
      }
    }
  }
  onChange(opt) {
    let optionValue = opt ? opt[this.props.valueKey] : null;
    // if multi, return options values as an array
    if (this.props.multi) {
      optionValue = opt ? opt.map(o => o[this.props.valueKey]) : null;
    }
    this.props.onChange(optionValue);
  }
  getOptions(props) {
    if (props.options) {
      return props.options;
    }
    // Accepts different formats of input
    const options = props.choices.map((c) => {
      let option;
      if (Array.isArray(c)) {
        const label = c.length > 1 ? c[1] : c[0];
        option = {
          value: c[0],
          label,
        };
      } else if (Object.is(c)) {
        option = c;
      } else {
        option = {
          value: c,
          label: c,
        };
      }
      return option;
    });

    if (props.freeForm) {
      // For FreeFormSelect, insert value into options if not exist
      const values = options.map(c => c.value);
      if (props.value) {
        let valuesToAdd = props.value;
        if (!Array.isArray(valuesToAdd)) {
          valuesToAdd = [valuesToAdd];
        }
        valuesToAdd.forEach((v) => {
          if (values.indexOf(v) < 0) {
            options.push({ value: v, label: v });
          }
        });
      }
    }
    return options;
  }
  render() {
    //  Tab, comma or Enter will trigger a new option created for FreeFormSelect
    const placeholder = this.props.placeholder || t('%s option(s)', this.state.options.length);

    const selectProps = {
      multi: this.props.multi,
      name: `select-${this.props.name}`,
      placeholder,
      options: this.state.options,
      value: this.props.value,
      labelKey: 'label',
      valueKey: this.props.valueKey,
      autosize: false,
      clearable: this.props.clearable,
      isLoading: this.props.isLoading,
      onChange: this.onChange,
      onFocus: this.props.onFocus,
      optionRenderer: VirtualizedRendererWrap(this.props.optionRenderer),
      valueRenderer: this.props.valueRenderer,
      selectComponent: this.props.freeForm ? Creatable : Select,
      disabled: this.props.disabled,
    };
    return (
      <div>
        {this.props.showHeader && <ControlHeader {...this.props} />}
        <OnPasteSelect {...selectProps} selectWrap={VirtualizedSelect} />
      </div>
    );
  }
}

SelectControl.propTypes = propTypes;
SelectControl.defaultProps = defaultProps;
