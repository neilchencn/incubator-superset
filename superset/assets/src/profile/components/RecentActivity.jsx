import React from 'react';
import PropTypes from 'prop-types';
// import dayjs from 'dayjs';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import relativeTime from 'dayjs/plugin/relativeTime';

import TableLoader from './TableLoader';

dayjs.extend(relativeTime);
dayjs.extend(utc);
const propTypes = {
  user: PropTypes.object,
};

export default class RecentActivity extends React.PureComponent {
  render() {
    const rowLimit = 50;
    const mutator = function (data) {
      return data
        .filter(row => row.action === 'dashboard' || row.action === 'explore')
        .map(row => ({
          name: row.item_url ? <a href={row.item_url}>{row.item_title}</a> : '',
          type: row.action,
          time: dayjs.utc(row.time).fromNow(),
          _time: row.time,
        }));
    };
    return (
      <div>
        <TableLoader
          className="table table-condensed"
          mutator={mutator}
          sortable
          dataEndpoint={`/superset/recent_activity/${this.props.user.userId}/?limit=${rowLimit}`}
        />
      </div>
    );
  }
}
RecentActivity.propTypes = propTypes;
