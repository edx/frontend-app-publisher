import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { StatefulButton } from '@openedx/paragon';

// Just a tiny wrapper around StatefulButton to provide some good defaults
const ActionButton = ({ className, primary, ...passThroughProps }) => (
  <StatefulButton
    {...passThroughProps}
    type="submit"
    variant={primary ? 'primary' : 'outline-primary'}
    className={classNames({
      btn: true,
      'form-submit-btn': true,
    }, className)}
  />
);

// Action comment
ActionButton.defaultProps = {
  className: '',
  primary: true,
};

ActionButton.propTypes = {
  className: PropTypes.string,
  primary: PropTypes.bool,
};

export default ActionButton;
