/* eslint-disable camelcase */
import moment from 'moment';
import React from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { Alert } from '@openedx/paragon';

import { IN_REVIEW_STATUS } from '../../data/constants';
import { CreateCourseRunForm } from './CreateCourseRunForm';
import LoadingSpinner from '../LoadingSpinner';

import PageContainer from '../PageContainer';
import {
  buildInitialPrices, formatDate, getOptionsData, parseCourseTypeOptions,
} from '../../utils';

class CreateCourseRunPage extends React.Component {
  constructor(props) {
    super(props);
    this.handleCourseCreate = this.handleCourseCreate.bind(this);
    this.state = {
      startedFetching: false,
    };

    if (props.courseInfo.error) {
      props.clearCourseInfoErrors();
    }
  }

  componentDidMount() {
    const {
      courseInfo,
      courseOptions,
      courseRunOptions,
      fetchCourseInfo,
      fetchCourseOptions,
      fetchCourseRunOptions,
      uuid,
    } = this.props;
    if (!courseInfo.data || (courseInfo.data
        && (Object.keys(courseInfo.data).length === 0
        || courseInfo.data.uuid !== uuid))) {
      // We need to request Course data
      fetchCourseInfo(uuid);
    }
    if (!courseOptions.data || (courseOptions.data
        && Object.keys(courseOptions.data).length === 0)) {
      fetchCourseOptions();
    }
    if (!courseRunOptions.data || (courseRunOptions.data
        && Object.keys(courseRunOptions.data).length === 0)) {
      fetchCourseRunOptions();
    }
    this.setStartedFetching();
  }

  handleCourseCreate(options) {
    const {
      courseInfo: {
        data: {
          key,
          uuid,
          entitlements,
          course_runs,
        },
      },
      createCourseRun,
      navigate,
    } = this.props;

    const prices = buildInitialPrices(entitlements, course_runs);
    const courseRunData = {
      course: key,
      start: options.start,
      end: options.end,
      pacing_type: options.pacing_type,
      prices,
      rerun: options.rerun,
      run_type: options.run_type,
      term: options.courseRunKey,
    };
    return createCourseRun(uuid, courseRunData, navigate);
  }

  setStartedFetching() {
    this.setState({ startedFetching: true });
  }

  parseCourseRunLabels(courseRuns) {
    // Sort course runs by descending start dates
    const sortedCourseRuns = courseRuns.sort((run1, run2) => moment(run2.start).diff(moment(run1.start)));
    return sortedCourseRuns.map((run) => {
      const runTerm = run.key.split(/\+|\//).pop();
      return ({ label: `Run starting ${formatDate(run.start)} (${runTerm})`, value: run.key });
    });
  }

  render() {
    const {
      courseInfo,
      courseInfo: {
        data: {
          course_runs,
          type,
        },
      },
      courseOptions,
      courseRunOptions,
      formValues,
    } = this.props;
    const {
      startedFetching,
    } = this.state;
    const title = courseInfo.data && courseInfo.data.title ? courseInfo.data.title : '';
    const uuid = courseInfo.data && courseInfo.data.uuid ? courseInfo.data.uuid : '';
    const canSetRunKey = courseInfo.data && courseInfo.data.owners
      && !courseInfo.data.owners.some(o => o.auto_generate_course_run_keys);

    const errorArray = [];
    if (courseInfo.error) {
      courseInfo.error.forEach((error, index) => {
        errorArray.push(error);
        if (index < courseInfo.error.length) {
          errorArray.push(<br />);
        }
      });
    }

    const courseInReview = course_runs && course_runs.some(courseRun => IN_REVIEW_STATUS.includes(courseRun.status));

    const showSpinner = !startedFetching || courseInfo.isFetching || courseOptions.isFetching
      || courseRunOptions.isFetching;
    const showForm = startedFetching && !courseInfo.isFetching && !courseOptions.isFetching
      && !courseRunOptions.isFetching && !courseInReview;
    const sortedRunLabels = (showForm
      && (course_runs ? this.parseCourseRunLabels(course_runs) : []));
    const defaultRun = (showForm && (sortedRunLabels.length ? sortedRunLabels[0].value : ''));

    const courseOptionsData = showForm && getOptionsData(courseOptions);
    const parsedTypeOptions = courseOptionsData && courseOptionsData.type
      && parseCourseTypeOptions(courseOptionsData.type.type_options);
    const courseRunTypeOptions = parsedTypeOptions && parsedTypeOptions.courseRunTypeOptions;
    const defaultRunType = courseRunTypeOptions && courseRunTypeOptions[type]
      && courseRunTypeOptions[type][1] && courseRunTypeOptions[type][1].value;
    const defaultPacingType = course_runs && defaultRun && course_runs.find(run => run.key === defaultRun).pacing_type;

    return (
      <>
        <Helmet>
          Create Course Run
        </Helmet>

        <PageContainer>
          { showSpinner && <LoadingSpinner /> }
          { courseInReview
            && (
            <Alert variant="warning">
              {`${title} has been submitted for review. No course runs can be added right now.`}
            </Alert>
            )}
          { showForm
          && (
            <div>
              <CreateCourseRunForm
                id={`create-course-run-form-${uuid}`}
                onSubmit={this.handleCourseCreate}
                title={title}
                uuid={uuid}
                isCreating={courseInfo.isCreating}
                currentFormValues={formValues}
                courseRunLabels={sortedRunLabels}
                courseOptions={courseOptions}
                courseRunOptions={courseRunOptions}
                courseRunTypeOptions={courseRunTypeOptions ? courseRunTypeOptions[type] : []}
                initialValues={{
                  rerun: defaultRun,
                  run_type: defaultRunType,
                  pacing_type: defaultPacingType,
                }}
                courseTypeUuid={type}
                canSetRunKey={canSetRunKey}
              />
              {errorArray.length > 1 && (
                <Alert
                  id="create-error"
                  variant="danger"
                  className="mt-3"
                >
                  {errorArray}
                </Alert>
              ) }
            </div>
          )}
        </PageContainer>

      </>
    );
  }
}

CreateCourseRunPage.defaultProps = {
  initialValues: {},
  fetchCourseInfo: () => {},
  fetchCourseOptions: () => {},
  fetchCourseRunOptions: () => {},
  courseInfo: {},
  courseOptions: {},
  courseRunOptions: {},
  createCourseRun: () => {},
  clearCourseInfoErrors: () => null,
  formValues: {},
};

CreateCourseRunPage.propTypes = {
  initialValues: PropTypes.shape({ // eslint-disable-line react/no-unused-prop-types
    course: PropTypes.string,
  }),
  fetchCourseInfo: PropTypes.func,
  courseInfo: PropTypes.shape({
    data: PropTypes.shape(),
    error: PropTypes.arrayOf(PropTypes.string),
    isCreating: PropTypes.bool,
    isFetching: PropTypes.bool,
  }),
  fetchCourseOptions: PropTypes.func,
  fetchCourseRunOptions: PropTypes.func,
  courseOptions: PropTypes.shape({
    data: PropTypes.shape(),
    error: PropTypes.arrayOf(PropTypes.string),
    isFetching: PropTypes.bool,
  }),
  courseRunOptions: PropTypes.shape({
    data: PropTypes.shape(),
    error: PropTypes.arrayOf(PropTypes.string),
    isFetching: PropTypes.bool,
  }),
  uuid: PropTypes.string.isRequired,
  createCourseRun: PropTypes.func,
  clearCourseInfoErrors: PropTypes.func,
  formValues: PropTypes.shape({}),
  navigate: PropTypes.func.isRequired,
};

export default CreateCourseRunPage;
