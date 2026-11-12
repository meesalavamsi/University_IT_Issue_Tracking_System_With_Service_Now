import { validateNewRequest, isSysId } from './core.ts'
import { bodyOf, created, fail, ok, pick, rows, secure, viewer } from './http.ts'

const P = 'x_774308_campus360_'
const ME = 'DYNAMIC90d1921e5f510100a9ad2572f2b477fe'

function activeAllocation(): any {
    const a = secure(P + 'room_alloc')
    a.addEncodedQuery('student.user' + ME + '^status=active')
    a.setLimit(1)
    a.query()
    if (!a.next()) return null
    const room = secure(P + 'hostel_room')
    const hostelId = room.get(a.getValue('hostel_room')) ? room.getValue('hostel') : ''
    return {
        allocation: a.getValue('number'),
        hostel_room: { value: a.getValue('hostel_room'), display: a.getDisplayValue('hostel_room') },
        hostel: { value: hostelId, display: hostelId ? room.getDisplayValue('hostel') : '' },
        bed: a.getValue('bed_label') || '',
        since: a.getValue('start_date') || '',
    }
}

/** GET /me — who am I, which personas, my profile(s), my hostel, my attendance summary. */
export function getMe(request: any, response: any): void {
    const v = viewer()
    const student = rows(P + 'student', 'user' + ME, ['student_id', 'department', 'program', 'current_semester', 'section', 'status', 'hostel_resident', 'advisor', 'personal_phone', 'personal_email'], 1)[0] || null
    const faculty = rows(P + 'faculty', 'user' + ME, ['employee_id', 'department', 'designation', 'status', 'office_location', 'joining_date'], 1)[0] || null
    const enrollments = student
        ? rows(P + 'enrollment', 'student=' + student.sys_id + '^status=enrolled', ['course_section', 'sessions_held', 'sessions_attended', 'attendance_pct', 'exam_eligible'], 50)
        : []
    ok(response, { user: { sys_id: v.userId, user_name: v.userName, name: v.displayName }, personas: v.personas, student, faculty, hostel: student ? activeAllocation() : null, enrollments })
}

/** GET /catalog — options for the "Raise a request" wizard (categories from the existing config tables). */
export function getCatalog(request: any, response: any): void {
    const categories = rows(P + 'issue_cat', 'active=true^portal_visible=true', ['code', 'name', 'description', 'icon', 'requires_asset', 'requires_lab', 'requires_hostel', 'default_urgency'], 50, 'ORDERBYorder')
    const subcategories = rows(P + 'issue_sub', 'active=true', ['category', 'code', 'name'], 200, 'ORDERBYname')
    const laboratories = rows(P + 'laboratory', 'active=true', ['code', 'name', 'location'], 200, 'ORDERBYname')
    const hostels = rows(P + 'hostel', 'active=true', ['code', 'name', 'location'], 50, 'ORDERBYname')
    ok(response, { categories, subcategories, laboratories, hostels })
}

/** POST /requests — creates the ACTUAL record (it_issue / hostel_cmpl / maint_req) as the user. */
export function createRequest(request: any, response: any): void {
    const body = bodyOf(request) || {}
    const v = viewer()
    if (body.kind === 'hostel' && v.personas.indexOf('student') > -1 && v.personas.indexOf('warden') < 0) {
        const mine = activeAllocation()
        if (!mine) return fail(response, 403, 'Hostel complaints can only be raised by current hostel residents.')
        body.hostel = mine.hostel.value
        body.hostel_room = mine.hostel_room.value
    }
    if (body.kind === 'maintenance' && !isSysId(body.location)) {
        const src = isSysId(body.laboratory) ? secure(P + 'laboratory') : isSysId(body.hostel) ? secure(P + 'hostel') : null
        if (src && src.get(isSysId(body.laboratory) ? body.laboratory : body.hostel)) body.location = src.getValue('location')
    }
    const valid = validateNewRequest(body)
    if ('error' in valid) return fail(response, 400, valid.error)
    const gr = secure(valid.table)
    if (!gr.canCreate()) return fail(response, 403, 'You are not allowed to raise this type of request.')
    gr.initialize()
    gr.setValue('caller', v.userId)
    for (const f in valid.values) gr.setValue(f, valid.values[f])
    const id = gr.insert()
    if (!id) return fail(response, 403, 'The request could not be created (permission or validation rule).')
    created(response, { sys_id: id, table: valid.table, number: gr.getValue('number') })
}

const TRACKED = [
    { table: P + 'it_issue', type: 'IT issue', extra: 'category' },
    { table: P + 'hostel_cmpl', type: 'Hostel complaint', extra: 'complaint_type' },
    { table: P + 'maint_req', type: 'Maintenance', extra: 'maintenance_type' },
]

/** GET /requests/mine — the user's own requests across the three existing request tables. */
export function getMyRequests(request: any, response: any): void {
    const out: any[] = []
    for (const t of TRACKED) {
        for (const r of rows(t.table, 'caller' + ME + '^ORopened_by' + ME, ['number', 'short_description', 'state', 'priority', 'assignment_group', 'assigned_to', 'sys_created_on', 'sys_updated_on', t.extra], 50, 'ORDERBYDESCsys_updated_on')) {
            r.table = t.table
            r.type = t.type
            r.kind = t.extra
            out.push(r)
        }
    }
    out.sort((a, b) => (b.sys_updated_on ? b.sys_updated_on.value : '').localeCompare(a.sys_updated_on ? a.sys_updated_on.value : ''))
    ok(response, out)
}

/** GET /records/{table}/{id} — header summary for a record the user can read (detail pages use RecordProvider). */
export function getRecordSummary(request: any, response: any): void {
    const table = String(request.pathParams.table || '')
    const id = String(request.pathParams.id || '')
    if (table.indexOf(P) !== 0 || !isSysId(id)) return fail(response, 400, 'Invalid record reference.')
    const gr = secure(table)
    if (!gr.get(id)) return fail(response, 404, 'Record not found or not visible to you.')
    ok(response, pick(gr, ['number', 'short_description', 'state', 'priority', 'assignment_group', 'assigned_to', 'caller', 'sys_created_on', 'sys_updated_on', 'opened_at', 'resolved_at', 'closed_at', 'escalated_incident']))
}
