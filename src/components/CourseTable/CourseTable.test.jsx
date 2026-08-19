import React from 'react';
import {
  render, screen, waitFor, fireEvent,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import CourseTable from './index';
import DiscoveryDataApiService from '../../data/services/DiscoveryDataApiService';
import { withLocation, withNavigate } from '../../utils/hoc';
import * as utils from '../../utils';
import '@testing-library/jest-dom';

/* eslint-disable react/prop-types */

jest.mock('react-select', () => (
  // eslint-disable-next-line react/prop-types
  function MockSelect(props) {
    return (
      <div>
        <button type="button" onClick={() => props.onChange(null)}>Mock Clear Filters</button>
        <button
          type="button"
          onClick={() => props.onChange([{ value: 'published', label: 'Published' }])}
        >
          Mock Apply Filters
        </button>
      </div>
    );
  }
));

jest.mock('@openedx/paragon', () => {
  const actual = jest.requireActual('@openedx/paragon');

  return {
    ...actual,
    // eslint-disable-next-line react/prop-types
    SearchField: ({ onClear, onSubmit, placeholder }) => (
      <div>
        <input aria-label={placeholder} placeholder={placeholder} />
        <button type="button" onClick={() => onSubmit('search term')}>Mock Submit Search</button>
        <button type="button" onClick={() => onClear()}>Mock Clear Search</button>
      </div>
    ),
  };
});

// Mock qs.parse to handle undefined location
jest.mock('query-string', () => ({
  parse: jest.fn(() => ({})),
}));

jest.mock('../../data/services/DiscoveryDataApiService');
jest.mock('../../utils', () => ({
  ...jest.requireActual('../../utils'),
  getPageOptionsFromUrl: jest.fn(() => ({})),
  updateUrl: jest.fn(),
}));

const mockStore = configureStore([thunk]);

// Wrap CourseTable with HOCs to provide location and navigate
const WrappedCourseTable = withLocation(withNavigate(CourseTable));

// Mock all DiscoveryDataApiService methods
DiscoveryDataApiService.fetchCourses = jest.fn(() => Promise.resolve({
  data: {
    count: 0,
    next: null,
    previous: null,
    results: [],
  },
}));

DiscoveryDataApiService.fetchUsersForCurrentUser = jest.fn(() => Promise.resolve({
  data: {
    results: [],
  },
}));

DiscoveryDataApiService.fetchOrganizations = jest.fn(() => Promise.resolve({
  data: {
    results: [],
  },
}));

DiscoveryDataApiService.exportCoursesCsv = jest.fn(() => Promise.resolve({
  data: new Blob([''], { type: 'text/csv' }),
  headers: { 'content-disposition': 'attachment; filename="courses.csv"' },
}));

const store = mockStore({
  table: {
    loading: false,
    error: null,
    data: {
      count: 2,
      next: null,
      previous: null,
      results: [
        {
          key: 'hogwarts+123',
          uuid: '04c512ed-1b2b-461c-a715-00a0f8cba514',
          title: 'Hast La Vista',
          course_run_statuses: [
            'archived',
          ],
          editors: [
            {
              id: 8,
              user: {
                id: 1,
                full_name: 'edx',
                email: 'edx@example.com',
              },
              course: '04c512ed-1b2b-461c-a715-00a0f8cba514',
            },
          ],
        },
        {
          key: 'hogwarts+111123',
          uuid: '7a6d5b85-fff2-4944-a7bc-a82890de3e7c',
          title: 'New Era Wisdom',
          course_run_statuses: [
            'archived',
          ],
          editors: [
            {
              id: 17,
              user: {
                id: 1,
                full_name: 'edx',
                email: 'edx@example.com',
              },
              course: '7a6d5b85-fff2-4944-a7bc-a82890de3e7c',
            },
          ],
        },
      ],
    },
  },
});

const renderCourseTable = (testStore = store, componentProps = {}) => render(
  <IntlProvider locale="en">
    <Provider store={testStore}>
      <MemoryRouter initialEntries={[{ pathname: '/', search: '' }]}>
        <WrappedCourseTable table={testStore.getState().table} {...componentProps} />
      </MemoryRouter>
    </Provider>
  </IntlProvider>,
);

describe('CourseTable', () => {
  let createObjectURLSpy;
  let revokeObjectURLSpy;
  let originalCreateObjectURL;
  let originalRevokeObjectURL;

  beforeEach(() => {
    jest.clearAllMocks();
    DiscoveryDataApiService.exportCoursesCsv.mockResolvedValue({
      data: new Blob([''], { type: 'text/csv' }),
      headers: { 'content-disposition': 'attachment; filename="courses.csv"' },
    });
    originalCreateObjectURL = global.URL.createObjectURL;
    originalRevokeObjectURL = global.URL.revokeObjectURL;
    if (!originalCreateObjectURL) {
      Object.defineProperty(global.URL, 'createObjectURL', {
        configurable: true,
        writable: true,
        value: () => {},
      });
    }
    if (!originalRevokeObjectURL) {
      Object.defineProperty(global.URL, 'revokeObjectURL', {
        configurable: true,
        writable: true,
        value: () => {},
      });
    }
    createObjectURLSpy = jest.spyOn(global.URL, 'createObjectURL').mockReturnValue('blob:mock-url');
    revokeObjectURLSpy = jest.spyOn(global.URL, 'revokeObjectURL').mockImplementation(() => {});
    // Mock utils functions
    utils.getPageOptionsFromUrl.mockReturnValue({});
    utils.updateUrl.mockImplementation(() => {});
  });

  afterEach(() => {
    createObjectURLSpy.mockRestore();
    revokeObjectURLSpy.mockRestore();
    if (!originalCreateObjectURL) {
      delete global.URL.createObjectURL;
    }
    if (!originalRevokeObjectURL) {
      delete global.URL.revokeObjectURL;
    }
    jest.restoreAllMocks();
  });

  it('shows a table', async () => {
    renderCourseTable();
    await waitFor(() => expect(screen.getByRole('table')).toBeInTheDocument());
  });

  it('shows Download CSV button', async () => {
    renderCourseTable();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Download CSV' })).toBeInTheDocument());
  });

  it('hides Download CSV button while table is loading', async () => {
    renderCourseTable(store, {
      table: {
        loading: true,
        error: null,
        editorFilterOptions: [],
      },
    });

    await waitFor(() => expect(screen.getByRole('table')).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: 'Download CSV' })).not.toBeInTheDocument();
  });

  it('calls export API when Download CSV button is clicked', async () => {
    DiscoveryDataApiService.exportCoursesCsv.mockResolvedValue({
      data: new Blob(['test,data'], { type: 'text/csv' }),
      headers: { 'content-disposition': 'attachment; filename="courses.csv"' },
    });

    renderCourseTable();

    const downloadButton = await waitFor(() => screen.getByRole('button', { name: 'Download CSV' }));
    fireEvent.click(downloadButton);

    await waitFor(() => {
      expect(DiscoveryDataApiService.exportCoursesCsv).toHaveBeenCalledWith({});
    });
  });

  it('shows loading state while download is in progress', async () => {
    DiscoveryDataApiService.exportCoursesCsv.mockImplementation(
      () => new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: new Blob(['test,data'], { type: 'text/csv' }),
            headers: { 'content-disposition': 'attachment; filename="courses.csv"' },
          });
        }, 50);
      }),
    );

    renderCourseTable();

    const downloadButton = await waitFor(() => screen.getByRole('button', { name: 'Download CSV' }));
    fireEvent.click(downloadButton);

    // Button should change to "Downloading..." immediately
    await waitFor(() => expect(screen.getByRole('button', { name: 'Downloading...' })).toBeInTheDocument());

    // After download completes, should return to "Download CSV"
    await waitFor(() => expect(screen.getByRole('button', { name: 'Download CSV' })).toBeInTheDocument(), { timeout: 500 });
  });

  it('shows error message when download fails', async () => {
    DiscoveryDataApiService.exportCoursesCsv.mockRejectedValue(new Error('Network error'));

    renderCourseTable();

    const downloadButton = await waitFor(() => screen.getByRole('button', { name: 'Download CSV' }));
    fireEvent.click(downloadButton);

    await waitFor(() => {
      expect(screen.getByText(/Unable to download CSV/)).toBeInTheDocument();
    });
  });

  it('passes current page options to the export service', async () => {
    utils.getPageOptionsFromUrl.mockReturnValue({
      page: 2,
      page_size: 50,
      limit: 100,
      offset: 100,
      pubq: 'security',
      editors: '1,2',
      course_run_statuses: 'published',
    });

    renderCourseTable();

    const downloadButton = await waitFor(() => screen.getByRole('button', { name: 'Download CSV' }));
    fireEvent.click(downloadButton);

    await waitFor(() => {
      expect(DiscoveryDataApiService.exportCoursesCsv).toHaveBeenCalledWith({
        page: 2,
        page_size: 50,
        limit: 100,
        offset: 100,
        pubq: 'security',
        editors: '1,2',
        course_run_statuses: 'published',
      });
    });
  });

  it('wires filter and search callbacks to URL updates', async () => {
    renderCourseTable();

    const clearFiltersButton = await waitFor(() => screen.getByRole('button', { name: 'Mock Clear Filters' }));
    fireEvent.click(clearFiltersButton);

    const applyFiltersButton = screen.getByRole('button', { name: 'Mock Apply Filters' });
    fireEvent.click(applyFiltersButton);

    const submitSearchButton = screen.getByRole('button', { name: 'Mock Submit Search' });
    fireEvent.click(submitSearchButton);

    const clearSearchButton = screen.getByRole('button', { name: 'Mock Clear Search' });
    fireEvent.click(clearSearchButton);

    expect(utils.updateUrl).toHaveBeenCalledWith(
      { course_run_statuses: null, editors: null, page: 1 },
      expect.any(Function),
      expect.objectContaining({ pathname: '/', search: '' }),
    );
    expect(utils.updateUrl).toHaveBeenCalledWith(
      { course_run_statuses: 'published', editors: null, page: 1 },
      expect.any(Function),
      expect.objectContaining({ pathname: '/', search: '' }),
    );
    expect(utils.updateUrl).toHaveBeenCalledWith(
      { filter: 'search term', page: 1 },
      expect.any(Function),
      expect.objectContaining({ pathname: '/', search: '' }),
    );
    expect(utils.updateUrl).toHaveBeenCalledWith(
      { filter: null },
      expect.any(Function),
      expect.objectContaining({ pathname: '/', search: '' }),
    );
  });

  it('uses filename from Content-Disposition and triggers blob download', async () => {
    const setTimeoutSpy = jest.spyOn(global, 'setTimeout');
    const originalCreateElement = document.createElement.bind(document);
    const mockLink = originalCreateElement('a');
    jest.spyOn(mockLink, 'setAttribute');
    jest.spyOn(mockLink, 'click').mockImplementation(() => {});
    jest.spyOn(mockLink, 'remove').mockImplementation(() => {});
    jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'a') {
        return mockLink;
      }
      return originalCreateElement(tagName);
    });

    DiscoveryDataApiService.exportCoursesCsv.mockResolvedValue({
      data: 'a,b\n1,2',
      headers: { 'content-disposition': 'attachment; filename="downloaded.csv"' },
    });

    renderCourseTable();

    const downloadButton = await waitFor(() => screen.getByRole('button', { name: 'Download CSV' }));
    fireEvent.click(downloadButton);

    await waitFor(() => {
      expect(mockLink.setAttribute).toHaveBeenCalledWith('download', 'downloaded.csv');
      expect(global.URL.createObjectURL).toHaveBeenCalledTimes(1);
      expect(mockLink.click).toHaveBeenCalled();
    });

    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 0);
    const revokeCall = setTimeoutSpy.mock.calls.find(([, delay]) => delay === 0);
    const revokeCallback = revokeCall[0];
    revokeCallback();
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });

  it('falls back to default filename when Content-Disposition is missing', async () => {
    const originalCreateElement = document.createElement.bind(document);
    const mockLink = originalCreateElement('a');
    jest.spyOn(mockLink, 'setAttribute');
    jest.spyOn(mockLink, 'click').mockImplementation(() => {});
    jest.spyOn(mockLink, 'remove').mockImplementation(() => {});
    jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'a') {
        return mockLink;
      }
      return originalCreateElement(tagName);
    });

    DiscoveryDataApiService.exportCoursesCsv.mockResolvedValue({
      data: 'a,b\n1,2',
      headers: {},
    });

    renderCourseTable();

    const downloadButton = await waitFor(() => screen.getByRole('button', { name: 'Download CSV' }));
    fireEvent.click(downloadButton);

    await waitFor(() => {
      expect(mockLink.setAttribute).toHaveBeenCalledWith('download', 'publisher_courses.csv');
    });
  });

  it('falls back to default filename when response headers are undefined', async () => {
    const originalCreateElement = document.createElement.bind(document);
    const mockLink = originalCreateElement('a');
    jest.spyOn(mockLink, 'setAttribute');
    jest.spyOn(mockLink, 'click').mockImplementation(() => {});
    jest.spyOn(mockLink, 'remove').mockImplementation(() => {});
    jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'a') {
        return mockLink;
      }
      return originalCreateElement(tagName);
    });

    DiscoveryDataApiService.exportCoursesCsv.mockResolvedValue({
      data: 'a,b\n1,2',
    });

    renderCourseTable();

    const downloadButton = await waitFor(() => screen.getByRole('button', { name: 'Download CSV' }));
    fireEvent.click(downloadButton);

    await waitFor(() => {
      expect(mockLink.setAttribute).toHaveBeenCalledWith('download', 'publisher_courses.csv');
      expect(mockLink.click).toHaveBeenCalled();
    });
  });
});
