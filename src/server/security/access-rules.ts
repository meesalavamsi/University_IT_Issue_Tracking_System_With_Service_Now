/**
 * Campus360 — pure access-decision rules (Part 3).
 *
 * This module has NO platform imports so it can be unit-tested outside ServiceNow.
 * All data lookups go through the AccessDataSource interface; the production implementation
 * (glide-access-data.ts) uses server-side GlideRecord.
 *
 * Rules implemented:
 *   RL-02  Faculty may read a student who is ENROLLED in a course section they teach
 *          (primary instructor or co-instructor), where the section is planned/active.
 *   RL-04  Wardens may read a student who holds an ACTIVE or REQUESTED room allocation
 *          in a hostel where the user is warden or assistant warden.
 *   RL-04g Wardens may read guardian contact fields ONLY for ACTIVE residents of their hostel.
 *
 * Every function fails CLOSED: any missing, empty or malformed input returns allowed=false.
 */

export interface AccessDataSource {
    /** sys_id of the ACTIVE faculty profile linked to the user, or null. */
    getActiveFacultyId(userId: string): string | null
    /** true if the student has an 'enrolled' enrollment in a planned/active section taught (or co-taught) by the faculty. */
    isEnrolledInFacultySection(studentId: string, facultyId: string): boolean
    /** true if the student has a room allocation with one of the statuses in a hostel the user wardens. */
    hasAllocationUnderWarden(studentId: string, wardenUserId: string, statuses: readonly string[]): boolean
}

export interface Decision {
    allowed: boolean
    reason: string
}

export const ALLOCATION_STATUSES_FOR_PROFILE: readonly string[] = ['active', 'requested']
export const ALLOCATION_STATUSES_FOR_GUARDIAN: readonly string[] = ['active']

const SYS_ID_PATTERN = /^[0-9a-f]{32}$/

/** A ServiceNow sys_id: exactly 32 lowercase hex characters. Anything else is rejected. */
export function isValidSysId(value: unknown): value is string {
    return typeof value === 'string' && SYS_ID_PATTERN.test(value)
}

function deny(reason: string): Decision {
    return { allowed: false, reason }
}

function allow(reason: string): Decision {
    return { allowed: true, reason }
}

/** RL-02: faculty → student via actual class enrollment and section assignment. */
export function evaluateFacultyStudentAccess(userId: unknown, studentId: unknown, ds: AccessDataSource): Decision {
    if (!isValidSysId(userId)) return deny('invalid or missing user')
    if (!isValidSysId(studentId)) return deny('invalid or missing student')
    const facultyId = ds.getActiveFacultyId(userId)
    if (!isValidSysId(facultyId)) return deny('user has no active faculty profile')
    if (!ds.isEnrolledInFacultySection(studentId, facultyId)) return deny('student not enrolled in any section taught by this faculty')
    return allow('student enrolled in a section taught by this faculty')
}

/** RL-04: warden → student profile (active or requested allocation in a hostel the user wardens). */
export function evaluateWardenStudentAccess(userId: unknown, studentId: unknown, ds: AccessDataSource): Decision {
    if (!isValidSysId(userId)) return deny('invalid or missing user')
    if (!isValidSysId(studentId)) return deny('invalid or missing student')
    if (!ds.hasAllocationUnderWarden(studentId, userId, ALLOCATION_STATUSES_FOR_PROFILE)) {
        return deny('student has no active/requested allocation in a hostel wardened by this user')
    }
    return allow('student allocated (active/requested) to a hostel wardened by this user')
}

/** RL-04g: warden → guardian contact fields (ACTIVE residents only). */
export function evaluateWardenGuardianAccess(userId: unknown, studentId: unknown, ds: AccessDataSource): Decision {
    if (!isValidSysId(userId)) return deny('invalid or missing user')
    if (!isValidSysId(studentId)) return deny('invalid or missing student')
    if (!ds.hasAllocationUnderWarden(studentId, userId, ALLOCATION_STATUSES_FOR_GUARDIAN)) {
        return deny('student is not an active resident of a hostel wardened by this user')
    }
    return allow('student is an active resident of a hostel wardened by this user')
}
