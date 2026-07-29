import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import React from 'react';
import { Link } from 'react-router-dom';
import Select from 'react-select';
import qs from 'query-string';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform';
import { SearchField, Alert } from '@openedx/paragon';

import TableContainer from '../../containers/TableContainer';
import PageContainer from '../PageContainer';
import {
  formatDate,
  getErrorMessages,
  getPageOptionsFromUrl,
  updateUrl,
} from '../../utils';
import DiscoveryDataApiService from '../../data/services/DiscoveryDataApiService';
import Pill from '../Pill';
import { PUBLISHED, REVIEWED, ARCHIVED } from '../../data/constants';

import './CourseTable.scss';

const dot = color => ({
  alignItems: 'center',
  display: 'flex',

  ':before': {
    backgroundColor: color,
    borderRadius: 10,
    content: '" "',
    display: 'block',
    marginRight: 8,
    height: 10,
    width: 10,
  },
});

class CourseTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filterGroups: [
        {
          label: 'Course Run Statuses',
          options: [
            { value: 'in_review', label: 'In review', color: '#e7e7e7' },
            { value: PUBLISHED, label: 'Published', color: '#008100' },
            { value: REVIEWED, label: 'Scheduled', color: '#0075b4' },
            { value: 'unsubmitted', label: 'Unsubmitted', color: '#E2C018' },
            { value: ARCHIVED, label: 'Archived', color: '#454545' },
          ],
        },
      ],
      selectedFilters: [],
      isExporting: false,
      exportError: null,
    };
  }

  componentDidMount() {
    this.props.fetchOrganizations();
  }

  componentDidUpdate(prevProps) {
    const {
      table: {
        editorFilterOptions,
      },
    } = this.props;
    const { administrator } = getAuthenticatedUser();
    const { selectedFilters } = this.state;
    const prevEditorFilterOptions = prevProps.table.editorFilterOptions;

    if (editorFilterOptions !== prevEditorFilterOptions && !administrator) {
      this.state.filterGroups.push({
        label: 'Course Editors',
        options: editorFilterOptions.map(editor => ({ value: editor.id, label: editor.name })),
      });
      this.getSelectedFiltersFromUrl();
    }
    const {
      editors: prevEditors,
      course_run_statuses: prevCourseRunStatuses,
      course_type: prevCourseType,
    } = qs.parse(prevProps.location.search);
    const {
      editors,
      course_run_statuses: courseRunStatuses,
      course_type: courseType,
    } = qs.parse(this.props.location.search);
    if ((editors !== prevEditors) || (courseRunStatuses !== prevCourseRunStatuses)) {
      this.getSelectedFiltersFromUrl();
    }
    if (courseType !== prevCourseType) {
      this.updateFilterQueryParamsInUrl(selectedFilters);
    }
  }

  // eslint-disable-next-line react/sort-comp
  getExportOptions() {
    return { ...getPageOptionsFromUrl() };
  }

  getFilenameFromContentDisposition(contentDispositionHeader) {
    if (!contentDispositionHeader) {
      return 'publisher_courses.csv';
    }

    const match = contentDispositionHeader.match(/filename="?([^";]+)"?/i);
    return match ? match[1] : 'publisher_courses.csv';
  }

  triggerCsvDownload(blobData, filename) {
    const blob = new Blob([blobData], { type: 'text/csv;charset=utf-8;' });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => {
      window.URL.revokeObjectURL(downloadUrl);
    }, 0);
  }

  handleDownloadCsv() {
    this.setState({ isExporting: true, exportError: null });

    DiscoveryDataApiService.exportCoursesCsv(this.getExportOptions())
      .then((response) => {
        const filename = this.getFilenameFromContentDisposition(response.headers?.['content-disposition']);
        this.triggerCsvDownload(response.data, filename);
        this.setState({ isExporting: false });
      })
      .catch((error) => {
        this.setState({
          isExporting: false,
          exportError: getErrorMessages(error).join(' '),
        });
      });
  }

  updateFilterQueryParamsInUrl(selectedFilters) {
    const { location, navigate } = this.props;
    const courseRunStatusParams = selectedFilters.filter(filter => !Number.isInteger(filter.value));
    const editorParams = selectedFilters.filter(filter => Number.isInteger(filter.value));
    const params = {
      course_run_statuses: courseRunStatusParams.length
        ? courseRunStatusParams.map(filter => filter.value).toString() : null,
      editors: editorParams.length ? editorParams.map(filter => filter.value).toString() : null,
    };
    updateUrl({ ...params, page: 1 }, navigate, location);
  }

  getSelectedFiltersFromUrl() {
    const pageOptions = getPageOptionsFromUrl();

    const courseRunStatusesFromQuery = pageOptions.course_run_statuses
      ? pageOptions.course_run_statuses.split(',') : null;

    const editorsFromQuery = pageOptions.editors ? pageOptions.editors.split(',') : null;
    const selectedEditors = editorsFromQuery ? this.state.filterGroups.find(group => (
      group.label === 'Course Editors'
    )).options.filter(option => editorsFromQuery.includes(option.value.toString())) : [];

    if (!courseRunStatusesFromQuery) {
      this.setState({
        selectedFilters: selectedEditors,
      });
    } else {
      this.setState(prevState => ({
        selectedFilters: prevState.filterGroups.find(group => (
          group.label === 'Course Run Statuses'
        ))
          .options
          .filter(option => courseRunStatusesFromQuery.includes(option.value))
          .concat(selectedEditors),
      }));
    }
  }

  renderTableHeader() {
    const { location, navigate } = this.props;
    const {
      selectedFilters, filterGroups, isExporting, exportError,
    } = this.state;
    const pageOptions = getPageOptionsFromUrl();

    return (
      <>
        {exportError && (
          <div className="row px-3 mb-3">
            <Alert variant="danger">Unable to download CSV: {exportError}</Alert>
          </div>
        )}
        <div className="row publisher-toolbar-row px-3">
          <div className="publisher-toolbar-filters">
            <Select
              closeMenuOnSelect={false}
              value={selectedFilters}
              options={filterGroups}
              onChange={filters => this.updateFilterQueryParamsInUrl(filters === null
                ? [] : filters)}
              isMulti
              maxMenuHeight="30vh"
              placeholder="Filters..."
              styles={
                  {
                    option: (styles, { data }) => ({ ...styles, ...dot(data.color) }),
                    multiValue: (styles, { data }) => (
                      { ...styles, backgroundColor: data.color || '#e7e7e7', opacity: 0.7 }
                    ),
                    multiValueLabel: (styles, { data }) => (
                      {
                        ...styles,
                        color: data.label === 'Published' || data.label === 'Scheduled' ? '#ffffff' : '#000000',
                      }
                    ),
                  }
                }
            />
          </div>
          <div className="publisher-toolbar-search">
            <SearchField
              value={pageOptions.pubq}
              onClear={() => {
                updateUrl({ filter: null }, navigate, location);
              }}
              onSubmit={(filter) => {
                updateUrl({ filter, page: 1 }, navigate, location);
              }}
              placeholder="Search"
            />
          </div>
          <div className="publisher-toolbar-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => this.handleDownloadCsv()}
              disabled={isExporting}
            >
              {isExporting ? 'Downloading...' : 'Download CSV'}
            </button>
            <Link to="/courses/new">
              <button type="button" className="btn btn-primary">New course</button>
            </Link>
          </div>
        </div>
      </>
    );
  }

  render() {
    const {
      table: {
        error,
        loading,
      },
    } = this.props;

    const courseTableColumns = [
      {
        Header: 'Course name',
        key: 'title',
        disableSortBy: false,
        accessor: 'title',
      },
      {
        Header: 'Course number',
        key: 'number',
        disableSortBy: false,
        accessor: 'number',
      },
      {
        Header: 'States',
        key: 'course_run_statuses',
        accessor: 'course_run_statuses',
        disableSortBy: true,
      },
      {
        Header: 'Course editors',
        key: 'course_editor_names',
        accessor: 'course_editor_names',
        disableSortBy: true,
      },
    ];
    const formatCourseData = courses => courses.map(course => ({
      ...course,
      title: (<Link to={`/courses/${course.uuid}`}>{course.title}</Link>),
      modified: formatDate(course.modified),
      number: course.key_for_reruns || course.key,
      course_run_statuses: (<Pill statuses={course.course_run_statuses} />),
      course_editor_names: course.editors ? course.editors.map(editor => editor.user.full_name).join(', ') : '',
    }));

    return (
      <PageContainer wide>
        <Helmet>
          <title>{`Publisher | ${getConfig().SITE_NAME}`}</title>
          <link rel="shortcut icon" href={getConfig().FAVICON_URL} type="image/x-icon" />
        </Helmet>
        {!loading && !error && this.renderTableHeader()}
        <TableContainer
          className="courses"
          columns={courseTableColumns}
          formatData={formatCourseData}
          tableSortable
        />
      </PageContainer>
    );
  }
}

CourseTable.defaultProps = {
  fetchOrganizations: () => {},
  publisherUserInfo: {
    organizations: [],
  },
  table: {
    error: null,
    loading: false,
    editorFilterOptions: [],
  },
};

CourseTable.propTypes = {
  fetchOrganizations: PropTypes.func,
  publisherUserInfo: PropTypes.shape({
    organizations: PropTypes.arrayOf(PropTypes.shape({})),
    error: PropTypes.arrayOf(PropTypes.string),
    isFetching: PropTypes.bool,
  }),
  location: PropTypes.shape({
    pathname: PropTypes.string,
    search: PropTypes.string,
  }).isRequired,
  table: PropTypes.shape({
    error: PropTypes.arrayOf(PropTypes.string),
    loading: PropTypes.bool,
    editorFilterOptions: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number,
      full_name: PropTypes.string,
    })),
  }),
  navigate: PropTypes.func.isRequired,
};

export default CourseTable;
