import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from '@openedx/paragon';

import Pane from './Pane';

const B2CSubscriptionsPane = ({ b2cSubscriptionInclusion }) => {
  const isIncluded = b2cSubscriptionInclusion === true;

  return (
    <Pane dataTestId="b2c-subscriptions-pane" title="B2C Subscriptions">
      <div className="font-weight-bold">Course Inclusion Status</div>
      <div className="mt-2 d-flex align-items-center">
        <span
          aria-hidden="true"
          style={{
            display: 'inline-block',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: isIncluded ? '#00875a' : '#b0b0b0',
            marginRight: '8px',
            flexShrink: 0,
          }}
        />
        <span>{isIncluded ? 'Included' : 'Not Included'}</span>
      </div>
      <div className="mt-1 x-small text-gray-500">
        {isIncluded
          ? 'This course is included in the B2C Subscription catalog.'
          : 'This course is not included in the B2C Subscription catalog.'}
      </div>
      <div className="mt-3 x-small text-gray-500">
        <Icon className="fa fa-lock mr-1" aria-hidden="true" />
        Read-only. Managed internally and cannot be modified in Publisher.
      </div>
    </Pane>
  );
};

B2CSubscriptionsPane.defaultProps = {
  b2cSubscriptionInclusion: null,
};

B2CSubscriptionsPane.propTypes = {
  b2cSubscriptionInclusion: PropTypes.bool,
};

export default B2CSubscriptionsPane;
