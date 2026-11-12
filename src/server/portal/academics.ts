import { isSysId, planRegistrarReview, validateMarks } from './core.ts'
import { bodyOf, fail, hasElement, ok, pick, rows, secure, viewer } from './http.ts'

const P = 'x_774308_campus360_'
const ME = 'DYNAMIC90d1921e5f510100a9ad2572f2b477fe'

/** GET /classes — sections the faculty member teaches or co-teaches, with recent/upcoming sessions. */
export function getClasses(request: any, response: any): void {
    const fac = rows(P + 'faculty', 'user' + ME, ['employee_id', 'department', 'designation'], 1)[0]
    if (!fac) return ok(response, { faculty: null, sections: [], sessions: [] })
    const sections = rows(P + 'course_sec', 'statusINplanned,active^faculty=' + fac.sys_id + '^ORco_instructorsLIKE' + fac.sys_id, ['name', 'course', 'term', 'section', 'enrolled_count', 'max_students', 'status', 'room', 'laboratory'], 100, 'ORDERBYname')
    const ids = sections.map((s) => s.sys_id).join(',')
    const sessions = ids
        ? rows(P + 'class_sess', 'course_sectionIN' + ids + '^session_dateRELATIVEGE@dayofweek@ago@14', ['number', 'course_section', 'session_date', 'start_time', 'end_time', 'session_type', 'status', 'attendance_status', 'present_count', 'absent_count', 'topic'], 200, 'ORDERBYDESCsession_date')
        : []
    ok(response, { faculty: fac, sections, sessions })
}

/** GET /sessions/{id}/roster — enrolled students + existing marks for a session the user can read. */
export function getRoster(request: any, response: any): void {
    const id = String(request.pathParams.id || '')
    const sess = secure(P + 'class_sess')
    if (!isSysId(id) || !sess.get(id)) return fail(response, 404, 'Session not found or not visible to you.')
    const section = sess.getValue('course_section')
    const enrolled = rows(P + 'enrollment', 'course_section=' + section + '^status=enrolled', ['student', 'attendance_pct'], 500, 'ORDERBYstudent')
    const marks = rows(P + 'stu_attend', 'class_session=' + id, ['student', 'status', 'remarks', 'marked_by', 'marked_at', 'locked'], 500)
    const byStudent: any = {}
    for (const m of marks) byStudent[m.student ? m.student.value : ''] = m
    const sa = secure(P + 'stu_attend')
    ok(response, {
        session: pick(sess, ['number', 'course_section', 'session_date', 'start_time', 'end_time', 'session_type', 'status', 'attendance_status', 'topic']),
        canMark: sa.canCreate(),
        students: enrolled.map((e) => ({ enrollment: e, mark: byStudent[e.student ? e.student.value : ''] || null })),
    })
}

/** POST /sessions/{id}/attendance — upsert marks as the user. Unique index (class_session, student) still applies. */
export function saveAttendance(request: any, response: any): void {
    const id = String(request.pathParams.id || '')
    const sess = secure(P + 'class_sess')
    if (!isSysId(id) || !sess.get(id)) return fail(response, 404, 'Session not found or not visible to you.')
    const marks = validateMarks(bodyOf(request))
    if ('error' in marks) return fail(response, 400, marks.error)
    const results: any[] = []
    for (const m of marks) {
        const existing = secure(P + 'stu_attend')
        existing.addQuery('class_session', id)
        existing.addQuery('student', m.student)
        existing.query()
        if (existing.next()) {
            if (!existing.canWrite()) { results.push({ student: m.student, ok: false, error: 'Locked or not editable by you.' }); continue }
            existing.setValue('status', m.status)
            if (m.remarks) existing.setValue('remarks', m.remarks)
            results.push({ student: m.student, ok: !!existing.update(), action: 'updated' })
        } else {
            const gr = secure(P + 'stu_attend')
            gr.initialize()
            gr.setValue('class_session', id)
            gr.setValue('student', m.student)
            gr.setValue('status', m.status)
            if (m.remarks) gr.setValue('remarks', m.remarks)
            const newId = gr.insert()
            results.push({ student: m.student, ok: !!newId, action: 'created', error: newId ? undefined : 'Not saved (permission, or already recorded by someone else).' })
        }
    }
    ok(response, { saved: results.filter((r) => r.ok).length, failed: results.filter((r) => !r.ok).length, results })
}

/** GET /registrations — registrar work list (ACL-filtered: registrar all, HOD own department, applicant own). */
export function getRegistrations(request: any, response: any): void {
    ok(response, rows(P + 'student_reg', 'stateIN1,2,10,11', ['number', 'first_name', 'last_name', 'applicant_email', 'program', 'admission_term', 'admission_category', 'state', 'documents_verified', 'registrar_recommendation', 'registrar_reviewed_by', 'registrar_reviewed_at', 'sys_created_on'], 200, 'ORDERBYsys_created_on'))
}

/** POST /registrations/{id}/review — the existing Registrar Review step (state 1/2 → 10 / 12 / 2). */
export function reviewRegistration(request: any, response: any): void {
    const id = String(request.pathParams.id || '')
    const gr = secure(P + 'student_reg')
    if (!isSysId(id) || !gr.get(id)) return fail(response, 404, 'Registration not found or not visible to you.')
    if (viewer().personas.indexOf('registrar') < 0 && viewer().personas.indexOf('admin') < 0) return fail(response, 403, 'Only the registrar can review registrations.')
    const plan = planRegistrarReview(String(gr.getValue('state')), bodyOf(request) || {})
    if ('error' in plan) return fail(response, 400, plan.error)
    for (const f in plan.values) {
        const el = gr.getElement(f)
        if (!hasElement(el) || !el.canWrite()) return fail(response, 403, 'You are not allowed to change ' + f + '.')
        gr.setValue(f, plan.values[f])
    }
    if (!gr.update()) return fail(response, 403, 'The review was rejected by a platform rule.')
    ok(response, pick(gr, ['number', 'state', 'registrar_recommendation', 'documents_verified', 'registrar_reviewed_by', 'registrar_reviewed_at']))
}
