import { gs, type GlideRecord } from '@servicenow/glide'
import {
    complaintVisibilityQuery,
    issueVisibilityQuery,
    maintenanceVisibilityQuery,
    onboardTaskVisibilityQuery,
    roomVisibilityQuery,
    sessionVisibilityQuery,
} from './issue-visibility.ts'
import { ownActiveRoomIds } from '../security/own-room.ts'

/**
 * Before-query business rule handlers (W-3). Each restricts EVERY query on its table to the rows
 * the current user may read, so aggregate counts (Stats API, GlideAggregate, reports) cannot reveal
 * records the user cannot see. Scheduled jobs / system context (user "system") are not restricted.
 *
 * gs.hasRole() is used deliberately here: these rules MIRROR the read ACLs, and the ACL engine's
 * role check has the same semantics (platform admin satisfies it; adminOverrides=true on these ACLs).
 * They only narrow queries; the ACLs remain the authority.
 */
const R = 'x_774308_campus360.'
const isSystem = () => gs.getUserName() === 'system'

export function restrictIssueQuery(current: GlideRecord<'x_774308_campus360_it_issue'>): void {
    const q = issueVisibilityQuery({
        userId: gs.getUserID(),
        isSystem: isSystem(),
        unrestricted: gs.hasRole(R + 'technician') || gs.hasRole(R + 'leadership'),
        warden: gs.hasRole(R + 'warden'),
        labAdmin: gs.hasRole(R + 'lab_admin'),
        hod: gs.hasRole(R + 'hod'),
    })
    if (q) current.addEncodedQuery(q)
}

export function restrictComplaintQuery(current: GlideRecord<'x_774308_campus360_hostel_cmpl'>): void {
    const q = complaintVisibilityQuery({
        userId: gs.getUserID(),
        isSystem: isSystem(),
        platformAdmin: gs.hasRole('admin'),
        leadership: gs.hasRole(R + 'leadership'),
        warden: gs.hasRole(R + 'warden'),
    })
    if (q) current.addEncodedQuery(q)
}

export function restrictRoomQuery(current: GlideRecord<'x_774308_campus360_hostel_room'>): void {
    const unrestricted = gs.hasRole(R + 'technician') || gs.hasRole(R + 'maintenance') || gs.hasRole(R + 'registrar') || gs.hasRole(R + 'leadership')
    const student = !unrestricted && gs.hasRole(R + 'student')
    const q = roomVisibilityQuery({
        userId: gs.getUserID(),
        isSystem: isSystem(),
        unrestricted,
        warden: gs.hasRole(R + 'warden'),
        student,
        ownRoomIds: student ? ownActiveRoomIds() : [],
    })
    if (q) current.addEncodedQuery(q)
}

export function restrictSessionQuery(current: GlideRecord<'x_774308_campus360_class_sess'>): void {
    const q = sessionVisibilityQuery({
        userId: gs.getUserID(),
        isSystem: isSystem(),
        unrestricted: gs.hasRole(R + 'registrar') || gs.hasRole(R + 'leadership') || gs.hasRole(R + 'student'),
        faculty: gs.hasRole(R + 'faculty'),
        hod: gs.hasRole(R + 'hod'),
    })
    if (q) current.addEncodedQuery(q)
}

export function restrictOnboardTaskQuery(current: GlideRecord<'x_774308_campus360_onboard_tsk'>): void {
    const q = onboardTaskVisibilityQuery({
        userId: gs.getUserID(),
        isSystem: isSystem(),
        unrestricted: gs.hasRole(R + 'faculty_admin') || gs.hasRole(R + 'leadership'),
    })
    if (q) current.addEncodedQuery(q)
}

export function restrictMaintenanceQuery(current: GlideRecord<'x_774308_campus360_maint_req'>): void {
    const q = maintenanceVisibilityQuery({
        userId: gs.getUserID(),
        isSystem: isSystem(),
        unrestricted: gs.hasRole(R + 'maintenance') || gs.hasRole(R + 'lab_admin') || gs.hasRole(R + 'technician') || gs.hasRole(R + 'leadership'),
        warden: gs.hasRole(R + 'warden'),
    })
    if (q) current.addEncodedQuery(q)
}
