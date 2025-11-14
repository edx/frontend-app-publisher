import {
  useCallback, useState, useRef, useMemo,
} from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import {
  DataTable, Alert, DropdownFilter,
} from '@openedx/paragon';

import PropTypes from 'prop-types';

import Collapsible from '../Collapsible';
import { formatDate } from '../../utils';
import DiscoveryDataApiService from '../../data/services/DiscoveryDataApiService';
import './BulkOperations.scss';

const RECORDS_PER_PAGE = 10;

const StatusCell = ({ value }) => (
  <span className={classNames(
    {
      badge: true,
      'text-capitalize': true,
      'badge-danger': value.toLowerCase() === 'failed',
      'badge-success': value.toLowerCase() === 'completed',
      'badge-warning': value.toLowerCase() === 'processing',
      'badge-info': value.toLowerCase() === 'pending',
    },
  )}
  >
    {value}
  </span>
);

const FilenameCell = ({ value, row }) => (
  <Link to={`/bulk-operation-tasks/${row.original.id}`}>{value}</Link>
);

const HistoricalRecords = () => {
  const [isLoading, setIsLoading] = useState(true);

  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [historicalRecords, setHistoricalRecords] = useState(null);
  const [isError, setIsError] = useState(false);

  const prevStatus = useRef();
  const prevPageIndex = useRef();

  const columns = useMemo(() => (
    [
      {
        Header: 'Date',
        accessor: row => formatDate(row.created),
        disableFilters: true,
      },
      {
        Header: 'Filename',
        accessor: row => row.csv_file.split('/').pop(),
        Cell: FilenameCell,
        disableFilters: true,
      },
      {
        Header: 'Status',
        accessor: 'status',
        Cell: StatusCell,
        Filter: DropdownFilter,
        filter: 'equals',
        filterChoices: [
          {
            name: 'Pending',
            value: 'pending',
          },
          {
            name: 'Processing',
            value: 'processing',
          },
          {
            name: 'Completed',
            value: 'completed',
          },
          {
            name: 'Failed',
            value: 'failed',
          },
        ],
      },
      {
        Header: 'Operation',
        accessor: row => row.task_type,
        disableFilters: true,
      },
    ]
  ), []);

  async function fetchBulkOpTasks(pageIndex, pageSize, statusFilter) {
    setIsLoading(true);
    try {
      const response = await DiscoveryDataApiService.fetchBulkOperations(pageIndex, pageSize, statusFilter);
      setHistoricalRecords(response.data.results);
      setTotalItems(response.data.count);
      setTotalPages(Math.ceil(response.data.count / pageSize));
    } catch (error) {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }

  const fetchData = useCallback((params) => {
    const statusFilter = params.filters.find(filter => filter.id === 'status')?.value;

    // When changing the filter from page X, fetchData is called first with page X and then
    // with page 0. We ignore the first of these.
    // please ignore this comment-just adding for testing of ci configurations
    if (prevStatus.current !== statusFilter && params.pageIndex !== 0) {
      return;
    }

    // Don't do anything if called for the same combination of filters and page number
    if (prevStatus.current === statusFilter && prevPageIndex.current === params.pageIndex) {
      return;
    }

    prevStatus.current = statusFilter;
    prevPageIndex.current = params.pageIndex;
    fetchBulkOpTasks(params.pageIndex, params.pageSize, statusFilter);
  }, []);

  function getCollapsibleTitle() {
    return <span className="font-weight-bold">Processing History</span>;
  }

  return (
    <Collapsible title={getCollapsibleTitle()} id="bulk-operation-historical-records">
      {isError && (
        <Alert variant="danger">Failed to fetch historical tasks. Please try reloading the page</Alert>
      )}

      <DataTable
        isLoading={isLoading}
        isFilterable
        manualFilters
        isPaginated
        manualPagination
        fetchData={fetchData}
        itemCount={totalItems}
        pageCount={totalPages}
        initialState={{
          pageSize: RECORDS_PER_PAGE,
          pageIndex: 0,
        }}
        data={historicalRecords ?? []}
        columns={columns}
      />
    </Collapsible>
  );
};

FilenameCell.propTypes = {
  value: PropTypes.string,
  row: PropTypes.shape({
    original: PropTypes.shape({
      id: PropTypes.string,
    }),
  }),
};

StatusCell.propTypes = {
  value: PropTypes.string,
};

export default HistoricalRecords;
