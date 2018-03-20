import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Panel } from 'react-bootstrap';
import { t } from '../../locales';

const propTypes = {
  user: PropTypes.object.isRequired,
};
const UserInfo = ({ user }) => (
  <div>
    <Panel>
      <h3>
        <strong>{user.firstName} {user.lastName}</strong>
      </h3>
      <h4 className="username">
        <i className="fa fa-user-o" /> {user.username}
      </h4>
      <hr />
      <p>
        <i className="fa fa-clock-o" />
        {' '}
        {t('joined')}
        {' '}
        {moment(user.createdOn, 'YYYYMMDD').fromNow()}
      </p>
      <p className="email">
        <i className="fa fa-envelope-o" /> {user.email}
      </p>
      <p className="roles">
        <i className="fa fa-lock" /> {Object.keys(user.roles).join(', ')}
      </p>
      <p>
        <i className="fa fa-key" />&nbsp;
        <span className="text-muted">{t('id:')}</span>&nbsp;
        <span className="user-id">{user.userId}</span>
      </p>
    </Panel>
  </div>
);
UserInfo.propTypes = propTypes;
export default UserInfo;
