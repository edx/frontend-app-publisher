import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import ButtonToolbar from './index';

describe('ButtonToolbar', () => {
  it('renders correctly with default props', () => {
    const { container } = render(<ButtonToolbar />);
    expect(container.firstChild).toHaveClass('btn-toolbar');
    expect(container.firstChild).toHaveClass('justify-content-end');
    expect(container.querySelectorAll('.btn-group').length).toBe(0);
    expect(container).toMatchSnapshot();
  });

  it('renders correctly with custom props', () => {
    const { container } = render(
      <ButtonToolbar className="custom-class" leftJustify>
        <button type="button">Test</button>
      </ButtonToolbar>,
    );
    expect(container.firstChild).toHaveClass('btn-toolbar');
    expect(container.firstChild).toHaveClass('justify-content-start');
    expect(container.firstChild).toHaveClass('custom-class');
    expect(container.querySelectorAll('.btn-group').length).toBe(1);
    expect(container).toMatchSnapshot();
  });

  it('renders correctly with simple buttons', () => {
    const { getByText, container } = render(
      <ButtonToolbar>
        <button type="button">Button 1</button>
        <button type="button">Button 2</button>
      </ButtonToolbar>,
    );
    expect(getByText('Button 1')).toBeInTheDocument();
    expect(getByText('Button 2')).toBeInTheDocument();
    expect(container.querySelectorAll('.btn-group').length).toBe(2);
    expect(container).toMatchSnapshot();
  });

  it('renders correctly with actionButtons', () => {
    const actionButton = <button type="button">Action</button>;
    const { getByText, container } = render(
      <ButtonToolbar>{actionButton}</ButtonToolbar>,
    );
    expect(getByText('Action')).toBeInTheDocument();
    expect(container.querySelectorAll('.btn-group').length).toBe(1);
    expect(container).toMatchSnapshot();
  });

  it('check position of button on basis of leftJustify prop', () => {
    const { container: endContainer } = render(
      <ButtonToolbar leftJustify={false}>
        <button type="button">End</button>
      </ButtonToolbar>,
    );
    expect(endContainer.firstChild).toHaveClass('justify-content-end');
    expect(endContainer).toMatchSnapshot();
    const { container: startContainer } = render(
      <ButtonToolbar leftJustify>
        <button type="button">Start</button>
      </ButtonToolbar>,
    );
    expect(startContainer.firstChild).toHaveClass('justify-content-start');
    expect(startContainer).toMatchSnapshot();
  });
});
