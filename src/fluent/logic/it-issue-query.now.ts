import { BusinessRule } from '@servicenow/sdk/core'
import {
    restrictComplaintQuery,
    restrictIssueQuery,
    restrictMaintenanceQuery,
    restrictOnboardTaskQuery,
    restrictRoomQuery,
    restrictSessionQuery,
} from '../../server/issue/issue-query-rule'

// W-3: before-query rules so list views, reports, Table API, Aggregate/Stats API and the portal all
// count and return only the records the user is allowed to read (each mirrors its table's read ACLs).
// ACLs remain in place; these rules only narrow queries further for non-staff users.
export const itIssueQueryRule = BusinessRule({
    $id: Now.ID['br-it-issue-query-visibility'],
    name: 'C360 IT Issue - restrict queries to visible rows',
    table: 'x_774308_campus360_it_issue',
    when: 'before',
    action: ['query'],
    order: 100,
    active: true,
    script: restrictIssueQuery,
    description: 'W-3: restricts queries for non-staff users to issues they can read (caller/opened_by, warden hostel, lab admin, HOD department) so aggregate counts cannot reveal hidden issues.',
})

export const hostelComplaintQueryRule = BusinessRule({
    $id: Now.ID['br-hostel-cmpl-query-visibility'],
    name: 'C360 Hostel Complaint - restrict queries to visible rows',
    table: 'x_774308_campus360_hostel_cmpl',
    when: 'before',
    action: ['query'],
    order: 100,
    active: true,
    script: restrictComplaintQuery,
    description: 'W-3: restricts queries to complaints the user can read (own, hostels they warden; leadership all non-confidential) so aggregate counts cannot reveal hidden or confidential complaints.',
})

export const maintenanceQueryRule = BusinessRule({
    $id: Now.ID['br-maint-req-query-visibility'],
    name: 'C360 Maintenance Request - restrict queries to visible rows',
    table: 'x_774308_campus360_maint_req',
    when: 'before',
    action: ['query'],
    order: 100,
    active: true,
    script: restrictMaintenanceQuery,
    description: 'W-3: restricts queries for non-maintenance users to requests they can read (own, hostels they warden) so aggregate counts cannot reveal hidden work orders.',
})

// Revision 3: remaining REST-enabled tables whose read ACLs are row-conditional.
export const hostelRoomQueryRule = BusinessRule({
    $id: Now.ID['br-hostel-room-query-visibility'],
    name: 'C360 Hostel Room - restrict queries to visible rows',
    table: 'x_774308_campus360_hostel_room',
    when: 'before',
    action: ['query'],
    order: 100,
    active: true,
    script: restrictRoomQuery,
    description: 'W-3 (rev 3): wardens see rooms of their hostels; students see available rooms plus the room of their own active allocation (even when full); facilities/registrar/leadership/IT see all.',
})

export const classSessionQueryRule = BusinessRule({
    $id: Now.ID['br-class-sess-query-visibility'],
    name: 'C360 Class Session - restrict queries to visible rows',
    table: 'x_774308_campus360_class_sess',
    when: 'before',
    action: ['query'],
    order: 100,
    active: true,
    script: restrictSessionQuery,
    description: 'W-3 (rev 3): faculty see sessions they take/teach, HODs their department; students (timetable), registrar and leadership see all; others none.',
})

export const onboardTaskQueryRule = BusinessRule({
    $id: Now.ID['br-onboard-tsk-query-visibility'],
    name: 'C360 Onboarding Task - restrict queries to visible rows',
    table: 'x_774308_campus360_onboard_tsk',
    when: 'before',
    action: ['query'],
    order: 100,
    active: true,
    script: restrictOnboardTaskQuery,
    description: 'W-3 (rev 3): faculty admins and leadership see all onboarding tasks; everyone else only tasks assigned to one of their groups.',
})
