import { Property } from '@servicenow/sdk/core'
import { roleAdmin } from '../roles/roles.now'

// Campus360 system properties (ARCHITECTURE.md §6.9). Read at runtime via gs.getProperty().

export const propAttendanceEditWindow = Property({
    $id: Now.ID['prop-attendance-edit-window-hours'],
    name: 'x_774308_campus360.attendance.edit_window_hours',
    type: 'integer',
    value: 48,
    description: 'Hours after a class session during which faculty may create or edit student attendance.',
    roles: { write: [roleAdmin] },
})

export const propAttendanceMinPct = Property({
    $id: Now.ID['prop-attendance-min-pct'],
    name: 'x_774308_campus360.attendance.min_pct',
    type: 'integer',
    value: 75,
    description: 'Default minimum attendance percentage for exam eligibility (a course may override it).',
    roles: { write: [roleAdmin] },
})

export const propIssueAutoCloseDays = Property({
    $id: Now.ID['prop-issue-auto-close-days'],
    name: 'x_774308_campus360.issue.auto_close_days',
    type: 'integer',
    value: 5,
    description: 'Days after which Resolved IT issues and hostel complaints are closed automatically.',
    roles: { write: [roleAdmin] },
})

export const propIssueReopenDays = Property({
    $id: Now.ID['prop-issue-reopen-days'],
    name: 'x_774308_campus360.issue.reopen_days',
    type: 'integer',
    value: 7,
    description: 'Days after resolution during which the caller may reopen an IT issue.',
    roles: { write: [roleAdmin] },
})

export const propFacultySelfCheckin = Property({
    $id: Now.ID['prop-faculty-self-checkin'],
    name: 'x_774308_campus360.faculty.self_checkin_enabled',
    type: 'boolean',
    value: 'true',
    description: 'Allow faculty to record their own daily attendance (check-in/check-out).',
    roles: { write: [roleAdmin] },
})

export const propHostelGenderRule = Property({
    $id: Now.ID['prop-hostel-enforce-gender-rule'],
    name: 'x_774308_campus360.hostel.enforce_gender_rule',
    type: 'boolean',
    value: 'true',
    description: 'Validate student gender against hostel type when activating a room allocation.',
    roles: { write: [roleAdmin] },
})

export const propRegistrationPublic = Property({
    $id: Now.ID['prop-registration-public-enabled'],
    name: 'x_774308_campus360.registration.public_enabled',
    type: 'boolean',
    value: 'false',
    description: 'Allow unauthenticated applicants to submit student registrations from the portal.',
    roles: { write: [roleAdmin] },
})

export const propPrivacyMaskLists = Property({
    $id: Now.ID['prop-privacy-mask-in-lists'],
    name: 'x_774308_campus360.privacy.mask_in_lists',
    type: 'boolean',
    value: 'true',
    description: 'Keep sensitive personal fields out of default list layouts and exports.',
    roles: { write: [roleAdmin] },
})

export const propSecurityDebug = Property({
    $id: Now.ID['prop-security-debug'],
    name: 'x_774308_campus360.security.debug',
    type: 'boolean',
    value: 'false',
    description: 'Write C360Security access decisions (rule, user, student, result, reason) to the debug log. Never logs field values.',
    roles: { write: [roleAdmin] },
})

export const propDemoDataEnabled = Property({
    $id: Now.ID['prop-demo-data-enabled'],
    name: 'x_774308_campus360.demo.enabled',
    type: 'boolean',
    value: 'false',
    description: 'Informational flag: demo data ships only in the optional "Load demo data" package and is never installed by default.',
    roles: { write: [roleAdmin] },
})
