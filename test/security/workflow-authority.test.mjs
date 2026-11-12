// Revision 3: workflow authority used by the before-update guard business rules (native-form security).
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { mayChangeIssueWorkflow as issue, mayChangeComplaintWorkflow as cmpl, changedProtected, ISSUE_WORKFLOW_FIELDS, COMPLAINT_WORKFLOW_FIELDS } from '../../src/server/issue/workflow-authority.ts'

const none = { isSystem: false, itManager: false, technician: false, memberOfPreviousGroup: false }
describe('IT issue workflow authority', () => {
    test('technician assigned to the issue\'s group: allowed', () => assert.equal(issue({ ...none, technician: true, memberOfPreviousGroup: true }), true))
    test('technician outside the assigned group: denied (even if they raised it)', () => assert.equal(issue({ ...none, technician: true }), false))
    test('original ticket creator (student/faculty/warden, no technician role): denied even if "member"', () => assert.equal(issue({ ...none, memberOfPreviousGroup: true }), false))
    test('authorised IT manager: allowed for any group', () => assert.equal(issue({ ...none, itManager: true }), true))
    test('Campus360 administrator (contains it_manager): allowed', () => assert.equal(issue({ ...none, itManager: true, technician: true }), true))
    test('system context (scheduled jobs): allowed', () => assert.equal(issue({ ...none, isSystem: true }), true))
})

const nobody = { isSystem: false, admin: false, warden: false, wardenOfPreviousHostel: false }
describe('Hostel complaint workflow authority', () => {
    test('warden assigned to the complaint\'s hostel: allowed', () => assert.equal(cmpl({ ...nobody, warden: true, wardenOfPreviousHostel: true }), true))
    test('warden of another hostel: denied (even if they raised it)', () => assert.equal(cmpl({ ...nobody, warden: true }), false))
    test('original creator (student): denied', () => assert.equal(cmpl(nobody), false))
    test('recorded as warden but without the warden role: denied', () => assert.equal(cmpl({ ...nobody, wardenOfPreviousHostel: true }), false))
    test('Campus360 administrator: allowed', () => assert.equal(cmpl({ ...nobody, admin: true }), true))
    test('IT manager has no complaint authority', () => assert.equal(cmpl({ ...nobody }), false))
    test('system context: allowed', () => assert.equal(cmpl({ ...nobody, isSystem: true }), true))
})

describe('Protected field sets mirror the field ACLs', () => {
    test('IT issue: 12 workflow fields incl. state, resolution, notes, assignment', () => {
        assert.equal(ISSUE_WORKFLOW_FIELDS.length, 12)
        for (const f of ['state', 'resolution_code', 'close_notes', 'work_notes', 'assignment_group', 'assigned_to']) assert.ok(ISSUE_WORKFLOW_FIELDS.includes(f))
    })
    test('complaint: 6 workflow fields', () => assert.deepEqual([...COMPLAINT_WORKFLOW_FIELDS].sort(), ['assigned_to', 'assignment_group', 'close_notes', 'priority', 'state', 'work_notes']))
    test('ownership fields are NOT guarded (callers keep editing description/comments)', () => {
        for (const f of ['short_description', 'description', 'comments']) { assert.ok(!ISSUE_WORKFLOW_FIELDS.includes(f)); assert.ok(!COMPLAINT_WORKFLOW_FIELDS.includes(f)) }
    })
    test('changedProtected reports only protected fields that changed', () =>
        assert.deepEqual(changedProtected(ISSUE_WORKFLOW_FIELDS, (f) => f === 'state' || f === 'comments'), ['state']))
})
