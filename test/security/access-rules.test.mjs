// Unit tests for the REAL decision module (src/server/security/access-rules.ts), run with Node's
// built-in test runner (Node ≥ 22.6 strips TypeScript types natively). No logic is copied here.
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
    evaluateFacultyStudentAccess as faculty,
    evaluateWardenStudentAccess as warden,
    evaluateWardenGuardianAccess as guardian,
    isValidSysId,
} from '../../src/server/security/access-rules.ts'
import { U, S, makeDataSource } from './fixture.mjs'

const ds = makeDataSource()
const yes = (d) => assert.equal(d.allowed, true, d.reason)
const no = (d) => assert.equal(d.allowed, false, d.reason)

describe('RL-02 faculty → student (actual enrollment + section assignment)', () => {
    test('primary instructor reads a student enrolled in their active section', () => yes(faculty(U.facTeach, S.A, ds)))
    test('co-instructor reads a student enrolled in the co-taught section', () => yes(faculty(U.facCo, S.A, ds)))
    test('unrelated faculty cannot read that student', () => no(faculty(U.facOther, S.A, ds)))
    test('instructor cannot read a student from another faculty member\'s section', () => no(faculty(U.facTeach, S.C, ds)))
    test('DROPPED enrollment grants no access', () => no(faculty(U.facTeach, S.D, ds)))
    test('enrollment in a COMPLETED section grants no access', () => no(faculty(U.facTeach, S.E, ds)))
    test('RESIGNED faculty loses access even to their section\'s students', () => no(faculty(U.facResigned, S.B, ds)))
    test('user with no faculty profile is denied', () => no(faculty(U.noProfile, S.A, ds)))
    test('advisor relationship is NOT granted by RL-02 (handled by the declarative advisor ACL)', () => no(faculty(U.facAdvisor, S.B, ds)))
})

describe('RL-04 warden → resident profile', () => {
    test('warden reads an ACTIVE resident of their hostel', () => yes(warden(U.wardenA, S.A, ds)))
    test('warden reads a student with a REQUESTED allocation to their hostel', () => yes(warden(U.wardenA, S.B, ds)))
    test('assistant warden reads an active resident', () => yes(warden(U.asstWardenA, S.A, ds)))
    test('VACATED allocation grants no access', () => no(warden(U.wardenA, S.D, ds)))
    test('warden cannot read another hostel\'s resident', () => no(warden(U.wardenA, S.C, ds)))
    test('other hostel\'s warden cannot read hostel A resident', () => no(warden(U.wardenB, S.A, ds)))
    test('warden of an INACTIVE hostel gets no access', () => no(warden(U.wardenClosed, S.E, ds)))
    test('faculty (non-warden) gets nothing from RL-04', () => no(warden(U.facTeach, S.A, ds)))
})

describe('RL-04g warden → guardian contact (restricted field, active residents only)', () => {
    test('warden reads guardian contact of an ACTIVE resident', () => yes(guardian(U.wardenA, S.A, ds)))
    test('REQUESTED allocation does NOT expose guardian contact', () => no(guardian(U.wardenA, S.B, ds)))
    test('VACATED resident guardian contact is hidden', () => no(guardian(U.wardenA, S.D, ds)))
    test('other hostel warden cannot read guardian contact', () => no(guardian(U.wardenB, S.A, ds)))
})

describe('Fail-closed input validation (empty, missing, malformed, injection)', () => {
    const bad = [undefined, null, '', ' ', 'abc', 123, {}, 'A'.repeat(32), S.A + '^ORactive=true', S.A.slice(0, 31), S.A + '0']
    for (const v of bad) {
        test(`faculty: invalid user ${JSON.stringify(v)} denied`, () => no(faculty(v, S.A, ds)))
        test(`faculty: invalid student ${JSON.stringify(v)} denied`, () => no(faculty(U.facTeach, v, ds)))
        test(`warden: invalid user ${JSON.stringify(v)} denied`, () => no(warden(v, S.A, ds)))
        test(`warden: invalid student ${JSON.stringify(v)} denied`, () => no(warden(U.wardenA, v, ds)))
        test(`guardian: invalid student ${JSON.stringify(v)} denied`, () => no(guardian(U.wardenA, v, ds)))
    }
    test('isValidSysId accepts only 32 lowercase hex characters', () => {
        assert.equal(isValidSysId(S.A), true)
        assert.equal(isValidSysId(S.A.toUpperCase().replace(/0/g, 'A')), false)
        assert.equal(isValidSysId(S.A + '^NQactive=true'), false)
    })
    test('invalid input never reaches the data source (no query is built from untrusted values)', () => {
        const probe = makeDataSource()
        faculty(S.A + '^ORactive=true', S.A, probe)
        warden(U.wardenA, 'x^ORstatus=active', probe)
        guardian('', S.A, probe)
        assert.deepEqual(probe.calls, [])
    })
})
