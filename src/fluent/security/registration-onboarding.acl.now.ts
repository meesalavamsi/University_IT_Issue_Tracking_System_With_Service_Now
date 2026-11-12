import { Acl } from '@servicenow/sdk/core'
import { hasExplicitFacultyAdminRole, hasExplicitRegistrarRole } from '../../server/security/explicit-roles'
import { roleAdmin, roleFacultyAdmin, roleHod, roleLeadership, roleRegistrar, roleUser } from '../roles/roles.now'

// ACLs — student registration & faculty onboarding (ROLE_PERMISSION_MATRIX.md §3, §5).

// ============================== Student Registration ==============================
Acl({ $id: Now.ID['acl-student-reg-read'], type: 'record', table: 'x_774308_campus360_student_reg', operation: 'read', roles: [roleRegistrar, roleLeadership], adminOverrides: true })
Acl({ $id: Now.ID['acl-student-reg-read-applicant'], type: 'record', table: 'x_774308_campus360_student_reg', operation: 'read', roles: [roleUser], condition: 'opened_byDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: true, description: 'Applicants read their own applications.' })
Acl({ $id: Now.ID['acl-student-reg-read-hod'], type: 'record', table: 'x_774308_campus360_student_reg', operation: 'read', roles: [roleHod], condition: 'program.department.hod.userDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: true, description: 'Stage-2 approver: HOD of the program department.' })
Acl({ $id: Now.ID['acl-student-reg-create'], type: 'record', table: 'x_774308_campus360_student_reg', operation: 'create', roles: [roleUser], adminOverrides: true })
Acl({ $id: Now.ID['acl-student-reg-write'], type: 'record', table: 'x_774308_campus360_student_reg', operation: 'write', roles: [roleRegistrar], adminOverrides: true, description: 'Stage-1 review is performed by the registrar; HOD approval is recorded on the approval record.' })
Acl({ $id: Now.ID['acl-student-reg-delete'], type: 'record', table: 'x_774308_campus360_student_reg', operation: 'delete', roles: [roleAdmin], adminOverrides: true })
// Registrar-only review fields (cannot be set by the applicant even on create)
Acl({ $id: Now.ID['acl-student-reg-docs-create'], type: 'record', table: 'x_774308_campus360_student_reg', field: 'documents_verified', operation: 'create', roles: [roleRegistrar], adminOverrides: true })
Acl({ $id: Now.ID['acl-student-reg-recommend-create'], type: 'record', table: 'x_774308_campus360_student_reg', field: 'registrar_recommendation', operation: 'create', roles: [roleRegistrar], adminOverrides: true })
Acl({ $id: Now.ID['acl-student-reg-state-create'], type: 'record', table: 'x_774308_campus360_student_reg', field: 'state', operation: 'create', roles: [roleRegistrar], adminOverrides: true })
// Applicant personal data: registrar + the applicant only (HOD and leadership excluded)
Acl({ $id: Now.ID['acl-student-reg-phone-read'], type: 'record', table: 'x_774308_campus360_student_reg', field: 'applicant_phone', operation: 'read', roles: [roleRegistrar], script: hasExplicitRegistrarRole, adminOverrides: false })
Acl({ $id: Now.ID['acl-student-reg-phone-read-self'], type: 'record', table: 'x_774308_campus360_student_reg', field: 'applicant_phone', operation: 'read', roles: [roleUser], condition: 'opened_byDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: false })
Acl({ $id: Now.ID['acl-student-reg-phone-qrange'], type: 'record', table: 'x_774308_campus360_student_reg', field: 'applicant_phone', operation: 'query_range', decisionType: 'deny', roles: [roleRegistrar], script: hasExplicitRegistrarRole, adminOverrides: false })
Acl({ $id: Now.ID['acl-student-reg-dob-read'], type: 'record', table: 'x_774308_campus360_student_reg', field: 'date_of_birth', operation: 'read', roles: [roleRegistrar], script: hasExplicitRegistrarRole, adminOverrides: false })
Acl({ $id: Now.ID['acl-student-reg-dob-read-self'], type: 'record', table: 'x_774308_campus360_student_reg', field: 'date_of_birth', operation: 'read', roles: [roleUser], condition: 'opened_byDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: false })
Acl({ $id: Now.ID['acl-student-reg-dob-qrange'], type: 'record', table: 'x_774308_campus360_student_reg', field: 'date_of_birth', operation: 'query_range', decisionType: 'deny', roles: [roleRegistrar], script: hasExplicitRegistrarRole, adminOverrides: false })
Acl({ $id: Now.ID['acl-student-reg-gender-read'], type: 'record', table: 'x_774308_campus360_student_reg', field: 'gender', operation: 'read', roles: [roleRegistrar], script: hasExplicitRegistrarRole, adminOverrides: false })
Acl({ $id: Now.ID['acl-student-reg-gender-read-self'], type: 'record', table: 'x_774308_campus360_student_reg', field: 'gender', operation: 'read', roles: [roleUser], condition: 'opened_byDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: false })
Acl({ $id: Now.ID['acl-student-reg-gender-qmatch'], type: 'record', table: 'x_774308_campus360_student_reg', field: 'gender', operation: 'query_match', decisionType: 'deny', roles: [roleRegistrar], script: hasExplicitRegistrarRole, adminOverrides: false })
Acl({ $id: Now.ID['acl-student-reg-gname-read'], type: 'record', table: 'x_774308_campus360_student_reg', field: 'guardian_name', operation: 'read', roles: [roleRegistrar], script: hasExplicitRegistrarRole, adminOverrides: false })
Acl({ $id: Now.ID['acl-student-reg-gname-read-self'], type: 'record', table: 'x_774308_campus360_student_reg', field: 'guardian_name', operation: 'read', roles: [roleUser], condition: 'opened_byDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: false })
Acl({ $id: Now.ID['acl-student-reg-gphone-read'], type: 'record', table: 'x_774308_campus360_student_reg', field: 'guardian_phone', operation: 'read', roles: [roleRegistrar], script: hasExplicitRegistrarRole, adminOverrides: false })
Acl({ $id: Now.ID['acl-student-reg-gphone-read-self'], type: 'record', table: 'x_774308_campus360_student_reg', field: 'guardian_phone', operation: 'read', roles: [roleUser], condition: 'opened_byDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: false })
Acl({ $id: Now.ID['acl-student-reg-gphone-qrange'], type: 'record', table: 'x_774308_campus360_student_reg', field: 'guardian_phone', operation: 'query_range', decisionType: 'deny', roles: [roleRegistrar], script: hasExplicitRegistrarRole, adminOverrides: false })

// ============================== Faculty Onboarding ==============================
Acl({ $id: Now.ID['acl-fac-onboard-read'], type: 'record', table: 'x_774308_campus360_fac_onboard', operation: 'read', roles: [roleFacultyAdmin, roleLeadership], adminOverrides: true })
Acl({ $id: Now.ID['acl-fac-onboard-read-hod'], type: 'record', table: 'x_774308_campus360_fac_onboard', operation: 'read', roles: [roleHod], condition: 'department.hod.userDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: true })
Acl({ $id: Now.ID['acl-fac-onboard-create'], type: 'record', table: 'x_774308_campus360_fac_onboard', operation: 'create', roles: [roleFacultyAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-fac-onboard-write'], type: 'record', table: 'x_774308_campus360_fac_onboard', operation: 'write', roles: [roleFacultyAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-fac-onboard-approval-write'], type: 'record', table: 'x_774308_campus360_fac_onboard', field: 'approval', operation: 'write', roles: [roleAdmin], adminOverrides: true, description: 'The approval field is set by the approval engine/flow only, never edited by hand (approval before checklist).' })
Acl({ $id: Now.ID['acl-fac-onboard-delete'], type: 'record', table: 'x_774308_campus360_fac_onboard', operation: 'delete', roles: [roleAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-fac-onboard-pemail-read'], type: 'record', table: 'x_774308_campus360_fac_onboard', field: 'personal_email', operation: 'read', roles: [roleFacultyAdmin], script: hasExplicitFacultyAdminRole, adminOverrides: false })
Acl({ $id: Now.ID['acl-fac-onboard-pemail-qrange'], type: 'record', table: 'x_774308_campus360_fac_onboard', field: 'personal_email', operation: 'query_range', decisionType: 'deny', roles: [roleFacultyAdmin], script: hasExplicitFacultyAdminRole, adminOverrides: false })
Acl({ $id: Now.ID['acl-fac-onboard-pphone-read'], type: 'record', table: 'x_774308_campus360_fac_onboard', field: 'personal_phone', operation: 'read', roles: [roleFacultyAdmin], script: hasExplicitFacultyAdminRole, adminOverrides: false })
Acl({ $id: Now.ID['acl-fac-onboard-pphone-qrange'], type: 'record', table: 'x_774308_campus360_fac_onboard', field: 'personal_phone', operation: 'query_range', decisionType: 'deny', roles: [roleFacultyAdmin], script: hasExplicitFacultyAdminRole, adminOverrides: false })

// ============================== Onboarding Task ==============================
Acl({ $id: Now.ID['acl-onboard-tsk-read'], type: 'record', table: 'x_774308_campus360_onboard_tsk', operation: 'read', roles: [roleFacultyAdmin, roleLeadership], adminOverrides: true })
Acl({ $id: Now.ID['acl-onboard-tsk-read-group'], type: 'record', table: 'x_774308_campus360_onboard_tsk', operation: 'read', roles: [roleUser], condition: 'assignment_groupDYNAMICd6435e965f510100a9ad2572f2b47744^EQ', adminOverrides: true, description: 'Fulfilment groups (IT, facilities, labs) read tasks assigned to them.' })
Acl({ $id: Now.ID['acl-onboard-tsk-create'], type: 'record', table: 'x_774308_campus360_onboard_tsk', operation: 'create', roles: [roleFacultyAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-onboard-tsk-write'], type: 'record', table: 'x_774308_campus360_onboard_tsk', operation: 'write', roles: [roleFacultyAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-onboard-tsk-write-group'], type: 'record', table: 'x_774308_campus360_onboard_tsk', operation: 'write', roles: [roleUser], condition: 'assignment_groupDYNAMICd6435e965f510100a9ad2572f2b47744^EQ', adminOverrides: true })
Acl({ $id: Now.ID['acl-onboard-tsk-delete'], type: 'record', table: 'x_774308_campus360_onboard_tsk', operation: 'delete', roles: [roleAdmin], adminOverrides: true })

// ============================== Onboarding Template ==============================
Acl({ $id: Now.ID['acl-onb-tmpl-read'], type: 'record', table: 'x_774308_campus360_onb_tmpl', operation: 'read', roles: [roleFacultyAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-onb-tmpl-create'], type: 'record', table: 'x_774308_campus360_onb_tmpl', operation: 'create', roles: [roleFacultyAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-onb-tmpl-write'], type: 'record', table: 'x_774308_campus360_onb_tmpl', operation: 'write', roles: [roleFacultyAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-onb-tmpl-delete'], type: 'record', table: 'x_774308_campus360_onb_tmpl', operation: 'delete', roles: [roleAdmin], adminOverrides: true })
