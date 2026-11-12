// Unit tests for the REAL portal rules module (src/server/portal/core.ts).
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { personasFromRoles, validateNewRequest, planIssueAction, planComplaintAction, validateMarks, planRegistrarReview, isSysId, canWorkIssue, canWorkComplaint } from '../../src/server/portal/core.ts'

const ID = 'a'.repeat(32)
const ID2 = 'b'.repeat(32)
const err = (r) => assert.ok(r && r.error, 'expected an error, got ' + JSON.stringify(r))

describe('personas come only from explicit Campus360 roles', () => {
    test('maps scoped roles', () => assert.deepEqual(personasFromRoles(['x_774308_campus360.student', 'x_774308_campus360.user', 'itil']), ['student']))
    test('platform admin role alone gives no persona', () => assert.deepEqual(personasFromRoles(['admin', 'security_admin']), []))
    test('inherited roles present in the session list are honoured', () =>
        assert.deepEqual(personasFromRoles(['x_774308_campus360.admin', 'x_774308_campus360.registrar', 'x_774308_campus360.leadership']), ['registrar', 'leadership', 'admin']))
})

describe('validateNewRequest maps to EXISTING tables and fields', () => {
    test('IT issue', () => {
        const r = validateNewRequest({ kind: 'it', category: ID, subcategory: ID2, short_description: 'No Wi-Fi in room', urgency: '2' })
        assert.equal(r.table, 'x_774308_campus360_it_issue')
        assert.equal(r.values.category, ID)
        assert.equal(r.values.channel, 'portal')
    })
    test('hostel complaint', () => {
        const r = validateNewRequest({ kind: 'hostel', complaint_type: 'water_supply', hostel: ID, short_description: 'No hot water' })
        assert.equal(r.table, 'x_774308_campus360_hostel_cmpl')
    })
    test('maintenance', () => assert.equal(validateNewRequest({ kind: 'maintenance', maintenance_type: 'hvac', location: ID, short_description: 'AC broken' }).table, 'x_774308_campus360_maint_req'))
    test('maintenance keeps the hostel (warden visibility) and ignores an invalid one', () => {
        assert.equal(validateNewRequest({ kind: 'maintenance', maintenance_type: 'hvac', location: ID, hostel: ID, short_description: 'AC broken' }).values.hostel, ID)
        assert.equal(validateNewRequest({ kind: 'maintenance', maintenance_type: 'hvac', location: ID, hostel: 'nope', short_description: 'AC broken' }).values.hostel, undefined)
    })
    test('rejects short titles', () => err(validateNewRequest({ kind: 'it', category: ID, short_description: 'x' })))
    test('rejects unknown kind', () => err(validateNewRequest({ kind: 'incident', short_description: 'hello world' })))
    test('rejects injected sys_ids', () => err(validateNewRequest({ kind: 'it', category: ID + '^ORactive=true', short_description: 'hello world' })))
    test('rejects unknown complaint type', () => err(validateNewRequest({ kind: 'hostel', complaint_type: 'anything', hostel: ID, short_description: 'hello world' })))
    test('does not accept caller/state/assignment from the client', () => {
        const r = validateNewRequest({ kind: 'it', category: ID, short_description: 'hello world', state: '6', assignment_group: ID, caller: ID2 })
        assert.equal(r.values.state, undefined)
        assert.equal(r.values.assignment_group, undefined)
        assert.equal(r.values.caller, undefined)
    })
    test('truncates oversized text', () => assert.equal(validateNewRequest({ kind: 'it', category: ID, short_description: 'x'.repeat(500) }).values.short_description.length, 160))
})

describe('planIssueAction follows the deployed state set only', () => {
    test('New → start → In Progress', () => assert.equal(planIssueAction('1', { action: 'start' }).values.state, '2'))
    test('hold needs a valid reason', () => { err(planIssueAction('2', { action: 'hold' })); assert.equal(planIssueAction('2', { action: 'hold', on_hold_reason: 'awaiting_parts' }).values.state, '-5') })
    test('resolve needs code + notes', () => {
        err(planIssueAction('2', { action: 'resolve', resolution_code: 'fixed' }))
        const p = planIssueAction('2', { action: 'resolve', resolution_code: 'fixed', close_notes: 'Replaced router' })
        assert.equal(p.values.state, '6')
    })
    test('cannot resolve a closed issue', () => err(planIssueAction('3', { action: 'resolve', resolution_code: 'fixed', close_notes: 'done done' })))
    test('reopen only from Resolved', () => { err(planIssueAction('2', { action: 'reopen' })); assert.equal(planIssueAction('6', { action: 'reopen' }).values.state, '2') })
    test('unknown action rejected', () => err(planIssueAction('1', { action: 'escalate' })))
    test('note requires text', () => { err(planIssueAction('2', { action: 'note' })); assert.equal(planIssueAction('2', { action: 'note', work_note: 'Called user' }).workNote, 'Called user') })
})

describe('planComplaintAction', () => {
    test('start / resolve', () => {
        assert.equal(planComplaintAction('1', { action: 'start' }).values.state, '2')
        err(planComplaintAction('2', { action: 'resolve' }))
        assert.equal(planComplaintAction('2', { action: 'resolve', close_notes: 'Fixed tap' }).values.state, '6')
    })
    test('no transitions from Closed', () => err(planComplaintAction('3', { action: 'start' })))
    test('resolve with whitespace-only notes rejected', () => err(planComplaintAction('1', { action: 'resolve', close_notes: '    ' })))
    test('resolve allowed from New, In Progress and On Hold only', () => {
        for (const s of ['1', '2', '-5']) assert.equal(planComplaintAction(s, { action: 'resolve', close_notes: 'Fixed tap' }).values.state, '6')
        for (const s of ['6', '3', '7']) err(planComplaintAction(s, { action: 'resolve', close_notes: 'Fixed tap' }))
    })
    test('resolve stores close_notes (audited field)', () => assert.equal(planComplaintAction('2', { action: 'resolve', close_notes: 'Fixed tap' }).values.close_notes, 'Fixed tap'))
})

describe('Cancel Issue requires a work note (server-side)', () => {
    test('cancel without a work note is rejected', () => err(planIssueAction('2', { action: 'cancel' })))
    test('cancel with a too-short note is rejected', () => err(planIssueAction('2', { action: 'cancel', work_note: ' ok ' })))
    test('cancel with a note → state 7 and the note is journaled', () => {
        const p = planIssueAction('2', { action: 'cancel', work_note: 'Duplicate of ITI0001001' })
        assert.equal(p.values.state, '7'); assert.equal(p.workNote, 'Duplicate of ITI0001001')
    })
    test('cannot cancel Resolved / Closed / Cancelled issues', () => { for (const s of ['6', '3', '7']) err(planIssueAction(s, { action: 'cancel', work_note: 'not needed' })) })
})

describe('Operational authority (server-side, narrows ACLs)', () => {
    test('IT manager and Campus360 admin may work any issue', () => { assert.equal(canWorkIssue(['it_manager'], false), true); assert.equal(canWorkIssue(['admin'], false), true) })
    test('technician only for issues of their assigned group', () => { assert.equal(canWorkIssue(['technician'], true), true); assert.equal(canWorkIssue(['technician'], false), false) })
    test('caller-only personas (student, faculty, warden) may never work issues', () => {
        for (const p of [['student'], ['faculty'], ['warden'], ['hod'], ['leadership'], []]) assert.equal(canWorkIssue(p, true), false)
    })
    test('warden only for complaints of hostels they warden', () => { assert.equal(canWorkComplaint(['warden'], true), true); assert.equal(canWorkComplaint(['warden'], false), false) })
    test('Campus360 admin may work any complaint; students/leadership/technicians never', () => {
        assert.equal(canWorkComplaint(['admin'], false), true)
        for (const p of [['student'], ['leadership'], ['technician'], ['it_manager'], []]) assert.equal(canWorkComplaint(p, true), false)
    })
})

describe('validateMarks', () => {
    test('valid marks', () => assert.equal(validateMarks({ marks: [{ student: ID, status: 'present' }, { student: ID2, status: 'absent' }] }).length, 2))
    test('duplicate student in one submission rejected', () => err(validateMarks({ marks: [{ student: ID, status: 'present' }, { student: ID, status: 'absent' }] })))
    test('invalid status rejected', () => err(validateMarks({ marks: [{ student: ID, status: 'deleted' }] })))
    test('invalid student id rejected', () => err(validateMarks({ marks: [{ student: 'x', status: 'present' }] })))
    test('empty rejected', () => err(validateMarks({ marks: [] })))
})

describe('planRegistrarReview (existing states)', () => {
    test('recommend requires verified documents → 10', () => {
        err(planRegistrarReview('1', { recommendation: 'recommend', documents_verified: false }))
        assert.equal(planRegistrarReview('1', { recommendation: 'recommend', documents_verified: true }).values.state, '10')
    })
    test('reject needs a reason → 12', () => { err(planRegistrarReview('2', { recommendation: 'reject' })); assert.equal(planRegistrarReview('2', { recommendation: 'reject', notes: 'Incomplete' }).values.state, '12') })
    test('more info → 2', () => assert.equal(planRegistrarReview('1', { recommendation: 'more_info' }).values.state, '2'))
    test('cannot review past the registrar step', () => err(planRegistrarReview('10', { recommendation: 'recommend', documents_verified: true })))
})

test('isSysId', () => { assert.equal(isSysId(ID), true); assert.equal(isSysId('nope'), false) })
