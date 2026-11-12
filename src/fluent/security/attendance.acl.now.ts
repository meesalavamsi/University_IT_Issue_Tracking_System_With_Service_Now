import { Acl } from '@servicenow/sdk/core'
import {
    roleFaculty,
    roleFacultyAdmin,
    roleHod,
    roleLeadership,
    roleRegistrar,
    roleStudent,
    roleUser,
} from '../roles/roles.now'

// ACLs — attendance (ROLE_PERMISSION_MATRIX.md §3–4, RL-07..RL-10).
// Edit-window, future-date and enrollment checks are server-side business rules (Part 7);
// these ACLs decide WHO may act on WHICH rows.
// Attendance can never be deleted (not even by administrators): mistakes are corrected by status
// change so the audit trail stays complete.

// ============================== Class Session ==============================
Acl({ $id: Now.ID['acl-class-sess-read'], type: 'record', table: 'x_774308_campus360_class_sess', operation: 'read', roles: [roleRegistrar, roleLeadership], adminOverrides: true })
Acl({ $id: Now.ID['acl-class-sess-read-faculty'], type: 'record', table: 'x_774308_campus360_class_sess', operation: 'read', roles: [roleFaculty], condition: 'faculty.userDYNAMIC90d1921e5f510100a9ad2572f2b477fe^ORcourse_section.faculty.userDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: true, description: 'RL-09: instructors read sessions of their sections or sessions they take.' })
Acl({ $id: Now.ID['acl-class-sess-read-hod'], type: 'record', table: 'x_774308_campus360_class_sess', operation: 'read', roles: [roleHod], condition: 'course_section.course.department.hod.userDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: true })
Acl({ $id: Now.ID['acl-class-sess-read-student'], type: 'record', table: 'x_774308_campus360_class_sess', operation: 'read', roles: [roleStudent], adminOverrides: true, description: 'Session timetable data (date/time/topic) is not personal; student rows are narrowed by the Part 3 query rule.' })
Acl({ $id: Now.ID['acl-class-sess-create'], type: 'record', table: 'x_774308_campus360_class_sess', operation: 'create', roles: [roleRegistrar], adminOverrides: true })
Acl({ $id: Now.ID['acl-class-sess-create-faculty'], type: 'record', table: 'x_774308_campus360_class_sess', operation: 'create', roles: [roleFaculty], condition: 'course_section.faculty.userDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: true })
Acl({ $id: Now.ID['acl-class-sess-write'], type: 'record', table: 'x_774308_campus360_class_sess', operation: 'write', roles: [roleRegistrar], adminOverrides: true })
Acl({ $id: Now.ID['acl-class-sess-write-faculty'], type: 'record', table: 'x_774308_campus360_class_sess', operation: 'write', roles: [roleFaculty], condition: 'faculty.userDYNAMIC90d1921e5f510100a9ad2572f2b477fe^ORcourse_section.faculty.userDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: true })
Acl({ $id: Now.ID['acl-class-sess-write-hod'], type: 'record', table: 'x_774308_campus360_class_sess', operation: 'write', roles: [roleHod], condition: 'course_section.course.department.hod.userDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: true })
Acl({ $id: Now.ID['acl-class-sess-delete'], type: 'record', table: 'x_774308_campus360_class_sess', operation: 'delete', roles: [roleRegistrar], condition: 'attendance_status=not_started^EQ', adminOverrides: true, description: 'Sessions can be deleted only before any attendance is taken.' })

// ============================== Student Attendance ==============================
Acl({ $id: Now.ID['acl-stu-attend-read'], type: 'record', table: 'x_774308_campus360_stu_attend', operation: 'read', roles: [roleRegistrar, roleLeadership], adminOverrides: true })
Acl({ $id: Now.ID['acl-stu-attend-read-student'], type: 'record', table: 'x_774308_campus360_stu_attend', operation: 'read', roles: [roleStudent], condition: 'student.userDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: true, description: 'RL-08: students read their own attendance.' })
Acl({ $id: Now.ID['acl-stu-attend-read-faculty'], type: 'record', table: 'x_774308_campus360_stu_attend', operation: 'read', roles: [roleFaculty], condition: 'class_session.faculty.userDYNAMIC90d1921e5f510100a9ad2572f2b477fe^ORclass_session.course_section.faculty.userDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: true })
Acl({ $id: Now.ID['acl-stu-attend-read-hod'], type: 'record', table: 'x_774308_campus360_stu_attend', operation: 'read', roles: [roleHod], condition: 'student.department.hod.userDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: true })
Acl({ $id: Now.ID['acl-stu-attend-create'], type: 'record', table: 'x_774308_campus360_stu_attend', operation: 'create', roles: [roleRegistrar], adminOverrides: true })
Acl({ $id: Now.ID['acl-stu-attend-create-faculty'], type: 'record', table: 'x_774308_campus360_stu_attend', operation: 'create', roles: [roleFaculty], condition: 'class_session.faculty.userDYNAMIC90d1921e5f510100a9ad2572f2b477fe^ORclass_session.course_section.faculty.userDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: true, description: 'RL-07: instructors mark attendance for their own sessions (edit window enforced by business rule).' })
Acl({ $id: Now.ID['acl-stu-attend-write'], type: 'record', table: 'x_774308_campus360_stu_attend', operation: 'write', roles: [roleRegistrar], adminOverrides: true })
Acl({ $id: Now.ID['acl-stu-attend-write-faculty'], type: 'record', table: 'x_774308_campus360_stu_attend', operation: 'write', roles: [roleFaculty], condition: 'locked=false^class_session.faculty.userDYNAMIC90d1921e5f510100a9ad2572f2b477fe^ORclass_session.course_section.faculty.userDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: true })
Acl({ $id: Now.ID['acl-stu-attend-write-hod'], type: 'record', table: 'x_774308_campus360_stu_attend', operation: 'write', roles: [roleHod], condition: 'student.department.hod.userDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: true, description: 'HOD override (reason required by business rule).' })
Acl({ $id: Now.ID['acl-stu-attend-student-field-write'], type: 'record', table: 'x_774308_campus360_stu_attend', field: 'student', operation: 'write', roles: [roleRegistrar], adminOverrides: true, description: 'After creation, the student on an attendance record can only be corrected by the registrar.' })
Acl({ $id: Now.ID['acl-stu-attend-student-field-create'], type: 'record', table: 'x_774308_campus360_stu_attend', field: 'student', operation: 'create', roles: [roleFaculty, roleRegistrar], adminOverrides: true })
Acl({ $id: Now.ID['acl-stu-attend-session-field-write'], type: 'record', table: 'x_774308_campus360_stu_attend', field: 'class_session', operation: 'write', roles: [roleRegistrar], adminOverrides: true })
Acl({ $id: Now.ID['acl-stu-attend-session-field-create'], type: 'record', table: 'x_774308_campus360_stu_attend', field: 'class_session', operation: 'create', roles: [roleFaculty, roleRegistrar], adminOverrides: true })
Acl({ $id: Now.ID['acl-stu-attend-delete-deny'], type: 'record', table: 'x_774308_campus360_stu_attend', operation: 'delete', decisionType: 'deny', condition: 'sys_idISEMPTY^EQ', adminOverrides: false, description: 'Attendance records can never be deleted (deny-unless with an always-false condition, no admin override).' })

// ============================== Faculty Attendance ==============================
Acl({ $id: Now.ID['acl-fac-attend-read'], type: 'record', table: 'x_774308_campus360_fac_attend', operation: 'read', roles: [roleFacultyAdmin, roleLeadership], adminOverrides: true })
Acl({ $id: Now.ID['acl-fac-attend-read-self'], type: 'record', table: 'x_774308_campus360_fac_attend', operation: 'read', roles: [roleFaculty], condition: 'faculty.userDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: true, description: 'RL-10: faculty read their own attendance.' })
Acl({ $id: Now.ID['acl-fac-attend-read-hod'], type: 'record', table: 'x_774308_campus360_fac_attend', operation: 'read', roles: [roleHod], condition: 'faculty.department.hod.userDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: true })
Acl({ $id: Now.ID['acl-fac-attend-create'], type: 'record', table: 'x_774308_campus360_fac_attend', operation: 'create', roles: [roleFacultyAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-fac-attend-create-self'], type: 'record', table: 'x_774308_campus360_fac_attend', operation: 'create', roles: [roleFaculty], condition: 'faculty.userDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: true, description: 'Self check-in; "today only" is enforced by business rule.' })
Acl({ $id: Now.ID['acl-fac-attend-write'], type: 'record', table: 'x_774308_campus360_fac_attend', operation: 'write', roles: [roleFacultyAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-fac-attend-write-self'], type: 'record', table: 'x_774308_campus360_fac_attend', operation: 'write', roles: [roleFaculty], condition: 'faculty.userDYNAMIC90d1921e5f510100a9ad2572f2b477fe^source=self^EQ', adminOverrides: true })
Acl({ $id: Now.ID['acl-fac-attend-write-hod'], type: 'record', table: 'x_774308_campus360_fac_attend', operation: 'write', roles: [roleHod], condition: 'faculty.department.hod.userDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: true })
Acl({ $id: Now.ID['acl-fac-attend-faculty-field-write'], type: 'record', table: 'x_774308_campus360_fac_attend', field: 'faculty', operation: 'write', roles: [roleFacultyAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-fac-attend-faculty-field-create'], type: 'record', table: 'x_774308_campus360_fac_attend', field: 'faculty', operation: 'create', roles: [roleUser], adminOverrides: true, description: 'Row-level create ACLs above already restrict faculty to themselves.' })
Acl({ $id: Now.ID['acl-fac-attend-date-field-write'], type: 'record', table: 'x_774308_campus360_fac_attend', field: 'attendance_date', operation: 'write', roles: [roleFacultyAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-fac-attend-date-field-create'], type: 'record', table: 'x_774308_campus360_fac_attend', field: 'attendance_date', operation: 'create', roles: [roleUser], adminOverrides: true })
Acl({ $id: Now.ID['acl-fac-attend-delete-deny'], type: 'record', table: 'x_774308_campus360_fac_attend', operation: 'delete', decisionType: 'deny', condition: 'sys_idISEMPTY^EQ', adminOverrides: false, description: 'Faculty attendance records can never be deleted.' })
