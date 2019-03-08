import React from 'react';
import PropTypes from 'prop-types';
// import dayjs from 'dayjs';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import relativeTime from 'dayjs/plugin/relativeTime';
import TableLoader from './TableLoader';
import { t } from '../../locales';

dayjs.extend(relativeTime);
dayjs.extend(utc);

const propTypes = {
  user: PropTypes.object.isRequired,
};

class CreatedContent extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      dashboardsLoading: true,
      slicesLoading: true,
      dashboards: [],
      slices: [],
    };
  }
  renderSliceTable() {
    const mutator = data =>
      data.map(slice => ({
        chart: <a href={slice.url}>{slice.title}</a>,
        favorited: dayjs.utc(slice.dttm).fromNow(),
        _favorited: slice.dttm,
        _chart: slice.title,
      }));
    return (
      <TableLoader
        dataEndpoint={`/superset/created_slices/${this.props.user.userId}/`}
        className="table table-condensed"
        columns={['chart', 'favorited']}
        mutator={mutator}
        noDataText={t('No charts')}
        sortable
      />
    );
  }
  renderDashboardTable() {
    const mutator = data =>
      data.map(dash => ({
        dashboard: <a href={dash.url}>{dash.title}</a>,
        favorited: dayjs.utc(dash.dttm).fromNow(),
        _favorited: dash.dttm,
        _dashboard: dash.title,
      }));
    return (
      <TableLoader
        className="table table-condensed"
        mutator={mutator}
        dataEndpoint={`/superset/created_dashboards/${this.props.user.userId}/`}
        noDataText={t('No dashboards')}
        columns={['dashboard', 'favorited']}
        sortable
      />
    );
  }
  render() {
    return (
      <div>
        <h3>{t('Dashboards')}</h3>
        {this.renderDashboardTable()}
        <hr />
        <h3>{t('Charts')}</h3>
        {this.renderSliceTable()}
      </div>
    );
  }
}
CreatedContent.propTypes = propTypes;

export default CreatedContent;
