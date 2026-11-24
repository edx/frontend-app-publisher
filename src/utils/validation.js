import store from '../data/store';
import { isValidDate, jsonDeepCopy } from '.';
import { courseSubmittingFailure } from '../data/actions/courseSubmitInfo';
import { PUBLISHED, UNPUBLISHED } from '../data/constants';

const requiredMessage = 'This field is required';

// Basic validation that ensures some value was entered
const basicValidate = value => (value ? undefined : requiredMessage);

function courseTagValidate(tagValue, selectValue, options) {
  // tagValue should only contain alphabets, numbers, hyphen and underscore
  if (!/^[a-zA-Z0-9_-]+$/.test(tagValue)) { return false; }
  // disallow tags that have already been selected or are present in options(dropdown)
  return ![...selectValue, ...options].some(x => x.label.toLowerCase() === tagValue.toLowerCase());
}

function emailValidate(emailValue, selectValue, options) {
  // emailValue should only contain alphabets, numbers, hyphen, underscore, dot and @
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(emailValue)) { return false; }
  // disallow emails that have already been selected or are present in options(dropdown)
  return ![...selectValue, ...options].some(x => x.label.toLowerCase() === emailValue.toLowerCase());
}

/**
 * Iterates through errors on a form and returns the first field name with an error.
 *
 * @param {?object} errors - Object with keys giving the field names with errors in a form like:
 *   {
 *     short_description: "Required",
 *     outcome: "Required",
 *     course_runs: [
 *       null,
 *       {
 *         transcript_languages: {
 *           _error: "Required",
 *         },
 *         staff: "Required"
 *       }
 *     ]
 *   };
 *   The param will be null if there are no errors.
 *
 * @returns {string} - The first field name with a validation error
 */
const getFieldName = (errors) => {
  if (!errors) {
    return null;
  }

  // Get the first field name and associated info
  let [fieldName, otherInfo] = Object.entries(errors)[0];

  // Parse field arrays for nested field errors
  while (Array.isArray(otherInfo)) {
    // Deep copy otherInfo to avoid modifying it in the loop
    const otherInfoCopy = jsonDeepCopy(otherInfo);
    for (let i = 0; i < otherInfoCopy.length; i += 1) {
      const nestedErrors = otherInfoCopy[i];

      if (nestedErrors) {
        // Get the first nested field name and associated info
        const [nestedFieldName, nestedInfo] = Object.entries(nestedErrors)[0];

        // Reset otherInfo to the new nestedInfo to keep parsing further down
        otherInfo = nestedInfo;
        // Fields within field arrays have names like: course_runs[1].staff
        fieldName = `${fieldName}[${i}].${nestedFieldName}`;
      }
    }
  }

  return fieldName;
};

const stafferOrCreateFormErrorField = (errors) => {
  let fieldName = Object.entries(errors)[0][0];
  const otherInfo = Object.entries(errors)[0][1];

  if (otherInfo.constructor === Object) {
    fieldName = `${fieldName}.${stafferOrCreateFormErrorField(otherInfo)}`;
  }

  return fieldName;
};

const handleStafferOrCreateFormFail = (errors, _, submitError) => {
  if (!errors) {
    throw submitError;
  }

  const fieldName = stafferOrCreateFormErrorField(errors);
  if (fieldName) {
    setTimeout(() => {
      document.getElementsByName(fieldName)[0].scrollIntoView();
    }, 500);
  }
};

// Focus on the first element that has validation errors
const handleCourseEditFail = (errors) => {
  const fieldName = getFieldName(errors);
  if (fieldName) {
    // We use setTimeout here to avoid a race condition between React and HTML. See DISCO-992.
    // 250ms worked in my personal testing. So I doubled it to give some more elbow room on less
    // performant machines.
    setTimeout(() => {
      // Some inputs (e.g. RenderInputTextField) render without a name attribute, so fall back to the id.
      const field = document.getElementsByName(fieldName)[0]
        || document.getElementById(`${fieldName}-text-label`);
      if (field) {
        field.focus();
      }
    }, 500);
  }
};

const editCourseValidate = (values, props) => {
  const { targetRun } = props;

  if (!targetRun || targetRun.status === PUBLISHED) {
    return {};
  }
  let hasError = false;
  let geoLocationDataCount = 0;
  const errors = {};

  // Validate all the fields required for submission at the top level of the form
  const courseRequiredFields = ['short_description', 'full_description', 'outcome', 'imageSrc'];
  courseRequiredFields.forEach((fieldName) => {
    const value = values[fieldName];
    if (!value) {
      hasError = true;
      errors[fieldName] = requiredMessage;
    }
  });

  // Validate that either all or none of the geolocation fields are provided.
  // The double parsing is done to first get count of how many geoLocaton fields
  // actually have values in them.
  const geoLocationFields = ['geoLocationName', 'geoLocationLng', 'geoLocationLat'];
  geoLocationFields.forEach((fieldName) => {
    if (!values[fieldName]) {
      geoLocationDataCount += 1;
    }
  });

  if (geoLocationDataCount > 0 && geoLocationDataCount < 3) {
    geoLocationFields.forEach((fieldName) => {
      const value = values[fieldName];
      if (!value) {
        hasError = true;
        errors[fieldName] = requiredMessage;
      }
    });
  }

  // Validate all the fields required for submission in the submitting course run
  errors.course_runs = [];
  values.course_runs.forEach((run) => {
    const { key: targetKey } = targetRun;
    const isSubmittingRun = run.key === targetKey;
    if (isSubmittingRun) {
      const runRequiredFields = ['transcript_languages'];
      const runErrors = {};
      runRequiredFields.forEach((fieldName) => {
        const value = run[fieldName];
        if (value.length < 1) {
          if (fieldName === 'transcript_languages') {
            // redux-form field arrays expect errors to be in this shape
            runErrors[fieldName] = { _error: requiredMessage };
          } else {
            runErrors[fieldName] = requiredMessage;
          }
        }
      });
      // Only an unpublished run is being submitted for review; reviewed and in-review runs may predate this rule.
      const isInitialSubmission = targetRun.status === UNPUBLISHED;
      // isValidDate(undefined) is true (moment() defaults to now), so the presence check is needed too.
      if (isInitialSubmission && (!run.go_live_date || !isValidDate(run.go_live_date))) {
        runErrors.go_live_date = requiredMessage;
      }
      if (Object.keys(runErrors).length > 0) {
        hasError = true;
      }
      errors.course_runs.push(runErrors);
    } else {
      errors.course_runs.push(null);
    }
  });

  // If needed, reset our state variable isSubmittingRunReview, which indicates that we are
  // validating for a submit-for-review (when we check required-for-submit properties).
  if (hasError && store.getState().courseSubmitInfo.isSubmittingRunReview) {
    store.dispatch(courseSubmittingFailure(errors));
  }

  return hasError ? errors : {};
};

export {
  requiredMessage,
  basicValidate,
  getFieldName,
  handleCourseEditFail,
  handleStafferOrCreateFormFail,
  editCourseValidate,
  courseTagValidate,
  emailValidate,
};
