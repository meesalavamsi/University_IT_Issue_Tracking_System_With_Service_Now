import { gs, GlideDateTime, type GlideRecord } from '@servicenow/glide'

/**
 * Before-update rule on student_reg: when the registrar recommendation changes, stamp who reviewed
 * it and when. These fields are server-maintained (write ACL: admin only, security audit F2), so the
 * stamp is trustworthy and cannot be supplied by a client.
 */
export function stampRegistrarReview(current: GlideRecord<'x_774308_campus360_student_reg'>, previous: GlideRecord<'x_774308_campus360_student_reg'>): void {
    if (!previous) return
    if (current.getValue('registrar_recommendation') === previous.getValue('registrar_recommendation')) return
    current.setValue('registrar_reviewed_by', gs.getUserID())
    current.setValue('registrar_reviewed_at', new GlideDateTime().getValue())
}
