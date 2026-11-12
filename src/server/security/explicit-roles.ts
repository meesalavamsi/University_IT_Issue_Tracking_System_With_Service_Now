import { gs, type GlideRecord } from '@servicenow/glide'

/**
 * D-2: explicit Campus360 role membership.
 *
 * gs.hasRole() returns TRUE for every role when the user holds the platform `admin` role
 * (verified on dev382380 2026-11-11: admin without the student role → gs.hasRole('…student') = true).
 * Role-only ACLs therefore cannot exclude platform administrators.
 *
 * Verified exact alternatives (same test): GlideUser.hasAssignedRole() and GlideUser.getRoles()
 * both return false for a role the user does not hold, and true for roles held directly, through a
 * group, or inherited through a containing role (e.g. Campus360 admin ⊃ registrar).
 *
 * This check is used as an ACL *script* together with the ACL's role list, so access requires BOTH
 * the role check and explicit membership. It never grants access on its own.
 */

const ROLE_PATTERN = /^x_774308_campus360\.[a-z_]+$/

export function hasExplicitRole(roleNames: readonly string[]): boolean {
    const user = gs.getUser()
    if (!user) return false
    const sessionRoles = String(user.getRoles() || '').split(',')
    for (const name of roleNames) {
        if (!ROLE_PATTERN.test(name)) continue
        if (user.hasAssignedRole(name) === true) return true
        if (sessionRoles.indexOf(name) > -1) return true
    }
    return false
}

type CurrentRecord = GlideRecord<string> | null | undefined

/** Sensitive student / registration fields: registrar (also inherited by Campus360 admin). */
export function hasExplicitRegistrarRole(_current: CurrentRecord): boolean {
    return hasExplicitRole(['x_774308_campus360.registrar'])
}

/** Sensitive faculty / onboarding fields: faculty_admin (also inherited by Campus360 admin). */
export function hasExplicitFacultyAdminRole(_current: CurrentRecord): boolean {
    return hasExplicitRole(['x_774308_campus360.faculty_admin'])
}
