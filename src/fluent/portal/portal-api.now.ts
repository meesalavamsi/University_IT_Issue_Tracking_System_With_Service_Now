import { Acl, BusinessRule, RestApi } from '@servicenow/sdk/core'
import { roleUser } from '../roles/roles.now'
import { createRequest, getCatalog, getMe, getMyRequests, getRecordSummary } from '../../server/portal/self-service'
import { assignToMe, complaintAction, getHostel, getMaintenance, getQueue, issueAction } from '../../server/portal/operations'
import { getClasses, getRegistrations, getRoster, reviewRegistration, saveAttendance } from '../../server/portal/academics'
import { getAdminOverview, getStats } from '../../server/portal/insights'
import { getBrowseCatalog, getBrowseModule } from '../../server/portal/browse'
import { stampRegistrarReview } from '../../server/registration/review-stamp'

// Campus360 portal API: /api/x_774308_campus360/portal/...
// Every handler accesses data ONLY through GlideRecordSecure as the logged-in user, so the deployed
// table/row/field ACLs, business rules (incl. W-3 query rule) and unique indexes all apply.
// The endpoint ACL below additionally requires the Campus360 base role.

export const portalApiAcl = Acl({
    $id: Now.ID['acl-portal-api-execute'],
    type: 'rest_endpoint',
    name: 'x_774308_campus360.portal',
    operation: 'execute',
    roles: [roleUser],
    adminOverrides: true,
    description: 'Campus360 portal API: callers must hold the Campus360 base role (all Campus360 personas contain it).',
})

export const portalApi = RestApi({
    $id: Now.ID['rest-campus360-portal'],
    name: 'Campus360 Portal API',
    serviceId: 'portal',
    shortDescription: 'Role-aware data for the Campus360 React portal. ACL-enforced (GlideRecordSecure) on every call.',
    consumes: 'application/json',
    produces: 'application/json',
    enforceAcl: [portalApiAcl],
    versions: [{ $id: Now.ID['rest-campus360-portal-v1'], version: 1, active: true, isDefault: true, shortDescription: 'Initial version' }],
    routes: [
        { version: 1, active: true, authentication: true, authorization: true, enforceAcl: [portalApiAcl], produces: 'application/json', $id: Now.ID['rest-portal-me'], name: 'me', method: 'GET', path: '/me', script: getMe },
        { version: 1, active: true, authentication: true, authorization: true, enforceAcl: [portalApiAcl], produces: 'application/json', $id: Now.ID['rest-portal-catalog'], name: 'catalog', method: 'GET', path: '/catalog', script: getCatalog },
        { version: 1, active: true, authentication: true, authorization: true, enforceAcl: [portalApiAcl], produces: 'application/json', $id: Now.ID['rest-portal-requests-create'], name: 'create request', method: 'POST', path: '/requests', consumes: 'application/json', script: createRequest },
        { version: 1, active: true, authentication: true, authorization: true, enforceAcl: [portalApiAcl], produces: 'application/json', $id: Now.ID['rest-portal-requests-mine'], name: 'my requests', method: 'GET', path: '/requests/mine', script: getMyRequests },
        { version: 1, active: true, authentication: true, authorization: true, enforceAcl: [portalApiAcl], produces: 'application/json', $id: Now.ID['rest-portal-record'], name: 'record summary', method: 'GET', path: '/records/{table}/{id}', script: getRecordSummary },
        { version: 1, active: true, authentication: true, authorization: true, enforceAcl: [portalApiAcl], produces: 'application/json', $id: Now.ID['rest-portal-queue'], name: 'it queue', method: 'GET', path: '/queue', script: getQueue },
        { version: 1, active: true, authentication: true, authorization: true, enforceAcl: [portalApiAcl], produces: 'application/json', $id: Now.ID['rest-portal-issue-action'], name: 'issue action', method: 'POST', path: '/issues/{id}/action', consumes: 'application/json', script: issueAction },
        { version: 1, active: true, authentication: true, authorization: true, enforceAcl: [portalApiAcl], produces: 'application/json', $id: Now.ID['rest-portal-issue-assign'], name: 'issue assign to me', method: 'POST', path: '/issues/{id}/assign-me', script: assignToMe },
        { version: 1, active: true, authentication: true, authorization: true, enforceAcl: [portalApiAcl], produces: 'application/json', $id: Now.ID['rest-portal-hostel'], name: 'hostel overview', method: 'GET', path: '/hostel', script: getHostel },
        { version: 1, active: true, authentication: true, authorization: true, enforceAcl: [portalApiAcl], produces: 'application/json', $id: Now.ID['rest-portal-complaint-action'], name: 'complaint action', method: 'POST', path: '/complaints/{id}/action', consumes: 'application/json', script: complaintAction },
        { version: 1, active: true, authentication: true, authorization: true, enforceAcl: [portalApiAcl], produces: 'application/json', $id: Now.ID['rest-portal-maintenance'], name: 'maintenance', method: 'GET', path: '/maintenance', script: getMaintenance },
        { version: 1, active: true, authentication: true, authorization: true, enforceAcl: [portalApiAcl], produces: 'application/json', $id: Now.ID['rest-portal-classes'], name: 'classes', method: 'GET', path: '/classes', script: getClasses },
        { version: 1, active: true, authentication: true, authorization: true, enforceAcl: [portalApiAcl], produces: 'application/json', $id: Now.ID['rest-portal-roster'], name: 'session roster', method: 'GET', path: '/sessions/{id}/roster', script: getRoster },
        { version: 1, active: true, authentication: true, authorization: true, enforceAcl: [portalApiAcl], produces: 'application/json', $id: Now.ID['rest-portal-attendance'], name: 'save attendance', method: 'POST', path: '/sessions/{id}/attendance', consumes: 'application/json', script: saveAttendance },
        { version: 1, active: true, authentication: true, authorization: true, enforceAcl: [portalApiAcl], produces: 'application/json', $id: Now.ID['rest-portal-registrations'], name: 'registrations', method: 'GET', path: '/registrations', script: getRegistrations },
        { version: 1, active: true, authentication: true, authorization: true, enforceAcl: [portalApiAcl], produces: 'application/json', $id: Now.ID['rest-portal-registration-review'], name: 'registration review', method: 'POST', path: '/registrations/{id}/review', consumes: 'application/json', script: reviewRegistration },
        { version: 1, active: true, authentication: true, authorization: true, enforceAcl: [portalApiAcl], produces: 'application/json', $id: Now.ID['rest-portal-stats'], name: 'stats', method: 'GET', path: '/stats', script: getStats },
        { version: 1, active: true, authentication: true, authorization: true, enforceAcl: [portalApiAcl], produces: 'application/json', $id: Now.ID['rest-portal-admin-overview'], name: 'admin overview', method: 'GET', path: '/admin/overview', script: getAdminOverview },
        // Campus records: read-only mirror of the native navigator (server-defined filters only).
        { version: 1, active: true, authentication: true, authorization: true, enforceAcl: [portalApiAcl], produces: 'application/json', $id: Now.ID['rest-portal-browse-catalog'], name: 'browse catalog', method: 'GET', path: '/browse', script: getBrowseCatalog },
        { version: 1, active: true, authentication: true, authorization: true, enforceAcl: [portalApiAcl], produces: 'application/json', $id: Now.ID['rest-portal-browse-module'], name: 'browse module', method: 'GET', path: '/browse/{module}', script: getBrowseModule },
    ],
})

// Registrar Review step: stamp reviewer and time (server-maintained fields).
export const registrarReviewStamp = BusinessRule({
    $id: Now.ID['br-student-reg-review-stamp'],
    name: 'C360 Registration - stamp registrar review',
    table: 'x_774308_campus360_student_reg',
    when: 'before',
    action: ['update'],
    order: 100,
    active: true,
    script: stampRegistrarReview,
    description: 'Sets registrar_reviewed_by / registrar_reviewed_at when registrar_recommendation changes.',
})
