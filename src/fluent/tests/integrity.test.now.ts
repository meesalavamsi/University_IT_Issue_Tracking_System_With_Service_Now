import { Test } from '@servicenow/sdk/core'
import { roleAdmin, roleFaculty, roleItManager, roleRegistrar, roleStudent, roleTechnician } from '../roles/roles.now'

// Test-only artifact (added during the approved D-1 re-verification): on-instance regression for
// attendance integrity (duplicates, deletion, corrections) and incident-escalation authorisation.
// Fictional users c360.test.*@example.edu; ATF rolls back all users and records it creates.

export const integrityRegressionTest = Test(
    {
        $id: Now.ID['atf-c360-integrity-regression'],
        name: 'C360 Integrity - Attendance and escalation regression',
        description: 'Duplicate student/faculty attendance rejected, attendance not deletable by instructor/registrar/app admin, corrections persist, escalation link limited to IT managers and write-once.',
        active: true,
        // The duplicate-insert checks intentionally provoke database unique-key violations, which the
        // platform logs as server errors. Assertions (incl. "exactly one row remains") still enforce results.
        failOnServerError: false,
    },
    (atf) => {
        const admin = atf.server.createUser({ $id: Now.ID['atf-int-u-admin'], firstName: 'C360Test', lastName: 'AppAdmin', roles: [roleAdmin], impersonate: false, fieldValues: { user_name: 'c360.test.admin', email: 'c360.test.admin@example.edu' } })
        const studentA = atf.server.createUser({ $id: Now.ID['atf-int-u-studenta'], firstName: 'C360Test', lastName: 'StudentA', roles: [roleStudent], impersonate: false, fieldValues: { user_name: 'c360.test.studenta', email: 'c360.test.studenta@example.edu' } })
        const studentB = atf.server.createUser({ $id: Now.ID['atf-int-u-studentb'], firstName: 'C360Test', lastName: 'StudentB', roles: [roleStudent], impersonate: false, fieldValues: { user_name: 'c360.test.studentb', email: 'c360.test.studentb@example.edu' } })
        const facTeach = atf.server.createUser({ $id: Now.ID['atf-int-u-facteach'], firstName: 'C360Test', lastName: 'Instructor', roles: [roleFaculty], impersonate: false, fieldValues: { user_name: 'c360.test.facteach', email: 'c360.test.facteach@example.edu' } })
        const registrar = atf.server.createUser({ $id: Now.ID['atf-int-u-registrar'], firstName: 'C360Test', lastName: 'Registrar', roles: [roleRegistrar], impersonate: false, fieldValues: { user_name: 'c360.test.registrar', email: 'c360.test.registrar@example.edu' } })
        const tech = atf.server.createUser({ $id: Now.ID['atf-int-u-tech'], firstName: 'C360Test', lastName: 'Technician', roles: [roleTechnician], impersonate: false, fieldValues: { user_name: 'c360.test.tech', email: 'c360.test.tech@example.edu' } })
        const itMgr = atf.server.createUser({ $id: Now.ID['atf-int-u-itmgr'], firstName: 'C360Test', lastName: 'ITManager', roles: [roleItManager], impersonate: false, fieldValues: { user_name: 'c360.test.itmgr', email: 'c360.test.itmgr@example.edu' } })

        atf.server.impersonate({ $id: Now.ID['atf-int-imp-admin-fixture'], user: admin.user })
        atf.server.runServerSideScript({ $id: Now.ID['atf-int-fixture'], script: Now.include('../../scripts/atf/integrity-fixture.js') })

        atf.server.impersonate({ $id: Now.ID['atf-int-imp-facteach'], user: facTeach.user })
        atf.server.runServerSideScript({ $id: Now.ID['atf-int-chk-facteach'], script: Now.include('../../scripts/atf/integrity-check.js') })

        atf.server.impersonate({ $id: Now.ID['atf-int-imp-registrar'], user: registrar.user })
        atf.server.runServerSideScript({ $id: Now.ID['atf-int-chk-registrar'], script: Now.include('../../scripts/atf/integrity-check.js') })

        atf.server.impersonate({ $id: Now.ID['atf-int-imp-admin-check'], user: admin.user })
        atf.server.runServerSideScript({ $id: Now.ID['atf-int-chk-admin'], script: Now.include('../../scripts/atf/integrity-check.js') })

        atf.server.impersonate({ $id: Now.ID['atf-int-imp-tech'], user: tech.user })
        atf.server.runServerSideScript({ $id: Now.ID['atf-int-chk-tech'], script: Now.include('../../scripts/atf/integrity-check.js') })

        atf.server.impersonate({ $id: Now.ID['atf-int-imp-itmgr'], user: itMgr.user })
        atf.server.runServerSideScript({ $id: Now.ID['atf-int-chk-itmgr'], script: Now.include('../../scripts/atf/integrity-check.js') })

        // W-3: aggregate counts respect row visibility
        atf.server.impersonate({ $id: Now.ID['atf-int-imp-studentb'], user: studentB.user })
        atf.server.runServerSideScript({ $id: Now.ID['atf-int-chk-studentb'], script: Now.include('../../scripts/atf/integrity-check.js') })
        atf.server.impersonate({ $id: Now.ID['atf-int-imp-studenta'], user: studentA.user })
        atf.server.runServerSideScript({ $id: Now.ID['atf-int-chk-studenta'], script: Now.include('../../scripts/atf/integrity-check.js') })
    }
)
