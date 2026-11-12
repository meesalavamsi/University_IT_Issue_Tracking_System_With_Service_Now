import { Test } from '@servicenow/sdk/core'
import { roleAdmin, roleFaculty, roleItManager, roleStudent, roleTechnician, roleWarden } from '../roles/roles.now'
import { grpNetworkWifi } from '../groups/groups.now'

// Revision 3 regression: native-form workflow boundaries (field ACLs + before-update guards) and
// authorization-aware counting on hostel_room / class_sess / onboard_tsk. ATF rolls back all data/users.
// Personas: technician IN the assigned group, technician OUTSIDE it, warden of the complaint's hostel,
// warden of another hostel, original ticket creator, Campus360 administrator, authorised IT manager,
// plus a second student and a faculty member for the statistics checks.
export const nativeSecurityTest = Test(
    {
        $id: Now.ID['atf-c360-native-security'],
        name: 'C360 Security - Native workflow boundaries and statistics (rev 3)',
        description: 'Allowed and denied workflow changes through the ACL path (forms/list/REST) and the script path (update guard) for 7 ticket personas; own full room stays visible; room/session/onboarding-task counts follow read visibility.',
        active: true,
        failOnServerError: false,
    },
    (atf) => {
        const admin = atf.server.createUser({ $id: Now.ID['atf-nat-u-admin'], firstName: 'C360Test', lastName: 'AppAdmin', roles: [roleAdmin], impersonate: false, fieldValues: { user_name: 'c360.test.admin', email: 'c360.test.admin@example.edu' } })
        const studentA = atf.server.createUser({ $id: Now.ID['atf-nat-u-studenta'], firstName: 'C360Test', lastName: 'StudentA', roles: [roleStudent], impersonate: false, fieldValues: { user_name: 'c360.test.studenta', email: 'c360.test.studenta@example.edu' } })
        const studentB = atf.server.createUser({ $id: Now.ID['atf-nat-u-studentb'], firstName: 'C360Test', lastName: 'StudentB', roles: [roleStudent], impersonate: false, fieldValues: { user_name: 'c360.test.studentb', email: 'c360.test.studentb@example.edu' } })
        const tech = atf.server.createUser({ $id: Now.ID['atf-nat-u-tech'], firstName: 'C360Test', lastName: 'TechOutside', roles: [roleTechnician], impersonate: false, fieldValues: { user_name: 'c360.test.tech', email: 'c360.test.tech@example.edu' } })
        const techGrp = atf.server.createUser({ $id: Now.ID['atf-nat-u-techgrp'], firstName: 'C360Test', lastName: 'TechInGroup', roles: [roleTechnician], groups: [grpNetworkWifi], impersonate: false, fieldValues: { user_name: 'c360.test.techgrp', email: 'c360.test.techgrp@example.edu' } })
        const itMgr = atf.server.createUser({ $id: Now.ID['atf-nat-u-itmgr'], firstName: 'C360Test', lastName: 'ITManager', roles: [roleItManager], impersonate: false, fieldValues: { user_name: 'c360.test.itmgr', email: 'c360.test.itmgr@example.edu' } })
        const wardenA = atf.server.createUser({ $id: Now.ID['atf-nat-u-wardena'], firstName: 'C360Test', lastName: 'WardenA', roles: [roleWarden], impersonate: false, fieldValues: { user_name: 'c360.test.wardena', email: 'c360.test.wardena@example.edu' } })
        const wardenB = atf.server.createUser({ $id: Now.ID['atf-nat-u-wardenb'], firstName: 'C360Test', lastName: 'WardenB', roles: [roleWarden], impersonate: false, fieldValues: { user_name: 'c360.test.wardenb', email: 'c360.test.wardenb@example.edu' } })
        const faculty = atf.server.createUser({ $id: Now.ID['atf-nat-u-faculty'], firstName: 'C360Test', lastName: 'Faculty', roles: [roleFaculty], impersonate: false, fieldValues: { user_name: 'c360.test.faculty', email: 'c360.test.faculty@example.edu' } })

        atf.server.impersonate({ $id: Now.ID['atf-nat-imp-admin'], user: admin.user })
        atf.server.runServerSideScript({ $id: Now.ID['atf-nat-fixture'], script: Now.include('../../scripts/atf/native-fixture.js') })
        atf.server.impersonate({ $id: Now.ID['atf-nat-imp-studenta'], user: studentA.user })
        atf.server.runServerSideScript({ $id: Now.ID['atf-nat-chk-studenta'], script: Now.include('../../scripts/atf/native-check.js') })
        atf.server.impersonate({ $id: Now.ID['atf-nat-imp-studentb'], user: studentB.user })
        atf.server.runServerSideScript({ $id: Now.ID['atf-nat-chk-studentb'], script: Now.include('../../scripts/atf/native-check.js') })
        atf.server.impersonate({ $id: Now.ID['atf-nat-imp-tech'], user: tech.user })
        atf.server.runServerSideScript({ $id: Now.ID['atf-nat-chk-tech'], script: Now.include('../../scripts/atf/native-check.js') })
        atf.server.impersonate({ $id: Now.ID['atf-nat-imp-techgrp'], user: techGrp.user })
        atf.server.runServerSideScript({ $id: Now.ID['atf-nat-chk-techgrp'], script: Now.include('../../scripts/atf/native-check.js') })
        atf.server.impersonate({ $id: Now.ID['atf-nat-imp-itmgr'], user: itMgr.user })
        atf.server.runServerSideScript({ $id: Now.ID['atf-nat-chk-itmgr'], script: Now.include('../../scripts/atf/native-check.js') })
        atf.server.impersonate({ $id: Now.ID['atf-nat-imp-wardena'], user: wardenA.user })
        atf.server.runServerSideScript({ $id: Now.ID['atf-nat-chk-wardena'], script: Now.include('../../scripts/atf/native-check.js') })
        atf.server.impersonate({ $id: Now.ID['atf-nat-imp-wardenb'], user: wardenB.user })
        atf.server.runServerSideScript({ $id: Now.ID['atf-nat-chk-wardenb'], script: Now.include('../../scripts/atf/native-check.js') })
        atf.server.impersonate({ $id: Now.ID['atf-nat-imp-faculty'], user: faculty.user })
        atf.server.runServerSideScript({ $id: Now.ID['atf-nat-chk-faculty'], script: Now.include('../../scripts/atf/native-check.js') })
        atf.server.impersonate({ $id: Now.ID['atf-nat-imp-admin2'], user: admin.user })
        atf.server.runServerSideScript({ $id: Now.ID['atf-nat-chk-admin'], script: Now.include('../../scripts/atf/native-check.js') })
    }
)
