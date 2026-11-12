import { Test } from '@servicenow/sdk/core'
import { roleAdmin, roleFaculty, roleHod, roleLeadership, roleStudent, roleWarden } from '../roles/roles.now'

// Part 3 on-instance regression suite (ATF). Executes only on an instance where the app is installed
// and ATF execution is enabled. ATF rolls back every user and record it creates.
// Test users are fictional: user_name c360.test.*, email @example.edu.
// The platform admin persona uses the OOB 'admin' role sys_id (verified on dev382380).

export const securityRegressionTest = Test(
    {
        $id: Now.ID['atf-c360-security-regression'],
        name: 'C360 Security - Student profile access regression (Part 3)',
        description: 'Verifies student self access, instructor/advisor/HOD/warden relationship access, admin and leadership access, restricted personal fields and REST exposure for Campus360 student profiles.',
        active: true,
        failOnServerError: true,
    },
    (atf) => {
        // ---------- Dedicated test personas (no existing user is impersonated) ----------
        const admin = atf.server.createUser({ $id: Now.ID['atf-sec-u-admin'], firstName: 'C360Test', lastName: 'AppAdmin', roles: [roleAdmin], impersonate: false, fieldValues: { user_name: 'c360.test.admin', email: 'c360.test.admin@example.edu' } })
        const studentA = atf.server.createUser({ $id: Now.ID['atf-sec-u-studenta'], firstName: 'C360Test', lastName: 'StudentA', roles: [roleStudent], impersonate: false, fieldValues: { user_name: 'c360.test.studenta', email: 'c360.test.studenta@example.edu' } })
        atf.server.createUser({ $id: Now.ID['atf-sec-u-studentb'], firstName: 'C360Test', lastName: 'StudentB', roles: [roleStudent], impersonate: false, fieldValues: { user_name: 'c360.test.studentb', email: 'c360.test.studentb@example.edu' } })
        atf.server.createUser({ $id: Now.ID['atf-sec-u-studentc'], firstName: 'C360Test', lastName: 'StudentC', roles: [roleStudent], impersonate: false, fieldValues: { user_name: 'c360.test.studentc', email: 'c360.test.studentc@example.edu' } })
        atf.server.createUser({ $id: Now.ID['atf-sec-u-studentd'], firstName: 'C360Test', lastName: 'StudentD', roles: [roleStudent], impersonate: false, fieldValues: { user_name: 'c360.test.studentd', email: 'c360.test.studentd@example.edu' } })
        const facTeach = atf.server.createUser({ $id: Now.ID['atf-sec-u-facteach'], firstName: 'C360Test', lastName: 'Instructor', roles: [roleFaculty], impersonate: false, fieldValues: { user_name: 'c360.test.facteach', email: 'c360.test.facteach@example.edu' } })
        const facOther = atf.server.createUser({ $id: Now.ID['atf-sec-u-facother'], firstName: 'C360Test', lastName: 'OtherFaculty', roles: [roleFaculty], impersonate: false, fieldValues: { user_name: 'c360.test.facother', email: 'c360.test.facother@example.edu' } })
        const facAdvisor = atf.server.createUser({ $id: Now.ID['atf-sec-u-facadvisor'], firstName: 'C360Test', lastName: 'Advisor', roles: [roleFaculty], impersonate: false, fieldValues: { user_name: 'c360.test.facadvisor', email: 'c360.test.facadvisor@example.edu' } })
        const hod = atf.server.createUser({ $id: Now.ID['atf-sec-u-hod'], firstName: 'C360Test', lastName: 'HOD', roles: [roleHod], impersonate: false, fieldValues: { user_name: 'c360.test.hod', email: 'c360.test.hod@example.edu' } })
        const wardenA = atf.server.createUser({ $id: Now.ID['atf-sec-u-wardena'], firstName: 'C360Test', lastName: 'WardenA', roles: [roleWarden], impersonate: false, fieldValues: { user_name: 'c360.test.wardena', email: 'c360.test.wardena@example.edu' } })
        const wardenB = atf.server.createUser({ $id: Now.ID['atf-sec-u-wardenb'], firstName: 'C360Test', lastName: 'WardenB', roles: [roleWarden], impersonate: false, fieldValues: { user_name: 'c360.test.wardenb', email: 'c360.test.wardenb@example.edu' } })
        const leadership = atf.server.createUser({ $id: Now.ID['atf-sec-u-leadership'], firstName: 'C360Test', lastName: 'Leadership', roles: [roleLeadership], impersonate: false, fieldValues: { user_name: 'c360.test.leadership', email: 'c360.test.leadership@example.edu' } })
        const platAdmin = atf.server.createUser({ $id: Now.ID['atf-sec-u-platadmin'], firstName: 'C360Test', lastName: 'PlatformAdmin', roles: ['2831a114c611228501d4ea6c309d626d'], impersonate: false, fieldValues: { user_name: 'c360.test.platadmin', email: 'c360.test.platadmin@example.edu' } })

        // ---------- Fixture, created as the Campus360 app admin through GlideRecordSecure ----------
        atf.server.impersonate({ $id: Now.ID['atf-sec-imp-admin-fixture'], user: admin.user })
        atf.server.runServerSideScript({ $id: Now.ID['atf-sec-fixture'], script: Now.include('../../scripts/atf/security-fixture.js') })

        // ---------- Per-persona checks (expectations in security-check.js) ----------
        atf.server.impersonate({ $id: Now.ID['atf-sec-imp-studenta'], user: studentA.user })
        atf.server.runServerSideScript({ $id: Now.ID['atf-sec-chk-studenta'], script: Now.include('../../scripts/atf/security-check.js') })

        atf.server.impersonate({ $id: Now.ID['atf-sec-imp-facteach'], user: facTeach.user })
        atf.server.runServerSideScript({ $id: Now.ID['atf-sec-chk-facteach'], script: Now.include('../../scripts/atf/security-check.js') })

        atf.server.impersonate({ $id: Now.ID['atf-sec-imp-facother'], user: facOther.user })
        atf.server.runServerSideScript({ $id: Now.ID['atf-sec-chk-facother'], script: Now.include('../../scripts/atf/security-check.js') })

        atf.server.impersonate({ $id: Now.ID['atf-sec-imp-facadvisor'], user: facAdvisor.user })
        atf.server.runServerSideScript({ $id: Now.ID['atf-sec-chk-facadvisor'], script: Now.include('../../scripts/atf/security-check.js') })

        atf.server.impersonate({ $id: Now.ID['atf-sec-imp-hod'], user: hod.user })
        atf.server.runServerSideScript({ $id: Now.ID['atf-sec-chk-hod'], script: Now.include('../../scripts/atf/security-check.js') })

        atf.server.impersonate({ $id: Now.ID['atf-sec-imp-wardena'], user: wardenA.user })
        atf.server.runServerSideScript({ $id: Now.ID['atf-sec-chk-wardena'], script: Now.include('../../scripts/atf/security-check.js') })

        atf.server.impersonate({ $id: Now.ID['atf-sec-imp-wardenb'], user: wardenB.user })
        atf.server.runServerSideScript({ $id: Now.ID['atf-sec-chk-wardenb'], script: Now.include('../../scripts/atf/security-check.js') })

        atf.server.impersonate({ $id: Now.ID['atf-sec-imp-admin-check'], user: admin.user })
        atf.server.runServerSideScript({ $id: Now.ID['atf-sec-chk-admin'], script: Now.include('../../scripts/atf/security-check.js') })

        atf.server.impersonate({ $id: Now.ID['atf-sec-imp-leadership'], user: leadership.user })
        atf.server.runServerSideScript({ $id: Now.ID['atf-sec-chk-leadership'], script: Now.include('../../scripts/atf/security-check.js') })

        atf.server.impersonate({ $id: Now.ID['atf-sec-imp-platadmin'], user: platAdmin.user })
        atf.server.runServerSideScript({ $id: Now.ID['atf-sec-chk-platadmin'], script: Now.include('../../scripts/atf/security-check.js') })

        // ---------- REST exposure (table-level web-service switch on personal-data tables) ----------
        atf.server.runServerSideScript({ $id: Now.ID['atf-sec-rest'], script: Now.include('../../scripts/atf/security-rest.js') })
    }
)
