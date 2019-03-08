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

export default class Favorites extends React.PureComponent {
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
        creator: <span>{slice.creator}</span>,
        favorited: dayjs.utc(slice.dttm).fromNow(),
        _favorited: slice.dttm,
        _chart: slice.title,
        _creator: slice.creator,
      }));
    return (
      <TableLoader
        dataEndpoint={`/superset/fave_slices/${this.props.user.userId}/`}
        className="table table-condensed"
        columns={['chart', 'creator', 'favorited']}
        mutator={mutator}
        noDataText={t('No favorite charts yet, go click on stars!')}
        sortable
      />
    );
  }
  renderDashboardTable() {
    const mutator = data =>
      data.map(dash => ({
        dashboard: <a href={dash.url}>{dash.title}</a>,
        creator: <span>{dash.creator}</span>,
        favorited: dayjs.utc(dash.dttm).fromNow(),
        _favorited: dash.dttm,
        _dashboard: dash.title,
        _creator: dash.creator,
      }));
    return (
      <TableLoader
        className="table table-condensed"
        mutator={mutator}
        dataEndpoint={`/superset/fave_dashboards/${this.props.user.userId}/`}
        noDataText={t('No favorite dashboards yet, go click on stars!')}
        columns={['dashboard', 'creator', 'favorited']}
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
Favorites.propTypes = propTypes;
