import { D3_TIME_FORMAT_OPTIONS } from './controls';
import * as v from '../validators';
import { t } from '../../locales';

export const sections = {
  druidTimeSeries: {
    label: t('Time'),
    expanded: true,
    description: t('Time related form attributes'),
    controlSetRows: [['granularity', 'druid_time_origin'], ['since', 'until']],
  },
  datasourceAndVizType: {
    label: t('Datasource & Chart Type'),
    expanded: true,
    controlSetRows: [
      ['datasource'],
      ['viz_type'],
      ['slice_id', 'cache_timeout'],
    ],
  },
  colorScheme: {
    label: t('Color Scheme'),
    controlSetRows: [['color_scheme']],
  },
  sqlaTimeSeries: {
    label: t('Time'),
    description: t('Time related form attributes'),
    expanded: true,
    controlSetRows: [
      ['granularity_sqla', 'time_grain_sqla'],
      ['since', 'until'],
    ],
  },
  sqlClause: {
    label: t('SQL'),
    controlSetRows: [['where'], ['having']],
    description: t(
      'This section exposes ways to include snippets of SQL in your query',
    ),
  },
  annotations: {
    label: t('Annotations and Layers'),
    expanded: true,
    controlSetRows: [['annotation_layers']],
  },
  NVD3TimeSeries: [
    {
      label: t('Query'),
      expanded: true,
      controlSetRows: [
        ['metrics'],
        ['groupby'],
        ['limit', 'timeseries_limit_metric'],
        ['order_desc', 'contribution'],
      ],
    },
    {
      label: t('Advanced Analytics'),
      description: t(
        'This section contains options ' +
          'that allow for advanced analytical post processing ' +
          'of query results',
      ),
      controlSetRows: [
        ['rolling_type', 'rolling_periods', 'min_periods'],
        ['time_compare', null],
        ['num_period_compare', 'period_ratio_type'],
        ['resample_how', 'resample_rule', 'resample_fillmethod'],
      ],
    },
  ],
  filters: [
    {
      label: t('Filters'),
      expanded: true,
      controlSetRows: [['filters']],
    },
    {
      label: t('Result Filters'),
      expanded: true,
      description: t(
        'The filters to apply after post-aggregation.' +
          'Leave the value control empty to filter empty strings or nulls',
      ),
      controlSetRows: [['having_filters']],
    },
  ],
};

export const visTypes = {
  dist_bar: {
    label: t('Distribution - Bar Chart'),
    showOnExplore: true,
    controlPanelSections: [
      {
        label: t('Query'),
        expanded: true,

        controlSetRows: [
          ['metrics'],
          ['groupby'],
          ['columns'],
          ['row_limit'],
          ['contribution'],
        ],
      },
      {
        label: t('Chart Options'),
        expanded: true,
        controlSetRows: [
          ['color_scheme'],
          ['show_legend', 'show_bar_value'],
          ['bar_stacked', 'order_bars'],
          ['y_axis_format', 'bottom_margin'],
          ['x_axis_label', 'y_axis_label'],
          ['reduce_x_ticks', 'show_controls'],
        ],
      },
    ],
    controlOverrides: {
      groupby: {
        label: t('Series'),
      },
      columns: {
        label: t('Breakdowns'),
        description: t('Defines how each series is broken down'),
      },
    },
  },

  pie: {
    label: t('Pie Chart'),
    showOnExplore: true,
    controlPanelSections: [
      {
        label: t('Query'),
        expanded: true,
        controlSetRows: [['metrics', 'groupby'], ['limit']],
      },
      {
        label: t('Chart Options'),
        expanded: true,
        controlSetRows: [
          ['pie_label_type'],
          ['donut', 'show_legend'],
          ['labels_outside'],
          ['color_scheme'],
        ],
      },
    ],
  },

  line: {
    label: t('Time Series - Line Chart'),
    showOnExplore: true,
    requiresTime: true,
    controlPanelSections: [
      sections.NVD3TimeSeries[0],
      {
        label: t('Chart Options'),
        expanded: true,
        controlSetRows: [
          ['color_scheme'],
          ['show_brush', 'show_legend'],
          ['rich_tooltip', 'show_markers'],
          ['line_interpolation'],
        ],
      },
      {
        label: t('X Axis'),
        expanded: true,
        controlSetRows: [
          ['x_axis_label', 'bottom_margin'],
          ['x_axis_showminmax'],
          ['x_axis_format'],
        ],
      },
      {
        label: t('Y Axis'),
        expanded: true,
        controlSetRows: [
          ['y_axis_label', 'left_margin'],
          ['y_axis_showminmax', 'y_log_scale'],
          ['y_axis_format', 'y_axis_bounds'],
        ],
      },
      sections.NVD3TimeSeries[1],
      sections.annotations,
    ],
    controlOverrides: {
      x_axis_format: {
        choices: D3_TIME_FORMAT_OPTIONS,
        default: 'smart_date',
      },
    },
  },

  time_pivot: {
    label: t('Time Series - Periodicity Pivot'),
    showOnExplore: true,
    requiresTime: true,
    controlPanelSections: [
      {
        label: t('Query'),
        expanded: true,
        controlSetRows: [['metric'], ['freq']],
      },
      {
        label: t('Chart Options'),
        expanded: true,
        controlSetRows: [
          ['show_legend', 'line_interpolation'],
          ['color_picker', null],
        ],
      },
      {
        label: t('X Axis'),
        expanded: true,
        controlSetRows: [
          ['x_axis_label', 'bottom_margin'],
          ['x_axis_showminmax'],
          ['x_axis_format'],
        ],
      },
      {
        label: t('Y Axis'),
        expanded: true,
        controlSetRows: [
          ['y_axis_label', 'left_margin'],
          ['y_axis_showminmax', 'y_log_scale'],
          ['y_axis_format', 'y_axis_bounds'],
        ],
      },
    ],
    controlOverrides: {
      x_axis_format: {
        choices: D3_TIME_FORMAT_OPTIONS,
        default: 'smart_date',
      },
    },
  },

  dual_line: {
    label: t('Dual Axis Line Chart'),
    requiresTime: true,
    controlPanelSections: [
      {
        label: t('Chart Options'),
        expanded: true,
        controlSetRows: [
          ['color_scheme'],
          ['x_axis_format'],
        ],
      },
      {
        label: t('Y Axis 1'),
        expanded: true,
        controlSetRows: [
          ['metric', 'y_axis_format'],
        ],
      },
      {
        label: t('Y Axis 2'),
        expanded: true,
        controlSetRows: [
          ['metric_2', 'y_axis_2_format'],
        ],
      },
      sections.annotations,
    ],
    controlOverrides: {
      metric: {
        label: t('Left Axis Metric'),
        description: t('Choose a metric for left axis'),
      },
      y_axis_format: {
        label: t('Left Axis Format'),
      },
      x_axis_format: {
        choices: D3_TIME_FORMAT_OPTIONS,
        default: 'smart_date',
      },
    },
  },

  bar: {
    label: t('Time Series - Bar Chart'),
    showOnExplore: true,
    requiresTime: true,
    controlPanelSections: [
      sections.NVD3TimeSeries[0],
      {
        label: t('Chart Options'),
        expanded: true,
        controlSetRows: [
          ['color_scheme'],
          ['show_brush', 'show_legend', 'show_bar_value'],
          ['rich_tooltip', 'bar_stacked'],
          ['line_interpolation', 'show_controls'],
          ['bottom_margin'],
        ],
      },
      {
        label: t('Axes'),
        expanded: true,
        controlSetRows: [
          ['x_axis_format'],
          ['y_axis_format'],
          ['x_axis_showminmax', 'reduce_x_ticks'],
          ['x_axis_label', 'y_axis_label'],
          ['y_axis_bounds', 'y_log_scale'],
        ],
      },
      sections.NVD3TimeSeries[1],
      sections.annotations,
    ],
    controlOverrides: {
      x_axis_format: {
        choices: D3_TIME_FORMAT_OPTIONS,
        default: 'smart_date',
      },
    },
  },

  compare: {
    label: t('Time Series - Percent Change'),
    requiresTime: true,
    controlPanelSections: [
      sections.NVD3TimeSeries[0],
      {
        label: t('Chart Options'),
        expanded: true,
        controlSetRows: [
          ['color_scheme'],
          ['x_axis_format'],
          ['y_axis_format'],
        ],
      },
      sections.NVD3TimeSeries[1],
      sections.annotations,
    ],
    controlOverrides: {
      x_axis_format: {
        choices: D3_TIME_FORMAT_OPTIONS,
        default: 'smart_date',
      },
    },
  },
  area: {
    label: t('Time Series - Stacked'),
    requiresTime: true,
    controlPanelSections: [
      sections.NVD3TimeSeries[0],
      {
        label: t('Chart Options'),
        expanded: true,
        controlSetRows: [
          ['show_brush', 'show_legend'],
          ['line_interpolation', 'stacked_style'],
          ['color_scheme'],
          ['rich_tooltip', 'show_controls'],
        ],
      },
      {
        label: t('Axes'),
        expanded: true,
        controlSetRows: [
          ['x_axis_format'],
          ['x_axis_showminmax'],
          ['y_axis_format', 'y_axis_bounds'],
          ['y_log_scale', null],
        ],
      },
      sections.NVD3TimeSeries[1],
      sections.annotations,
    ],
    controlOverrides: {
      x_axis_format: {
        default: 'smart_date',
        choices: D3_TIME_FORMAT_OPTIONS,
      },
      color_scheme: {
        renderTrigger: false,
      },
    },
  },

  table: {
    label: t('Table View'),
    controlPanelSections: [
      {
        label: t('GROUP BY'),
        description: t('Use this section if you want a query that aggregates'),
        controlSetRows: [
          ['groupby'],
          ['metrics'],
          ['percent_metrics'],
          ['include_time'],
          ['timeseries_limit_metric', 'order_desc'],
        ],
      },
      {
        label: t('NOT GROUPED BY'),
        description: t('Use this section if you want to query atomic rows'),
        controlSetRows: [['all_columns'], ['order_by_cols']],
      },
      {
        label: t('Options'),
        controlSetRows: [
          ['table_timestamp_format'],
          ['row_limit', 'page_length'],
          ['include_search', 'table_filter'],
          ['align_pn', 'color_pn'],
        ],
      },
    ],
    controlOverrides: {
      metrics: {
        validators: [],
      },
      time_grain_sqla: {
        default: null,
      },
    },
  },

  time_table: {
    label: t('Time Series Table'),
    controlPanelSections: [
      {
        label: t('Query'),
        expanded: true,
        controlSetRows: [
          ['groupby', 'metrics'],
          ['limit'],
          ['column_collection'],
          ['url'],
        ],
      },
    ],
    controlOverrides: {
      groupby: {
        multiple: false,
      },
      url: {
        description: t(
          "Templated link, it's possible to include {{ metric }} " +
            'or other values coming from the controls.',
        ),
      },
    },
  },

  markup: {
    label: t('Markup'),
    controlPanelSections: [
      {
        label: t('Code'),
        expanded: true,
        controlSetRows: [['markup_type'], ['code']],
      },
    ],
  },

  pivot_table: {
    label: t('Pivot Table'),
    controlPanelSections: [
      {
        label: t('Query'),
        expanded: true,
        controlSetRows: [['groupby'], ['columns'], ['metrics']],
      },
      {
        label: t('Pivot Options'),
        controlSetRows: [
          ['pandas_aggfunc', 'pivot_margins'],
          ['number_format', 'combine_metric'],
        ],
      },
    ],
    controlOverrides: {
      groupby: { includeTime: false },
      columns: { includeTime: false },
    },
  },

  separator: {
    label: t('Separator'),
    controlPanelSections: [
      {
        label: t('Code'),
        controlSetRows: [['markup_type'], ['code']],
      },
    ],
    controlOverrides: {
      code: {
        default: '####Section Title\n' +
          'A paragraph describing the section' +
          'of the dashboard, right before the separator line ' +
          '\n\n' +
          '---------------',
      },
    },
  },

  word_cloud: {
    label: t('Word Cloud'),
    controlPanelSections: [
      {
        label: t('Query'),
        expanded: true,
        controlSetRows: [['series', 'metric'], ['row_limit', null]],
      },
      {
        label: t('Options'),
        controlSetRows: [
          ['size_from', 'size_to'],
          ['rotation'],
          ['color_scheme'],
        ],
      },
    ],
  },

  treemap: {
    label: t('Treemap'),
    controlPanelSections: [
      {
        label: t('Query'),
        expanded: true,
        controlSetRows: [['metrics'], ['groupby']],
      },
      {
        label: t('Chart Options'),
        expanded: true,
        controlSetRows: [
          ['color_scheme'],
          ['treemap_ratio'],
          ['number_format'],
        ],
      },
    ],
    controlOverrides: {
      color_scheme: {
        renderTrigger: false,
      },
    },
  },

  cal_heatmap: {
    label: t('Calendar Heatmap'),
    requiresTime: true,
    controlPanelSections: [
      {
        label: t('Query'),
        expanded: true,
        controlSetRows: [['metric']],
      },
      {
        label: t('Options'),
        controlSetRows: [['domain_granularity'], ['subdomain_granularity']],
      },
    ],
  },

  box_plot: {
    label: t('Box Plot'),
    controlPanelSections: [
      {
        label: t('Query'),
        expanded: true,
        controlSetRows: [['metrics'], ['groupby', 'limit']],
      },
      {
        label: t('Chart Options'),

        expanded: true,
        controlSetRows: [
          ['color_scheme'],
          ['whisker_options'],
        ],
      },
    ],
  },

  bubble: {
    label: t('Bubble Chart'),
    controlPanelSections: [
      {
        label: t('Query'),
        expanded: true,
        controlSetRows: [['series', 'entity'], ['size', 'limit']],
      },
      {
        label: t('Chart Options'),

        expanded: true,
        controlSetRows: [
          ['color_scheme'],
          ['show_legend', null],
        ],

      },
      {
        label: t('Bubbles'),
        controlSetRows: [['size', 'max_bubble_size']],
      },
      {
        label: t('X Axis'),
        expanded: true,
        controlSetRows: [
          ['x_axis_label', 'left_margin'],
          ['x', 'x_axis_format'],
          ['x_log_scale', 'x_axis_showminmax'],
        ],
      },
      {
        label: t('Y Axis'),
        expanded: true,
        controlSetRows: [
          ['y_axis_label', 'bottom_margin'],
          ['y', 'y_axis_format'],
          ['y_log_scale', 'y_axis_showminmax'],
        ],
      },
    ],
    controlOverrides: {
      x_axis_format: {
        default: '.3s',
      },
      color_scheme: {
        renderTrigger: false,
      },
    },
  },

  big_number: {
    label: t('Big Number with Trendline'),
    controlPanelSections: [
      {
        label: t('Query'),
        expanded: true,
        controlSetRows: [['metric']],
      },
      {
        label: t('Chart Options'),
        expanded: true,
        controlSetRows: [
          ['compare_lag', 'compare_suffix'],
          ['y_axis_format', null],
        ],
      },
    ],
    controlOverrides: {
      y_axis_format: {
        label: t('Number format'),
      },
    },
  },

  big_number_total: {
    label: t('Big Number'),
    controlPanelSections: [
      {
        label: t('Query'),
        expanded: true,
        controlSetRows: [['metric']],
      },
      {
        label: t('Chart Options'),
        expanded: true,
        controlSetRows: [
          ['subheader'],
          ['y_axis_format'],
        ],
      },
    ],
    controlOverrides: {
      y_axis_format: {
        label: t('Number format'),
      },
    },
  },

  histogram: {
    label: t('Histogram'),
    controlPanelSections: [
      {
        label: t('Query'),
        expanded: true,
        controlSetRows: [['all_columns_x'], ['row_limit']],
      },
      {
        label: t('Chart Options'),

        expanded: true,
        controlSetRows: [
          ['color_scheme'],
          ['link_length'],
          ['x_axis_label', 'y_axis_label'],
          ['normalized'],
        ],
      },
    ],
    controlOverrides: {
      all_columns_x: {
        label: t('Numeric Column'),
        description: t('Select the numeric column to draw the histogram'),
      },
      link_length: {
        label: t('No of Bins'),
        description: t('Select number of bins for the histogram'),
        default: 5,
      },
    },
  },

  sunburst: {
    label: t('Sunburst'),
    controlPanelSections: [
      {
        label: t('Query'),
        expanded: true,
        controlSetRows: [
          ['groupby'],
          ['metric', 'secondary_metric'],
          ['row_limit'],
        ],
      },
      {
        label: t('Chart Options'),

        expanded: true,
        controlSetRows: [
          ['color_scheme'],
        ],

      },
    ],
    controlOverrides: {
      metric: {
        label: t('Primary Metric'),
        description: t(
          'The primary metric is used to define the arc segment sizes',
        ),
      },
      secondary_metric: {
        label: t('Secondary Metric'),
        default: null,
        description: t(
          '[optional] this secondary metric is used to ' +
            'define the color as a ratio against the primary metric. ' +
            'When omitted, the color is categorical and based on labels',
        ),
      },
      groupby: {
        label: t('Hierarchy'),
        description: t('This defines the level of the hierarchy'),
      },
    },
  },

  sankey: {
    label: t('Sankey'),
    controlPanelSections: [
      {
        label: t('Query'),
        expanded: true,
        controlSetRows: [['groupby'], ['metric'], ['row_limit']],
      },
      {
        label: t('Chart Options'),

        expanded: true,
        controlSetRows: [
          ['color_scheme'],
        ],
      },
    ],
    controlOverrides: {
      groupby: {
        label: t('Source / Target'),
        description: t('Choose a source and a target'),
      },
    },
  },

  directed_force: {
    label: t('Directed Force Layout'),
    controlPanelSections: [
      {
        label: t('Query'),
        expanded: true,
        controlSetRows: [['groupby'], ['metric'], ['row_limit']],
      },
      {
        label: t('Options'),
        controlSetRows: [['link_length'], ['charge']],
      },
    ],
    controlOverrides: {
      groupby: {
        label: t('Source / Target'),
        description: t('Choose a source and a target'),
      },
    },
  },
  chord: {
    label: t('Chord Diagram'),
    controlPanelSections: [
      {
        label: t('Query'),
        expanded: true,
        controlSetRows: [['groupby', 'columns'], ['metric', 'row_limit']],
      },
      {
        label: t('Chart Options'),

        expanded: true,
        controlSetRows: [
          ['y_axis_format', null],
          ['color_scheme'],
        ],
      },
    ],
    controlOverrides: {
      y_axis_format: {
        label: t('Number format'),
        description: t('Choose a number format'),
      },
      groupby: {
        label: t('Source'),
        multi: false,
        validators: [v.nonEmpty],
        description: t('Choose a source'),
      },
      columns: {
        label: t('Target'),
        multi: false,
        validators: [v.nonEmpty],
        description: t('Choose a target'),
      },
    },
  },
  filter_box: {
    label: t('Filter Box'),
    controlPanelSections: [
      {
        label: t('Query'),
        expanded: true,
        controlSetRows: [
          ['groupby'],
          ['metric'],
          ['date_filter', 'instant_filtering'],
          ['show_sqla_time_granularity', 'show_sqla_time_column'],
          ['show_druid_time_granularity', 'show_druid_time_origin'],
        ],
      },
    ],
    controlOverrides: {
      groupby: {
        label: t('Filter controls'),
        description: t(
          'The controls you want to filter on. Note that only columns ' +
            'checked as "filterable" will show up on this list.',
        ),
        mapStateToProps: state => ({
          options: state.datasource
            ? state.datasource.columns.filter(c => c.filterable)
            : [],
        }),
      },
    },
  },


  para: {
    label: t('Parallel Coordinates'),
    controlPanelSections: [
      {
        label: t('Query'),
        expanded: true,
        controlSetRows: [
          ['series'],
          ['metrics'],
          ['secondary_metric'],
          ['limit'],
        ],
      },
      {
        label: t('Options'),
        controlSetRows: [['show_datatable', 'include_series']],
      },
    ],
  },

  heatmap: {
    label: t('Heatmap'),
    controlPanelSections: [
      {
        label: t('Query'),
        expanded: true,
        controlSetRows: [
          ['all_columns_x', 'all_columns_y'],
          ['metric', 'row_limit'],
        ],
      },
      {
        label: t('Heatmap Options'),
        controlSetRows: [
          ['linear_color_scheme'],
          ['xscale_interval', 'yscale_interval'],
          ['canvas_image_rendering', 'normalize_across'],
          ['left_margin', 'bottom_margin'],
          ['y_axis_bounds', 'y_axis_format'],
          ['show_legend', 'show_perc'],
          ['show_values'],
          ['sort_x_axis', 'sort_y_axis'],
        ],
      },
    ],
    controlOverrides: {
      all_columns_x: {
        validators: [v.nonEmpty],
      },
      all_columns_y: {
        validators: [v.nonEmpty],
      },
      y_axis_bounds: {
        label: t('Value bounds'),
        renderTrigger: false,
        description: 'Hard value bounds applied for color coding. Is only relevant ' +
          'and applied when the normalization is applied against the whole ' +
          'heatmap.',
      },
      y_axis_format: {
        label: t('Value Format'),
      },
    },
  },

  horizon: {
    label: t('Horizon'),
    controlPanelSections: [
      sections.NVD3TimeSeries[0],
      {
        label: t('Chart Options'),

        expanded: true,
        controlSetRows: [
          ['series_height', 'horizon_color_scale'],
        ],
      },
    ],
  },

  event_flow: {
    label: t('Event flow'),
    requiresTime: true,
    controlPanelSections: [
      {
        label: t('Event definition'),
        controlSetRows: [
          ['entity'],
          ['all_columns_x'],
          ['row_limit'],
          ['order_by_entity'],
          ['min_leaf_node_event_count'],
        ],
      },
      {
        label: t('Additional meta data'),
        controlSetRows: [['all_columns']],
      },
    ],
    controlOverrides: {
      entity: {
        label: t('Column containing entity ids'),
        description: t('e.g., a "user id" column'),
      },
      all_columns_x: {
        label: t('Column containing event names'),
        validators: [v.nonEmpty],
        default: control =>
          (control.choices && control.choices.length > 0
            ? control.choices[0][0]
            : null),
      },
      row_limit: {
        label: t('Event count limit'),
        description: t(
          'The maximum number of events to return, equivalent to number of rows',
        ),
      },
      all_columns: {
        label: t('Meta data'),
        description: t('Select any columns for meta data inspection'),
      },
    },
  },

  paired_ttest: {
    label: t('Time Series - Paired t-test'),
    showOnExplore: true,
    requiresTime: true,
    controlPanelSections: [
      sections.NVD3TimeSeries[0],
      {
        label: t('Paired t-test'),
        expanded: false,
        controlSetRows: [
          ['significance_level'],
          ['pvalue_precision'],
          ['liftvalue_precision'],
        ],
      },
    ],
  },

  rose: {
    label: t('Time Series - Nightingale Rose Chart'),
    showOnExplore: true,
    requiresTime: true,
    controlPanelSections: [
      sections.NVD3TimeSeries[0],
      {
        label: t('Chart Options'),
        expanded: true,
        controlSetRows: [
          ['color_scheme'],
          ['number_format', 'date_time_format'],
          ['rich_tooltip', 'rose_area_proportion'],
        ],
      },
      sections.NVD3TimeSeries[1],
    ],
  },

  partition: {
    label: 'Partition Diagram',
    showOnExplore: true,
    controlPanelSections: [
      sections.NVD3TimeSeries[0],
      {
        label: t('Time Series Options'),
        expanded: true,
        controlSetRows: [['time_series_option']],
      },
      {
        label: t('Chart Options'),
        expanded: true,
        controlSetRows: [
          ['color_scheme'],
          ['number_format', 'date_time_format'],
          ['partition_limit', 'partition_threshold'],
          ['log_scale', 'equal_date_size'],
          ['rich_tooltip'],
        ],
      },
      sections.NVD3TimeSeries[1],
    ],
  },
};

export default visTypes;

export function sectionsToRender(vizType, datasourceType) {
  const viz = visTypes[vizType];
  return [].concat(
    sections.datasourceAndVizType,
    datasourceType === 'table'
      ? sections.sqlaTimeSeries
      : sections.druidTimeSeries,
    viz.controlPanelSections,
    datasourceType === 'table' ? sections.sqlClause : [],
    datasourceType === 'table' ? sections.filters[0] : sections.filters,
  );
}
