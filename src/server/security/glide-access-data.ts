import { GlideRecord } from '@servicenow/glide'
import { type AccessDataSource, isValidSysId } from './access-rules.ts'

/**
 * Production AccessDataSource backed by server-side GlideRecord.
 *
 * WHY GlideRecord (not GlideRecordSecure): these lookups run INSIDE ACL evaluation. Using
 * GlideRecordSecure would re-enter the ACLs of enrollment / room_alloc / faculty, which can
 * reference the student table again → circular ACL evaluation and recursion. The lookups only
 * return a boolean or a faculty sys_id to the ACL; no record data is exposed to the caller.
 *
 * Injection safety: every value placed into an encoded query is validated as a 32-hex sys_id
 * first (callers already validate; re-checked here defensively). Status values are constants.
 * Every query uses setLimit(1) and indexed columns (see DATABASE_SCHEMA.md §4 indexes).
 */

const STATUS_PATTERN = /^[a-z_]+$/

export const glideAccessData: AccessDataSource = {
    getActiveFacultyId(userId: string): string | null {
        if (!isValidSysId(userId)) return null
        const fac = new GlideRecord('x_774308_campus360_faculty')
        fac.addEncodedQuery('user=' + userId + '^status=active')
        fac.setLimit(1)
        fac.query()
        if (!fac.next()) return null
        const id = fac.getUniqueValue()
        return isValidSysId(id) ? id : null
    },

    isEnrolledInFacultySection(studentId: string, facultyId: string): boolean {
        if (!isValidSysId(studentId) || !isValidSysId(facultyId)) return false
        const enr = new GlideRecord('x_774308_campus360_enrollment')
        enr.addEncodedQuery(
            'student=' + studentId +
                '^status=enrolled' +
                '^course_section.statusINplanned,active' +
                '^course_section.faculty=' + facultyId +
                '^ORcourse_section.co_instructorsLIKE' + facultyId
        )
        enr.setLimit(1)
        enr.query()
        return enr.hasNext()
    },

    hasAllocationUnderWarden(studentId: string, wardenUserId: string, statuses: readonly string[]): boolean {
        if (!isValidSysId(studentId) || !isValidSysId(wardenUserId)) return false
        const safeStatuses = statuses.filter((s) => STATUS_PATTERN.test(s))
        if (safeStatuses.length === 0) return false
        const alloc = new GlideRecord('x_774308_campus360_room_alloc')
        alloc.addEncodedQuery(
            'student=' + studentId +
                '^statusIN' + safeStatuses.join(',') +
                '^hostel_room.hostel.active=true' +
                '^hostel_room.hostel.warden=' + wardenUserId +
                '^ORhostel_room.hostel.assistant_warden=' + wardenUserId
        )
        alloc.setLimit(1)
        alloc.query()
        return alloc.hasNext()
    },
}
