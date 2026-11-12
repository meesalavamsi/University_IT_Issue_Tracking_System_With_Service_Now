import { gs } from '@servicenow/glide'
import { canWorkComplaint, canWorkIssue, isSysId, planComplaintAction, planIssueAction } from './core.ts'
import { bodyOf, fail, hasElement, ok, pick, rows, secure, viewer, type Viewer } from './http.ts'

const P = 'x_774308_campus360_'
const ME = 'DYNAMIC90d1921e5f510100a9ad2572f2b477fe'
const MY_GROUPS = 'DYNAMICd6435e965f510100a9ad2572f2b47744'
const ISSUE_FIELDS = ['number', 'short_description', 'state', 'priority', 'category', 'subcategory', 'caller', 'assignment_group', 'assigned_to', 'location', 'hostel', 'laboratory', 'on_hold_reason', 'escalated_incident', 'sys_created_on', 'sys_updated_on']

/** GET /queue — IT work queue. Technicians: their groups + assigned to them. IT managers/admin: all active. */
export function getQueue(request: any, response: any): void {
    const v = viewer()
    const manager = v.personas.indexOf('it_manager') > -1 || v.personas.indexOf('admin') > -1
    if (!manager && v.personas.indexOf('technician') < 0) return fail(response, 403, 'The IT queue is available to IT support staff only.')
    const scope = manager ? 'active=true' : 'active=true^assignment_group' + MY_GROUPS + '^ORassigned_to' + ME
    const items = rows(P + 'it_issue', scope, ISSUE_FIELDS, 200, 'ORDERBYpriority^ORDERBYsys_created_on')
    const now = new Date().getTime()
    let overdue = 0
    for (const i of items) {
        const created = Date.parse(String(i.sys_created_on ? i.sys_created_on.value : '').replace(' ', 'T') + 'Z')
        i.overdue = !isNaN(created) && now - created > 3 * 24 * 3600 * 1000
        if (i.overdue) overdue++
    }
    ok(response, { scope: manager ? 'all' : 'my_groups', items, overdue })
}

/** Server-side operational authority for an IT issue (see core.canWorkIssue). */
function mayWorkIssue(gr: any, v: Viewer): boolean {
    const group = String(gr.getValue('assignment_group') || '')
    return canWorkIssue(v.personas, !!group && gs.getUser().isMemberOf(group) === true)
}

/** Server-side operational authority for a hostel complaint (see core.canWorkComplaint). */
function mayWorkComplaint(gr: any, v: Viewer): boolean {
    const hostelId = String(gr.getValue('hostel') || '')
    let isWarden = false
    if (isSysId(hostelId)) {
        const h = secure(P + 'hostel')
        if (h.get(hostelId)) isWarden = h.getValue('warden') === v.userId || h.getValue('assistant_warden') === v.userId
    }
    return canWorkComplaint(v.personas, isWarden)
}

function applyPlanned(gr: any, values: { [f: string]: string }, workNote: string): string {
    for (const f in values) {
        const el = gr.getElement(f)
        if (!hasElement(el) || !el.canWrite()) return 'You are not allowed to change ' + f + '.'
        gr.setValue(f, values[f])
    }
    if (workNote) {
        const wn = gr.getElement('work_notes')
        if (!hasElement(wn) || !wn.canWrite()) return 'You are not allowed to add work notes.'
        // rev 3.1 (DEF-3): setValue('work_notes', …) is silently discarded on this instance, and
        // setJournalEntry() is not allowed in this application scope. Property assignment is the
        // supported form (verified in scope on GlideRecordSecure to store a journal entry).
        gr.work_notes = workNote
    }
    return gr.update() ? '' : 'The update was rejected by a platform rule.'
}

/** POST /issues/{id}/action — start / hold / resume / resolve / reopen / cancel / note, as the user. */
export function issueAction(request: any, response: any): void {
    const id = String(request.pathParams.id || '')
    if (!isSysId(id)) return fail(response, 400, 'Invalid issue.')
    const gr = secure(P + 'it_issue')
    if (!gr.get(id)) return fail(response, 404, 'Issue not found or not visible to you.')
    const v = viewer()
    if (!gr.canWrite() || !mayWorkIssue(gr, v)) return fail(response, 403, 'Only IT staff of the assigned group (or IT managers) can work this issue.')
    const body = bodyOf(request) || {}
    const plan = planIssueAction(String(gr.getValue('state')), body)
    if ('error' in plan) return fail(response, 400, plan.error)
    if (body.action === 'start' && !gr.getValue('assigned_to')) plan.values.assigned_to = v.userId
    const err = applyPlanned(gr, plan.values, plan.workNote)
    if (err) return fail(response, 403, err)
    ok(response, pick(gr, ISSUE_FIELDS))
}

/** POST /issues/{id}/assign-me — take ownership (assigned_to = me). */
export function assignToMe(request: any, response: any): void {
    const id = String(request.pathParams.id || '')
    const gr = secure(P + 'it_issue')
    if (!isSysId(id) || !gr.get(id)) return fail(response, 404, 'Issue not found or not visible to you.')
    const v = viewer()
    if (!gr.canWrite() || !mayWorkIssue(gr, v)) return fail(response, 403, 'Only IT staff of the assigned group (or IT managers) can take this issue.')
    const err = applyPlanned(gr, { assigned_to: v.userId }, '')
    if (err) return fail(response, 403, err)
    ok(response, pick(gr, ISSUE_FIELDS))
}

/** GET /hostel — warden view of THEIR hostels: rooms, occupancy, residents (+authorised guardian contact), open complaints. */
export function getHostel(request: any, response: any): void {
    const v = viewer()
    if (v.personas.indexOf('warden') < 0 && v.personas.indexOf('admin') < 0) return fail(response, 403, 'Hostel management is available to wardens only.')
    const hostels = rows(P + 'hostel', 'warden' + ME + '^ORassistant_warden' + ME, ['code', 'name', 'hostel_type', 'total_capacity', 'occupied_beds', 'contact_phone'], 20)
    const ids = hostels.map((h) => h.sys_id).join(',')
    if (!ids) return ok(response, { hostels: [], rooms: [], residents: [], complaints: [] })
    const rooms = rows(P + 'hostel_room', 'hostelIN' + ids, ['name', 'hostel', 'floor', 'room_type', 'capacity', 'occupied', 'status'], 500, 'ORDERBYname')
    const allocs = rows(P + 'room_alloc', 'status=active^hostel_room.hostelIN' + ids, ['student', 'hostel_room', 'bed_label', 'start_date'], 500)
    const residents = allocs.map((a) => {
        const s = secure(P + 'student')
        const visible = a.student && s.get(a.student.value)
        return { allocation: a, student: visible ? pick(s, ['student_id', 'department', 'program', 'guardian_name', 'guardian_phone']) : null }
    })
    const complaints = rows(P + 'hostel_cmpl', 'active=true^hostelIN' + ids, ['number', 'short_description', 'state', 'complaint_type', 'hostel_room', 'caller', 'is_confidential', 'sys_created_on'], 200, 'ORDERBYsys_created_on')
    ok(response, { hostels, rooms, residents, complaints })
}

/** POST /complaints/{id}/action — warden actions on hostel complaints. */
export function complaintAction(request: any, response: any): void {
    const id = String(request.pathParams.id || '')
    const gr = secure(P + 'hostel_cmpl')
    if (!isSysId(id) || !gr.get(id)) return fail(response, 404, 'Complaint not found or not visible to you.')
    if (!gr.canWrite() || !mayWorkComplaint(gr, viewer())) return fail(response, 403, 'Only the warden of this hostel (or a Campus360 administrator) can work this complaint.')
    const plan = planComplaintAction(String(gr.getValue('state')), bodyOf(request) || {})
    if ('error' in plan) return fail(response, 400, plan.error)
    const err = applyPlanned(gr, plan.values, plan.workNote)
    if (err) return fail(response, 403, err)
    ok(response, pick(gr, ['number', 'short_description', 'state', 'complaint_type']))
}

/** GET /maintenance — maintenance work orders visible to the user (ACL-filtered). */
export function getMaintenance(request: any, response: any): void {
    ok(response, rows(P + 'maint_req', 'active=true', ['number', 'short_description', 'state', 'maintenance_type', 'location', 'laboratory', 'hostel', 'assignment_group', 'assigned_to', 'scheduled_start'], 200, 'ORDERBYsys_created_on'))
}
