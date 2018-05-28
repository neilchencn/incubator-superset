import React from 'react';
import PropTypes from 'prop-types';
import VirtualizedSelect from 'react-virtualized-select';
import ControlHeader from '../ControlHeader';
import { t } from '../../../locales';
import VirtualizedRendererWrap
  from '../../../components/VirtualizedRendererWrap';
import OnPasteSelect from '../../../components/OnPasteSelect';
import MetricDefinitionOption from '../MetricDefinitionOption';
import MetricDefinitionValue from '../MetricDefinitionValue';
import AdhocMetric from '../../AdhocMetric';
import columnType from '../../propTypes/columnType';
import savedMetricType from '../../propTypes/savedMetricType';
import adhocMetricType from '../../propTypes/adhocMetricType';
import {
  AGGREGATES,
  sqlaAutoGeneratedMetricRegex,
  druidAutoGeneratedMetricRegex,
} from '../../constants';

const propTypes = {
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  value: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, adhocMetricType])),
    PropTypes.oneOfType([PropTypes.string, adhocMetricType]),
  ]),
  columns: PropTypes.arrayOf(columnType),
  savedMetrics: PropTypes.arrayOf(savedMetricType),
  multi: PropTypes.bool,
  datasourceType: PropTypes.string,
  default: PropTypes.array,
};

const defaultProps = {
  onChange: () => {},
};

function isDictionaryForAdhocMetric(value) {
  return value && !(value instanceof AdhocMetric) && value.expressionType;
}

// adhoc metrics are stored as dictionaries in URL params. We convert them back into the
// AdhocMetric class for typechecking, consistency and instance method access.
function coerceAdhocMetrics(value) {
  if (!value) {
    return [];
  }
  if (!Array.isArray(value)) {
    if (isDictionaryForAdhocMetric(value)) {
      return [new AdhocMetric(value)];
    }
    return [value];
  }
  return value.map((val) => {
    if (isDictionaryForAdhocMetric(val)) {
      return new AdhocMetric(val);
    }
    return val;
  });
}

function getDefaultAggregateForColumn(column) {
  const type = column.type;
  if (typeof type !== 'string') {
    return AGGREGATES.COUNT;
  } else if (type === '' || type === 'expression') {
    return AGGREGATES.SUM;
  } else if (
    type.match(/.*char.*/i) ||
    type.match(/string.*/i) ||
    type.match(/.*text.*/i)
  ) {
    return AGGREGATES.COUNT_DISTINCT;
  } else if (
    type.match(/.*int.*/i) ||
    type === 'LONG' ||
    type === 'DOUBLE' ||
    type === 'FLOAT'
  ) {
    return AGGREGATES.SUM;
  } else if (type.match(/.*bool.*/i)) {
    return AGGREGATES.MAX;
  } else if (type.match(/.*time.*/i)) {
    return AGGREGATES.COUNT;
  } else if (type.match(/unknown/i)) {
    return AGGREGATES.COUNT;
  }
  return null;
}

export default class MetricsControl extends React.PureComponent {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.onMetricEdit = this.onMetricEdit.bind(this);
    this.checkIfAggregateInInput = this.checkIfAggregateInInput.bind(this);
    this.optionsForSelect = this.optionsForSelect.bind(this);
    this.selectFilterOption = this.selectFilterOption.bind(this);
    this.isAutoGeneratedMetric = this.isAutoGeneratedMetric.bind(this);
    this.optionRenderer = VirtualizedRendererWrap(
      option => <MetricDefinitionOption option={option} />,
      { ignoreAutogeneratedMetrics: true },
    );
    this.valueRenderer = option => (
      <MetricDefinitionValue
        option={option}
        onMetricEdit={this.onMetricEdit}
        columns={this.props.columns}
        multi={this.props.multi}
        datasourceType={this.props.datasourceType}
      />
    );
    this.refFunc = (ref) => {
      if (ref) {
        // eslint-disable-next-line no-underscore-dangle
        this.select = ref._selectRef;
      }
    };
    this.state = {
      aggregateInInput: null,
      options: this.optionsForSelect(this.props),
      value: coerceAdhocMetrics(this.props.value),
    };
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.props.columns !== nextProps.columns ||
      this.props.savedMetrics !== nextProps.savedMetrics
    ) {
      this.setState({ options: this.optionsForSelect(nextProps) });
      this.props.onChange(nextProps.default);
    }
    if (this.props.value !== nextProps.value) {
      this.setState({ value: coerceAdhocMetrics(nextProps.value) });
    }
  }

  onMetricEdit(changedMetric) {
    let newValue = this.state.value.map((value) => {
      if (value.optionName === changedMetric.optionName) {
        return changedMetric;
      }
      return value;
    });
    if (!this.props.multi) {
      newValue = newValue[0];
    }
    this.props.onChange(newValue);
  }

  onChange(opts) {
    let transformedOpts = opts;
    if (!this.props.multi) {
      transformedOpts = [opts].filter(option => option);
    }
    let optionValues = transformedOpts
      .map((option) => {
        if (option.metric_name) {
          return option.metric_name;
        } else if (option.column_name) {
          const clearedAggregate = this.clearedAggregateInInput;
          this.clearedAggregateInInput = null;
          return new AdhocMetric({
            column: option,
            aggregate: clearedAggregate || getDefaultAggregateForColumn(option),
          });
        } else if (option instanceof AdhocMetric) {
          return option;
        } else if (option.aggregate_name) {
          const newValue = `${option.aggregate_name}()`;
          this.select.setInputValue(newValue);
          this.select.handleInputChange({ target: { value: newValue } });
          // we need to set a timeout here or the selectionWill be overwritten
          // by some browsers (e.g. Chrome)
          setTimeout(() => {
            this.select.input.input.selectionStart = newValue.length - 1;
            this.select.input.input.selectionEnd = newValue.length - 1;
          }, 0);
          return null;
        }
        return null;
      })
      .filter(option => option);
    if (!this.props.multi) {
      optionValues = optionValues[0];
    }

    this.props.onChange(optionValues);
  }

  checkIfAggregateInInput(input) {
    let nextState = { aggregateInInput: null };
    Object.keys(AGGREGATES).forEach((aggregate) => {
      if (input.toLowerCase().startsWith(aggregate.toLowerCase() + '(')) {
        nextState = { aggregateInInput: aggregate };
      }
    });
    this.clearedAggregateInInput = this.state.aggregateInInput;
    this.setState(nextState);
  }

  optionsForSelect(props) {
    const options = [
      // neil modify
      // ...props.columns,
      // ...Object.keys(AGGREGATES).map(aggregate => ({ aggregate_name: aggregate })),
      ...props.savedMetrics,
    ];

    return options.map((option) => {
      if (option.metric_name) {
        return { ...option, optionName: option.metric_name };
      } else if (option.column_name) {
        return { ...option, optionName: '_col_' + option.column_name };
      } else if (option.aggregate_name) {
        return { ...option, optionName: '_aggregate_' + option.aggregate_name };
      }
      notify.error(`provided invalid option to MetricsControl, ${option}`);
      return null;
    });
  }

  isAutoGeneratedMetric(savedMetric) {
    if (this.props.datasourceType === 'druid') {
      return druidAutoGeneratedMetricRegex.test(savedMetric.verbose_name);
    }
    return sqlaAutoGeneratedMetricRegex.test(savedMetric.expression);
  }

  selectFilterOption(option, filterValue) {
    if (this.state.aggregateInInput) {
      let endIndex = filterValue.length;
      if (filterValue.endsWith(')')) {
        endIndex = filterValue.length - 1;
      }
      const valueAfterAggregate = filterValue.substring(
        filterValue.indexOf('(') + 1,
        endIndex,
      );
      return (
        option.column_name &&
        option.column_name
          .toLowerCase()
          .indexOf(valueAfterAggregate.toLowerCase()) >= 0
      );
    }
    return (
      option.optionName &&
      (!option.metric_name || !this.isAutoGeneratedMetric(option)) &&
      option.optionName.toLowerCase().indexOf(filterValue.toLowerCase()) >= 0
    );
  }

  render() {
    // TODO figure out why the dropdown isnt appearing as soon as a metric is selected
    return (
      <div className="metrics-select">
        <ControlHeader {...this.props} />
        <OnPasteSelect
          multi={this.props.multi}
          name={`select-${this.props.name}`}
          placeholder={t('choose a column or aggregate function')}
          options={this.state.options}
          value={this.props.multi ? this.state.value : this.state.value[0]}
          labelKey="label"
          valueKey="optionName"
          clearable
          closeOnSelect
          onChange={this.onChange}
          optionRenderer={this.optionRenderer}
          valueRenderer={this.valueRenderer}
          onInputChange={this.checkIfAggregateInInput}
          // neil modify
          // filterOption={this.selectFilterOption}
          refFunc={this.refFunc}
          selectWrap={VirtualizedSelect}
        />
      </div>
    );
  }
}

MetricsControl.propTypes = propTypes;
MetricsControl.defaultProps = defaultProps;
