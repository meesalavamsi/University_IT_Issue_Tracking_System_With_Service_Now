// W-3 unit tests for the real policy module (src/server/issue/issue-visibility.ts).
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { issueVisibilityQuery as q, complaintVisibilityQuery as cq, maintenanceVisibilityQuery as mq, roomVisibilityQuery as rq, sessionVisibilityQuery as sq, onboardTaskVisibilityQuery as oq } from '../../src/server/issue/issue-visibility.ts'

const U = 'a'.repeat(32)
const base = { userId: U, isSystem: false, unrestricted: false, warden: false, labAdmin: false, hod: false }

describe('W-3 it_issue query visibility (mirrors read ACLs)', () => {
    test('system context is not restricted', () => assert.equal(q({ ...base, isSystem: true }), ''))
    test('technician / IT manager / leadership / admin are not restricted', () => assert.equal(q({ ...base, unrestricted: true }), ''))
    test('student or faculty: only own issues (caller or opened_by)', () => assert.equal(q(base), `caller=${U}^ORopened_by=${U}`))
    test('warden: own issues OR issues of hostels they warden', () =>
        assert.equal(q({ ...base, warden: true }), `caller=${U}^ORopened_by=${U}^ORhostel.warden=${U}^ORhostel.assistant_warden=${U}`))
    test('lab admin: own OR any laboratory issue', () => assert.equal(q({ ...base, labAdmin: true }), `caller=${U}^ORopened_by=${U}^ORlaboratoryISNOTEMPTY`))
    test('HOD: own OR department issues', () => assert.equal(q({ ...base, hod: true }), `caller=${U}^ORopened_by=${U}^ORdepartment.hod.user=${U}`))
    test('combined restricted roles OR together', () =>
        assert.match(q({ ...base, warden: true, labAdmin: true, hod: true }), /hostel\.warden=.*laboratoryISNOTEMPTY.*department\.hod\.user=/))
    for (const bad of ['', 'abc', U + '^ORactive=true', null, undefined]) {
        test(`invalid user id ${JSON.stringify(bad)} fails closed (no rows)`, () => assert.equal(q({ ...base, userId: bad }), 'sys_idISEMPTY'))
    }
})

const OWN = `caller=${U}^ORopened_by=${U}`
const WARDEN = `hostel.warden=${U}^ORhostel.assistant_warden=${U}`

describe('W-3 hostel_cmpl query visibility (mirrors hostel.acl.now.ts incl. confidential deny)', () => {
    const c = { userId: U, isSystem: false, platformAdmin: false, leadership: false, warden: false }
    test('system context and platform admin (adminOverrides) are not restricted', () => { assert.equal(cq({ ...c, isSystem: true }), ''); assert.equal(cq({ ...c, platformAdmin: true }), '') })
    test('student / faculty / technician: only own complaints', () => assert.equal(cq(c), OWN))
    test('warden: own OR complaints of hostels they warden / assist', () => assert.equal(cq({ ...c, warden: true }), `${OWN}^OR${WARDEN}`))
    test('leadership: all NON-confidential, plus confidential ones they raised or warden', () =>
        assert.equal(cq({ ...c, leadership: true }), `is_confidential=false^OR${OWN}^OR${WARDEN}`))
    test('Campus360 admin (leadership + warden roles) is still bound by the confidential rule', () =>
        assert.match(cq({ ...c, leadership: true, warden: true }), /^is_confidential=false\^OR/))
    for (const bad of ['', 'x', U + '^ORsys_idISNOTEMPTY', null]) {
        test(`invalid user id ${JSON.stringify(bad)} fails closed`, () => assert.equal(cq({ ...c, userId: bad }), 'sys_idISEMPTY'))
    }
})

const R1 = 'b'.repeat(32), R2 = 'c'.repeat(32)
describe('Rev 3 hostel_room query visibility (mirrors hostel.acl.now.ts incl. own-room ACL)', () => {
    const r = { userId: U, isSystem: false, unrestricted: false, warden: false, student: false, ownRoomIds: [] }
    test('facilities / registrar / leadership / IT / admin: all rooms', () => assert.equal(rq({ ...r, unrestricted: true }), ''))
    test('system context: all rooms', () => assert.equal(rq({ ...r, isSystem: true }), ''))
    test('student without allocation: available rooms only', () => assert.equal(rq({ ...r, student: true }), 'status=available'))
    test('student with allocation: available rooms OR own room — own room stays visible when FULL', () =>
        assert.equal(rq({ ...r, student: true, ownRoomIds: [R1] }), `status=available^ORsys_idIN${R1}`))
    test('injected / malformed own-room ids are dropped', () =>
        assert.equal(rq({ ...r, student: true, ownRoomIds: [R2, 'x^ORsys_idISNOTEMPTY', ''] }), `status=available^ORsys_idIN${R2}`))
    test('warden: rooms of hostels they warden / assist', () => assert.equal(rq({ ...r, warden: true }), WARDEN))
    test('faculty / HOD / lab admin / faculty admin (no read ACL): no rooms', () => assert.equal(rq(r), 'sys_idISEMPTY'))
    test('invalid user fails closed', () => assert.equal(rq({ ...r, userId: 'nope', student: true }), 'sys_idISEMPTY'))
})

describe('Rev 3 class_sess query visibility (mirrors attendance.acl.now.ts)', () => {
    const s = { userId: U, isSystem: false, unrestricted: false, faculty: false, hod: false }
    test('students (timetable), registrar, leadership, admin: all sessions', () => assert.equal(sq({ ...s, unrestricted: true }), ''))
    test('faculty: sessions they take or of sections they teach', () => assert.equal(sq({ ...s, faculty: true }), `faculty.user=${U}^ORcourse_section.faculty.user=${U}`))
    test('HOD (⊃ faculty): own sessions OR department sessions', () =>
        assert.equal(sq({ ...s, faculty: true, hod: true }), `faculty.user=${U}^ORcourse_section.faculty.user=${U}^ORcourse_section.course.department.hod.user=${U}`))
    test('warden / technician / lab admin (no read ACL): none', () => assert.equal(sq(s), 'sys_idISEMPTY'))
    test('invalid user fails closed', () => assert.equal(sq({ ...s, userId: undefined, faculty: true }), 'sys_idISEMPTY'))
})

describe('Rev 3 onboard_tsk query visibility (mirrors registration-onboarding.acl.now.ts)', () => {
    const o = { userId: U, isSystem: false, unrestricted: false }
    test('faculty admin / leadership / admin: all tasks', () => assert.equal(oq({ ...o, unrestricted: true }), ''))
    test('everyone else: tasks assigned to one of their groups', () => assert.equal(oq(o), 'assignment_groupDYNAMICd6435e965f510100a9ad2572f2b47744'))
    test('invalid user fails closed', () => assert.equal(oq({ ...o, userId: '' }), 'sys_idISEMPTY'))
})

describe('W-3 maint_req query visibility (mirrors infrastructure.acl.now.ts)', () => {
    const m = { userId: U, isSystem: false, unrestricted: false, warden: false }
    test('maintenance / lab_admin / technician / leadership / admin not restricted', () => assert.equal(mq({ ...m, unrestricted: true }), ''))
    test('system context not restricted', () => assert.equal(mq({ ...m, isSystem: true }), ''))
    test('student / faculty / HOD / registrar: only own requests', () => assert.equal(mq(m), OWN))
    test('warden: own OR requests for hostels they warden', () => assert.equal(mq({ ...m, warden: true }), `${OWN}^OR${WARDEN}`))
    for (const bad of ['', 'x', U + '^ORactive=true', undefined]) {
        test(`invalid user id ${JSON.stringify(bad)} fails closed`, () => assert.equal(mq({ ...m, userId: bad }), 'sys_idISEMPTY'))
    }
})
