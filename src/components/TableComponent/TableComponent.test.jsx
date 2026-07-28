import React from 'react';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { IntlProvider } from '@edx/frontend-platform/i18n';
import { PAGE_SIZE } from '../../data/constants/table';
import TableComponent from './index';

describe('CourseTable', () => {
  const mockFormat = data => data.map(datum => ({
    ...datum,
  }));
  const mockColumns = [
    {
      label: 'Col 1',
      key: 'col1',
      columnSortable: true,
      accessor: 'col1',
    },
    {
      label: 'Col 2',
      key: 'col2',
      columnSortable: false,
      accessor: 'col2',
    },
  ];
  const mockFetch = () => [
    {
      col1: 'Test11',
      col2: 'Test12',
    },
    {
      col1: 'Test21',
      col2: 'Test22',
    },
  ];
  const DEFAULT_ORDERING = 'key';
  const TEST_PATHNAME = '/test';
  const createRows = (count) => Array.from({ length: count }, (_, index) => ({
    col1: `Test${index + 1}1`,
    col2: `Test${index + 1}2`,
  }));
  const createSearchQuery = ({ page = 1, ordering = DEFAULT_ORDERING } = {}) => (
    `?page=${page}&ordering=${ordering}`
  );
  const getRowStatusText = ({ page, itemCount, pageSize = PAGE_SIZE }) => {
    const rowStart = ((page - 1) * pageSize) + 1;
    const rowEnd = Math.min(page * pageSize, itemCount);
    return `Showing ${rowStart} - ${rowEnd} of ${itemCount}.`;
  };
  const expectAllRowStatusesToMatch = expectedText => {
    const statuses = screen.getAllByTestId('row-status');
    statuses.forEach((status) => {
      expect(status.textContent).toContain(expectedText);
    });
  };

  it('shows a table', () => {
    const { container } = render(<TableComponent
      id="test"
      className="test"
      fetchMethod={mockFetch}
      columns={mockColumns}
      formatData={mockFormat}
      tableSortable
      pageCount={1}
      itemCount={2}
      paginateTable={() => true}
      sortTable={() => true}
      clearTable={() => true}
      location={{ search: createSearchQuery() }}
      fetchEditorFilterOptions={() => true}
    />);
    expect(container).toMatchSnapshot();
  });

  it('shows an error', () => {
    const { container } = render(<TableComponent
      id="test"
      className="test"
      fetchMethod={mockFetch}
      columns={mockColumns}
      formatData={mockFormat}
      error={new Error('Test error')}
      tableSortable
      pageCount={1}
      paginateTable={() => true}
      sortTable={() => true}
      clearTable={() => true}
      location={{ search: createSearchQuery() }}
      fetchEditorFilterOptions={() => true}
    />);
    expect(container).toMatchSnapshot();
  });

  it('shows loading', () => {
    const { container } = render(<TableComponent
      id="test"
      className="test"
      fetchMethod={mockFetch}
      columns={mockColumns}
      formatData={mockFormat}
      tableSortable
      pageCount={1}
      paginateTable={() => true}
      sortTable={() => true}
      clearTable={() => true}
      location={{ search: createSearchQuery() }}
      loading
      fetchEditorFilterOptions={() => true}
    />);
    expect(container).toMatchSnapshot();
  });

  it('shows an empty table', () => {
    const { container } = render(
      <IntlProvider locale="en">
        <TableComponent
          id="test"
          className="test"
          fetchMethod={mockFetch}
          columns={mockColumns}
          formatData={mockFormat}
          tableSortable
          pageCount={1}
          paginateTable={() => true}
          sortTable={() => true}
          clearTable={() => true}
          location={{ search: createSearchQuery() }}
          data={[]}
          fetchEditorFilterOptions={() => true}
        />
      </IntlProvider>,
    );
    expect(container).toMatchSnapshot();
  });

  it('shows a populated table', () => {
    const { container } = render(
      <IntlProvider locale="en">
        <TableComponent
          id="test"
          className="test"
          fetchMethod={mockFetch}
          columns={mockColumns}
          formatData={mockFormat}
          tableSortable
          pageCount={1}
          itemCount={2}
          paginateTable={() => true}
          sortTable={() => true}
          clearTable={() => true}
          location={{ search: createSearchQuery() }}
          data={mockFetch()}
          fetchEditorFilterOptions={() => true}
        />
      </IntlProvider>,
    );
    expect(container).toMatchSnapshot();
  });

  it('shows a populated table after a component update for page', () => {
    const defaultProps = {
      id: 'test',
      className: 'test',
      fetchMethod: mockFetch,
      columns: mockColumns,
      formatData: mockFormat,
      tableSortable: true,
      pageCount: 1,
      itemCount: 2,
      paginateTable: () => true,
      sortTable: () => true,
      clearTable: () => true,
      location: { search: createSearchQuery() },
      data: mockFetch(),
      fetchEditorFilterOptions: () => true,
    };
    const { rerender, container } = render(
      <IntlProvider locale="en">
        <TableComponent
          {...defaultProps}
        />
      </IntlProvider>,
    );
    const updatedProps = { ...defaultProps, location: { search: createSearchQuery({ page: 2 }) } };
    rerender(<IntlProvider locale="en"><TableComponent {...updatedProps} /></IntlProvider>);
    expect(container).toMatchSnapshot();
  });

  it('shows a populated table after a component update for ordering', () => {
    const defaultProps = {
      id: 'test',
      className: 'test',
      fetchMethod: mockFetch,
      columns: mockColumns,
      formatData: mockFormat,
      tableSortable: true,
      pageCount: 1,
      itemCount: 2,
      paginateTable: () => true,
      sortTable: () => true,
      clearTable: () => true,
      location: { search: createSearchQuery() },
      data: mockFetch(),
      fetchEditorFilterOptions: () => true,
    };
    const { rerender, container } = render(
      <IntlProvider locale="en">
        <TableComponent
          {...defaultProps}
        />
      </IntlProvider>,
    );
    const updatedProps = { ...defaultProps, location: { search: createSearchQuery({ ordering: '-key' }) } };
    rerender(<IntlProvider locale="en"><TableComponent {...updatedProps} /></IntlProvider>);
    expect(container).toMatchSnapshot();
  });
  it('shows row status for the current page range', () => {
    const page = 4;
    const itemCount = 151;
    const rowsOnLastPage = itemCount - ((page - 1) * PAGE_SIZE);
    window.history.pushState({}, '', `/?page=${page}`);
    render(
      <IntlProvider locale="en">
        <TableComponent
          id="test"
          className="test"
          fetchMethod={mockFetch}
          columns={mockColumns}
          formatData={mockFormat}
          tableSortable
          pageCount={page}
          itemCount={itemCount}
          paginateTable={() => true}
          sortTable={() => true}
          clearTable={() => true}
          location={{ search: `?page=${page}` }}
          data={createRows(rowsOnLastPage)}
          fetchEditorFilterOptions={() => true}
        />
      </IntlProvider>,
    );
    expectAllRowStatusesToMatch(getRowStatusText({ page, itemCount }));
  });

  it('paginates immediately when selecting a new page', async () => {
    delete window.location;
    window.location = new URL(`http://localhost/${createSearchQuery()}`);

    const paginateTable = jest.fn();
    const navigate = jest.fn();
    const selectedPage = 2;
    render(
      <IntlProvider locale="en">
        <TableComponent
          id="test"
          className="test"
          fetchMethod={mockFetch}
          columns={mockColumns}
          formatData={mockFormat}
          tableSortable
          pageCount={4}
          itemCount={151}
          paginateTable={paginateTable}
          sortTable={() => true}
          filterTable={() => true}
          clearTable={() => true}
          location={{ pathname: TEST_PATHNAME, search: createSearchQuery() }}
          data={createRows(PAGE_SIZE)}
          fetchEditorFilterOptions={() => true}
          navigate={navigate}
        />
      </IntlProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: `Page ${selectedPage}` }));
    expect(paginateTable).toHaveBeenCalledWith(selectedPage);
    expect(navigate).toHaveBeenCalledTimes(1);
    const [{ pathname, search }] = navigate.mock.calls[0];
    const queryParams = new URLSearchParams(search);
    expect(pathname).toBe(TEST_PATHNAME);
    expect(queryParams.get('ordering')).toBe(DEFAULT_ORDERING);
    expect(queryParams.get('page')).toBe(String(selectedPage));
  });

  it('updates row status when page changes without refresh', () => {
    const firstPage = 1;
    const secondPage = 2;
    const itemCount = 115;
    delete window.location;
    window.location = new URL(`http://localhost/?page=${firstPage}`);

    const defaultProps = {
      id: 'test',
      className: 'test',
      fetchMethod: mockFetch,
      columns: mockColumns,
      formatData: mockFormat,
      tableSortable: true,
      pageCount: 3,
      itemCount,
      paginateTable: () => true,
      sortTable: () => true,
      filterTable: () => true,
      clearTable: () => true,
      fetchEditorFilterOptions: () => true,
      navigate: () => true,
      data: createRows(PAGE_SIZE),
      location: { pathname: TEST_PATHNAME, search: createSearchQuery({ page: firstPage }) },
    };

    const { rerender } = render(
      <IntlProvider locale="en">
        <TableComponent
          {...defaultProps}
        />
      </IntlProvider>,
    );

    expectAllRowStatusesToMatch(getRowStatusText({ page: firstPage, itemCount }));

    window.location = new URL(`http://localhost/?page=${secondPage}`);
    rerender(
      <IntlProvider locale="en">
        <TableComponent
          {...defaultProps}
          data={createRows(PAGE_SIZE)}
          location={{ pathname: TEST_PATHNAME, search: createSearchQuery({ page: secondPage }) }}
        />
      </IntlProvider>,
    );

    expectAllRowStatusesToMatch(getRowStatusText({ page: secondPage, itemCount }));
  });
});
