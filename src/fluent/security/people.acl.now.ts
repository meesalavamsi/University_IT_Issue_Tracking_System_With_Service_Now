import { Acl } from '@servicenow/sdk/core'
import { hasExplicitFacultyAdminRole, hasExplicitRegistrarRole } from '../../server/security/explicit-roles'
import {
    roleAdmin,
    roleFaculty,
    roleFacultyAdmin,
    roleHod,
    roleItManager,
    roleLeadership,
    roleRegistrar,
    roleStudent,
    roleTechnician,
    roleUser,
} from '../roles/roles.now'

// ACLs — student, faculty and technician profiles (ROLE_PERMISSION_MATRIX.md §3–5).
// Self-service edits of contact fields are done through the portal widgets (Part 11), which write
// only the permitted fields server-side; students/faculty therefore receive NO table write ACL here.
// RL-02 (instructors read their enrolled students) and RL-04 (wardens read residents) need a
// sub-query and are added in Part 3 via the C360Security script include.

// ============================== STUDENT (table) ==============================
Acl({ $id: Now.ID['acl-student-read'], type: 'record', table: 'x_774308_campus360_student', operation: 'read', roles: [roleRegistrar, roleLeadership], adminOverrides: true })
Acl({ $id: Now.ID['acl-student-read-self'], type: 'record', table: 'x_774308_campus360_student', operation: 'read', roles: [roleStudent], condition: 'userDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: true, description: 'RL-01: a student reads their own profile.' })
Acl({ $id: Now.ID['acl-student-read-advisor'], type: 'record', table: 'x_774308_campus360_student', operation: 'read', roles: [roleFaculty], condition: 'advisor.userDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: true, description: 'RL-02 (part): faculty advisors read their advisees.' })
Acl({ $id: Now.ID['acl-student-read-hod'], type: 'record', table: 'x_774308_campus360_student', operation: 'read', roles: [roleHod], condition: 'department.hod.userDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: true, description: 'RL-03: HOD reads students of their department.' })
Acl({ $id: Now.ID['acl-student-create'], type: 'record', table: 'x_774308_campus360_student', operation: 'create', roles: [roleRegistrar], adminOverrides: true })
Acl({ $id: Now.ID['acl-student-write'], type: 'record', table: 'x_774308_campus360_student', operation: 'write', roles: [roleRegistrar], adminOverrides: true })
Acl({ $id: Now.ID['acl-student-delete'], type: 'record', table: 'x_774308_campus360_student', operation: 'delete', roles: [roleAdmin], adminOverrides: true })

// ============================== STUDENT (sensitive fields) ==============================
// Per field: read (registrar) + read (self) + write (registrar) + deny-unless query_range/query_match (registrar).
// --- date_of_birth ---
Acl({ $id: Now.ID['acl-student-dob-read'], type: 'record', table: 'x_774308_campus360_student', field: 'date_of_birth', operation: 'read', roles: [roleRegistrar], script: hasExplicitRegistrarRole, adminOverrides: false })
Acl({ $id: Now.ID['acl-student-dob-read-self'], type: 'record', table: 'x_774308_campus360_student', field: 'date_of_birth', operation: 'read', roles: [roleStudent], condition: 'userDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: false })
Acl({ $id: Now.ID['acl-student-dob-write'], type: 'record', table: 'x_774308_campus360_student', field: 'date_of_birth', operation: 'write', roles: [roleRegistrar], script: hasExplicitRegistrarRole, adminOverrides: false })
Acl({ $id: Now.ID['acl-student-dob-qrange'], type: 'record', table: 'x_774308_campus360_student', field: 'date_of_birth', operation: 'query_range', decisionType: 'deny', roles: [roleRegistrar], script: hasExplicitRegistrarRole, adminOverrides: false })
Acl({ $id: Now.ID['acl-student-dob-qmatch'], type: 'record', table: 'x_774308_campus360_student', field: 'date_of_birth', operation: 'query_match', decisionType: 'deny', roles: [roleRegistrar], script: hasExplicitRegistrarRole, adminOverrides: false })
// --- gender ---
Acl({ $id: Now.ID['acl-student-gender-read'], type: 'record', table: 'x_774308_campus360_student', field: 'gender', operation: 'read', roles: [roleRegistrar], script: hasExplicitRegistrarRole, adminOverrides: false })
Acl({ $id: Now.ID['acl-student-gender-read-self'], type: 'record', table: 'x_774308_campus360_student', field: 'gender', operation: 'read', roles: [roleStudent], condition: 'userDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: false })
Acl({ $id: Now.ID['acl-student-gender-write'], type: 'record', table: 'x_774308_campus360_student', field: 'gender', operation: 'write', roles: [roleRegistrar], script: hasExplicitRegistrarRole, adminOverrides: false })
Acl({ $id: Now.ID['acl-student-gender-qrange'], type: 'record', table: 'x_774308_campus360_student', field: 'gender', operation: 'query_range', decisionType: 'deny', roles: [roleRegistrar], script: hasExplicitRegistrarRole, adminOverrides: false })
Acl({ $id: Now.ID['acl-student-gender-qmatch'], type: 'record', table: 'x_774308_campus360_student', field: 'gender', operation: 'query_match', decisionType: 'deny', roles: [roleRegistrar], script: hasExplicitRegistrarRole, adminOverrides: false })
// --- blood_group ---
Acl({ $id: Now.ID['acl-student-blood-read'], type: 'record', table: 'x_774308_campus360_student', field: 'blood_group', operation: 'read', roles: [roleRegistrar], script: hasExplicitRegistrarRole, adminOverrides: false })
Acl({ $id: Now.ID['acl-student-blood-read-self'], type: 'record', table: 'x_774308_campus360_student', field: 'blood_group', operation: 'read', roles: [roleStudent], condition: 'userDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: false })
Acl({ $id: Now.ID['acl-student-blood-write'], type: 'record', table: 'x_774308_campus360_student', field: 'blood_group', operation: 'write', roles: [roleRegistrar], script: hasExplicitRegistrarRole, adminOverrides: false })
Acl({ $id: Now.ID['acl-student-blood-qrange'], type: 'record', table: 'x_774308_campus360_student', field: 'blood_group', operation: 'query_range', decisionType: 'deny', roles: [roleRegistrar], script: hasExplicitRegistrarRole, adminOverrides: false })
Acl({ $id: Now.ID['acl-student-blood-qmatch'], type: 'record', table: 'x_774308_campus360_student', field: 'blood_group', operation: 'query_match', decisionType: 'deny', roles: [roleRegistrar], script: hasExplicitRegistrarRole, adminOverrides: false })
// --- personal_phone ---
Acl({ $id: Now.ID['acl-student-pphone-read'], type: 'record', table: 'x_774308_campus360_student', field: 'personal_phone', operation: 'read', roles: [roleRegistrar], script: hasExplicitRegistrarRole, adminOverrides: false })
Acl({ $id: Now.ID['acl-student-pphone-read-self'], type: 'record', table: 'x_774308_campus360_student', field: 'personal_phone', operation: 'read', roles: [roleStudent], condition: 'userDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: false })
Acl({ $id: Now.ID['acl-student-pphone-write'], type: 'record', table: 'x_774308_campus360_student', field: 'personal_phone', operation: 'write', roles: [roleRegistrar], script: hasExplicitRegistrarRole, adminOverrides: false })
Acl({ $id: Now.ID['acl-student-pphone-qrange'], type: 'record', table: 'x_774308_campus360_student', field: 'personal_phone', operation: 'query_range', decisionType: 'deny', roles: [roleRegistrar], script: hasExplicitRegistrarRole, adminOverrides: false })
Acl({ $id: Now.ID['acl-student-pphone-qmatch'], type: 'record', table: 'x_774308_campus360_student', field: 'personal_phone', operation: 'query_match', decisionType: 'deny', roles: [roleRegistrar], script: hasExplicitRegistrarRole, adminOverrides: false })
// --- personal_email ---
Acl({ $id: Now.ID['acl-student-pemail-read'], type: 'record', table: 'x_774308_campus360_student', field: 'personal_email', operation: 'read', roles: [roleRegistrar], script: hasExplicitRegistrarRole, adminOverrides: false })
Acl({ $id: Now.ID['acl-student-pemail-read-self'], type: 'record', table: 'x_774308_campus360_student', field: 'personal_email', operation: 'read', roles: [roleStudent], condition: 'userDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: false })
Acl({ $id: Now.ID['acl-student-pemail-write'], type: 'record', table: 'x_774308_campus360_student', field: 'personal_email', operation: 'write', roles: [roleRegistrar], script: hasExplicitRegistrarRole, adminOverrides: false })
Acl({ $id: Now.ID['acl-student-pemail-qrange'], type: 'record', table: 'x_774308_campus360_student', field: 'personal_email', operation: 'query_range', decisionType: 'deny', roles: [roleRegistrar], script: hasExplicitRegistrarRole, adminOverrides: false })
Acl({ $id: Now.ID['acl-student-pemail-qmatch'], type: 'record', table: 'x_774308_campus360_student', field: 'personal_email', operation: 'query_match', decisionType: 'deny', roles: [roleRegistrar], script: hasExplicitRegistrarRole, adminOverrides: false })
// --- home_address ---
Acl({ $id: Now.ID['acl-student-address-read'], type: 'record', table: 'x_774308_campus360_student', field: 'home_address', operation: 'read', roles: [roleRegistrar], script: hasExplicitRegistrarRole, adminOverrides: false })
Acl({ $id: Now.ID['acl-student-address-read-self'], type: 'record', table: 'x_774308_campus360_student', field: 'home_address', operation: 'read', roles: [roleStudent], condition: 'userDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: false })
Acl({ $id: Now.ID['acl-student-address-write'], type: 'record', table: 'x_774308_campus360_student', field: 'home_address', operation: 'write', roles: [roleRegistrar], script: hasExplicitRegistrarRole, adminOverrides: false })
Acl({ $id: Now.ID['acl-student-address-qrange'], type: 'record', table: 'x_774308_campus360_student', field: 'home_address', operation: 'query_range', decisionType: 'deny', roles: [roleRegistrar], script: hasExplicitRegistrarRole, adminOverrides: false })
Acl({ $id: Now.ID['acl-student-address-qmatch'], type: 'record', table: 'x_774308_campus360_student', field: 'home_address', operation: 'query_match', decisionType: 'deny', roles: [roleRegistrar], script: hasExplicitRegistrarRole, adminOverrides: false })
// --- guardian_name ---
Acl({ $id: Now.ID['acl-student-gname-read'], type: 'record', table: 'x_774308_campus360_student', field: 'guardian_name', operation: 'read', roles: [roleRegistrar], script: hasExplicitRegistrarRole, adminOverrides: false })
Acl({ $id: Now.ID['acl-student-gname-read-self'], type: 'record', table: 'x_774308_campus360_student', field: 'guardian_name', operation: 'read', roles: [roleStudent], condition: 'userDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: false })
Acl({ $id: Now.ID['acl-student-gname-write'], type: 'record', table: 'x_774308_campus360_student', field: 'guardian_name', operation: 'write', roles: [roleRegistrar], script: hasExplicitRegistrarRole, adminOverrides: false })
Acl({ $id: Now.ID['acl-student-gname-qrange'], type: 'record', table: 'x_774308_campus360_student', field: 'guardian_name', operation: 'query_range', decisionType: 'deny', roles: [roleRegistrar], script: hasExplicitRegistrarRole, adminOverrides: false })
Acl({ $id: Now.ID['acl-student-gname-qmatch'], type: 'record', table: 'x_774308_campus360_student', field: 'guardian_name', operation: 'query_match', decisionType: 'deny', roles: [roleRegistrar], script: hasExplicitRegistrarRole, adminOverrides: false })
// --- guardian_relation ---
Acl({ $id: Now.ID['acl-student-grel-read'], type: 'record', table: 'x_774308_campus360_student', field: 'guardian_relation', operation: 'read', roles: [roleRegistrar], script: hasExplicitRegistrarRole, adminOverrides: false })
Acl({ $id: Now.ID['acl-student-grel-read-self'], type: 'record', table: 'x_774308_campus360_student', field: 'guardian_relation', operation: 'read', roles: [roleStudent], condition: 'userDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: false })
Acl({ $id: Now.ID['acl-student-grel-write'], type: 'record', table: 'x_774308_campus360_student', field: 'guardian_relation', operation: 'write', roles: [roleRegistrar], script: hasExplicitRegistrarRole, adminOverrides: false })
Acl({ $id: Now.ID['acl-student-grel-qrange'], type: 'record', table: 'x_774308_campus360_student', field: 'guardian_relation', operation: 'query_range', decisionType: 'deny', roles: [roleRegistrar], script: hasExplicitRegistrarRole, adminOverrides: false })
Acl({ $id: Now.ID['acl-student-grel-qmatch'], type: 'record', table: 'x_774308_campus360_student', field: 'guardian_relation', operation: 'query_match', decisionType: 'deny', roles: [roleRegistrar], script: hasExplicitRegistrarRole, adminOverrides: false })
// --- guardian_phone ---
Acl({ $id: Now.ID['acl-student-gphone-read'], type: 'record', table: 'x_774308_campus360_student', field: 'guardian_phone', operation: 'read', roles: [roleRegistrar], script: hasExplicitRegistrarRole, adminOverrides: false })
Acl({ $id: Now.ID['acl-student-gphone-read-self'], type: 'record', table: 'x_774308_campus360_student', field: 'guardian_phone', operation: 'read', roles: [roleStudent], condition: 'userDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: false })
Acl({ $id: Now.ID['acl-student-gphone-write'], type: 'record', table: 'x_774308_campus360_student', field: 'guardian_phone', operation: 'write', roles: [roleRegistrar], script: hasExplicitRegistrarRole, adminOverrides: false })
Acl({ $id: Now.ID['acl-student-gphone-qrange'], type: 'record', table: 'x_774308_campus360_student', field: 'guardian_phone', operation: 'query_range', decisionType: 'deny', roles: [roleRegistrar], script: hasExplicitRegistrarRole, adminOverrides: false })
Acl({ $id: Now.ID['acl-student-gphone-qmatch'], type: 'record', table: 'x_774308_campus360_student', field: 'guardian_phone', operation: 'query_match', decisionType: 'deny', roles: [roleRegistrar], script: hasExplicitRegistrarRole, adminOverrides: false })

// ============================== FACULTY (table) ==============================
Acl({ $id: Now.ID['acl-faculty-read'], type: 'record', table: 'x_774308_campus360_faculty', operation: 'read', roles: [roleUser], adminOverrides: true, description: 'Faculty directory fields are readable campus-wide; personal fields are protected by field ACLs.' })
Acl({ $id: Now.ID['acl-faculty-create'], type: 'record', table: 'x_774308_campus360_faculty', operation: 'create', roles: [roleFacultyAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-faculty-write'], type: 'record', table: 'x_774308_campus360_faculty', operation: 'write', roles: [roleFacultyAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-faculty-delete'], type: 'record', table: 'x_774308_campus360_faculty', operation: 'delete', roles: [roleAdmin], adminOverrides: true })

// ============================== FACULTY (sensitive fields) ==============================
// --- date_of_birth ---
Acl({ $id: Now.ID['acl-faculty-dob-read'], type: 'record', table: 'x_774308_campus360_faculty', field: 'date_of_birth', operation: 'read', roles: [roleFacultyAdmin], script: hasExplicitFacultyAdminRole, adminOverrides: false })
Acl({ $id: Now.ID['acl-faculty-dob-read-self'], type: 'record', table: 'x_774308_campus360_faculty', field: 'date_of_birth', operation: 'read', roles: [roleFaculty], condition: 'userDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: false })
Acl({ $id: Now.ID['acl-faculty-dob-write'], type: 'record', table: 'x_774308_campus360_faculty', field: 'date_of_birth', operation: 'write', roles: [roleFacultyAdmin], script: hasExplicitFacultyAdminRole, adminOverrides: false })
Acl({ $id: Now.ID['acl-faculty-dob-qrange'], type: 'record', table: 'x_774308_campus360_faculty', field: 'date_of_birth', operation: 'query_range', decisionType: 'deny', roles: [roleFacultyAdmin], script: hasExplicitFacultyAdminRole, adminOverrides: false })
Acl({ $id: Now.ID['acl-faculty-dob-qmatch'], type: 'record', table: 'x_774308_campus360_faculty', field: 'date_of_birth', operation: 'query_match', decisionType: 'deny', roles: [roleFacultyAdmin], script: hasExplicitFacultyAdminRole, adminOverrides: false })
// --- personal_phone ---
Acl({ $id: Now.ID['acl-faculty-pphone-read'], type: 'record', table: 'x_774308_campus360_faculty', field: 'personal_phone', operation: 'read', roles: [roleFacultyAdmin], script: hasExplicitFacultyAdminRole, adminOverrides: false })
Acl({ $id: Now.ID['acl-faculty-pphone-read-self'], type: 'record', table: 'x_774308_campus360_faculty', field: 'personal_phone', operation: 'read', roles: [roleFaculty], condition: 'userDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: false })
Acl({ $id: Now.ID['acl-faculty-pphone-write'], type: 'record', table: 'x_774308_campus360_faculty', field: 'personal_phone', operation: 'write', roles: [roleFacultyAdmin], script: hasExplicitFacultyAdminRole, adminOverrides: false })
Acl({ $id: Now.ID['acl-faculty-pphone-qrange'], type: 'record', table: 'x_774308_campus360_faculty', field: 'personal_phone', operation: 'query_range', decisionType: 'deny', roles: [roleFacultyAdmin], script: hasExplicitFacultyAdminRole, adminOverrides: false })
Acl({ $id: Now.ID['acl-faculty-pphone-qmatch'], type: 'record', table: 'x_774308_campus360_faculty', field: 'personal_phone', operation: 'query_match', decisionType: 'deny', roles: [roleFacultyAdmin], script: hasExplicitFacultyAdminRole, adminOverrides: false })
// --- personal_email ---
Acl({ $id: Now.ID['acl-faculty-pemail-read'], type: 'record', table: 'x_774308_campus360_faculty', field: 'personal_email', operation: 'read', roles: [roleFacultyAdmin], script: hasExplicitFacultyAdminRole, adminOverrides: false })
Acl({ $id: Now.ID['acl-faculty-pemail-read-self'], type: 'record', table: 'x_774308_campus360_faculty', field: 'personal_email', operation: 'read', roles: [roleFaculty], condition: 'userDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: false })
Acl({ $id: Now.ID['acl-faculty-pemail-write'], type: 'record', table: 'x_774308_campus360_faculty', field: 'personal_email', operation: 'write', roles: [roleFacultyAdmin], script: hasExplicitFacultyAdminRole, adminOverrides: false })
Acl({ $id: Now.ID['acl-faculty-pemail-qrange'], type: 'record', table: 'x_774308_campus360_faculty', field: 'personal_email', operation: 'query_range', decisionType: 'deny', roles: [roleFacultyAdmin], script: hasExplicitFacultyAdminRole, adminOverrides: false })
Acl({ $id: Now.ID['acl-faculty-pemail-qmatch'], type: 'record', table: 'x_774308_campus360_faculty', field: 'personal_email', operation: 'query_match', decisionType: 'deny', roles: [roleFacultyAdmin], script: hasExplicitFacultyAdminRole, adminOverrides: false })
// --- home_address ---
Acl({ $id: Now.ID['acl-faculty-address-read'], type: 'record', table: 'x_774308_campus360_faculty', field: 'home_address', operation: 'read', roles: [roleFacultyAdmin], script: hasExplicitFacultyAdminRole, adminOverrides: false })
Acl({ $id: Now.ID['acl-faculty-address-read-self'], type: 'record', table: 'x_774308_campus360_faculty', field: 'home_address', operation: 'read', roles: [roleFaculty], condition: 'userDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: false })
Acl({ $id: Now.ID['acl-faculty-address-write'], type: 'record', table: 'x_774308_campus360_faculty', field: 'home_address', operation: 'write', roles: [roleFacultyAdmin], script: hasExplicitFacultyAdminRole, adminOverrides: false })
Acl({ $id: Now.ID['acl-faculty-address-qrange'], type: 'record', table: 'x_774308_campus360_faculty', field: 'home_address', operation: 'query_range', decisionType: 'deny', roles: [roleFacultyAdmin], script: hasExplicitFacultyAdminRole, adminOverrides: false })
Acl({ $id: Now.ID['acl-faculty-address-qmatch'], type: 'record', table: 'x_774308_campus360_faculty', field: 'home_address', operation: 'query_match', decisionType: 'deny', roles: [roleFacultyAdmin], script: hasExplicitFacultyAdminRole, adminOverrides: false })
// --- emergency_contact ---
Acl({ $id: Now.ID['acl-faculty-econtact-read'], type: 'record', table: 'x_774308_campus360_faculty', field: 'emergency_contact', operation: 'read', roles: [roleFacultyAdmin], script: hasExplicitFacultyAdminRole, adminOverrides: false })
Acl({ $id: Now.ID['acl-faculty-econtact-read-self'], type: 'record', table: 'x_774308_campus360_faculty', field: 'emergency_contact', operation: 'read', roles: [roleFaculty], condition: 'userDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: false })
Acl({ $id: Now.ID['acl-faculty-econtact-write'], type: 'record', table: 'x_774308_campus360_faculty', field: 'emergency_contact', operation: 'write', roles: [roleFacultyAdmin], script: hasExplicitFacultyAdminRole, adminOverrides: false })
Acl({ $id: Now.ID['acl-faculty-econtact-qrange'], type: 'record', table: 'x_774308_campus360_faculty', field: 'emergency_contact', operation: 'query_range', decisionType: 'deny', roles: [roleFacultyAdmin], script: hasExplicitFacultyAdminRole, adminOverrides: false })
Acl({ $id: Now.ID['acl-faculty-econtact-qmatch'], type: 'record', table: 'x_774308_campus360_faculty', field: 'emergency_contact', operation: 'query_match', decisionType: 'deny', roles: [roleFacultyAdmin], script: hasExplicitFacultyAdminRole, adminOverrides: false })
// --- emergency_phone ---
Acl({ $id: Now.ID['acl-faculty-ephone-read'], type: 'record', table: 'x_774308_campus360_faculty', field: 'emergency_phone', operation: 'read', roles: [roleFacultyAdmin], script: hasExplicitFacultyAdminRole, adminOverrides: false })
Acl({ $id: Now.ID['acl-faculty-ephone-read-self'], type: 'record', table: 'x_774308_campus360_faculty', field: 'emergency_phone', operation: 'read', roles: [roleFaculty], condition: 'userDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: false })
Acl({ $id: Now.ID['acl-faculty-ephone-write'], type: 'record', table: 'x_774308_campus360_faculty', field: 'emergency_phone', operation: 'write', roles: [roleFacultyAdmin], script: hasExplicitFacultyAdminRole, adminOverrides: false })
Acl({ $id: Now.ID['acl-faculty-ephone-qrange'], type: 'record', table: 'x_774308_campus360_faculty', field: 'emergency_phone', operation: 'query_range', decisionType: 'deny', roles: [roleFacultyAdmin], script: hasExplicitFacultyAdminRole, adminOverrides: false })
Acl({ $id: Now.ID['acl-faculty-ephone-qmatch'], type: 'record', table: 'x_774308_campus360_faculty', field: 'emergency_phone', operation: 'query_match', decisionType: 'deny', roles: [roleFacultyAdmin], script: hasExplicitFacultyAdminRole, adminOverrides: false })

// ============================== TECHNICIAN ==============================
Acl({ $id: Now.ID['acl-technician-read'], type: 'record', table: 'x_774308_campus360_technician', operation: 'read', roles: [roleTechnician, roleLeadership], adminOverrides: true })
Acl({ $id: Now.ID['acl-technician-create'], type: 'record', table: 'x_774308_campus360_technician', operation: 'create', roles: [roleItManager], adminOverrides: true })
Acl({ $id: Now.ID['acl-technician-write'], type: 'record', table: 'x_774308_campus360_technician', operation: 'write', roles: [roleItManager], adminOverrides: true })
Acl({ $id: Now.ID['acl-technician-write-self'], type: 'record', table: 'x_774308_campus360_technician', operation: 'write', roles: [roleTechnician], condition: 'userDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: true, description: 'Technicians update their own availability; other fields are protected by the field ACLs below.' })
Acl({ $id: Now.ID['acl-technician-maxopen-write'], type: 'record', table: 'x_774308_campus360_technician', field: 'max_open_issues', operation: 'write', roles: [roleItManager], adminOverrides: true })
Acl({ $id: Now.ID['acl-technician-group-write'], type: 'record', table: 'x_774308_campus360_technician', field: 'primary_group', operation: 'write', roles: [roleItManager], adminOverrides: true })
Acl({ $id: Now.ID['acl-technician-skills-write'], type: 'record', table: 'x_774308_campus360_technician', field: 'skills', operation: 'write', roles: [roleItManager], adminOverrides: true })
Acl({ $id: Now.ID['acl-technician-user-write'], type: 'record', table: 'x_774308_campus360_technician', field: 'user', operation: 'write', roles: [roleItManager], adminOverrides: true })
Acl({ $id: Now.ID['acl-technician-active-write'], type: 'record', table: 'x_774308_campus360_technician', field: 'active', operation: 'write', roles: [roleItManager], adminOverrides: true })
Acl({ $id: Now.ID['acl-technician-delete'], type: 'record', table: 'x_774308_campus360_technician', operation: 'delete', roles: [roleAdmin], adminOverrides: true })
