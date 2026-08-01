import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import {
  fireEvent,
  render, screen, waitFor, within,
} from '@testing-library/react';
import { createStore } from 'redux';

import '@testing-library/jest-dom';
import configureStore from 'redux-mock-store';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import EditCoursePage from './index';
import { initialValuesFull as formInitialValues } from './EditCourseForm.test';

import {
  PUBLISHED, REVIEW_BY_INTERNAL, REVIEW_BY_LEGAL, UNPUBLISHED, EXECUTIVE_EDUCATION_SLUG,
} from '../../data/constants';
import { courseOptions, courseRunOptions } from '../../data/constants/testData';
import createRootReducer from '../../data/reducers';
import { jsonDeepCopy } from '../../utils';

// Need to mock the Editor as we don't want to test TinyMCE
jest.mock('@tinymce/tinymce-react');

const mockStore = configureStore();
const store = mockStore({});

describe('EditCoursePage', () => {
  const defaultPrice = '77';
  const defaultEnd = '2019-08-14T00:00:00Z';
  const defaultUpgradeDeadlineOverride = '2019-09-14T00:00:00Z';
  const variantId = '00000000-0000-0000-0000-000000000000';
  const restrictionType = 'custom-b2b-enterprise';
  const watchers = ['test@test.com'];

  const initialValuesFull = {
    ...formInitialValues,
    course_runs: [
      {
        start: '2000-01-01T12:00:00Z', // Different format to be transformed
        end: '2010-01-01T00:00:00Z',
        external_key: null,
        go_live_date: '1999-12-31T00:00:00Z',
        pacing_type: 'self_paced',
        min_effort: 1,
        max_effort: 1,
        content_language: 'English',
        transcript_languages: ['English'],
        weeks_to_complete: 1,
        status: 'published',
        key: 'edX101+DemoX',
        has_ofac_restrictions: false,
        seats: [],
        run_type: '00000000-0000-4000-0000-000000000000',
      },
      {
        start: '2000-01-01T12:00:00Z', // Different format to be transformed
        end: '2010-01-01T00:00:00Z',
        external_key: null,
        go_live_date: '1999-12-31T00:00:00Z',
        pacing_type: 'self_paced',
        min_effort: 1,
        max_effort: 1,
        content_language: 'English',
        transcript_languages: ['English'],
        weeks_to_complete: 1,
        status: 'published',
        key: 'edX101+DemoX',
        has_ofac_restrictions: false,
        seats: [],
        run_type: '00000000-0000-4000-0000-000000000000',
      },
    ],
  };

  const courseInfo = {
    data: {
      editable: true,
      additional_information: '',
      additional_metadata: {
        external_url: 'https://www.external_url.com',
        external_identifier: '2U_external_identifier',
        lead_capture_form_url: 'https://www.lead_capture_url.com',
        organic_url: 'https://www.organic_url.com',
        certificate_info: {
          heading: 'heading',
          blurb: 'blurb',
        },
        facts: [{
          heading: 'facts_1_heading',
          blurb: 'facts_1_blurb',
        },
        {
          heading: 'facts_2_heading',
          blurb: 'facts_2_blurb',
        }],
        start_date: '2019-05-10T00:00:00Z',
        end_date: '2019-05-10T00:00:00Z',
        product_status: 'published',
        external_course_marketing_type: 'short_course',
        product_meta: null,
        registration_deadline: '2019-05-10T00:00:00Z',
        variant_id: '00000000-0000-0000-0000-000000000000',
      },
      course_runs: [
        {
          key: 'edX101+DemoX+T2',
          start: '2019-05-14T00:00:00Z',
          end: defaultEnd,
          upgrade_deadline_override: '2019-05-10T00:00:00Z',
          variant_id: null,
          restriction_type: restrictionType,
          expected_program_type: 'micromasters',
          expected_program_name: 'Test Program Name',
          go_live_date: '2019-05-06T00:00:00Z',
          min_effort: 10,
          max_effort: 123,
          pacing_type: 'instructor_paced',
          content_language: 'ar-ae',
          transcript_languages: ['ar-ae'],
          weeks_to_complete: 100,
          seats: [],
          staff: [],
          status: UNPUBLISHED,
          draft: undefined,
          marketing_url: null,
          has_ofac_restrictions: false,
          ofac_comment: '',
          run_type: '4e260c57-24ef-46c1-9a0d-5ec3a30f6b0c',
          external_key: null,
        },
        {
          key: 'edX101+DemoX+T1',
          start: '2019-05-14T00:00:00Z',
          end: defaultEnd,
          upgrade_deadline_override: '2019-05-10T00:00:00Z',
          variant_id: null,
          restriction_type: null,
          expected_program_type: null,
          expected_program_name: '',
          go_live_date: '2019-05-06T00:00:00Z',
          min_effort: 10,
          max_effort: 123,
          pacing_type: 'instructor_paced',
          content_language: 'ar-ae',
          transcript_languages: ['ar-ae'],
          weeks_to_complete: 100,
          seats: [],
          staff: [],
          status: PUBLISHED,
          draft: undefined,
          marketing_url: null,
          has_ofac_restrictions: false,
          ofac_comment: '',
          run_type: '4e260c57-24ef-46c1-9a0d-5ec3a30f6b0c',
          external_key: null,
        },
      ],
      entitlements: [
        {
          mode: 'verified',
          price: defaultPrice,
          currency: 'USD',
          sku: '000000D',
          expires: null,
        },
      ],
      faq: '',
      full_description: '<p>long desc</p>',
      image: {
        src: 'http://path/to/image/woo.small',
        width: null,
        height: null,
        description: null,
      },
      key: 'edX+Test101x',
      collaborators: [],
      learner_testimonials: null,
      level_type: 'intermediate',
      outcome: '<p>learn</p>',
      prerequisites_raw: '<p>prereq</p>',
      short_description: '<p>short&nbsp;</p>',
      subjects: [
        {
          banner_image_url: null,
          card_image_url: null,
          description: '',
          name: 'Security',
          slug: 'security',
          subtitle: null,
          uuid: '00000000-0000-0000-0000-000000000001',
        }, {
          banner_image_url: null,
          card_image_url: null,
          description: '',
          name: 'Chemistry',
          slug: 'chemistry',
          subtitle: null,
          uuid: '00000000-0000-0000-0000-000000000002',
        },
      ],
      syllabus_raw: '',
      title: 'Test title',
      type: '8a8f30e1-23ce-4ed3-a361-1325c656b67b',
      topics: [],
      uuid: '00000000-0000-0000-0000-000000000000',
      video: {
        src: 'https://www.video.information/watch?v=cVsQLlk-T0s',
        description: null,
        image: null,
      },
      skill_names: [],
      organization_logo_override_url: 'http://image.src.small',
      organization_short_code_override: 'test short code',
      watchers,
      watchers_list: watchers?.length ? watchers.map(w => ({ label: w, value: w })) : null,
      location_restriction: {
        restriction_type: 'allowlist',
        countries: [
          'AF', 'AX',
        ],
        states: ['AL'],
      },
    },
    showCreateStatusAlert: false,
    isFetching: false,
    error: null,
  };

  const courseInfoExecEd = {
    ...courseInfo,
    data: {
      ...courseInfo.data,
      product_source: {
        slug: 'test-source',
        name: 'Test Source',
        description: 'Test Source Description',
      },
      course_type: EXECUTIVE_EDUCATION_SLUG,
    },
  };

  it('renders html correctly', async () => {
    const { container } = render(
      <MemoryRouter>
        <Provider store={store}>
          <IntlProvider locale="en">
            <EditCoursePage
              courseInfo={courseInfoExecEd}
              courseOptions={courseOptions}
              courseRunOptions={courseRunOptions}
            />
          </IntlProvider>
        </Provider>
      </MemoryRouter>,
    );
    await waitFor(() => expect(container).toMatchSnapshot());
  });

  it('renders page correctly while fetching', async () => {
    const { container } = render(
      <IntlProvider locale="en">
        <EditCoursePage
          courseInfo={{
            data: {},
            isFetching: true,
            error: null,
          }}
          courseOptions={{
            data: {},
            isFetching: true,
            error: null,
          }}
          courseRunOptions={{
            data: {},
            isFetching: true,
            error: null,
          }}
        />
      </IntlProvider>,
    );
    await waitFor(() => expect(container).toMatchSnapshot());
  });

  it('renders page correctly with courseInfo', async () => {
    const { container } = render(
      <MemoryRouter>
        <Provider store={store}>
          <IntlProvider locale="en">
            <EditCoursePage
              courseOptions={courseOptions}
              courseRunOptions={courseRunOptions}
              courseInfo={courseInfo}
            />
          </IntlProvider>
        </Provider>
      </MemoryRouter>,
    );
    await waitFor(() => expect(container).toMatchSnapshot());
  });

  it('renders course run restriction_type correctly for executive education course', async () => {
    const realStore = createStore(createRootReducer());

    const EditCoursePageWrapper = (props) => (
      <MemoryRouter>
        <Provider store={realStore}>
          <IntlProvider locale="en">
            <EditCoursePage
              {...props}
              courseInfo={courseInfoExecEd}
              courseOptions={courseOptions}
              courseRunOptions={courseRunOptions}
            />
          </IntlProvider>
        </Provider>
      </MemoryRouter>
    );

    render(<EditCoursePageWrapper />);
    const restrictionFields = screen.getAllByLabelText('Restriction Type');
    expect(restrictionFields[0].value).toBe('custom-b2b-enterprise');
    expect(restrictionFields[1].value).toBe('');
  });

  it('renders page correctly with courseInfo error', async () => {
    const { container } = render(
      <MemoryRouter>
        <Provider store={store}>
          <IntlProvider locale="en">
            <EditCoursePage
              courseInfo={{
                ...courseInfo,
                isFetching: false,
                error: ['Course Info error.'],
              }}
              courseOptions={courseOptions}
              courseRunOptions={courseRunOptions}
            />
          </IntlProvider>
        </Provider>
      </MemoryRouter>,
    );
    await waitFor(() => expect(container).toMatchSnapshot());
  });

  it('renders page correctly with no courseInfo', async () => {
    const { container } = render(
      <MemoryRouter>
        <Provider store={store}>
          <IntlProvider locale="en">
            <EditCoursePage
              courseInfo={null}
              courseOptions={courseOptions}
              courseRunOptions={courseRunOptions}
            />
          </IntlProvider>
        </Provider>
      </MemoryRouter>,
    );
    await waitFor(() => expect(container).toMatchSnapshot());
  });

  it('renders page correctly with courseOptions', async () => {
    const { container } = render(
      <MemoryRouter>
        <Provider store={store}>
          <IntlProvider locale="en">
            <EditCoursePage
              courseInfo={null}
              courseOptions={courseOptions}
              courseRunOptions={courseRunOptions}
            />
          </IntlProvider>
        </Provider>
      </MemoryRouter>,
    );
    await waitFor(() => expect(container).toMatchSnapshot());
  });

  it('renders page correctly with courseOptions error', async () => {
    const { container } = render(
      <MemoryRouter>
        <Provider store={store}>
          <IntlProvider locale="en">
            <EditCoursePage
              courseInfo={courseInfoExecEd}
              courseOptions={courseOptions}
              courseRunOptions={courseRunOptions}
            />
          </IntlProvider>
        </Provider>
      </MemoryRouter>,
    );
    await waitFor(() => expect(container).toMatchSnapshot());
  });

  it('renders page correctly with no courseOptions', async () => {
    const { container } = render(
      <MemoryRouter>
        <Provider store={store}>
          <IntlProvider locale="en">
            <EditCoursePage
              courseOptions={null}
              courseRunOptions={courseRunOptions}
              courseInfo={courseInfoExecEd}
            />
          </IntlProvider>
        </Provider>
      </MemoryRouter>,
    );
    await waitFor(() => expect(container).toMatchSnapshot());
  });

  it('renders page correctly with courseInfo and courseOptions', async () => {
    const { container } = render(
      <MemoryRouter>
        <Provider store={store}>
          <IntlProvider locale="en">
            <EditCoursePage
              courseInfo={courseInfo}
              courseOptions={courseOptions}
              courseRunOptions={courseRunOptions}
            />
          </IntlProvider>
        </Provider>
      </MemoryRouter>,
    );
    await waitFor(() => expect(container).toMatchSnapshot());
  });

  it('renders page correctly with courseRunOptions', async () => {
    const { container } = render(
      <MemoryRouter>
        <Provider store={store}>
          <IntlProvider locale="en">
            <EditCoursePage
              courseInfo={courseInfoExecEd}
              courseRunOptions={courseRunOptions}
              courseOptions={courseOptions}
            />
          </IntlProvider>
        </Provider>
      </MemoryRouter>,
    );
    await waitFor(() => expect(container).toMatchSnapshot());
  });

  it('renders page correctly with no courseRunOptions', async () => {
    const { container } = render(
      <MemoryRouter>
        <Provider store={store}>
          <IntlProvider locale="en">
            <EditCoursePage
              courseOptions={courseOptions}
              courseInfo={courseInfoExecEd}
              courseRunOptions={null}
            />
          </IntlProvider>
        </Provider>
      </MemoryRouter>,
    );
    await waitFor(() => expect(container).toMatchSnapshot());
  });

  it('renders page correctly with courseRunOptions error', async () => {
    const { container } = render(
      <MemoryRouter>
        <Provider store={store}>
          <IntlProvider locale="en">
            <EditCoursePage
              courseRunOptions={{
                ...courseRunOptions,
                isFetching: false,
                error: ['Course Run Options error.'],
              }}
              courseOptions={courseOptions}
              courseInfo={courseInfoExecEd}
            />
          </IntlProvider>
        </Provider>
      </MemoryRouter>,
    );
    await waitFor(() => expect(container).toMatchSnapshot());
  });

  it('renders page correctly with courseInfo, courseOptions, and courseRunOptions', () => {
    const { container } = render(
      <MemoryRouter>
        <Provider store={store}>
          <IntlProvider locale="en">
            <EditCoursePage
              courseInfo={courseInfo}
              courseOptions={courseOptions}
              courseRunOptions={courseRunOptions}
            />
          </IntlProvider>
        </Provider>
      </MemoryRouter>,
    );
    expect(container).toMatchSnapshot();
  });

  it('renders page correctly with courseInfo, courseOptions, and courseRunOptions errors', async () => {
    const { container } = render(
      <MemoryRouter>
        <Provider store={store}>
          <IntlProvider locale="en">
            <EditCoursePage
              courseInfo={{
                ...courseInfo,
                isFetching: false,
                error: ['Course Info error.'],
              }}
              courseOptions={{
                ...courseOptions,
                isFetching: false,
                error: ['Course Options error.'],
              }}
              courseRunOptions={{
                ...courseRunOptions,
                isFetching: false,
                error: ['Course Run Options error.'],
              }}
            />
          </IntlProvider>
        </Provider>
      </MemoryRouter>,
    );
    await waitFor(() => expect(container).toMatchSnapshot());
  });

  describe('EditCoursePage submission handling', () => {
    const publishedCourseRun = {
      key: 'edX101+DemoX+T1',
      start: '2019-05-14T00:00:00Z',
      end: defaultEnd,
      upgrade_deadline_override: defaultUpgradeDeadlineOverride,
      variant_id: variantId,
      restriction_type: restrictionType,
      expected_program_type: null,
      expected_program_name: '',
      go_live_date: '2019-05-06T00:00:00Z',
      min_effort: '10',
      max_effort: '123',
      pacing_type: 'instructor_paced',
      content_language: 'en-us',
      transcript_languages: ['en-us'],
      weeks_to_complete: '100',
      seats: [],
      staff: [],
      status: PUBLISHED,
      draft: undefined,
      marketing_url: null,
      has_ofac_restrictions: false,
      ofac_comment: '',
      run_type: '4e260c57-24ef-46c1-9a0d-5ec3a30f6b0c',
      external_key: null,
    };

    const unpublishedCourseRun = {
      ...publishedCourseRun,
      key: 'edX101+DemoX+T2',
      status: UNPUBLISHED,
      expected_program_type: 'micromasters',
      expected_program_name: 'Test Program Name',
    };

    const courseData = {
      additional_information: '<p>Stuff</p>',
      additional_metadata: {
        external_url: 'https://www.external_url.com',
        external_identifier: '2U_external_identifier',
        lead_capture_form_url: 'https://www.lead_capture_url.com',
        organic_url: 'https://www.organic_url.com',
        certificate_info_heading: 'heading',
        certificate_info_blurb: 'blurb',
        facts_1_heading: 'facts_1_heading',
        facts_1_blurb: 'facts_1_blurb',
        facts_2_heading: 'facts_2_heading',
        facts_2_blurb: 'facts_2_blurb',
        start_date: '2019-05-10T00:00:00Z',
        end_date: '2019-05-10T00:00:00Z',
        product_status: 'published',
        external_course_marketing_type: 'short_course',
        product_meta: null,
        registration_deadline: '2019-05-10T00:00:00Z',
        variant_id: '00000000-0000-0000-0000-000000000000',
      },
      course_runs: [unpublishedCourseRun, publishedCourseRun],
      faq: '<p>Help?</p>',
      full_description: '<p>Long</p>',
      imageSrc: 'http://image.jpg',
      learner_testimonials: '<p>I learned stuff!</p>',
      level_type: 'Basic',
      location_restriction: {
        restriction_type: 'allowlist',
        countries: [
          'AF', 'AX',
        ],
        states: ['AL'],
      },
      organization_logo_override_url: 'http://image.src.small',
      organization_short_code_override: 'test short code',
      watchers,
      watchers_list: watchers?.length ? watchers.map(w => ({ label: w, value: w })) : null,
      outcome: '<p>Stuff</p>',
      prerequisites_raw: '',
      prices: {
        verified: defaultPrice,
      },
      short_description: '<p>Short</p>',
      subjectPrimary: 'basket-weaving',
      subjectSecondary: undefined,
      subjectTertiary: undefined,
      syllabus_raw: null,
      title: 'demo4004',
      topics: [],
      type: '8a8f30e1-23ce-4ed3-a361-1325c656b67b',
      geoLocationName: null,
      geoLocationLat: null,
      geoLocationLng: null,
      url_slug: 'demo4004',
      videoSrc: null,
      editable: true,
    };

    const expectedSendCourse = {
      additional_information: '<p>Stuff</p>',
      draft: true,
      faq: '<p>Help?</p>',
      full_description: '<p>Long</p>',
      image: 'http://image.jpg',
      key: 'edX+Test101x',
      learner_testimonials: '<p>I learned stuff!</p>',
      level_type: 'Basic',
      location_restriction: {
        restriction_type: 'allowlist',
        countries: ['AF', 'AX'],
        states: ['AL'],
      },
      geolocation: {
        lat: null,
        lng: null,
        location_name: null,
      },
      organization_logo_override: 'http://image.src.small',
      organization_short_code_override: 'test short code',
      watchers,
      outcome: '<p>Stuff</p>',
      prerequisites_raw: '',
      prices: {
        verified: defaultPrice,
      },
      short_description: '<p>Short</p>',
      subjects: ['basket-weaving'],
      syllabus_raw: null,
      title: 'demo4004',
      topics: [],
      type: '8a8f30e1-23ce-4ed3-a361-1325c656b67b',
      url_slug: 'demo4004',
      uuid: '00000000-0000-0000-0000-000000000000',
      video: { src: null },
    };

    const expectedSendCourseRuns = [
      {
        content_language: 'en-us',
        draft: true,
        expected_program_type: 'micromasters',
        expected_program_name: 'Test Program Name',
        external_key: '',
        go_live_date: '2019-05-06T00:00:00Z',
        key: 'edX101+DemoX+T2',
        max_effort: '123',
        min_effort: '10',
        prices: {
          verified: defaultPrice,
        },
        rerun: null,
        run_type: '4e260c57-24ef-46c1-9a0d-5ec3a30f6b0c',
        staff: [],
        status: UNPUBLISHED,
        transcript_languages: ['en-us'],
        weeks_to_complete: '100',
        upgrade_deadline_override: defaultUpgradeDeadlineOverride,
        variant_id: variantId,
        restriction_type: restrictionType,
      },
      {
        content_language: 'en-us',
        draft: false,
        expected_program_type: null,
        expected_program_name: '',
        external_key: '',
        go_live_date: '2019-05-06T00:00:00Z',
        key: 'edX101+DemoX+T1',
        max_effort: '123',
        min_effort: '10',
        prices: {
          verified: defaultPrice,
        },
        rerun: null,
        run_type: '4e260c57-24ef-46c1-9a0d-5ec3a30f6b0c',
        staff: [],
        status: PUBLISHED,
        transcript_languages: ['en-us'],
        weeks_to_complete: '100',
        upgrade_deadline_override: defaultUpgradeDeadlineOverride,
        variant_id: variantId,
        restriction_type: restrictionType,
      },
    ];

    const expectedSendCourseExEdCourses = {
      additional_information: '<p>Stuff</p>',
      additional_metadata: {
        external_url: 'https://www.external_url.com',
        external_identifier: '2U_external_identifier',
        lead_capture_form_url: 'https://www.lead_capture_url.com',
        organic_url: 'https://www.organic_url.com',
        display_on_org_page: true,
        certificate_info: {
          heading: 'heading',
          blurb: 'blurb',
        },
        facts: [
          {
            heading: 'facts_1_heading',
            blurb: 'facts_1_blurb',
          },
          {
            heading: 'facts_2_heading',
            blurb: 'facts_2_blurb',
          },
        ],
        start_date: '2019-05-10T00:00:00Z',
        end_date: '2019-05-10T00:00:00Z',
        registration_deadline: '2019-05-10T00:00:00Z',
        product_status: 'published',
        external_course_marketing_type: 'short_course',
        product_meta: null,
        variant_id: '00000000-0000-0000-0000-000000000000',
        course_term_override: null,
      },
      draft: false,
      enterprise_subscription_inclusion: undefined,
      collaborators: undefined,
      faq: '<p>Help?</p>',
      full_description: '<p>Long</p>',
      image: 'http://image.jpg',
      key: 'edX+Test101x',
      learner_testimonials: '<p>I learned stuff!</p>',
      level_type: 'Basic',
      location_restriction: {
        restriction_type: 'allowlist',
        countries: ['AF', 'AX'],
        states: ['AL'],
      },
      organization_logo_override: 'http://image.src.small',
      organization_short_code_override: 'test short code',
      watchers,
      outcome: '<p>Stuff</p>',
      prerequisites_raw: '',
      prices: {
        verified: defaultPrice,
      },
      short_description: '<p>Short</p>',
      subjects: ['basket-weaving'],
      syllabus_raw: null,
      title: 'demo4004',
      topics: [],
      type: '8a8f30e1-23ce-4ed3-a361-1325c656b67b',
      url_slug: 'demo4004',
      uuid: '00000000-0000-0000-0000-000000000000',
      video: { src: null },
      geolocation: {
        lat: null,
        lng: null,
        location_name: null,
      },
    };

    let mockHandleCourseSubmit;

    beforeEach(() => {
      mockHandleCourseSubmit = jest.spyOn(EditCoursePage.prototype, 'handleCourseSubmit');

      courseData.course_runs[0].end = defaultEnd;
      courseData.course_runs[0].status = UNPUBLISHED;
      courseData.course_runs[0].upgrade_deadline_override = defaultUpgradeDeadlineOverride;
      courseData.course_runs[0].variant_id = variantId;
      courseData.prices = {
        verified: defaultPrice,
      };

      expectedSendCourseRuns[0].draft = true;
      expectedSendCourseRuns[0].upgrade_deadline_override = defaultUpgradeDeadlineOverride;
      expectedSendCourseRuns[0].prices = {
        verified: defaultPrice,
      };
      expectedSendCourseRuns[1].draft = false;
      expectedSendCourseRuns[1].prices = {
        verified: defaultPrice,
      };
      expectedSendCourse.draft = false;
      expectedSendCourse.prices = {
        verified: defaultPrice,
      };
    });

    afterEach(() => {
      mockHandleCourseSubmit.mockRestore();
    });

    function renderEditCoursePage(reduxStore, addProps = {}) {
      render(
        <MemoryRouter>
          <Provider store={reduxStore}>
            <IntlProvider locale="en">
              <EditCoursePage
                courseInfo={courseInfo}
                courseOptions={courseOptions}
                courseRunOptions={courseRunOptions}
                currentFormValues={initialValuesFull}
                {...addProps}
              />
            </IntlProvider>
          </Provider>
        </MemoryRouter>,
      );
    }

    it('sets state correctly and does not show modal with no target run', async () => {
      const realStore = createStore(createRootReducer());
      renderEditCoursePage(realStore);

      const levelType = screen.getByRole('combobox', { name: 'Course level' });
      fireEvent.change(levelType, { target: { value: 'beginner' } });
      const saveCourseButton = screen.getByRole('button', { name: 'Save & Re-Publish' });
      fireEvent.click(saveCourseButton);

      expect(mockHandleCourseSubmit).toHaveBeenCalled();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('sets state correctly and does not show modal with PUBLISHED target run', () => {
      const realStore = createStore(createRootReducer());
      renderEditCoursePage(realStore, { courseSubmitInfo: { targetRun: publishedCourseRun } });

      const reviewRunButton = screen.getByRole('button', { name: 'Submit Run for Review' });
      fireEvent.click(reviewRunButton);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(mockHandleCourseSubmit).toHaveBeenCalled();
    });

    it('sets state correctly and shows modal with UNPUBLISHED target run', async () => {
      const realStore = createStore(createRootReducer());
      renderEditCoursePage(realStore, { courseSubmitInfo: { targetRun: unpublishedCourseRun } });

      const reviewRunButton = screen.getByRole('button', { name: 'Submit Run for Review' });
      fireEvent.click(reviewRunButton);
      expect(screen.queryByRole('dialog').textContent).toContain('Submit for Review?');
      expect(mockHandleCourseSubmit).not.toHaveBeenCalled();
    });

    it('sets state correctly when modal shown and continue submit called', () => {
      const realStore = createStore(createRootReducer());
      const mockContinueSubmit = jest.spyOn(EditCoursePage.prototype, 'continueSubmit');
      renderEditCoursePage(realStore, { courseSubmitInfo: { targetRun: unpublishedCourseRun } });

      const reviewRunButton = screen.getByRole('button', { name: 'Submit Run for Review' });
      fireEvent.click(reviewRunButton);
      expect(screen.queryByRole('dialog')).toBeInTheDocument();
      const modalSubmitBtn = screen.getByRole('button', { name: 'Submit' });
      fireEvent.click(modalSubmitBtn);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(mockContinueSubmit).toHaveBeenCalled();
      expect(mockHandleCourseSubmit).toHaveBeenCalled();
      mockContinueSubmit.mockRestore();
    });

    it('upon course submission, StatusAlert is set to appear', () => {
      const realStore = createStore(createRootReducer());
      renderEditCoursePage(
        realStore,
        { courseSubmitInfo: { targetRun: unpublishedCourseRun, showReviewStatusAlert: true } },
      );

      const alert = screen.getByRole('alert');
      const reviewMessage = 'Course has been submitted for review. The course will be locked for the next two business days. You will receive an email when the review is complete.';
      expect(within(alert).getByText(reviewMessage)).toBeInTheDocument();
    });

    it('upon legal review submission, StatusAlert is set to appear', () => {
      const realStore = createStore(createRootReducer());
      renderEditCoursePage(
        realStore,
        {
          courseSubmitInfo: {
            targetRun: { ...unpublishedCourseRun, status: REVIEW_BY_LEGAL }, showReviewStatusAlert: true,
          },
        },
      );

      const alert = screen.getByRole('alert');
      const reviewMessage = 'Legal Review Complete. Course Run is now awaiting PC Review.';
      expect(within(alert).getByText(reviewMessage)).toBeInTheDocument();
    });

    it('upon internal review submission, StatusAlert is set to appear', () => {
      const realStore = createStore(createRootReducer());
      renderEditCoursePage(
        realStore,
        {
          courseSubmitInfo: {
            targetRun: { ...unpublishedCourseRun, status: REVIEW_BY_INTERNAL }, showReviewStatusAlert: true,
          },
        },
      );

      const alert = screen.getByRole('alert');
      const reviewMessage = 'PC Review Complete.';
      expect(within(alert).getByText(reviewMessage)).toBeInTheDocument();
    });

    it('upon course run creation, StatusAlert is set to appear', () => {
      const realStore = createStore(createRootReducer());
      renderEditCoursePage(
        realStore,
        {
          courseInfo: {
            data: { ...courseInfo.data }, showCreateStatusAlert: true,
          },
        },
      );

      const alert = screen.getByRole('alert');
      const createMessage = 'Course run has been created in studio. See link below.';
      expect(within(alert).getByText(createMessage)).toBeInTheDocument();
    });

    it('handleCourseSubmit properly prepares course data for Save Edits case with no changes', async () => {
      const mockEditCourse = jest.fn();
      const ref = React.createRef();
      renderEditCoursePage(store, { editCourse: mockEditCourse, ref });

      ref.current.handleCourseSubmit(courseData);
      expect(mockEditCourse).toHaveBeenCalledWith(
        expectedSendCourse,
        expectedSendCourseRuns,
        false,
        false,
        expect.anything(),
      );
    });

    it('handleCourseSubmit properly prepares course data for Save Edits case with course changes (no archived run)', () => {
      const mockEditCourse = jest.fn();
      const ref = React.createRef();
      renderEditCoursePage(store, { editCourse: mockEditCourse, ref });

      courseData.prices.verified = '500.00';
      courseData.course_runs[0].end = '5000-08-12T12:34:56Z';

      expectedSendCourse.prices.verified = '500';
      expectedSendCourseRuns[0].prices = expectedSendCourse.prices;
      expectedSendCourseRuns[1].prices = expectedSendCourse.prices;

      ref.current.handleCourseSubmit(courseData);
      expect(mockEditCourse).toHaveBeenCalledWith(
        expectedSendCourse,
        expectedSendCourseRuns,
        false,
        false,
        expect.anything(),
      );
    });

    it('handleCourseSubmit properly prepares course data for Save Edits case with course changes (archived run)', () => {
      const mockEditCourse = jest.fn();
      const ref = React.createRef();
      renderEditCoursePage(store, { editCourse: mockEditCourse, ref });

      courseData.prices.verified = '500.00';
      expectedSendCourse.prices.verified = '500';
      expectedSendCourseRuns[0].prices = expectedSendCourse.prices;
      expectedSendCourseRuns[1].prices = expectedSendCourse.prices;

      ref.current.handleCourseSubmit(courseData);
      expect(mockEditCourse).toHaveBeenCalledWith(
        expectedSendCourse,
        expectedSendCourseRuns,
        false,
        false,
        expect.anything(),
      );
    });

    it('handleCourseSubmit properly prepares course data for Save Edits case with course changes (with type)', () => {
      const mockEditCourse = jest.fn();
      const ref = React.createRef();

      const myCourseInfo = jsonDeepCopy(courseInfo);
      myCourseInfo.data.type = '9521aa7d-801b-4a67-92c3-716ea30f5086'; // credit
      myCourseInfo.data.course_runs[0].end = '5000-08-12T12:34:56Z'; // make this active
      myCourseInfo.data.course_runs[0].type = 'f17e29d6-4648-4bb5-a199-97dc40f904aa'; // credit
      myCourseInfo.data.course_runs[1].type = '4e260c57-24ef-46c1-9a0d-5ec3a30f6b0c'; // verified

      renderEditCoursePage(store, { editCourse: mockEditCourse, ref, courseInfo: myCourseInfo });

      const myCourseData = jsonDeepCopy(courseData);
      delete myCourseData.price;
      myCourseData.type = myCourseInfo.data.type;
      myCourseData.prices = {};
      myCourseData.prices.credit = '500';
      myCourseData.prices.verified = '10';

      const myExpectedSendCourse = jsonDeepCopy(expectedSendCourse);
      myExpectedSendCourse.type = myCourseData.type;
      myExpectedSendCourse.prices = {
        credit: '500',
        verified: '10',
      };
      const myExpectedCourseRun0 = jsonDeepCopy(expectedSendCourseRuns[0]);
      myExpectedCourseRun0.prices = myExpectedSendCourse.prices;
      const myExpectedCourseRun1 = jsonDeepCopy(expectedSendCourseRuns[1]);
      myExpectedCourseRun1.prices = myExpectedSendCourse.prices;

      ref.current.handleCourseSubmit(myCourseData);
      expect(mockEditCourse).toHaveBeenCalledWith(
        myExpectedSendCourse,
        [myExpectedCourseRun0, myExpectedCourseRun1],
        false,
        false,
        expect.anything(),
      );
    });

    it('handleCourseSubmit properly prepares course data for Published run Submit case', () => {
      const mockEditCourse = jest.fn();
      const ref = React.createRef();
      renderEditCoursePage(
        store,
        { editCourse: mockEditCourse, ref, courseSubmitInfo: { targetRun: publishedCourseRun } },
      );

      expectedSendCourseRuns[1].draft = false;

      ref.current.handleCourseSubmit(courseData);
      expect(mockEditCourse).toHaveBeenCalledWith(
        expectedSendCourse,
        expectedSendCourseRuns,
        true,
        false,
        expect.anything(),
      );
    });

    it('handleCourseSubmit properly prepares course data for Unpublished run Submit case', () => {
      const mockEditCourse = jest.fn();
      const ref = React.createRef();
      const realStore = createStore(createRootReducer());
      renderEditCoursePage(
        realStore,
        { editCourse: mockEditCourse, ref, courseSubmitInfo: { targetRun: unpublishedCourseRun } },
      );

      expectedSendCourseRuns[0].draft = false;
      ref.current.handleCourseSubmit(courseData);
      expect(mockEditCourse).toHaveBeenCalledWith(
        expectedSendCourse,
        expectedSendCourseRuns,
        true,
        false,
        expect.anything(),
      );
    });

    it('handleCourseSubmit properly prepares course data for Save Edits case with run in review', () => {
      const mockEditCourse = jest.fn();
      const ref = React.createRef();
      const realStore = createStore(createRootReducer());
      renderEditCoursePage(realStore, { editCourse: mockEditCourse, ref });

      // Course changed so it should send saves for all non-archived runs, but this run is
      // in review so it won't be sent.
      courseData.prices.verified = '500.00';
      courseData.course_runs[0].end = '5000-08-12T12:34:56Z';
      courseData.course_runs[0].status = REVIEW_BY_INTERNAL;

      expectedSendCourse.prices.verified = '500';
      expectedSendCourseRuns[1].prices = expectedSendCourse.prices;

      ref.current.handleCourseSubmit(courseData);
      expect(mockEditCourse).toHaveBeenCalledWith(
        expectedSendCourse,
        [expectedSendCourseRuns[1]],
        false,
        false,
        expect.anything(),
      );
    });

    it('submit modal can be cancelled', () => {
      const realStore = createStore(createRootReducer());
      renderEditCoursePage(realStore, { courseSubmitInfo: { targetRun: unpublishedCourseRun } });

      const reviewRunButton = screen.getByRole('button', { name: 'Submit Run for Review' });
      fireEvent.click(reviewRunButton);
      expect(screen.queryByRole('dialog')).toBeInTheDocument();

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      fireEvent.click(cancelButton);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('handleCourseSubmit properly for executive education courses, will add additional metadata fields', () => {
      const mockEditCourse = jest.fn();
      const ref = React.createRef();
      const realStore = createStore(createRootReducer());
      renderEditCoursePage(realStore, { editCourse: mockEditCourse, ref });

      const execEdCourseData = { ...courseData, course_type: EXECUTIVE_EDUCATION_SLUG };
      ref.current.handleCourseSubmit(execEdCourseData);
      expect(mockEditCourse).toHaveBeenCalledWith(
        expectedSendCourseExEdCourses,
        expectedSendCourseRuns,
        false,
        false,
        expect.anything(),
      );
    });

    it('sends in_year_value when at least one value is present', () => {
      const mockEditCourse = jest.fn();
      const ref = React.createRef();
      const realStore = createStore(createRootReducer());

      const inYearValue = {
        per_click_usa: null,
        per_click_international: null,
        per_lead_usa: '100',
        per_lead_international: null,
      };
      const courseInfoInYearValue = { ...courseInfo, in_year_value: inYearValue };

      // Values are converted to integers before sending
      const expectedSendCourseInYearValue = {
        ...expectedSendCourse,
        in_year_value: {
          per_click_usa: 0,
          per_click_international: 0,
          per_lead_usa: 100,
          per_lead_international: 0,
        },
      };

      renderEditCoursePage(realStore, { editCourse: mockEditCourse, ref, courseInfo: courseInfoInYearValue });

      const courseDataInYearValue = { ...courseData, in_year_value: inYearValue };
      ref.current.handleCourseSubmit(courseDataInYearValue);
      expect(mockEditCourse).toHaveBeenCalledWith(
        expectedSendCourseInYearValue,
        expectedSendCourseRuns,
        false,
        false,
        expect.anything(),
      );
    });
  });
});
