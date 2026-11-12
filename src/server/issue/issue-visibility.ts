/**
 * W-3: row-visibility policy for x_774308_campus360_it_issue, applied as a before-query business rule
 * so that EVERY query (lists, reports, Table API, Aggregate/Stats API, exports, portal) is restricted
 * before rows are counted. It mirrors the existing read ACLs exactly (security/it-issue.acl.now.ts):
 *
 *   technician (⊂ it_manager ⊂ Campus360 admin), leadership  → all issues (no restriction)
 *   any user                                                 → caller = me OR opened_by = me
 *   warden                                                   → + hostel.warden / assistant_warden = me
 *   lab_admin                                                → + laboratory is not empty
 *   hod                                                      → + department.hod.user = me
 *
 * Pure function (no platform imports) so it can be unit-tested.
 */
export interface IssueViewer {
    userId: string
    isSystem: boolean
    unrestricted: boolean // technician / it_manager / Campus360 admin / leadership / platform admin
    warden: boolean
    labAdmin: boolean
    hod: boolean
}

const SYS_ID = /^[0-9a-f]{32}$/

/** Returns '' when no restriction applies, otherwise an encoded query to AND onto the query. */
export function issueVisibilityQuery(v: IssueViewer): string {
    if (v.isSystem || v.unrestricted) return ''
    // Fail closed: an unidentifiable user sees nothing.
    if (!SYS_ID.test(v.userId)) return 'sys_idISEMPTY'
    const u = v.userId
    const parts = ['caller=' + u, 'opened_by=' + u]
    if (v.warden) parts.push('hostel.warden=' + u, 'hostel.assistant_warden=' + u)
    if (v.labAdmin) parts.push('laboratoryISNOTEMPTY')
    if (v.hod) parts.push('department.hod.user=' + u)
    return parts.join('^OR')
}

/**
 * W-3 extension: x_774308_campus360_hostel_cmpl. Mirrors security/hostel.acl.now.ts exactly:
 *   allow  caller/opened_by = me (any user) · warden of the hostel (warden role) · leadership (all)
 *   deny   confidential complaints unless caller/opened_by/warden/assistant warden of the hostel
 *   platform admin passes both (adminOverrides=true on these ACLs).
 */
export interface ComplaintViewer {
    userId: string
    isSystem: boolean
    platformAdmin: boolean
    leadership: boolean
    warden: boolean
}

export function complaintVisibilityQuery(v: ComplaintViewer): string {
    if (v.isSystem || v.platformAdmin) return ''
    if (!SYS_ID.test(v.userId)) return 'sys_idISEMPTY'
    const u = v.userId
    const own = ['caller=' + u, 'opened_by=' + u]
    const hostelWarden = ['hostel.warden=' + u, 'hostel.assistant_warden=' + u]
    // Leadership reads every complaint except other people's confidential ones (deny-unless ACL).
    if (v.leadership) return ['is_confidential=false'].concat(own, hostelWarden).join('^OR')
    return (v.warden ? own.concat(hostelWarden) : own).join('^OR')
}

/**
 * W-3 extension: x_774308_campus360_maint_req. Mirrors security/infrastructure.acl.now.ts exactly:
 *   maintenance, lab_admin, technician, leadership (and platform admin) → all
 *   any user → caller/opened_by = me · warden → + hostel.warden / assistant_warden = me
 */
export interface MaintenanceViewer {
    userId: string
    isSystem: boolean
    unrestricted: boolean
    warden: boolean
}

/**
 * Revision 3: x_774308_campus360_hostel_room. Mirrors security/hostel.acl.now.ts:
 *   technician, maintenance, registrar, leadership (and admins) → all
 *   warden  → rooms of hostels they warden / assist
 *   student → available rooms + the room(s) of their OWN active allocation (even when full)
 *   others  → none
 */
export interface RoomViewer {
    userId: string
    isSystem: boolean
    unrestricted: boolean
    warden: boolean
    student: boolean
    ownRoomIds: string[]
}

export function roomVisibilityQuery(v: RoomViewer): string {
    if (v.isSystem || v.unrestricted) return ''
    if (!SYS_ID.test(v.userId)) return 'sys_idISEMPTY'
    const u = v.userId
    const parts: string[] = []
    if (v.warden) parts.push('hostel.warden=' + u, 'hostel.assistant_warden=' + u)
    if (v.student) {
        parts.push('status=available')
        const own = (v.ownRoomIds || []).filter((id) => SYS_ID.test(id))
        if (own.length) parts.push('sys_idIN' + own.join(','))
    }
    return parts.length ? parts.join('^OR') : 'sys_idISEMPTY'
}

/**
 * Revision 3: x_774308_campus360_class_sess. Mirrors security/attendance.acl.now.ts:
 *   registrar, leadership, student (timetable data) and admins → all
 *   faculty → sessions they take or of sections they teach · hod → sessions of their department's courses
 *   others → none
 */
export interface SessionViewer {
    userId: string
    isSystem: boolean
    unrestricted: boolean
    faculty: boolean
    hod: boolean
}

export function sessionVisibilityQuery(v: SessionViewer): string {
    if (v.isSystem || v.unrestricted) return ''
    if (!SYS_ID.test(v.userId)) return 'sys_idISEMPTY'
    const u = v.userId
    const parts: string[] = []
    if (v.faculty) parts.push('faculty.user=' + u, 'course_section.faculty.user=' + u)
    if (v.hod) parts.push('course_section.course.department.hod.user=' + u)
    return parts.length ? parts.join('^OR') : 'sys_idISEMPTY'
}

/**
 * Revision 3: x_774308_campus360_onboard_tsk. Mirrors security/registration-onboarding.acl.now.ts:
 *   faculty_admin, leadership (and admins) → all · anyone else → tasks assigned to one of their groups
 */
export const ONE_OF_MY_GROUPS = 'DYNAMICd6435e965f510100a9ad2572f2b47744'
export interface OnboardTaskViewer { userId: string; isSystem: boolean; unrestricted: boolean }

export function onboardTaskVisibilityQuery(v: OnboardTaskViewer): string {
    if (v.isSystem || v.unrestricted) return ''
    if (!SYS_ID.test(v.userId)) return 'sys_idISEMPTY'
    return 'assignment_group' + ONE_OF_MY_GROUPS
}

export function maintenanceVisibilityQuery(v: MaintenanceViewer): string {
    if (v.isSystem || v.unrestricted) return ''
    if (!SYS_ID.test(v.userId)) return 'sys_idISEMPTY'
    const u = v.userId
    const parts = ['caller=' + u, 'opened_by=' + u]
    if (v.warden) parts.push('hostel.warden=' + u, 'hostel.assistant_warden=' + u)
    return parts.join('^OR')
}
