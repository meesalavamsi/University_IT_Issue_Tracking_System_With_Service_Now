import { fail, ok, secure, viewer } from './http.ts'

const P = 'x_774308_campus360_'
const CAP = 5000

/** Buckets ACL-readable rows by field values (iterates GlideRecordSecure, so counts never exceed what the user can read). */
function bucket(table: string, query: string, fields: string[]): { total: number; by: any; capped: boolean } {
    const gr = secure(table)
    gr.addEncodedQuery(query)
    gr.setLimit(CAP)
    gr.query()
    const by: any = {}
    for (const f of fields) by[f] = {}
    let total = 0
    while (gr.next()) {
        total++
        for (const f of fields) {
            const k = gr.getDisplayValue(f) || '(empty)'
            by[f][k] = (by[f][k] || 0) + 1
        }
    }
    return { total, by, capped: total >= CAP }
}

/** GET /stats — campus operations statistics, computed only from rows the caller can read. */
export function getStats(request: any, response: any): void {
    const v = viewer()
    const allowed = ['leadership', 'admin', 'it_manager', 'hod', 'registrar', 'warden', 'technician', 'lab_admin', 'maintenance']
    if (!v.personas.some((p) => allowed.indexOf(p) > -1)) return fail(response, 403, 'Statistics are available to staff and management.')
    const issues = bucket(P + 'it_issue', 'sys_idISNOTEMPTY', ['state', 'category', 'priority'])
    const openIssues = bucket(P + 'it_issue', 'active=true', ['assignment_group'])
    const complaints = bucket(P + 'hostel_cmpl', 'sys_idISNOTEMPTY', ['state', 'complaint_type'])
    const maintenance = bucket(P + 'maint_req', 'sys_idISNOTEMPTY', ['state', 'maintenance_type'])
    const registrations = bucket(P + 'student_reg', 'sys_idISNOTEMPTY', ['state'])
    const h = secure(P + 'hostel')
    h.addActiveQuery()
    h.query()
    let capacity = 0
    let occupied = 0
    while (h.next()) {
        capacity += parseInt(h.getValue('total_capacity') || '0', 10)
        occupied += parseInt(h.getValue('occupied_beds') || '0', 10)
    }
    ok(response, { issues, openIssues, complaints, maintenance, registrations, hostel: { capacity, occupied } })
}

const TABLES = ['department', 'program', 'course', 'course_sec', 'enrollment', 'student', 'faculty', 'technician', 'acad_term', 'issue_cat', 'issue_sub', 'it_issue', 'hostel', 'hostel_room', 'room_alloc', 'hostel_cmpl', 'laboratory', 'maint_req', 'pm_schedule', 'class_sess', 'stu_attend', 'fac_attend', 'student_reg', 'fac_onboard', 'onboard_tsk', 'onb_tmpl']

/** GET /admin/overview — Campus360 admin: readable record counts per table (no platform-level data). */
export function getAdminOverview(request: any, response: any): void {
    if (viewer().personas.indexOf('admin') < 0) return fail(response, 403, 'Campus360 administrators only.')
    const tables = TABLES.map((t) => {
        const gr = secure(P + t)
        gr.setLimit(CAP)
        gr.query()
        let n = 0
        while (gr.next()) n++
        return { table: P + t, name: t, readable: n, capped: n >= CAP }
    })
    ok(response, { tables })
}
