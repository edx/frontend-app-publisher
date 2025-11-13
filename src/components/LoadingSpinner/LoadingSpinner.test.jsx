import React from 'react';
import { render, waitFor } from '@testing-library/react';

import LoadingSpinner from './index';
//This is for fork related testing purpose only before adding protection rules(test-ulmo)
//This is for fork related testing purpose only before adding protection rules(test-ulmo)
describe('LoadingSpinner', () => {
  it('shows a loading spinner', async () => {
    const { container } = render(<LoadingSpinner />);
    await waitFor(() => expect(container).toMatchSnapshot());
  });
});
