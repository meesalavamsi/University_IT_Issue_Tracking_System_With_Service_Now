import { gs, type GlideRecord } from '@servicenow/glide'
import {
    evaluateFacultyStudentAccess,
    evaluateWardenGuardianAccess,
    evaluateWardenStudentAccess,
    type Decision,
} from './access-rules.ts'
import { glideAccessData } from './glide-access-data.ts'
import { hasExplicitRole } from './explicit-roles.ts'
// NOTE: relative imports MUST carry the .ts extension. On the instance, modules are stored in
// sys_module under their exact source path (…/access-rules.ts) and require() does not append
// extensions (verified on dev382380, ATF run 2026-11-11: ModuleResolutionException without it).

/**
 * Campus360 security facade used by ACL scripts (through the C360Security script include).
 *
 * Record-level vs. table-level evaluation:
 *   The platform also evaluates read ACLs WITHOUT a concrete row (e.g. to decide whether a list or
 *   module is accessible at all); `current` is then an empty/new record. For TABLE-LEVEL row ACLs we
 *   return true in that probe case, because no row data exists to expose and each concrete row is
 *   still evaluated individually. FIELD-LEVEL ACLs (guardian contact) always fail closed.
 */

type CurrentRecord = GlideRecord<string> | null | undefined

function isProbe(current: CurrentRecord): boolean {
    if (!current) return false
    return current.isNewRecord() || !current.getUniqueValue()
}

function studentIdOf(current: CurrentRecord): string {
    if (!current) return ''
    return current.getUniqueValue() || ''
}

function log(rule: string, d: Decision, studentId: string): void {
    if (gs.getProperty('x_774308_campus360.security.debug', 'false') === 'true') {
        gs.debug('[C360Security] ' + rule + ' student=' + studentId + ' user=' + gs.getUserID() + ' allowed=' + d.allowed + ' (' + d.reason + ')')
    }
}

/** RL-02 — table-level read ACL on x_774308_campus360_student for role faculty. */
export function canFacultyReadStudent(current: CurrentRecord): boolean {
    if (!current) return false
    if (isProbe(current)) return true
    if (!hasExplicitRole(['x_774308_campus360.faculty'])) return false // D-2: platform admin is not implicitly faculty
    const sid = studentIdOf(current)
    const d = evaluateFacultyStudentAccess(gs.getUserID(), sid, glideAccessData)
    log('RL-02', d, sid)
    return d.allowed
}

/** RL-04 — table-level read ACL on x_774308_campus360_student for role warden. */
export function canWardenReadStudent(current: CurrentRecord): boolean {
    if (!current) return false
    if (isProbe(current)) return true
    if (!hasExplicitRole(['x_774308_campus360.warden'])) return false // D-2
    const sid = studentIdOf(current)
    const d = evaluateWardenStudentAccess(gs.getUserID(), sid, glideAccessData)
    log('RL-04', d, sid)
    return d.allowed
}

/** RL-04g — field-level read ACL on guardian_name / guardian_phone for role warden. Fails closed on probes. */
export function canWardenReadGuardian(current: CurrentRecord): boolean {
    if (!current || isProbe(current)) return false
    if (!hasExplicitRole(['x_774308_campus360.warden'])) return false // D-2
    const sid = studentIdOf(current)
    const d = evaluateWardenGuardianAccess(gs.getUserID(), sid, glideAccessData)
    log('RL-04g', d, sid)
    return d.allowed
}
