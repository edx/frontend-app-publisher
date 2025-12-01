import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import ActionButton from './index';

// Mock Paragon StatefulButton to a basic button to avoid ESM/CommonJS interop issues in tests
jest.mock('@openedx/paragon', () => {
  // eslint-disable-next-line global-require
  const PropTypes = require('prop-types');
  const StatefulButton = ({ children, className = '', onClick }) => (
    // Render as a native button preserving key props used in ActionButton
    <button type="submit" className={className} onClick={onClick}>
      {children}
    </button>
  );

  StatefulButton.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    onClick: PropTypes.func,
  };

  return { StatefulButton };
});

describe('ActionButton', () => {
  it('renders correctly with default props', () => {
    const { getByRole, getByText, container } = render(<ActionButton>Submit</ActionButton>);
    const button = getByRole('button');

    // Renders children
    expect(getByText('Submit')).toBeInTheDocument();

    // Default classes applied
    expect(button).toHaveClass('btn');
    expect(button).toHaveClass('form-submit-btn');

    // Default type
    expect(button).toHaveAttribute('type', 'submit');
    expect(container).toMatchSnapshot();
  });

  it('renders correctly with custom props', () => {
    const { getByRole, getByText, container } = render(
      <ActionButton className="extra-class" primary={false}>Go</ActionButton>,
    );
    const button = getByRole('button');

    // Renders children
    expect(getByText('Go')).toBeInTheDocument();

    // Base classes still present
    expect(button).toHaveClass('btn');
    expect(button).toHaveClass('form-submit-btn');

    // Custom class merged
    expect(button).toHaveClass('extra-class');
    expect(container).toMatchSnapshot();
  });

  it('calls onClick method when clicked', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    const { getByRole, container } = render(
      <ActionButton onClick={onClick}>Click Me</ActionButton>,
    );
    const button = getByRole('button');
    await user.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(container).toMatchSnapshot();
  });
});
