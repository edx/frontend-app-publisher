import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import B2CSubscriptionsPane from './B2CSubscriptionsPane';

describe('B2CSubscriptionsPane', () => {
  it('renders card title', () => {
    render(<B2CSubscriptionsPane />);
    expect(screen.getByText('B2C Subscriptions')).toBeInTheDocument();
  });

  it('renders Course Inclusion Status header', () => {
    render(<B2CSubscriptionsPane />);
    expect(screen.getByText('Course Inclusion Status')).toBeInTheDocument();
  });

  it('renders read-only text', () => {
    render(<B2CSubscriptionsPane />);
    expect(screen.getByText(/Read-only\. Managed internally and cannot be modified in Publisher\./)).toBeInTheDocument();
  });

  it('displays Not Included when b2cSubscriptionInclusion is false', () => {
    render(<B2CSubscriptionsPane b2cSubscriptionInclusion={false} />);
    expect(screen.getByText('Not Included')).toBeInTheDocument();
    expect(screen.getByText('This course is not included in the B2C Subscription catalog.')).toBeInTheDocument();
  });

  it('displays Included when b2cSubscriptionInclusion is true', () => {
    render(<B2CSubscriptionsPane b2cSubscriptionInclusion />);
    expect(screen.getByText('Included')).toBeInTheDocument();
    expect(screen.getByText('This course is included in the B2C Subscription catalog.')).toBeInTheDocument();
  });

  it('defaults to Not Included when b2cSubscriptionInclusion is null', () => {
    render(<B2CSubscriptionsPane b2cSubscriptionInclusion={null} />);
    expect(screen.getByText('Not Included')).toBeInTheDocument();
  });

  it('defaults to Not Included when b2cSubscriptionInclusion is undefined', () => {
    render(<B2CSubscriptionsPane />);
    expect(screen.getByText('Not Included')).toBeInTheDocument();
  });

  it('does not render any editable controls', () => {
    render(<B2CSubscriptionsPane b2cSubscriptionInclusion />);
    expect(screen.queryByRole('switch')).not.toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('status text is accessible (not color-only)', () => {
    render(<B2CSubscriptionsPane b2cSubscriptionInclusion />);
    // Verify visible text label exists independent of color indicator
    expect(screen.getByText('Included')).toBeInTheDocument();
  });
});
