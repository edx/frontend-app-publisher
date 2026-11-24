import React from 'react';
import {
  render, waitFor, screen, fireEvent,
} from '@testing-library/react';
import '@testing-library/jest-dom';

import { IntlProvider } from '@edx/frontend-platform/i18n';
import { reduxForm } from 'redux-form';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import {
  AUDIT_TRACK, EXECUTIVE_EDUCATION_SLUG, MASTERS_TRACK, VERIFIED_TRACK,
} from '../../data/constants';
import { courseSubmitRun } from '../../data/actions/courseSubmitInfo';
import CollapsibleCourseRun from './CollapsibleCourseRun';

import store from '../../data/store';

jest.mock('../../utils', () => {
  const actual = jest.requireActual('../../utils');
  const mockState = { isSafari: true };
  return {
    ...actual,
    get isSafari() { return mockState.isSafari; },
    setMockIsSafari: (value) => { mockState.isSafari = value; },
  };
});

const languageOptions = [
  {
    label: 'Arabic - United Arab Emirates',
    value: 'ar-ae',
  },
];

const pacingTypeOptions = [
  {
    label: 'Self-paced',
    value: 'self_paced',
  },
];

const courseRunTypeOptions = {
  '8a8f30e1-23ce-4ed3-a361-1325c656b67b': [
    { label: 'Select enrollment track', value: '' },
    { label: 'Verified and Audit', value: '4e260c57-24ef-46c1-9a0d-5ec3a30f6b0c' },
    { label: 'Audit Only', value: 'cfacfc62-54bd-4e1b-939a-5a94f12fbd8d' },
    { label: 'Masters, Verified, and Audit', value: '00000000-0000-4000-0000-000000000000' },
  ],
};

const programOptions = [
  {
    label: '--',
    value: '',
  },
  {
    label: 'Professional Certificate',
    value: 'professional-certificate',
  },
  {
    label: 'MicroMasters',
    value: 'micromasters',
  },
  {
    label: 'XSeries',
    value: 'xseries',
  },
  {
    label: 'Masters',
    value: 'masters',
  },
];

const ofacRestrictionOptions = [
  {
    label: 'Restricted',
    value: 'true',
  },
  {
    label: 'Unrestricted',
    value: 'false',
  },
];

const publishedCourseRun = {
  start: '2000-01-01T12:00:00Z', // Different format to be transformed
  end: '2010-01-01T00:00:00Z',
  external_key: null,
  go_live_date: '1999-12-31T00:00:00Z',
  pacing_type: 'self_paced',
  min_effort: 1,
  max_effort: 1,
  content_language: languageOptions[0].value,
  transcript_languages: [languageOptions[0].value],
  weeks_to_complete: 1,
  status: 'published',
  key: 'edX101+DemoX',
  has_ofac_restrictions: false,
  seats: [],
  run_type: '00000000-0000-4000-0000-000000000000',
};

const unpublishedCourseRun = { ...publishedCourseRun, status: 'unpublished' };

const currentFormValues = {
  course_runs: [publishedCourseRun, unpublishedCourseRun],
  type: '8a8f30e1-23ce-4ed3-a361-1325c656b67b',
};

const WrappedCollapsibleCourseRun = reduxForm({ form: 'testForm' })(CollapsibleCourseRun);

Date.now = jest.fn(() => new Date(Date.UTC(2001, 0, 1)).valueOf());

describe('Collapsible Course Run', () => {
  it('renders correctly with no fields', async () => {
    const { container } = render(
      <MemoryRouter>
        <Provider store={store}>
          <IntlProvider locale="en">
            <WrappedCollapsibleCourseRun
              languageOptions={[]}
              pacingTypeOptions={[]}
              programOptions={[]}
              ofacRestrictionOptions={[]}
              courseRun={{}}
              courseId="test-course"
              courseUuid="11111111-1111-1111-1111-111111111111"
            />
          </IntlProvider>
        </Provider>
      </MemoryRouter>,
    );
    await waitFor(() => expect(container).toMatchSnapshot());
  });

  it('renders correctly when given a published course run', async () => {
    const { container } = render(
      <MemoryRouter>
        <Provider store={store}>
          <IntlProvider locale="en">
            <WrappedCollapsibleCourseRun
              languageOptions={languageOptions}
              pacingTypeOptions={pacingTypeOptions}
              courseRun={publishedCourseRun}
              programOptions={programOptions}
              ofacRestrictionOptions={ofacRestrictionOptions}
              courseId="test-course"
              courseUuid="11111111-1111-1111-1111-111111111111"
              index={0}
            />
          </IntlProvider>
        </Provider>
      </MemoryRouter>,
    );
    await waitFor(() => expect(container).toMatchSnapshot());
  });

  it('renders correctly when given an unpublished course run', async () => {
    const component = render(
      <MemoryRouter>
        <Provider store={store}>
          <IntlProvider locale="en">
            <WrappedCollapsibleCourseRun
              languageOptions={languageOptions}
              pacingTypeOptions={pacingTypeOptions}
              courseRun={unpublishedCourseRun}
              programOptions={programOptions}
              ofacRestrictionOptions={ofacRestrictionOptions}
              courseId="test-course"
              courseUuid="11111111-1111-1111-1111-111111111111"
              index={1}
            />
          </IntlProvider>
        </Provider>
      </MemoryRouter>,
    );
    await waitFor(() => expect(component).toMatchSnapshot());
  });

  it('renders correctly with a course run type', async () => {
    const { container } = render(
      <MemoryRouter>
        <Provider store={store}>
          <IntlProvider locale="en">
            <WrappedCollapsibleCourseRun
              languageOptions={languageOptions}
              pacingTypeOptions={pacingTypeOptions}
              programOptions={programOptions}
              ofacRestrictionOptions={ofacRestrictionOptions}
              courseRun={unpublishedCourseRun}
              courseId="test-course"
              courseUuid="11111111-1111-1111-1111-111111111111"
              type="8a8f30e1-23ce-4ed3-a361-1325c656b67b"
              currentFormValues={currentFormValues}
              courseRunTypeOptions={courseRunTypeOptions}
              index={1}
            />
          </IntlProvider>
        </Provider>
      </MemoryRouter>,
    );
    await waitFor(() => expect(container).toMatchSnapshot());
  });

  it('renders correctly variant_id field for external course\'s course run', () => {
    const courseInfo = {
      data: {
        product_source: {
          slug: 'test-source',
          name: 'Test Source',
          description: 'Test Source Description',
        },
        course_type: EXECUTIVE_EDUCATION_SLUG,
      },
    };
    const { container } = render(
      <MemoryRouter>
        <Provider store={store}>
          <IntlProvider locale="en">
            <WrappedCollapsibleCourseRun
              languageOptions={languageOptions}
              pacingTypeOptions={pacingTypeOptions}
              programOptions={programOptions}
              ofacRestrictionOptions={ofacRestrictionOptions}
              courseRun={unpublishedCourseRun}
              courseId="test-course"
              courseUuid="11111111-1111-1111-1111-111111111111"
              type="8a8f30e1-23ce-4ed3-a361-1325c656b67b"
              currentFormValues={currentFormValues}
              courseRunTypeOptions={courseRunTypeOptions}
              index={1}
              courseInfo={courseInfo}
            />
          </IntlProvider>
        </Provider>
      </MemoryRouter>,
    );
    const variantIdInput = screen.getByRole('textbox', { name: /variant id/i });
    expect(variantIdInput).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  it.each(['custom-b2c', ''])('renders correctly restriction type field for external course\'s course run (type: %s)', (restrictionType) => {
    const courseInfo = {
      data: {
        product_source: {
          slug: 'test-source',
          name: 'Test Source',
          description: 'Test Source Description',
        },
        course_type: EXECUTIVE_EDUCATION_SLUG,
      },
    };
    const courseRun = { ...unpublishedCourseRun, restriction_type: restrictionType };
    const { container } = render(
      <MemoryRouter>
        <Provider store={store}>
          <IntlProvider locale="en">
            <WrappedCollapsibleCourseRun
              languageOptions={languageOptions}
              pacingTypeOptions={pacingTypeOptions}
              programOptions={programOptions}
              ofacRestrictionOptions={ofacRestrictionOptions}
              courseRun={courseRun}
              courseId="test-course"
              courseUuid="11111111-1111-1111-1111-111111111111"
              type="8a8f30e1-23ce-4ed3-a361-1325c656b67b"
              currentFormValues={currentFormValues}
              courseRunTypeOptions={courseRunTypeOptions}
              index={1}
              courseInfo={courseInfo}
            />
          </IntlProvider>
        </Provider>
      </MemoryRouter>,
    );
    const restrictionField = screen.getByRole('combobox', { name: /restriction type/i });
    expect(restrictionField).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  it('renders correctly with external key field enabled', () => {
    const runTypeModes = {
      '00000000-0000-4000-0000-000000000000': [
        AUDIT_TRACK.key, MASTERS_TRACK.key, VERIFIED_TRACK.key,
      ],
    };

    const { container } = render(
      <MemoryRouter>
        <Provider store={store}>
          <IntlProvider locale="en">
            <WrappedCollapsibleCourseRun
              languageOptions={languageOptions}
              pacingTypeOptions={pacingTypeOptions}
              programOptions={programOptions}
              ofacRestrictionOptions={ofacRestrictionOptions}
              courseRun={unpublishedCourseRun}
              courseId="test-course"
              courseUuid="11111111-1111-1111-1111-111111111111"
              type="8a8f30e1-23ce-4ed3-a361-1325c656b67b"
              currentFormValues={currentFormValues}
              courseRunTypeOptions={courseRunTypeOptions}
              runTypeModes={runTypeModes}
              index={1}
            />,
          </IntlProvider>
        </Provider>
      </MemoryRouter>,
    );

    expect(container).toMatchSnapshot();
  });

  it('renders correctly when submitting for review', async () => {
    const { container } = render(
      <MemoryRouter>
        <Provider store={store}>
          <IntlProvider locale="en">
            <WrappedCollapsibleCourseRun
              languageOptions={languageOptions}
              pacingTypeOptions={pacingTypeOptions}
              programOptions={programOptions}
              ofacRestrictionOptions={ofacRestrictionOptions}
              courseRun={unpublishedCourseRun}
              courseId="test-course"
              courseUuid="11111111-1111-1111-1111-111111111111"
              isSubmittingForReview
              index={1}
            />
          </IntlProvider>
        </Provider>
      </MemoryRouter>,
    );
    await waitFor(() => expect(container).toMatchSnapshot());
  });

  it('renders correctly when submitting for review and given a matching target run', async () => {
    const { container } = render(
      <MemoryRouter>
        <Provider store={store}>
          <IntlProvider locale="en">
            <WrappedCollapsibleCourseRun
              languageOptions={languageOptions}
              pacingTypeOptions={pacingTypeOptions}
              programOptions={programOptions}
              ofacRestrictionOptions={ofacRestrictionOptions}
              courseRun={publishedCourseRun}
              courseId="test-course"
              courseUuid="11111111-1111-1111-1111-111111111111"
              isSubmittingForReview
              index={0}
            />
          </IntlProvider>
        </Provider>
      </MemoryRouter>,
    );
    await waitFor(() => expect(container).toMatchSnapshot());
  });

  it('renders fields as disabled when course is in review', () => {
    const { container } = render(
      <MemoryRouter>
        <Provider store={store}>
          <IntlProvider locale="en">
            <WrappedCollapsibleCourseRun
              languageOptions={[]}
              pacingTypeOptions={[]}
              programOptions={[]}
              ofacRestrictionOptions={[]}
              courseRun={{}}
              courseInReview
              courseId="test-course"
              courseUuid="11111111-1111-1111-1111-111111111111"
            />
          </IntlProvider>
        </Provider>
      </MemoryRouter>,
    );

    const inputs = container.querySelectorAll('input');
    inputs.forEach((input) => {
      expect(input).toBeDisabled();
    });
  });

  it.each([true, false])('renders with run type disabled if SKU exists', (skuExists) => {
    const seat = {
      type: 'verified',
      price: '149.00',
      sku: skuExists ? 'ABCDEF' : '',
    };
    const updatedCourseRun = { ...publishedCourseRun, seats: [seat] };

    render(
      <MemoryRouter>
        <Provider store={store}>
          <IntlProvider locale="en">
            <WrappedCollapsibleCourseRun
              languageOptions={[]}
              pacingTypeOptions={[]}
              programOptions={[]}
              ofacRestrictionOptions={[]}
              courseRun={updatedCourseRun}
              courseId="test-course"
              courseUuid="11111111-1111-1111-1111-111111111111"
              type="8a8f30e1-23ce-4ed3-a361-1325c656b67b"
              currentFormValues={currentFormValues}
              courseRunTypeOptions={courseRunTypeOptions}
              index={0}
              editable
            />
          </IntlProvider>
        </Provider>
      </MemoryRouter>,
    );

    const runTypeSelect = screen.getByRole('combobox', { name: /Course run enrollment track Cannot edit after submission/i });
    if (skuExists) {
      expect(runTypeSelect).toBeDisabled();
    } else {
      expect(runTypeSelect).not.toBeDisabled();
    }
  });

  it('handles submission when called from a course run', () => {
    const mockDispatch = jest.spyOn(store, 'dispatch');

    render(
      <MemoryRouter>
        <Provider store={store}>
          <IntlProvider locale="en">
            <WrappedCollapsibleCourseRun
              languageOptions={languageOptions}
              pacingTypeOptions={pacingTypeOptions}
              programOptions={programOptions}
              ofacRestrictionOptions={ofacRestrictionOptions}
              courseRun={unpublishedCourseRun}
              courseRunTypeOptions={courseRunTypeOptions}
              courseId="test-course"
              courseUuid="11111111-1111-1111-1111-111111111111"
              currentFormValues={{}}
              initialValues={{}}
              editable
              index={1}
            />
          </IntlProvider>
        </Provider>
      </MemoryRouter>,
    );

    const submitButton = screen.getByRole('button', { name: /Submit Run for Review/i });
    fireEvent.click(submitButton);

    expect(mockDispatch).toHaveBeenCalledWith(courseSubmitRun(unpublishedCourseRun));
    mockDispatch.mockClear();
  });

  it('renders credit fields (provider, hours, deadline) for a course run', () => {
    const creditCourseRun = {
      ...unpublishedCourseRun,
      credit_provider: 'TestProvider',
      credit_hours: 3,
      upgrade_deadline: '2030-01-01',
      // keep seats array minimal to avoid SKU logic interfering
      seats: [{ type: 'credit', price: '0.00', sku: '' }],
    };

    const { container } = render(
      <MemoryRouter>
        <Provider store={store}>
          <IntlProvider locale="en">
            <WrappedCollapsibleCourseRun
              languageOptions={languageOptions}
              pacingTypeOptions={pacingTypeOptions}
              programOptions={programOptions}
              ofacRestrictionOptions={ofacRestrictionOptions}
              courseRun={creditCourseRun}
              courseId="course_runs[2]" // we set courseId as the name root used in fields in the component
              courseUuid="11111111-1111-1111-1111-111111111111"
              index={2}
              editable
              currentFormValues={{ course_runs: [publishedCourseRun, unpublishedCourseRun, creditCourseRun] }}
              initialValues={{ course_runs: [publishedCourseRun, unpublishedCourseRun, creditCourseRun] }}
            />
          </IntlProvider>
        </Provider>
      </MemoryRouter>,
    );

    const providerInput = screen.getAllByLabelText(/Credit Provider/i)[1];
    const hoursInput = screen.getAllByLabelText(/Credit Hours/i)[1];

    const deadlineInput = screen.queryByPlaceholderText(/Upgrade Deadline/i)
      || screen.queryByDisplayValue('2030-01-01')
      || container.querySelector('input[name*="upgrade_deadline"]');

    expect(providerInput).toHaveValue('TestProvider');
    expect(Number(hoursInput.value)).toBe(3);
    expect(deadlineInput).toHaveValue('2030-01-01');

    expect(container).toMatchSnapshot();
  });

  it('updates credit fields when user edits them', () => {
    const creditCourseRun = {
      ...unpublishedCourseRun,
      credit_provider: '',
      credit_hours: '',
      upgrade_deadline: '',
      seats: [{ type: 'credit', price: '0.00', sku: '' }],
    };

    const { container } = render(
      <MemoryRouter>
        <Provider store={store}>
          <IntlProvider locale="en">
            <WrappedCollapsibleCourseRun
              languageOptions={languageOptions}
              pacingTypeOptions={pacingTypeOptions}
              programOptions={programOptions}
              ofacRestrictionOptions={ofacRestrictionOptions}
              courseRun={creditCourseRun}
              courseId="course_runs[2]"
              courseUuid="11111111-1111-1111-1111-111111111111"
              index={2}
              editable
              initialValues={{ course_runs: [publishedCourseRun, unpublishedCourseRun, creditCourseRun] }}
              currentFormValues={{ course_runs: [publishedCourseRun, unpublishedCourseRun, creditCourseRun] }}
            />
          </IntlProvider>
        </Provider>
      </MemoryRouter>,
    );

    const providerInput = screen.getAllByLabelText(/Credit Provider/i)[1];
    const hoursInput = screen.getAllByLabelText(/Credit Hours/i)[1];

    const deadlineInput = screen.queryByPlaceholderText(/Upgrade Deadline/i)
      || container.querySelector('input[name*="upgrade_deadline"]');

    fireEvent.change(providerInput, { target: { value: 'MIT' } });
    fireEvent.change(hoursInput, { target: { value: '5' } });
    fireEvent.change(deadlineInput, { target: { value: '2035-12-01' } });

    expect(providerInput).toHaveValue('MIT');
    expect(Number(hoursInput.value)).toBe(5);
    expect(deadlineInput).toHaveValue('2035-12-01');
  });

  describe('publish date input for non-Safari browsers', () => {
    const { setMockIsSafari } = jest.requireMock('../../utils');

    beforeEach(() => {
      setMockIsSafari(false);
    });

    afterEach(() => {
      setMockIsSafari(true);
    });

    const renderPublishDateInput = () => {
      const { container } = render(
        <MemoryRouter>
          <Provider store={store}>
            <IntlProvider locale="en">
              <WrappedCollapsibleCourseRun
                languageOptions={languageOptions}
                pacingTypeOptions={pacingTypeOptions}
                programOptions={programOptions}
                ofacRestrictionOptions={ofacRestrictionOptions}
                courseRun={unpublishedCourseRun}
                courseId="course_runs[1]"
                courseUuid="11111111-1111-1111-1111-111111111111"
                index={1}
                editable
                initialValues={{ course_runs: [publishedCourseRun, unpublishedCourseRun] }}
                currentFormValues={{ course_runs: [publishedCourseRun, unpublishedCourseRun] }}
              />
            </IntlProvider>
          </Provider>
        </MemoryRouter>,
      );

      const publishDateInput = container.querySelector('input[id^="course_runs[1].go_live_date"]');
      expect(publishDateInput).toHaveAttribute('type', 'date');
      return publishDateInput;
    };

    it('stores a picked publish date as a UTC-formatted value', () => {
      const publishDateInput = renderPublishDateInput();

      fireEvent.change(publishDateInput, { target: { value: '2035-12-01' } });
      expect(store.getState().form.testForm.values.course_runs[1].go_live_date).toBe('2035-12-01T00:00:00Z');
    });

    it('stores an empty publish date when the user clears the input', () => {
      const publishDateInput = renderPublishDateInput();

      fireEvent.change(publishDateInput, { target: { value: '2035-12-01' } });
      fireEvent.change(publishDateInput, { target: { value: '' } });
      expect(store.getState().form.testForm.values.course_runs[1].go_live_date).toBe('');
    });
  });
});
