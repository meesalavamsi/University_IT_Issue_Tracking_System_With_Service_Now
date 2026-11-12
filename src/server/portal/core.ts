/**
 * Campus360 portal API — pure rules (no platform imports, unit-tested in test/portal).
 * These rules only VALIDATE input and choose WHICH existing backend transition to request.
 * Authorization is never decided here: every read/write is executed with GlideRecordSecure
 * as the logged-in user, so the deployed ACLs, business rules and unique indexes decide.
 */

export const SCOPE_ROLE = 'x_774308_campus360.'
export type Persona = 'student' | 'faculty' | 'hod' | 'warden' | 'technician' | 'it_manager' | 'maintenance' | 'lab_admin' | 'registrar' | 'faculty_admin' | 'leadership' | 'admin'

/** Personas from the user's EXPLICIT Campus360 roles (session role list, not gs.hasRole). */
export function personasFromRoles(roleList: string[]): Persona[] {
    const all: Persona[] = ['student', 'faculty', 'hod', 'warden', 'technician', 'it_manager', 'maintenance', 'lab_admin', 'registrar', 'faculty_admin', 'leadership', 'admin']
    return all.filter((p) => roleList.indexOf(SCOPE_ROLE + p) > -1)
}

const SYS_ID = /^[0-9a-f]{32}$/
export const isSysId = (v: unknown): v is string => typeof v === 'string' && SYS_ID.test(v)
const clean = (v: unknown, max: number): string => (typeof v === 'string' ? v.trim().slice(0, max) : '')

export type RequestKind = 'it' | 'hostel' | 'maintenance'
export interface ValidRequest { kind: RequestKind; table: string; values: { [field: string]: string } }
export interface ValidationError { error: string }

const HOSTEL_TYPES = ['plumbing', 'electrical', 'furniture', 'cleanliness', 'pest_control', 'mess_food', 'water_supply', 'security', 'roommate', 'noise', 'other']
const MAINT_TYPES = ['electrical', 'plumbing', 'civil', 'hvac', 'carpentry', 'painting', 'cleaning', 'it_infra', 'network_cabling', 'equipment_service', 'other']
const URGENCY = ['1', '2', '3']

/** Validates a "Raise a request" payload and maps it onto the EXISTING table + fields. */
export function validateNewRequest(body: any): ValidRequest | ValidationError {
    if (!body || typeof body !== 'object') return { error: 'Request body is required.' }
    const kind = body.kind as RequestKind
    const short = clean(body.short_description, 160)
    const description = clean(body.description, 4000)
    if (short.length < 5) return { error: 'Please enter a title of at least 5 characters.' }
    const urgency = URGENCY.indexOf(String(body.urgency)) > -1 ? String(body.urgency) : '3'
    if (kind === 'it') {
        if (!isSysId(body.category)) return { error: 'Please choose an issue category.' }
        const v: { [f: string]: string } = { category: body.category, short_description: short, description, urgency, channel: 'portal' }
        if (isSysId(body.subcategory)) v.subcategory = body.subcategory
        if (isSysId(body.laboratory)) v.laboratory = body.laboratory
        if (isSysId(body.hostel)) v.hostel = body.hostel
        if (isSysId(body.hostel_room)) v.hostel_room = body.hostel_room
        if (isSysId(body.location)) v.location = body.location
        const room = clean(body.room_detail, 60)
        if (room) v.room_detail = room
        return { kind, table: 'x_774308_campus360_it_issue', values: v }
    }
    if (kind === 'hostel') {
        if (HOSTEL_TYPES.indexOf(body.complaint_type) < 0) return { error: 'Please choose a complaint type.' }
        if (!isSysId(body.hostel)) return { error: 'Your hostel could not be determined.' }
        const v: { [f: string]: string } = { complaint_type: body.complaint_type, hostel: body.hostel, short_description: short, description }
        if (isSysId(body.hostel_room)) v.hostel_room = body.hostel_room
        if (body.is_confidential === true) v.is_confidential = 'true'
        return { kind, table: 'x_774308_campus360_hostel_cmpl', values: v }
    }
    if (kind === 'maintenance') {
        if (MAINT_TYPES.indexOf(body.maintenance_type) < 0) return { error: 'Please choose a maintenance type.' }
        if (!isSysId(body.location)) return { error: 'Please choose a location.' }
        const v: { [f: string]: string } = { maintenance_type: body.maintenance_type, location: body.location, short_description: short, description, request_type: 'corrective' }
        if (isSysId(body.laboratory)) v.laboratory = body.laboratory
        // rev 3.1: keep the hostel on the work order (wardens see maintenance requests of their hostels).
        if (isSysId(body.hostel)) v.hostel = body.hostel
        return { kind, table: 'x_774308_campus360_maint_req', values: v }
    }
    return { error: 'Unknown request type.' }
}

/** IT issue lifecycle actions — only transitions defined by the deployed state set (DATABASE_SCHEMA §4.3). */
export type IssueAction = 'start' | 'hold' | 'resume' | 'resolve' | 'reopen' | 'cancel' | 'note'
const IT_TRANSITIONS: { [a in IssueAction]: { from: string[]; to: string | null } } = {
    start: { from: ['1'], to: '2' },
    hold: { from: ['1', '2'], to: '-5' },
    resume: { from: ['-5'], to: '2' },
    resolve: { from: ['1', '2', '-5'], to: '6' },
    reopen: { from: ['6'], to: '2' },
    cancel: { from: ['1', '2', '-5'], to: '7' },
    note: { from: ['1', '2', '-5', '6'], to: null },
}
const ON_HOLD = ['awaiting_caller', 'awaiting_parts', 'awaiting_vendor', 'scheduled_visit']
const RESOLUTION = ['fixed', 'workaround', 'hardware_replaced', 'config_change', 'user_guidance', 'duplicate', 'not_reproducible', 'vendor_referral', 'referred_maintenance']

export interface PlannedUpdate { values: { [f: string]: string }; workNote: string }

export function planIssueAction(currentState: string, body: any): PlannedUpdate | ValidationError {
    const action = body && body.action
    const t = IT_TRANSITIONS[action as IssueAction]
    if (!t) return { error: 'Unknown action.' }
    if (t.from.indexOf(currentState) < 0) return { error: 'This action is not allowed in the current state.' }
    const values: { [f: string]: string } = {}
    if (t.to) values.state = t.to
    if (action === 'hold') {
        if (ON_HOLD.indexOf(body.on_hold_reason) < 0) return { error: 'Choose an on-hold reason.' }
        values.on_hold_reason = body.on_hold_reason
    }
    if (action === 'resolve') {
        if (RESOLUTION.indexOf(body.resolution_code) < 0) return { error: 'Choose a resolution code.' }
        const notes = clean(body.close_notes, 4000)
        if (notes.length < 5) return { error: 'Resolution notes are required.' }
        values.resolution_code = body.resolution_code
        values.close_notes = notes
    }
    const workNote = clean(body.work_note, 4000)
    if (action === 'note' && !workNote) return { error: 'Enter a work note.' }
    if (action === 'cancel' && workNote.length < 5) return { error: 'A work note explaining the cancellation is required.' }
    return { values, workNote }
}

/**
 * Operational authority to WORK an IT issue (any lifecycle action, assign-to-me).
 * Mirrors RL-06 record-write ACLs (it_manager: all; technician: issues assigned to one of their groups)
 * and deliberately EXCLUDES the caller-comment ACL branch, so a technician cannot change the state of
 * an issue merely because they raised it. Narrows, never widens: ACLs are still evaluated afterwards.
 */
export function canWorkIssue(personas: Persona[], memberOfAssignedGroup: boolean): boolean {
    if (personas.indexOf('it_manager') > -1 || personas.indexOf('admin') > -1) return true
    return personas.indexOf('technician') > -1 && memberOfAssignedGroup
}

/**
 * Operational authority to WORK a hostel complaint: Campus360 admin, or a warden who is the warden /
 * assistant warden of the complaint's hostel. Excludes the caller-comment ACL branch.
 */
export function canWorkComplaint(personas: Persona[], isWardenOfComplaintHostel: boolean): boolean {
    if (personas.indexOf('admin') > -1) return true
    return personas.indexOf('warden') > -1 && isWardenOfComplaintHostel
}

/** Hostel complaint states (same set as IT issues, DATABASE_SCHEMA §5.4). */
export function planComplaintAction(currentState: string, body: any): PlannedUpdate | ValidationError {
    const map: { [a: string]: { from: string[]; to: string | null } } = {
        start: { from: ['1'], to: '2' }, hold: { from: ['1', '2'], to: '-5' }, resume: { from: ['-5'], to: '2' },
        resolve: { from: ['1', '2', '-5'], to: '6' }, note: { from: ['1', '2', '-5', '6'], to: null },
    }
    const t = body && map[body.action]
    if (!t) return { error: 'Unknown action.' }
    if (t.from.indexOf(currentState) < 0) return { error: 'This action is not allowed in the current state.' }
    const values: { [f: string]: string } = {}
    if (t.to) values.state = t.to
    if (body.action === 'resolve') {
        const notes = clean(body.close_notes, 4000)
        if (notes.length < 5) return { error: 'Resolution notes are required.' }
        values.close_notes = notes
    }
    const workNote = clean(body.work_note, 4000)
    if (body.action === 'note' && !workNote) return { error: 'Enter a work note.' }
    return { values, workNote }
}

export const ATTENDANCE_STATUSES = ['present', 'absent', 'late', 'excused', 'medical', 'on_duty']
export interface Mark { student: string; status: string; remarks: string }
export function validateMarks(body: any): Mark[] | ValidationError {
    if (!body || !Array.isArray(body.marks) || body.marks.length === 0) return { error: 'No attendance marks submitted.' }
    if (body.marks.length > 500) return { error: 'Too many marks in one submission.' }
    const out: Mark[] = []
    const seen: { [s: string]: boolean } = {}
    for (const m of body.marks) {
        if (!m || !isSysId(m.student)) return { error: 'Invalid student in attendance list.' }
        if (ATTENDANCE_STATUSES.indexOf(m.status) < 0) return { error: 'Invalid attendance status.' }
        if (seen[m.student]) return { error: 'A student appears twice in the submission.' }
        seen[m.student] = true
        out.push({ student: m.student, status: m.status, remarks: clean(m.remarks, 200) })
    }
    return out
}

/** Registrar review → existing student_reg states (1 Submitted, 2 Registrar Review, 10 Pending HOD, 12 Rejected). */
export function planRegistrarReview(currentState: string, body: any): PlannedUpdate | ValidationError {
    if (['1', '2'].indexOf(currentState) < 0) return { error: 'Only submitted or in-review registrations can be reviewed.' }
    const rec = body && body.recommendation
    const notes = clean(body && body.notes, 2000)
    const values: { [f: string]: string } = { documents_verified: body && body.documents_verified === true ? 'true' : 'false' }
    if (rec === 'recommend') {
        if (values.documents_verified !== 'true') return { error: 'Verify the documents before recommending.' }
        values.state = '10'
    } else if (rec === 'reject') {
        if (notes.length < 5) return { error: 'Give a reason for rejection.' }
        values.state = '12'
    } else if (rec === 'more_info') {
        values.state = '2'
    } else return { error: 'Choose a recommendation.' }
    values.registrar_recommendation = rec
    if (notes) values.verification_notes = notes
    return { values, workNote: '' }
}
