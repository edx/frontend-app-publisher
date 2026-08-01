import moment from 'moment';
import React from 'react';
import { Field, reduxForm } from 'redux-form';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { compose } from 'redux';

import ButtonToolbar from '../ButtonToolbar';
import FieldLabel from '../FieldLabel';
import ActionButton from '../ActionButton';

import {
  endDateHelp, runTypeHelp, startDateHelp, pacingHelp, keyHelp,
} from '../../helpText';
import RenderInputTextField from '../RenderInputTextField';
import RenderSelectField from '../RenderSelectField';
import DateTimeField from '../DateTimeField';
import {
  getDateWithDashes, getOptionsData, isSafari, localTimeZone, parseOptions,
} from '../../utils';
import { DATE_INPUT_PATTERN } from '../../data/constants';

const BaseCreateCourseRunForm = ({
  handleSubmit,
  pristine,
  isCreating,
  title,
  uuid,
  courseRunOptions,
  courseRunTypeOptions,
  currentFormValues,
  courseRunLabels,
  canSetRunKey,
}) => {
  const courseRunOptionsData = getOptionsData(courseRunOptions);
  const { pacing_type: { choices } } = courseRunOptionsData;
  const pacingTypeOptions = courseRunOptionsData && parseOptions(choices);
  return (
    <div className="create-course-run-form">
      <h2>Create a new course run</h2>
      <hr />
      <FieldLabel text="Course" className="mb-2" />
      <div className="mb-3">
        <Link to={`/courses/${uuid}`}>
          {title}
        </Link>
      </div>
      <form onSubmit={handleSubmit}>
        <Field
          name="rerun"
          type="text"
          component={RenderSelectField}
          options={courseRunLabels}
          label={(
            <FieldLabel
              id="rerun.label"
              text="Select a run to copy"
              helpText={(
                <div>
                  <p>
                    Select a run to copy as the starting point for your new studio instance.
                    The newest run is listed first.
                  </p>
                </div>
              )}
            />
          )}
        />
        {canSetRunKey
        && (
        <Field
          name="courseRunKey"
          component={RenderInputTextField}
          type="text"
          pattern="[a-zA-Z0-9-]+"
          label={(
            <FieldLabel
              id="courseRunKey-label"
              text="Run Key"
              helpText={keyHelp}
              optional
            />
          )}
        />
        )}
        {/* TODO this should be refactored when paragon supports safari */}
        {/* text inputs for safari */}
        {isSafari
          ? (
            <div>
              <Field
                name="start"
                type="text"
                component={DateTimeField}
                dateLabel="Start date"
                timeLabel={`Start time (${localTimeZone})`}
                helpText={startDateHelp}
                required
                maxLength="10"
                pattern={DATE_INPUT_PATTERN}
                placeholder="yyyy/mm/dd"
              />
              <Field
                name="end"
                type="text"
                component={DateTimeField}
                dateLabel="End date"
                timeLabel={`End time (${localTimeZone})`}
                helpText={endDateHelp}
                required
                maxLength="10"
                pattern={DATE_INPUT_PATTERN}
                placeholder="yyyy/mm/dd"
              />
            </div>
          )
          // date inputs for all browsers besides safari
          : (
            <div>
              <Field
                name="start"
                type="date"
                component={DateTimeField}
                dateLabel="Start date"
                timeLabel={`Start time (${localTimeZone})`}
                helpText={startDateHelp}
                required
                minDate={getDateWithDashes(moment())}
              />
              <Field
                name="end"
                type="date"
                component={DateTimeField}
                dateLabel="End date"
                timeLabel={`End time (${localTimeZone})`}
                helpText={endDateHelp}
                required
                minDate={getDateWithDashes(moment(currentFormValues.start).add(1, 'd') || moment())}
              />
            </div>
          )}
        <Field
          name="run_type"
          component={RenderSelectField}
          options={courseRunTypeOptions}
          label={(
            <FieldLabel
              id="run_type.label"
              text="Course run enrollment track"
              required
              helpText={runTypeHelp}
            />
          )}
          required
        />
        <Field
          name="pacing_type"
          type="text"
          component={RenderSelectField}
          options={pacingTypeOptions}
          label={(
            <FieldLabel
              id="pacing_type.label"
              text="Course pacing"
              helpText={pacingHelp}
            />
          )}
          props={{
            name: 'pacing_type',
          }}
        />
        <ButtonToolbar>
          <Link to={`/courses/${uuid}`}>
            <button
              type="button"
              className="btn btn-outline-primary"
              disabled={isCreating}
            >
              Cancel
            </button>
          </Link>
          <ActionButton
            disabled={pristine}
            labels={{
              default: 'Create',
              pending: 'Creating',
            }}
            state={isCreating ? 'pending' : 'default'}
          />
        </ButtonToolbar>
      </form>
    </div>
  );
};

BaseCreateCourseRunForm.defaultProps = {
  currentFormValues: {},
  courseRunLabels: [],
  courseRunOptions: {},
  courseRunTypeOptions: [],
};

BaseCreateCourseRunForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  uuid: PropTypes.string.isRequired,
  pristine: PropTypes.bool.isRequired,
  isCreating: PropTypes.bool.isRequired,
  currentFormValues: PropTypes.shape({
    start: PropTypes.string,
  }),
  courseRunLabels: PropTypes.arrayOf(PropTypes.shape({})),
  courseRunOptions: PropTypes.shape({
    data: PropTypes.shape(),
    error: PropTypes.arrayOf(PropTypes.string),
    isFetching: PropTypes.bool,
  }),
  courseRunTypeOptions: PropTypes.arrayOf(PropTypes.shape({})),
  canSetRunKey: PropTypes.bool.isRequired,
};

const CreateCourseRunForm = compose(
  connect((state, props) => ({
    // Give form a unique id so that values from one form don't overwrite others
    form: props.id,
  })),
  reduxForm({
    destroyOnUnmount: false,
    enableReinitialize: true,
  }),
)(BaseCreateCourseRunForm);
export { BaseCreateCourseRunForm, CreateCourseRunForm };
