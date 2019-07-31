import React from 'react';
import { shallow } from 'enzyme';
import { Field } from 'redux-form';

import { BaseEditCourseForm } from './EditCourseForm';
import { IN_LEGAL_REVIEW, REVIEWED, UNPUBLISHED } from '../../data/constants';


describe('BaseEditCourseForm', () => {
  const courseOptions = {
    data: {
      actions: {
        POST: {
          level_type: {
            choices: [
              { display_name: 'Beginner', value: 'beginner' },
              { display_name: 'Intermediate', value: 'intermediate' },
              { display_name: 'Advanced', value: 'advanced' },
            ],
          },
          subjects: {
            child: {
              choices: [
                { display_name: 'Business', value: 'business' },
                { display_name: 'Chemistry', value: 'chemistry' },
                { display_name: 'English', value: 'english' },
                { display_name: 'Security', value: 'security' },
              ],
            },
          },
        },
      },
    },
  };
  const courseRunOptions = {
    data: {
      actions: {
        POST: {
          pacing_type: {
            type: 'choice',
            required: false,
            read_only: false,
            label: 'Pacing type',
            choices: [{
              display_name: 'Instructor-paced',
              value: 'instructor_paced',
            }, {
              display_name: 'Self-paced',
              value: 'self_paced',
            }],
          },
          content_language: {
            type: 'field',
            required: false,
            read_only: false,
            label: 'Content language',
            help_text: 'Language in which the course is administered',
            choices: [{
              display_name: 'Afrikaans',
              value: 'af',
            }, {
              display_name: 'Arabic - United Arab Emirates',
              value: 'ar-ae',
            }, {
              display_name: 'Arabic - Bahrain',
              value: 'ar-bh',
            }, {
              display_name: 'Arabic - Algeria',
              value: 'ar-dz',
            }, {
              display_name: 'Arabic - Egypt',
              value: 'ar-eg',
            }, {
              display_name: 'Arabic - Iraq',
              value: 'ar-iq',
            }, {
              display_name: 'Arabic - Jordan',
              value: 'ar-jo',
            }, {
              display_name: 'Arabic - Kuwait',
              value: 'ar-kw',
            }, {
              display_name: 'Arabic - Lebanon',
              value: 'ar-lb',
            }, {
              display_name: 'Arabic - Libya',
              value: 'ar-ly',
            }, {
              display_name: 'Arabic - Morocco',
              value: 'ar-ma',
            }, {
              display_name: 'Arabic - Oman',
              value: 'ar-om',
            }, {
              display_name: 'Arabic - Qatar',
              value: 'ar-qa',
            }, {
              display_name: 'Arabic - Saudi Arabia',
              value: 'ar-sa',
            }, {
              display_name: 'Arabic - Syria',
              value: 'ar-sy',
            }, {
              display_name: 'Arabic - Tunisia',
              value: 'ar-tn',
            }, {
              display_name: 'Arabic - Yemen',
              value: 'ar-ye',
            }, {
              display_name: 'Azeri - Latin',
              value: 'az-az',
            }, {
              display_name: 'Belarusian',
              value: 'be',
            }, {
              display_name: 'Bulgarian',
              value: 'bg',
            }, {
              display_name: 'Catalan',
              value: 'ca',
            }, {
              display_name: 'Czech',
              value: 'cs',
            }, {
              display_name: 'Danish',
              value: 'da',
            }, {
              display_name: 'German - Austria',
              value: 'de-at',
            }, {
              display_name: 'German - Switzerland',
              value: 'de-ch',
            }, {
              display_name: 'German - Germany',
              value: 'de-de',
            }, {
              display_name: 'German - Liechtenstein',
              value: 'de-li',
            }, {
              display_name: 'German - Luxembourg',
              value: 'de-lu',
            }, {
              display_name: 'Greek',
              value: 'el',
            }, {
              display_name: 'English - Australia',
              value: 'en-au',
            }, {
              display_name: 'English - Belize',
              value: 'en-bz',
            }, {
              display_name: 'English - Canada',
              value: 'en-ca',
            }, {
              display_name: 'English - Caribbean',
              value: 'en-cb',
            }, {
              display_name: 'English - Great Britain',
              value: 'en-gb',
            }, {
              display_name: 'English - Ireland',
              value: 'en-ie',
            }, {
              display_name: 'English - India',
              value: 'en-in',
            }, {
              display_name: 'English - Jamaica',
              value: 'en-jm',
            }, {
              display_name: 'English - Malaysia',
              value: 'en-my',
            }, {
              display_name: 'English - New Zealand',
              value: 'en-nz',
            }, {
              display_name: 'English - Phillippines',
              value: 'en-ph',
            }, {
              display_name: 'English - Singapore',
              value: 'en-sg',
            }, {
              display_name: 'English - Trinidad',
              value: 'en-tt',
            }, {
              display_name: 'English - United States',
              value: 'en-us',
            }, {
              display_name: 'English - Southern Africa',
              value: 'en-za',
            }, {
              display_name: 'English - Zimbabwe',
              value: 'en-zw',
            }, {
              display_name: 'Spanish - Argentina',
              value: 'es-ar',
            }, {
              display_name: 'Spanish - Bolivia',
              value: 'es-bo',
            }, {
              display_name: 'Spanish - Chile',
              value: 'es-cl',
            }, {
              display_name: 'Spanish - Colombia',
              value: 'es-co',
            }, {
              display_name: 'Spanish - Costa Rica',
              value: 'es-cr',
            }, {
              display_name: 'Spanish - Dominican Republic',
              value: 'es-do',
            }, {
              display_name: 'Spanish - Ecuador',
              value: 'es-ec',
            }, {
              display_name: 'Spanish - Spain (Modern)',
              value: 'es-es',
            }, {
              display_name: 'Spanish - Guatemala',
              value: 'es-gt',
            }, {
              display_name: 'Spanish - Honduras',
              value: 'es-hn',
            }, {
              display_name: 'Spanish - Mexico',
              value: 'es-mx',
            }, {
              display_name: 'Spanish - Nicaragua',
              value: 'es-ni',
            }, {
              display_name: 'Spanish - Panama',
              value: 'es-pa',
            }, {
              display_name: 'Spanish - Peru',
              value: 'es-pe',
            }, {
              display_name: 'Spanish - Puerto Rico',
              value: 'es-pr',
            }, {
              display_name: 'Spanish - Paraguay',
              value: 'es-py',
            }, {
              display_name: 'Spanish - El Salvador',
              value: 'es-sv',
            }, {
              display_name: 'Spanish - Uruguay',
              value: 'es-uy',
            }, {
              display_name: 'Spanish - Venezuela',
              value: 'es-ve',
            }, {
              display_name: 'Estonian',
              value: 'et',
            }, {
              display_name: 'Basque (Basque)',
              value: 'eu',
            }, {
              display_name: 'Farsi',
              value: 'fa',
            }, {
              display_name: 'Finnish',
              value: 'fi',
            }, {
              display_name: 'Faroese',
              value: 'fo',
            }, {
              display_name: 'French - Belgium',
              value: 'fr-be',
            }, {
              display_name: 'French - Canada',
              value: 'fr-ca',
            }, {
              display_name: 'French - Switzerland',
              value: 'fr-ch',
            }, {
              display_name: 'French - France',
              value: 'fr-fr',
            }, {
              display_name: 'French - Luxembourg',
              value: 'fr-lu',
            }, {
              display_name: 'Scottish Gaelic - United Kingdom',
              value: 'gd',
            }, {
              display_name: 'Irish - Ireland',
              value: 'gd-ie',
            }, {
              display_name: 'Hebrew',
              value: 'he',
            }, {
              display_name: 'Hindi',
              value: 'hi',
            }, {
              display_name: 'Croatian',
              value: 'hr',
            }, {
              display_name: 'Hungarian',
              value: 'hu',
            }, {
              display_name: 'Armenian',
              value: 'hy',
            }, {
              display_name: 'Indonesian',
              value: 'id',
            }, {
              display_name: 'Icelandic',
              value: 'is',
            }, {
              display_name: 'Italian - Switzerland',
              value: 'it-ch',
            }, {
              display_name: 'Italian - Italy',
              value: 'it-it',
            }, {
              display_name: 'Japanese',
              value: 'ja',
            }, {
              display_name: 'Korean',
              value: 'ko',
            }, {
              display_name: 'Lithuanian',
              value: 'lt',
            }, {
              display_name: 'Latvian',
              value: 'lv',
            }, {
              display_name: 'F.Y.R.O. Macedonia',
              value: 'mk',
            }, {
              display_name: 'Marathi',
              value: 'mr',
            }, {
              display_name: 'Malay - Brunei',
              value: 'ms-bn',
            }, {
              display_name: 'Malay - Malaysia',
              value: 'ms-my',
            }, {
              display_name: 'Maltese',
              value: 'mt',
            }, {
              display_name: 'Norwegian - Bokmål',
              value: 'nb-no',
            }, {
              display_name: 'Dutch - Belgium',
              value: 'nl-be',
            }, {
              display_name: 'Dutch - Netherlands',
              value: 'nl-nl',
            }, {
              display_name: 'Norwegian - Nynorsk',
              value: 'nn-no',
            }, {
              display_name: 'Polish',
              value: 'pl',
            }, {
              display_name: 'Portuguese - Brazil',
              value: 'pt-br',
            }, {
              display_name: 'Portuguese - Portugal',
              value: 'pt-pt',
            }, {
              display_name: 'Raeto-Romance',
              value: 'rm',
            }, {
              display_name: 'Romanian - Romania',
              value: 'ro',
            }, {
              display_name: 'Romanian - Republic of Moldova',
              value: 'ro-mo',
            }, {
              display_name: 'Russian',
              value: 'ru',
            }, {
              display_name: 'Russian - Republic of Moldova',
              value: 'ru-mo',
            }, {
              display_name: 'Sanskrit',
              value: 'sa',
            }, {
              display_name: 'Sorbian',
              value: 'sb',
            }, {
              display_name: 'Slovak',
              value: 'sk',
            }, {
              display_name: 'Slovenian',
              value: 'sl',
            }, {
              display_name: 'Albanian',
              value: 'sq',
            }, {
              display_name: 'Serbian - Latin',
              value: 'sr-sp',
            }, {
              display_name: 'Southern Sotho',
              value: 'st',
            }, {
              display_name: 'Swedish - Finland',
              value: 'sv-fi',
            }, {
              display_name: 'Swedish - Sweden',
              value: 'sv-se',
            }, {
              display_name: 'Swahili',
              value: 'sw',
            }, {
              display_name: 'Tamil',
              value: 'ta',
            }, {
              display_name: 'Thai',
              value: 'th',
            }, {
              display_name: 'Setsuana',
              value: 'tn',
            }, {
              display_name: 'Turkish',
              value: 'tr',
            }, {
              display_name: 'Tsonga',
              value: 'ts',
            }, {
              display_name: 'Tatar',
              value: 'tt',
            }, {
              display_name: 'Ukrainian',
              value: 'uk',
            }, {
              display_name: 'Urdu',
              value: 'ur',
            }, {
              display_name: 'Uzbek - Latin',
              value: 'uz-uz',
            }, {
              display_name: 'Vietnamese',
              value: 'vi',
            }, {
              display_name: 'Xhosa',
              value: 'xh',
            }, {
              display_name: 'Yiddish',
              value: 'yi',
            }, {
              display_name: 'Chinese - Mandarin',
              value: 'zh-cmn',
            }, {
              display_name: 'Chinese - China',
              value: 'zh-cn',
            }, {
              display_name: 'Chinese - Simplified',
              value: 'zh-Hans',
            }, {
              display_name: 'Chinese - Traditional',
              value: 'zh-Hant',
            }, {
              display_name: 'Chinese - Hong Kong SAR',
              value: 'zh-hk',
            }, {
              display_name: 'Chinese - Macau SAR',
              value: 'zh-mo',
            }, {
              display_name: 'Chinese - Singapore',
              value: 'zh-sg',
            }, {
              display_name: 'Chinese - Taiwan',
              value: 'zh-tw',
            }, {
              display_name: 'Zulu',
              value: 'zu',
            }],
          },
          expected_program_type: {
            type: 'field',
            required: false,
            read_only: false,
            label: 'Expected Program Type',
            choices: [{
              display_name: 'Professional Certificate',
              value: 'professional-certificate',
            },
            {
              display_name: 'MicroMasters',
              value: 'micromasters',
            },
            {
              display_name: 'XSeries',
              value: 'xseries',
            },
            {
              display_name: 'Masters',
              value: 'masters',
            }],
          },
        },
      },
    },
  };
  const initialValuesFull = {
    title: 'Test Title',
    number: 'Test101x',
    short_description: 'short desc',
    full_description: 'long desc',
    outcome: 'learning outcomes',
    subjectPrimary: 'business',
    subjectSecondary: 'english',
    subjectTertiary: 'security',
    imageSrc: 'http://image.src.small',
    prerequisites_raw: 'prereq',
    level_type: 'advanced',
    learner_testimonials: 'learner testimonials',
    faq: 'frequently asked questions',
    additional_information: 'additional info',
    syllabus_raw: 'syllabus',
    videoSrc: 'https://www.video.src/watch?v=fdsafd',
    mode: 'verified',
    price: '77',
    uuid: '11111111-1111-1111-1111-111111111111',
    editable: true,
  };
  const entitlement = {
    mode: 'verified',
    price: '77',
  };

  it('renders html correctly with minimal data', () => {
    const component = shallow(<BaseEditCourseForm
      handleSubmit={() => null}
      initialValues={{
        title: initialValuesFull.title,
      }}
      title={initialValuesFull.title}
      entitlement={undefined}
      courseStatuses={[UNPUBLISHED]}
      courseOptions={courseOptions}
      courseRunOptions={courseRunOptions}
      uuid={initialValuesFull.uuid}
      id="edit-course-form"
    />);
    expect(component).toMatchSnapshot();
  });

  it('renders html correctly with all data present and verified entitlement', () => {
    const component = shallow(<BaseEditCourseForm
      handleSubmit={() => null}
      initialValues={initialValuesFull}
      currentFormValues={initialValuesFull}
      title={initialValuesFull.title}
      entitlement={entitlement}
      courseStatuses={[UNPUBLISHED]}
      courseOptions={courseOptions}
      courseRunOptions={courseRunOptions}
      uuid={initialValuesFull.uuid}
      id="edit-course-form"
    />);
    expect(component).toMatchSnapshot();
  });

  it('renders html correctly with administrator being true', () => {
    const component = shallow(<BaseEditCourseForm
      authentication={{
        administrator: true,
      }}
      handleSubmit={() => null}
      initialValues={initialValuesFull}
      currentFormValues={initialValuesFull}
      title={initialValuesFull.title}
      entitlement={entitlement}
      courseStatuses={[UNPUBLISHED]}
      courseOptions={courseOptions}
      courseRunOptions={courseRunOptions}
      uuid={initialValuesFull.uuid}
      id="edit-course-form"
    />);
    expect(component).toMatchSnapshot();
  });

  it('renders html correctly while submitting', () => {
    const component = shallow(<BaseEditCourseForm
      handleSubmit={() => null}
      initialValues={initialValuesFull}
      currentFormValues={initialValuesFull}
      title={initialValuesFull.title}
      entitlement={entitlement}
      courseStatuses={[UNPUBLISHED]}
      courseOptions={courseOptions}
      courseRunOptions={courseRunOptions}
      pristine={false}
      submitting
      uuid={initialValuesFull.uuid}
      id="edit-course-form"
    />);
    expect(component).toMatchSnapshot();
  });

  it('renders correctly when submitting for review', () => {
    const component = shallow(<BaseEditCourseForm
      handleSubmit={() => null}
      title={initialValuesFull.title}
      currentFormValues={initialValuesFull}
      entitlement={entitlement}
      courseStatuses={[UNPUBLISHED]}
      courseOptions={courseOptions}
      courseRunOptions={courseRunOptions}
      uuid={initialValuesFull.uuid}
      isSubmittingForReview
      id="edit-course-form"
    />);
    expect(component).toMatchSnapshot();
  });

  it('renders with disabled fields if course is in review', () => {
    const component = shallow(<BaseEditCourseForm
      handleSubmit={() => null}
      title={initialValuesFull.title}
      currentFormValues={initialValuesFull}
      entitlement={entitlement}
      courseStatuses={[IN_LEGAL_REVIEW]}
      courseOptions={courseOptions}
      courseRunOptions={courseRunOptions}
      uuid={initialValuesFull.uuid}
      courseInReview
      id="edit-course-form"
    />);

    const childFields = component.find(Field);
    childFields.forEach((field) => {
      expect(field.prop('disabled')).toBe(true);
    });
  });

  it('renders with mode disabled after being reviewed', () => {
    entitlement.sku = 'ABC1234';
    const component = shallow(<BaseEditCourseForm
      handleSubmit={() => null}
      title={initialValuesFull.title}
      initialValues={initialValuesFull}
      currentFormValues={initialValuesFull}
      entitlement={entitlement}
      courseStatuses={[REVIEWED]}
      courseOptions={courseOptions}
      courseRunOptions={courseRunOptions}
      uuid={initialValuesFull.uuid}
      id="edit-course-form"
    />);

    const disabledFields = component.find({ disabled: true });
    expect(disabledFields.length === 1);
  });

  it('renders with mode disabled once a sku exists, even if course is unpublished', () => {
    entitlement.sku = 'ABC1234';
    const component = shallow(<BaseEditCourseForm
      handleSubmit={() => null}
      title={initialValuesFull.title}
      initialValues={initialValuesFull}
      currentFormValues={initialValuesFull}
      entitlement={entitlement}
      courseStatuses={[UNPUBLISHED]}
      courseOptions={courseOptions}
      courseRunOptions={courseRunOptions}
      uuid={initialValuesFull.uuid}
      id="edit-course-form"
    />);

    const disabledFields = component.find({ disabled: true });
    expect(disabledFields.length === 1);
  });
});
