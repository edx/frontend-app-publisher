import React from 'react';
import PropTypes from 'prop-types';
import qs from 'query-string';
import { Pagination, DataTable, Alert } from '@openedx/paragon';
import { Error as ErrorIcon } from '@openedx/paragon/icons';
import 'font-awesome/css/font-awesome.css';

import './TableComponent.scss';

import LoadingSpinner from '../LoadingSpinner';
import { getErrorMessages, getPageOptionsFromUrl, updateUrl } from '../../utils';

class TableComponent extends React.Component {
  pendingPageUpdateFromClick = null;

  componentDidMount() {
    // Get initial data
    this.props.paginateTable();
    this.props.fetchEditorFilterOptions();
  }

  componentDidUpdate(prevProps) {
    const { location } = this.props;

    // Handle the case where the query params have changed. This is used when sorting & paging, but
    // also when the back button is used. We need to determine if this is a pagination or sorting
    // request as we handle these as slightly different actions in the action handlers.
    if (location.search !== prevProps.location.search) {
      const {
        page: prevPage,
        ordering: prevOrdering,
        filter: prevFilter,
        editors: prevEditors,
        course_run_statuses: prevCourseRunStatuses,
      } = qs.parse(prevProps.location.search);
      const {
        page,
        ordering,
        filter,
        editors,
        course_run_statuses: courseRunStatuses,
      } = qs.parse(location.search);
      if (ordering !== prevOrdering) {
        this.props.sortTable(ordering);
      } else if (page !== prevPage) {
        const selectedPage = parseInt(page || 1, 10);

        if (this.pendingPageUpdateFromClick === selectedPage) {
          this.pendingPageUpdateFromClick = null;
        } else {
          this.props.paginateTable(selectedPage);
        }
      } else if (filter !== prevFilter) {
        this.props.filterTable({ pubq: filter });
      } else if (editors !== prevEditors) {
        this.props.filterTable(editors);
      } else if (courseRunStatuses !== prevCourseRunStatuses) {
        this.props.filterTable(courseRunStatuses);
      }
    }
  }

  componentWillUnmount() {
    this.props.clearTable();
  }

  handlePageSelect = (page) => {
    const { navigate, location } = this.props;
    this.pendingPageUpdateFromClick = page;
    this.props.paginateTable(page);
    updateUrl({ page }, navigate, location);
  };

  renderTableContent() {
    const {
      className,
      pageCount,
      itemCount,
      tableSortable,
      data,
      formatData,
      loading,
      location,
      navigate,
    } = this.props;

    const columnConfig = this.props.columns.map(column => ({
      ...column,
      onSort: !column.columnSortable ? direction => updateUrl({
        page: 1,
        ordering: direction === 'desc' ? `-${column.key}` : column.key,
      }, navigate, location) : null,
    }));
    let sortDirection;
    let sortColumn;

    if (tableSortable) {
      const { ordering } = qs.parse(location.search);
      sortDirection = ordering && ordering.indexOf('-') !== -1 ? 'desc' : 'asc';
      sortColumn = (ordering && ordering.replace('-', '')) || columnConfig[0].key;
    }

    const paginationOptions = getPageOptionsFromUrl();
    const pageIndex = paginationOptions.page - 1;

    return (
      <div className={className}>
        {loading && <LoadingSpinner />}
        <div className="table-responsive">
          <DataTable
            key={`table-page-${paginationOptions.page}-${paginationOptions.page_size}`}
            className="table-sm table-striped"
            columns={columnConfig}
            data={formatData(data)}
            isSortable={tableSortable}
            itemCount={itemCount}
            initialState={{
              pageIndex,
              pageSize: paginationOptions.page_size,
            }}
            defaultSortedColumn={sortColumn}
            defaultSortDirection={sortDirection}
          />
        </div>
        { pageCount > 1
          && (
          <div className="mt-2 d-flex justify-content-center">
            <Pagination
              pageCount={pageCount}
              currentPage={paginationOptions.page}
              onPageSelect={this.handlePageSelect}
            />
          </div>
          )}
      </div>
    );
  }

  renderLoadingMessage() {
    return <LoadingSpinner />;
  }

  renderErrorMessage() {
    const { error } = this.props;
    const isForbidden = error.response && error.response.status === 403;
    const message = isForbidden
      ? ['You do not yet have access to Publisher. Please contact your project coordinator to get access.']
      : ['Unable to load data: '].concat(getErrorMessages(this.props.error));
    return (
      <Alert
        variant="danger"
        icon={ErrorIcon}
      >
        {message}
      </Alert>
    );
  }

  render() {
    const {
      data,
      loading,
      error,
    } = this.props;

    return (
      <>
        {error && this.renderErrorMessage()}
        {loading && !data && this.renderLoadingMessage()}
        {data && this.renderTableContent()}
      </>
    );
  }
}

TableComponent.propTypes = {
  // Props expected from consumer
  className: PropTypes.string,
  columns: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  formatData: PropTypes.func.isRequired,
  tableSortable: PropTypes.bool,

  // Props expected from TableContainer / redux store
  data: PropTypes.arrayOf(PropTypes.shape({})),
  pageCount: PropTypes.number.isRequired,
  itemCount: PropTypes.number.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.instanceOf(Error),
  paginateTable: PropTypes.func.isRequired,
  sortTable: PropTypes.func.isRequired,
  filterTable: PropTypes.func.isRequired,
  clearTable: PropTypes.func.isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string,
    search: PropTypes.string,
  }).isRequired,
  fetchEditorFilterOptions: PropTypes.func.isRequired,
  navigate: PropTypes.func.isRequired,
};

TableComponent.defaultProps = {
  className: '',
  tableSortable: false,
  data: undefined,
  error: null,
  loading: false,
};

export default TableComponent;
