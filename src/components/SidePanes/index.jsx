import React from 'react';
import PropTypes from 'prop-types';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';

import UsersPane from './UsersPane';
import CommentsPane from './CommentsPane';
import CatalogInclusionPane from './CatalogInclusionPane';
import B2CSubscriptionsPane from './B2CSubscriptionsPane';

const SidePanes = (props) => {
  const isEdxStaff = getAuthenticatedUser().administrator;
  let orgInclusionList = false;

  if (isEdxStaff) {
    const incList = props.organizations.map(element => element.enterprise_subscription_inclusion);
    orgInclusionList = incList.every(orgInclusion => orgInclusion === true);
  }

  return (
    <div className={props.className} hidden={props.hidden}>
      <UsersPane
        addCourseEditor={props.addCourseEditor}
        courseEditors={props.courseEditors}
        fetchCourseEditors={props.fetchCourseEditors}
        fetchOrganizationRoles={props.fetchOrganizationRoles}
        fetchOrganizationUsers={props.fetchOrganizationUsers}
        organizationRoles={props.organizationRoles}
        organizationUsers={props.organizationUsers}
        removeCourseEditor={props.removeCourseEditor}
      />
      { isEdxStaff && (
      <CatalogInclusionPane
        courseUuid={props.courseUuid}
        subInclusion={props.enterpriseSubscriptionInclusion}
        draftStatuses={props.draft}
        orgInclusion={orgInclusionList}
      />
      )}
      <B2CSubscriptionsPane
        b2cSubscriptionInclusion={props.b2cSubscriptionInclusion}
      />
      <CommentsPane
        addComment={props.addComment}
        comments={props.comments}
        fetchComments={props.fetchComments}
        courseUuid={props.courseUuid}
      />
    </div>
  );
};

SidePanes.defaultProps = {
  addComment: () => null,
  addCourseEditor: () => null,
  b2cSubscriptionInclusion: null,
  className: '',
  comments: {},
  courseEditors: {},
  courseUuid: '',
  fetchComments: () => null,
  fetchCourseEditors: () => null,
  fetchOrganizationRoles: null,
  fetchOrganizationUsers: null,
  hidden: false,
  organizations: {},
  organizationRoles: {},
  organizationUsers: {},
  removeCourseEditor: () => null,
};

SidePanes.propTypes = {
  addComment: PropTypes.func,
  addCourseEditor: PropTypes.func,
  b2cSubscriptionInclusion: PropTypes.bool,
  className: PropTypes.string,
  comments: PropTypes.shape(),
  courseEditors: PropTypes.shape(),
  courseUuid: PropTypes.string,
  draft: PropTypes.arrayOf(PropTypes.string).isRequired,
  enterpriseSubscriptionInclusion: PropTypes.bool.isRequired,
  fetchComments: PropTypes.func,
  fetchCourseEditors: PropTypes.func,
  fetchOrganizationRoles: PropTypes.func,
  fetchOrganizationUsers: PropTypes.func,
  hidden: PropTypes.bool,
  organizations: PropTypes.arrayOf(PropTypes.string),
  organizationRoles: PropTypes.shape(),
  organizationUsers: PropTypes.shape(),
  removeCourseEditor: PropTypes.func,
};

export default SidePanes;
