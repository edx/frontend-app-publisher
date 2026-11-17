import {
  requiredMessage,
  basicValidate,
  getFieldName,
  handleCourseEditFail,
  editCourseValidate,
  emailValidate,
} from './validation';
import {
  PUBLISHED,
  REVIEW_BY_INTERNAL,
  REVIEW_BY_LEGAL,
  REVIEWED,
  UNPUBLISHED,
} from '../data/constants';

describe('basicValidate', () => {
  it('returns a validation message for falsey values', () => {
    const falseyValues = [0, '', undefined, null];

    falseyValues.forEach((value) => {
      expect(basicValidate(value)).toEqual(requiredMessage);
    });
  });

  it('returns undefined for truthy values', () => {
    const truthyValues = [1, 'test', { key: 'key value' }];

    truthyValues.forEach((value) => {
      expect(basicValidate(value)).toEqual(undefined);
    });
  });
});

describe('getFieldName', () => {
  it('returns null if there are no errors', () => {
    expect(getFieldName(undefined)).toEqual(null);
  });

  it('returns the first field name in errors for simple fields', () => {
    const errors = {
      short_description: 'This field is required',
      full_description: 'This field is required',
    };
    expect(getFieldName(errors)).toEqual('short_description');
  });

  it('returns the first full field name in errors for field arrays, ignoring null errors', () => {
    const errors = {
      course_runs: [
        null,
        {
          transcript_languages: {
            _error: 'This field is required',
          },
          staff: 'This field is required',
        },
      ],
      full_description: 'This field is required',
    };
    expect(getFieldName(errors)).toEqual('course_runs[1].transcript_languages');
  });

  it('returns the first full field name in errors for deeply nested fields', () => {
    const errors = {
      course_runs: [
        null,
        {
          deep_property: [
            null,
            null,
            {
              deeper_property: [
                {
                  deepest_property: 'This field is required',
                },
              ],
            },
          ],
          transcript_languages: {
            _error: 'This field is required',
          },
          staff: 'This field is required',
        },
      ],
      full_description: 'This field is required',
    };

    expect(getFieldName(errors)).toEqual('course_runs[1].deep_property[2].deeper_property[0].deepest_property');
  });
});

describe('editCourseValidate', () => {
  const unpublishedTargetRun = {
    status: UNPUBLISHED,
    key: 'TestRun',
  };

  it('does not return errors if there is no target run', () => {
    const targetRun = null;
    expect(editCourseValidate({}, { targetRun })).toEqual({});
  });

  it('does not return errors if the target run is published', () => {
    const targetRun = {
      status: PUBLISHED,
      key: 'TestRun',
    };
    expect(editCourseValidate({}, { targetRun })).toEqual({});
  });

  it('returns errors for missing course level fields', () => {
    const values = {
      short_description: undefined,
      full_description: undefined,
      outcome: 'Outcome',
      course_runs: [],
      imageSrc: 'base64;encodedimage',
    };

    const expectedErrors = {
      short_description: requiredMessage,
      full_description: requiredMessage,
      course_runs: [],
    };
    expect(editCourseValidate(values, { targetRun: unpublishedTargetRun })).toEqual(expectedErrors);
  });

  it('returns error for missing image fields', () => {
    const values = {
      short_description: 'Short',
      full_description: 'Full',
      outcome: 'Outcome',
      imageSrc: null,
      course_runs: [
        {
          key: 'NonSubmittingTestRun',
        },
      ],
    };

    const expectedErrors = {
      imageSrc: requiredMessage,
      course_runs: [null],
    };
    expect(editCourseValidate(values, { targetRun: unpublishedTargetRun })).toEqual(expectedErrors);
  });

  it('does not return errors on course runs that are not the submitting run', () => {
    const values = {
      short_description: 'Short',
      full_description: 'Full',
      outcome: 'Outcome',
      imageSrc: 'base64;encodedimage',
      course_runs: [
        {
          key: 'NonSubmittingTestRun',
        },
      ],
    };
    expect(editCourseValidate(values, { targetRun: unpublishedTargetRun })).toEqual({});
  });

  it('returns errors on submitting course runs with missing transcript languages', () => {
    const values = {
      short_description: 'Short',
      full_description: 'Full',
      outcome: 'Outcome',
      imageSrc: 'base64;encodedimage',
      course_runs: [
        {
          key: 'NonSubmittingTestRun',
        },
        {
          key: 'TestRun',
          go_live_date: '2030-01-01T00:00:00Z',
          transcript_languages: [],
          staff: [
            {
              dummy_field: 'Staff dummy field',
            },
          ],
        },
      ],
    };

    const expectedErrors = {
      course_runs: [
        null,
        {
          transcript_languages: { _error: requiredMessage },
        },
      ],
    };
    expect(editCourseValidate(values, { targetRun: unpublishedTargetRun })).toEqual(expectedErrors);
  });

  it('does not return error when submitting course runs with missing staff', () => {
    const values = {
      short_description: 'Short',
      full_description: 'Full',
      outcome: 'Outcome',
      imageSrc: 'base64;encodedimage',
      course_runs: [
        {
          key: 'NonSubmittingTestRun',
        },
        {
          key: 'TestRun',
          go_live_date: '2030-01-01T00:00:00Z',
          transcript_languages: [
            {
              dummy_field: 'Transcript languages dummy field',
            },
          ],
          staff: [],
        },
      ],
    };

    expect(editCourseValidate(values, { targetRun: unpublishedTargetRun })).toEqual({});
  });

  it.each([
    ['is missing', undefined],
    ['is empty', ''],
    ['is not a valid date', 'Invalid date'],
  ])('returns go_live_date error on submitting course run when publish date %s', (_, goLiveDate) => {
    const values = {
      short_description: 'Short',
      full_description: 'Full',
      outcome: 'Outcome',
      imageSrc: 'base64;encodedimage',
      course_runs: [
        {
          key: 'NonSubmittingTestRun',
        },
        {
          key: 'TestRun',
          go_live_date: goLiveDate,
          transcript_languages: [{ dummy_field: 'Transcript languages dummy field' }],
          staff: [],
        },
      ],
    };

    const expectedErrors = {
      course_runs: [
        null,
        {
          go_live_date: requiredMessage,
        },
      ],
    };
    expect(editCourseValidate(values, { targetRun: unpublishedTargetRun })).toEqual(expectedErrors);
  });

  it.each([
    ['reviewed', REVIEWED],
    ['legal review', REVIEW_BY_LEGAL],
    ['internal review', REVIEW_BY_INTERNAL],
  ])('does not require publish date when updating a run that is %s', (_, status) => {
    const values = {
      short_description: 'Short',
      full_description: 'Full',
      outcome: 'Outcome',
      imageSrc: 'base64;encodedimage',
      course_runs: [
        {
          key: 'TestRun',
          go_live_date: undefined,
          transcript_languages: [{ dummy_field: 'Transcript languages dummy field' }],
          staff: [],
        },
      ],
    };

    expect(editCourseValidate(values, { targetRun: { status, key: 'TestRun' } })).toEqual({});
  });

  it('still requires transcript languages when advancing a run already in review without a publish date', () => {
    const values = {
      short_description: 'Short',
      full_description: 'Full',
      outcome: 'Outcome',
      imageSrc: 'base64;encodedimage',
      course_runs: [
        {
          key: 'TestRun',
          go_live_date: undefined,
          transcript_languages: [],
          staff: [],
        },
      ],
    };

    const expectedErrors = {
      course_runs: [
        { transcript_languages: { _error: requiredMessage } },
      ],
    };
    expect(editCourseValidate(values, { targetRun: { status: REVIEW_BY_LEGAL, key: 'TestRun' } }))
      .toEqual(expectedErrors);
  });

  describe('handleCourseEditFail', () => {
    const publishDateErrors = {
      course_runs: [null, { go_live_date: requiredMessage }],
    };

    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
      document.body.innerHTML = '';
    });

    it('focuses the publish date input when it has no name attribute', () => {
      const input = document.createElement('input');
      input.id = 'course_runs[1].go_live_date-text-label';
      document.body.appendChild(input);

      handleCourseEditFail(publishDateErrors);
      jest.advanceTimersByTime(500);

      expect(document.activeElement).toBe(input);
    });

    it('focuses the field by name when a matching element exists', () => {
      const input = document.createElement('input');
      input.name = 'course_runs[1].go_live_date';
      document.body.appendChild(input);

      handleCourseEditFail(publishDateErrors);
      jest.advanceTimersByTime(500);

      expect(document.activeElement).toBe(input);
    });

    it('does not throw when the errored field is not in the DOM', () => {
      handleCourseEditFail(publishDateErrors);

      expect(() => jest.advanceTimersByTime(500)).not.toThrow();
    });
  });

  test.each([
    [{ geoLocationName: 'location name' }, { geoLocationLat: requiredMessage, geoLocationLng: requiredMessage }],
    [{ geoLocationLat: '45.0' }, { geoLocationName: requiredMessage, geoLocationLng: requiredMessage }],
    [{ geoLocationLng: '55.0' }, { geoLocationLat: requiredMessage, geoLocationName: requiredMessage }],
    [{ geoLocationLng: '55.0', geoLocationLat: '45.0' }, { geoLocationName: requiredMessage }],
  ])('Geolocation validation is raised if not all geolocation fields are provided', (providedGeoLocValue, expectedError) => {
    const values = {
      short_description: 'Short',
      full_description: 'Full',
      outcome: 'Outcome',
      imageSrc: 'base64;encodedimage',
      ...providedGeoLocValue,
      course_runs: [
        {
          key: 'NonSubmittingTestRun',
        },
      ],
    };
    expect(editCourseValidate(values, { targetRun: unpublishedTargetRun })).toEqual(
      { ...expectedError, course_runs: [null] },
    );
  });

  describe('emailValidate function', () => {
    const selectValue = [];
    const options = [{ label: 'john@example.com' }, { label: 'jane@example.com' }];

    it('should return true for a valid email that is not present in selectValue or options', () => {
      const emailValue = 'newuser@example.com';
      const isValid = emailValidate(emailValue, selectValue, options);
      expect(isValid).toBe(true);
    });

    it('should return false for a valid email that is already present in selectValue', () => {
      const emailValue = 'john@example.com';
      const isValid = emailValidate(emailValue, selectValue, options);
      expect(isValid).toBe(false);
    });

    it('should return false for a valid email that is already present in options', () => {
      const emailValue = 'jane@example.com';
      const isValid = emailValidate(emailValue, selectValue, options);
      expect(isValid).toBe(false);
    });

    it('should return false for an invalid email format', () => {
      const emailValue = 'invalidemailformat';
      const isValid = emailValidate(emailValue, selectValue, options);
      expect(isValid).toBe(false);
    });

    it('should return false for a valid email format with invalid characters', () => {
      const emailValue = 'user$example.com';
      const isValid = emailValidate(emailValue, selectValue, options);
      expect(isValid).toBe(false);
    });

    it('should return false for an empty email value', () => {
      const emailValue = '';
      const isValid = emailValidate(emailValue, selectValue, options);
      expect(isValid).toBe(false);
    });
  });
});
