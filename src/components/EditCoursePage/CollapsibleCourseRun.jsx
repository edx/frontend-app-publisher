/* eslint-disable react/jsx-no-useless-fragment */
import React from 'react';

import { CopyToClipboard } from 'react-copy-to-clipboard';
import moment from 'moment';
import PropTypes from 'prop-types';

import { Field, FieldArray } from 'redux-form';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform';
import { faCopy } from '@fortawesome/free-regular-svg-icons';
import { faCopy as solidCopy } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Hyperlink, Tooltip, OverlayTrigger } from '@openedx/paragon';

import CourseRunButtonToolbar from './CourseRunButtonToolbar';
import { courseSubmitRun } from '../../data/actions/courseSubmitInfo';
import FieldLabel from '../FieldLabel';
import {
  courseRunIsArchived, localTimeZone, formatDate, isSafari, getDateWithDashes,
  getDateWithSlashes, isNonExemptChanged, isPristine, hasMastersTrack, jsonDeepEqual, utcTimeZone, isExternalCourse,
  restrictionTypeOptions,
} from '../../utils';
import Pill from '../Pill';
import RenderInputTextField from '../RenderInputTextField';
import RenderSelectField from '../RenderSelectField';
import DateTimeField from '../DateTimeField';
import store from '../../data/store';
import TranscriptLanguage from './TranscriptLanguage';
import Collapsible from '../Collapsible';

import {
  ARCHIVED, DATE_FORMAT, IN_REVIEW_STATUS, REVIEW_BY_INTERNAL, REVIEW_BY_LEGAL,
  PUBLISHED, DATE_INPUT_PATTERN, FORMAT_DATE_MATCHER, NORMALIZE_DATE_MATCHER, REVIEWED,
} from '../../data/constants';
import {
  dateEditHelp, runTypeHelp, pacingEditHelp, publishDateHelp, courseRunVariantIdHelp, courseRunRestrictionTypeHelp,
} from '../../helpText';
import RichEditor from '../RichEditor';
import ListField from '../ListField';
import { Staffer } from '../Staffer';
import renderStaffSuggestion from '../Staffer/renderStaffSuggestion';
import fetchStaffSuggestions from '../Staffer/fetchStaffSuggestions';
import { withNavigate } from '../../utils/hoc';

const determineStatus = run => (courseRunIsArchived(run) ? ARCHIVED : run.status);

const formatCourseRunTitle = (courseRun, copied, setCopied) => {
  if (courseRun) {
    const labelItems = [];
    let publishDate = '';

    const handleClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    if (courseRun.start) {
      labelItems.push(formatDate(courseRun.start));
    }
    if (courseRun.pacing_type) {
      labelItems.push(courseRun.pacing_type.split('_').map(pacingType => pacingType.charAt(0).toUpperCase() + pacingType.slice(1)).join(' '));
    }
    if (courseRun.status !== PUBLISHED && courseRun.go_live_date) {
      const formattedDate = formatDate(courseRun.go_live_date);
      publishDate = `Publish date is ${formattedDate}`;
    }
    return (
      <div className="course-run-label">
        <span>{`Course run starting on ${labelItems.join(' - ')}`}</span>
        {/*
          TODO: After we have a way of determining if the course run has been edited, that should
          be added into the list of statuses being passed into the Pill component.
        */}
        <Pill statuses={[determineStatus(courseRun)]} />
        <div className="course-run-label">
          <span>{`${publishDate}`}</span>
        </div>
        <div className="course-run-studio-url">
          <>
            Studio URL -&nbsp;
            <Hyperlink
              destination={`${getConfig().STUDIO_BASE_URL}/course/${courseRun.key}`}
              target="_blank"
              isInline
            >
              {courseRun.key}
            </Hyperlink>
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>{copied ? 'Course key copied!' : 'Copy course key'}</Tooltip>}
            >
              <CopyToClipboard text={courseRun.key} onCopy={() => setCopied()}>
                <FontAwesomeIcon
                  className="text-primary ml-2"
                  icon={copied ? solidCopy : faCopy}
                  onClick={handleClick}
                />
              </CopyToClipboard>
            </OverlayTrigger>
          </>
        </div>
      </div>
    );
  }
  return (
    <div>
      <span>Your new course run</span>
    </div>
  );
};

class CollapsibleCourseRun extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      copied: false,
      returnFromStaffPage: false,
      hasExternalKey: undefined,
    };

    this.openCollapsible = this.openCollapsible.bind(this);
    this.scrollToStaffPosition = this.scrollToStaffPosition.bind(this);
    this.displayOfacRestriction = this.displayOfacRestriction.bind(this);
    this.formatDate = this.formatDate.bind(this);
    this.normalizeDate = this.normalizeDate.bind(this);
  }

  componentDidMount() {
    const {
      stafferInfo: { returnToEditCourse },
      sourceInfo: { referringRun },
      courseRun: { key },
    } = this.props;

    if (returnToEditCourse && referringRun === key) {
      this.openCollapsible();
      this.scrollToStaffPosition(returnToEditCourse);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      open,
      returnFromStaffPage,
    } = this.state;
    const {
      courseId,
      currentFormValues: {
        course_runs: courseRuns,
      },
      index,
      runTypeModes,
    } = this.props;
    const {
      returnFromStaffPage: wasReturnedFromStaff,
    } = prevState;

    if (open && returnFromStaffPage) {
      this.scrollToStaffPosition(false);
    }
    if (wasReturnedFromStaff && !returnFromStaffPage) {
      const element = document.getElementById(`${courseId}.staff.label`);
      element.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
    }

    // We initialize hasExternalKey to null and then the function will reevaluate it into
    // a boolean which will be our exit state
    if (prevState.hasExternalKey === undefined && courseRuns) {
      // eslint-disable-next-line react/prop-types
      const hasExternalKey = hasMastersTrack(courseRuns[index].run_type, runTypeModes);
      this.setState({ hasExternalKey }); // eslint-disable-line react/no-did-update-set-state
    }
  }

  setCopied = () => {
    this.setState({
      copied: true,
    });

    setTimeout(() => {
      this.setState({ copied: false });
    }, 1800);
  };

  scrollToStaffPosition(focus) {
    this.setState({
      returnFromStaffPage: focus,
    });
  }

  openCollapsible() {
    this.props.onToggle(true);
  }

  displayOfacRestriction(restriction) {
    switch (restriction) {
      case false:
        return 'No';
      case true:
        return 'Yes';
      default:
        return '--';
    }
  }

  formatDate(date) {
    if (date) {
      if (date.includes('T')
        && date.split('T')[0].match(FORMAT_DATE_MATCHER)) {
        return getDateWithSlashes(date);
      }
      return date;
    }
    return '';
  }

  normalizeDate(date) {
    if (date) {
      if (date.match(NORMALIZE_DATE_MATCHER)) {
        return moment(date).utc().format(DATE_FORMAT);
      }
      return date;
    }
    return '';
  }

  render() {
    const {
      courseId,
      courseInReview,
      courseRun,
      courseSubmitting,
      editable,
      isSubmittingForReview,
      languageOptions,
      ofacRestrictionOptions,
      programOptions,
      pacingTypeOptions,
      targetRun,
      owners,
      courseUuid,
      stafferInfo,
      sourceInfo,
      courseSubmitInfo,
      initialValues,
      currentFormValues,
      isOpen,
      onToggle,
      courseRunTypeOptions,
      courseInfo,
    } = this.props;
    const { copied, hasExternalKey } = this.state;
    const { administrator } = getAuthenticatedUser();

    const courseRunInReview = IN_REVIEW_STATUS.includes(courseRun.status);
    // Checks if the current course run is the one triggering submission for review
    const courseRunSubmitting = !courseRunInReview && isSubmittingForReview && targetRun
      && (targetRun.key === courseRun.key);

    const disabled = courseInReview || !editable;
    const seatHasSku = courseRun.seats
      && courseRun.seats.reduce((hasSku, seat) => !!seat.sku || hasSku, false);

    const courseDateEditHelp = dateEditHelp(courseRun);
    const coursePacingEditHelp = pacingEditHelp(courseRun);
    const runType = currentFormValues && currentFormValues.type;
    const runTypeOptions = runType && courseRunTypeOptions[runType];
    // Handle mismatches between CourseType and CourseRunType
    if (courseRun.run_type && runTypeOptions
      && runTypeOptions.every(option => option.value !== courseRun.run_type)) {
      runTypeOptions.push({ label: '--', value: courseRun.run_type });
    }

    const pristine = initialValues && isPristine(initialValues, currentFormValues)
      && isPristine(initialValues, currentFormValues, courseRun.key);
    const productSource = courseInfo?.data?.product_source?.slug;
    const courseType = courseInfo?.data?.course_type;

    return (
      <Collapsible
        title={formatCourseRunTitle(courseRun, copied, this.setCopied)}
        open={isOpen}
        onToggle={onToggle}
      >
        <div className="mb-3">
          <span className="text-primary-500" aria-hidden> All fields are required for publication unless otherwise specified.</span>
        </div>
        {isExternalCourse(productSource, courseType) && (
          <Field
            name={`${courseId}.variant_id`}
            component={RenderInputTextField}
            label={(
              <FieldLabel
                id={`${courseId}.variant_id.label`}
                text="Variant Id"
                helpText={courseRunVariantIdHelp}
              />
            )}
            disabled={disabled}
            optional
          />
        )}
        {isExternalCourse(productSource, courseType) && (
        <Field
          name={`${courseId}.restriction_type`}
          component={RenderSelectField}
          options={restrictionTypeOptions}
          label={<FieldLabel text="Restriction Type" helpText={courseRunRestrictionTypeHelp} />}
          disabled={disabled}
          props={{ name: `${courseId}.restriction_type` }}
        />
        )}
        {/* TODO this should be refactored when paragon supports safari */}
        {/* text inputs for safari */}
        {isSafari
          ? (
            <div>
              <Field
                name={`${courseId}.go_live_date`}
                type="text"
                component={RenderInputTextField}
                format={date => this.formatDate(date)}
                normalize={date => this.normalizeDate(date)}
                pattern={DATE_INPUT_PATTERN}
                maxLength="10"
                label={(
                  <FieldLabel
                    id={`${courseId}.go_live_date.label`}
                    text="Publish date"
                    helpText={publishDateHelp}
                  />
                )}
                extraInput={{
                  onInvalid: this.openCollapsible,
                }}
                placeholder="yyyy/mm/dd"
                disabled={disabled || courseRun.status === PUBLISHED}
                required={courseRunSubmitting}
              />
              <Field
                name={`${courseId}.start`}
                type="text"
                component={DateTimeField}
                dateLabel="Start date"
                timeLabel={`Start time (${localTimeZone})`}
                helpText={courseDateEditHelp}
                disabled
              />
              <Field
                name={`${courseId}.end`}
                type="text"
                component={DateTimeField}
                dateLabel="End date"
                timeLabel={`End time (${localTimeZone})`}
                helpText={courseDateEditHelp}
                disabled
              />
              <Field
                name={`${courseId}.upgrade_deadline_override`}
                type="date"
                component={DateTimeField}
                dateLabel="Upgrade deadline override date"
                timeLabel={`Upgrade deadline override time (${utcTimeZone})`}
                utcTimeZone
                helpText={courseDateEditHelp}
                disabled={!administrator || disabled}
              />
            </div>
          )
          // date inputs for all browsers besides safari
          : (
            <div>
              <Field
                name={`${courseId}.go_live_date`}
                type="date"
                component={RenderInputTextField}
                format={value => getDateWithDashes(value)}
                normalize={value => moment(value).utc().format(DATE_FORMAT)}
                label={(
                  <FieldLabel
                    id={`${courseId}.go_live_date.label`}
                    text="Publish date"
                    helpText={publishDateHelp}
                  />
                )}
                extraInput={{
                  onInvalid: this.openCollapsible,
                  min: moment(courseRun.go_live_date).isBefore(moment())
                    ? getDateWithDashes(courseRun.go_live_date) : getDateWithDashes(moment()),
                }}
                placeholder="mm/dd/yyyy"
                disabled={disabled || courseRun.status === PUBLISHED}
                required={courseRunSubmitting}
              />
              <Field
                name={`${courseId}.start`}
                type="date"
                component={DateTimeField}
                dateLabel="Start date"
                timeLabel={`Start time (${localTimeZone})`}
                helpText={courseDateEditHelp}
                disabled
              />
              <Field
                name={`${courseId}.end`}
                type="date"
                component={DateTimeField}
                dateLabel="End date"
                timeLabel={`End time (${localTimeZone})`}
                helpText={courseDateEditHelp}
                disabled
              />
              <Field
                name={`${courseId}.upgrade_deadline_override`}
                type="date"
                component={DateTimeField}
                dateLabel="Upgrade deadline override date"
                timeLabel={`Upgrade deadline override time (${utcTimeZone})`}
                utcTimeZone
                helpText={courseDateEditHelp}
                disabled={!administrator || disabled}
              />
            </div>
          )}
        <hr />
        <Field
          name={`${courseId}.run_type`}
          component={RenderSelectField}
          options={runTypeOptions || [{ label: 'Select Course enrollment track first', value: '' }]}
          extraInput={{ onInvalid: this.openCollapsible }}
          label={(
            <FieldLabel
              id={`${courseId}.run_type.label`}
              text="Course run enrollment track"
              helpText={runTypeHelp}
              extraText="Cannot edit after submission"
            />
          )}
          // If any of the seats have a SKU, then ecom products exist and
          // changing shouldn't be allowed
          disabled={disabled || seatHasSku}
          required
        />
        <Field
          name={`${courseId}.pacing_type`}
          type="text"
          component={RenderSelectField}
          options={pacingTypeOptions}
          label={(
            <FieldLabel
              id={`${courseId}.pacing_type.label`}
              text="Course pacing"
              helpText={coursePacingEditHelp}
            />
          )}
          disabled
        />
        <FieldLabel
          id={`${courseId}.staff.label`}
          text="Staff"
          className="mb-2"
          helpText={(
            <div>
              <p>The primary instructor or instructors for the course.</p>
              <p>
                The order that instructors are listed here is the same order they will be
                displayed on course pages. You can drag and drop to reorder instructors.
              </p>
            </div>
          )}
          optional
        />
        <Field
          name={`${courseId}.staff`}
          component={withNavigate(ListField)}
          fetchSuggestions={fetchStaffSuggestions(owners)}
          renderSuggestion={renderStaffSuggestion}
          createNewUrl="/instructors/new"
          referrer={`/courses/${courseUuid}`}
          itemType="staff"
          renderItemComponent={Staffer}
          extraInput={{ onInvalid: this.openCollapsible }}
          disabled={disabled}
          courseRunKey={courseRun.key}
          owners={owners}
          sourceInfo={sourceInfo}
          newItemInfo={stafferInfo}
          newItemText="Add New Instructor"
        />
        <div className="row">
          <div className="col-6">
            <Field
              name={`${courseId}.min_effort`}
              type="number"
              component={RenderInputTextField}
              label={(
                <FieldLabel
                  id={`${courseId}.min_effort.label`}
                  text="Minimum effort"
                  helpText={(
                    <div>
                      <p>
                        The minimum number of hours per week the learner should expect to spend
                        on the course.
                      </p>
                    </div>
                  )}
                />
              )}
              extraInput={{
                onInvalid: this.openCollapsible,
                min: 0,
                max: 168,
              }}
              disabled={disabled}
              required={courseRunSubmitting}
            />
          </div>
          <div className="col-6">
            <Field
              name={`${courseId}.max_effort`}
              type="number"
              component={RenderInputTextField}
              label={(
                <FieldLabel
                  id={`${courseId}.max_effort.label`}
                  text="Maximum effort"
                  helpText={(
                    <div>
                      <p>
                        The maximum number of hours per week the learner should expect to spend
                        on the course.
                      </p>
                    </div>
                  )}
                />
              )}
              extraInput={{
                onInvalid: this.openCollapsible,
                min: 1,
                max: 168,
              }}
              disabled={disabled}
              required={courseRunSubmitting}
            />
          </div>
        </div>
        <Field
          name={`${courseId}.weeks_to_complete`}
          type="number"
          component={RenderInputTextField}
          label={(
            <FieldLabel
              id={`${courseId}.weeks_to_complete.label`}
              text="Length"
              helpText={(
                <div>
                  <p>
                    The estimated number of weeks the learner should expect to spend on the course,
                    rounded to the nearest whole number.
                  </p>
                </div>
              )}
            />
          )}
          extraInput={{ onInvalid: this.openCollapsible }}
          disabled={disabled}
          required={courseRunSubmitting}
        />
        <Field
          name={`${courseId}.content_language`}
          type="text"
          component={RenderSelectField}
          options={languageOptions}
          label={<FieldLabel text="Content language" />}
          extraInput={{ onInvalid: this.openCollapsible }}
          disabled={disabled}
          required={courseRunSubmitting}
        />
        <FieldLabel text="Transcript languages" className="mb-2" />
        <FieldArray
          name={`${courseId}.transcript_languages`}
          component={TranscriptLanguage}
          languageOptions={languageOptions}
          extraInput={{ onInvalid: this.openCollapsible }}
          disabled={disabled}
        />
        <Field
          name={`${courseId}.expected_program_type`}
          type="text"
          component={RenderSelectField}
          options={programOptions}
          label={(
            <FieldLabel
              id={`${courseId}.expected_program_type.label`}
              text="Expected Program Type"
              helpText={(
                <div>
                  <p>
                    If this Course Run will potentially be part of a Program, please set the
                    expected program type here.
                  </p>
                </div>
              )}
              optional
            />
          )}
          extraInput={{ onInvalid: this.openCollapsible }}
          disabled={disabled}
        />
        <Field
          name={`${courseId}.expected_program_name`}
          component={RenderInputTextField}
          type="text"
          label={(
            <FieldLabel
              id={`${courseId}.expected_program_name.label`}
              text="Expected Program Name"
              helpText={(
                <div>
                  <p>
                    If this Course Run will potentially be part of a Program, please set the
                    expected program name here.
                  </p>
                </div>
              )}
              optional
            />
          )}
          extraInput={{ onInvalid: this.openCollapsible }}
          disabled={disabled}
        />
        {hasExternalKey
          && (
          <Field
            name={`${courseId}.external_key`}
            component={RenderInputTextField}
            type="text"
            label={(
              <FieldLabel
                id={`${courseId}.external_key.label`}
                text="Institution Course ID"
                helpText={(
                  <div>
                    <p>
                      Only fill in this field if you are planning to integrate with your
                      Institution’s systems through edX registrar service.
                    </p>
                  </div>
                )}
                optional
              />
            )}
            extraInput={{ onInvalid: this.openCollapsible }}
            disabled={disabled}
          />
          )}
        {(!administrator || !IN_REVIEW_STATUS.includes(courseRun.status))
          && (
          <div>
            <FieldLabel
              id="ofac-notice-label"
              text="Course Embargo (OFAC) Restriction text added to the FAQ section"
              className="mb-2"
              helpText={(
                <div>
                  <p>
                    Course embargo status for OFAC is managed internally, please contact
                    support with questions.
                  </p>
                </div>
              )}
            />
            <div className="mb-3">
              {this.displayOfacRestriction(courseRun.has_ofac_restrictions)}
            </div>
          </div>
          )}
        {administrator && IN_REVIEW_STATUS.includes(courseRun.status)
          && (
          <div>
            Status: {courseRun.status === REVIEW_BY_LEGAL ? 'Legal Review' : 'PC Review'}
            <div>
              <Field
                name={`${courseId}.has_ofac_restrictions`}
                disabled={courseRun.status === REVIEW_BY_INTERNAL}
                type="text"
                component={RenderSelectField}
                options={ofacRestrictionOptions}
                label={(
                  <FieldLabel
                    id={`${courseId}.has_ofac_restrictions.label`}
                    text="OFAC status"
                  />
                )}
                extraInput={{ onInvalid: this.openCollapsible }}
                required={jsonDeepEqual(courseSubmitInfo.targetRun, courseRun)}
              />
              <Field
                name={`${courseId}.ofac_comment`}
                disabled={courseRun.status === REVIEW_BY_INTERNAL}
                component={RichEditor}
                label={(
                  <FieldLabel
                    id={`${courseId}.ofac_comment.label`}
                    text="Countries or additional notes"
                  />
                )}
                extraInput={{ onInvalid: this.openCollapsible }}
                maxChars={500}
              />
            </div>
          </div>
          )}
        <CourseRunButtonToolbar
          // only disable if *this run* is in review
          disabled={courseSubmitting || (courseRunInReview && !administrator)
            || (courseRun.status === REVIEWED && pristine)}
          editable={editable}
          hasNonExemptChanges={initialValues && initialValues.course_runs
            && currentFormValues.course_runs
            && (isNonExemptChanged(initialValues, currentFormValues, courseRun.key)
                || isNonExemptChanged(initialValues, currentFormValues))}
          // Pass the submitting course run up to validate different fields based on status
          onSubmit={() => store.dispatch(courseSubmitRun(courseRun))}
          pristine={pristine}
          submitting={courseSubmitting
            || (courseSubmitInfo && courseSubmitInfo.isSubmittingRunReview)}
          status={courseRun.status}
        />
      </Collapsible>
    );
  }
}

CollapsibleCourseRun.propTypes = {
  courseId: PropTypes.string.isRequired,
  courseInReview: PropTypes.bool,
  courseRun: PropTypes.shape({
    go_live_date: PropTypes.string,
    has_ofac_restrictions: PropTypes.bool,
    key: PropTypes.string,
    run_type: PropTypes.string,
    seats: PropTypes.arrayOf(PropTypes.shape({
      sku: PropTypes.string,
    })),
    status: PropTypes.string,
  }).isRequired,
  courseSubmitting: PropTypes.bool,
  courseSubmitInfo: PropTypes.shape({
    isSubmittingRunReview: PropTypes.bool,
    targetRun: PropTypes.shape(),
  }),
  courseUuid: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  courseRunTypeOptions: PropTypes.shape({}),
  runTypeModes: PropTypes.shape({}),
  editable: PropTypes.bool,
  isSubmittingForReview: PropTypes.bool,
  languageOptions: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string,
    value: PropTypes.string,
  })).isRequired,
  programOptions: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string,
    value: PropTypes.string,
  })).isRequired,
  owners: PropTypes.arrayOf(PropTypes.shape({})),
  pacingTypeOptions: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string,
    value: PropTypes.string,
  })).isRequired,
  sourceInfo: PropTypes.shape({
    referringRun: PropTypes.string,
  }),
  stafferInfo: PropTypes.shape({
    returnToEditCourse: PropTypes.bool,
  }),
  targetRun: PropTypes.shape({
    key: PropTypes.string,
  }),
  isOpen: PropTypes.bool,
  onToggle: PropTypes.func.isRequired,
  ofacRestrictionOptions: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string,
    value: PropTypes.bool,
  })).isRequired,
  currentFormValues: PropTypes.shape({
    course_runs: PropTypes.arrayOf(PropTypes.shape({})),
    type: PropTypes.string,
  }).isRequired,
  initialValues: PropTypes.shape({
    course_runs: PropTypes.arrayOf(PropTypes.shape({})),
  }).isRequired,
  courseInfo: PropTypes.shape({
    data: PropTypes.shape({
      product_source: PropTypes.shape({
        slug: PropTypes.string,
        name: PropTypes.string,
        description: PropTypes.string,
      }),
      course_type: PropTypes.string,
    }),
  }),
};

CollapsibleCourseRun.defaultProps = {
  courseInReview: false,
  courseSubmitting: false,
  courseSubmitInfo: {
    isSubmittingRunReview: false,
  },
  courseRunTypeOptions: {},
  courseInfo: {},
  runTypeModes: {},
  editable: false,
  isSubmittingForReview: false,
  owners: [],
  sourceInfo: {},
  stafferInfo: {},
  targetRun: null,
  isOpen: false,
};

export default CollapsibleCourseRun;
