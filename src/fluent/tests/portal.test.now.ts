import { Test } from '@servicenow/sdk/core'
import { roleAdmin, roleFaculty, roleItManager, roleStudent, roleTechnician, roleWarden } from '../roles/roles.now'

// Portal API regression: real handlers executed as real personas (ATF rolls back all data/users).
// Covers students, faculty, wardens, IT staff (manager + technician) and Campus360 administrators,
// the W-3 query rules on it_issue / hostel_cmpl / maint_req, Cancel Issue and Warden Resolve.
export const portalRegressionTest = Test(
    {
        $id: Now.ID['atf-c360-portal-regression'],
        name: 'C360 Portal - API end-to-end regression',
        description: 'Student/faculty/warden/IT/admin personas: request creation, visibility (404/403), W-3 aggregate counts on IT issues, complaints and maintenance, IT lifecycle incl. Cancel (work note required, history kept), technician group authority, warden Resolve (notes required, own hostel only, history kept), statistics and admin overview access.',
        active: true,
        failOnServerError: false,
    },
    (atf) => {
        const admin = atf.server.createUser({ $id: Now.ID['atf-por-u-admin'], firstName: 'C360Test', lastName: 'AppAdmin', roles: [roleAdmin], impersonate: false, fieldValues: { user_name: 'c360.test.admin', email: 'c360.test.admin@example.edu' } })
        const studentA = atf.server.createUser({ $id: Now.ID['atf-por-u-studenta'], firstName: 'C360Test', lastName: 'StudentA', roles: [roleStudent], impersonate: false, fieldValues: { user_name: 'c360.test.studenta', email: 'c360.test.studenta@example.edu' } })
        const studentB = atf.server.createUser({ $id: Now.ID['atf-por-u-studentb'], firstName: 'C360Test', lastName: 'StudentB', roles: [roleStudent], impersonate: false, fieldValues: { user_name: 'c360.test.studentb', email: 'c360.test.studentb@example.edu' } })
        const faculty = atf.server.createUser({ $id: Now.ID['atf-por-u-faculty'], firstName: 'C360Test', lastName: 'Faculty', roles: [roleFaculty], impersonate: false, fieldValues: { user_name: 'c360.test.faculty', email: 'c360.test.faculty@example.edu' } })
        const itMgr = atf.server.createUser({ $id: Now.ID['atf-por-u-itmgr'], firstName: 'C360Test', lastName: 'ITManager', roles: [roleItManager], impersonate: false, fieldValues: { user_name: 'c360.test.itmgr', email: 'c360.test.itmgr@example.edu' } })
        const tech = atf.server.createUser({ $id: Now.ID['atf-por-u-tech'], firstName: 'C360Test', lastName: 'Technician', roles: [roleTechnician], impersonate: false, fieldValues: { user_name: 'c360.test.tech', email: 'c360.test.tech@example.edu' } })
        const warden = atf.server.createUser({ $id: Now.ID['atf-por-u-wardena'], firstName: 'C360Test', lastName: 'WardenA', roles: [roleWarden], impersonate: false, fieldValues: { user_name: 'c360.test.wardena', email: 'c360.test.wardena@example.edu' } })

        atf.server.impersonate({ $id: Now.ID['atf-por-imp-admin'], user: admin.user })
        atf.server.runServerSideScript({ $id: Now.ID['atf-por-fixture'], script: Now.include('../../scripts/atf/portal-fixture.js') })
        atf.server.impersonate({ $id: Now.ID['atf-por-imp-studenta'], user: studentA.user })
        atf.server.runServerSideScript({ $id: Now.ID['atf-por-chk-studenta'], script: Now.include('../../scripts/atf/portal-check.js') })
        atf.server.impersonate({ $id: Now.ID['atf-por-imp-faculty'], user: faculty.user })
        atf.server.runServerSideScript({ $id: Now.ID['atf-por-chk-faculty'], script: Now.include('../../scripts/atf/portal-check.js') })
        atf.server.impersonate({ $id: Now.ID['atf-por-imp-studentb'], user: studentB.user })
        atf.server.runServerSideScript({ $id: Now.ID['atf-por-chk-studentb'], script: Now.include('../../scripts/atf/portal-check.js') })
        atf.server.impersonate({ $id: Now.ID['atf-por-imp-itmgr'], user: itMgr.user })
        atf.server.runServerSideScript({ $id: Now.ID['atf-por-chk-itmgr'], script: Now.include('../../scripts/atf/portal-check.js') })
        atf.server.impersonate({ $id: Now.ID['atf-por-imp-tech'], user: tech.user })
        atf.server.runServerSideScript({ $id: Now.ID['atf-por-chk-tech'], script: Now.include('../../scripts/atf/portal-check.js') })
        atf.server.impersonate({ $id: Now.ID['atf-por-imp-warden'], user: warden.user })
        atf.server.runServerSideScript({ $id: Now.ID['atf-por-chk-warden'], script: Now.include('../../scripts/atf/portal-check.js') })
        atf.server.impersonate({ $id: Now.ID['atf-por-imp-admin2'], user: admin.user })
        atf.server.runServerSideScript({ $id: Now.ID['atf-por-chk-admin'], script: Now.include('../../scripts/atf/portal-check.js') })
    }
)
