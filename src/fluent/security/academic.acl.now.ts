import { Acl } from '@servicenow/sdk/core'
import { roleAdmin, roleFaculty, roleHod, roleLeadership, roleRegistrar, roleStudent, roleUser } from '../roles/roles.now'

// ACLs — academic structure (ROLE_PERMISSION_MATRIX.md §3–4).
// Dynamic filter "Me" = DYNAMIC90d1921e5f510100a9ad2572f2b477fe (verified on instance).
// Role containment: admin ⊃ registrar, leadership; hod ⊃ faculty ⊃ user; student ⊃ user.

// ---- Department ----
Acl({ $id: Now.ID['acl-department-read'], type: 'record', table: 'x_774308_campus360_department', operation: 'read', roles: [roleUser], adminOverrides: true, description: 'Departments are campus reference data.' })
Acl({ $id: Now.ID['acl-department-create'], type: 'record', table: 'x_774308_campus360_department', operation: 'create', roles: [roleRegistrar], adminOverrides: true })
Acl({ $id: Now.ID['acl-department-write'], type: 'record', table: 'x_774308_campus360_department', operation: 'write', roles: [roleRegistrar], adminOverrides: true })
Acl({ $id: Now.ID['acl-department-write-hod'], type: 'record', table: 'x_774308_campus360_department', operation: 'write', roles: [roleHod], condition: 'hod.userDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: true, description: 'RL-15: HOD may update their own department.' })
Acl({ $id: Now.ID['acl-department-delete'], type: 'record', table: 'x_774308_campus360_department', operation: 'delete', roles: [roleAdmin], adminOverrides: true })

// ---- Academic Term ----
Acl({ $id: Now.ID['acl-acad-term-read'], type: 'record', table: 'x_774308_campus360_acad_term', operation: 'read', roles: [roleUser], adminOverrides: true })
Acl({ $id: Now.ID['acl-acad-term-create'], type: 'record', table: 'x_774308_campus360_acad_term', operation: 'create', roles: [roleRegistrar], adminOverrides: true })
Acl({ $id: Now.ID['acl-acad-term-write'], type: 'record', table: 'x_774308_campus360_acad_term', operation: 'write', roles: [roleRegistrar], adminOverrides: true })
Acl({ $id: Now.ID['acl-acad-term-delete'], type: 'record', table: 'x_774308_campus360_acad_term', operation: 'delete', roles: [roleAdmin], adminOverrides: true })

// ---- Program ----
Acl({ $id: Now.ID['acl-program-read'], type: 'record', table: 'x_774308_campus360_program', operation: 'read', roles: [roleUser], adminOverrides: true })
Acl({ $id: Now.ID['acl-program-create'], type: 'record', table: 'x_774308_campus360_program', operation: 'create', roles: [roleRegistrar], adminOverrides: true })
Acl({ $id: Now.ID['acl-program-write'], type: 'record', table: 'x_774308_campus360_program', operation: 'write', roles: [roleRegistrar], adminOverrides: true })
Acl({ $id: Now.ID['acl-program-delete'], type: 'record', table: 'x_774308_campus360_program', operation: 'delete', roles: [roleAdmin], adminOverrides: true })

// ---- Course ----
Acl({ $id: Now.ID['acl-course-read'], type: 'record', table: 'x_774308_campus360_course', operation: 'read', roles: [roleUser], adminOverrides: true })
Acl({ $id: Now.ID['acl-course-create'], type: 'record', table: 'x_774308_campus360_course', operation: 'create', roles: [roleRegistrar], adminOverrides: true })
Acl({ $id: Now.ID['acl-course-write'], type: 'record', table: 'x_774308_campus360_course', operation: 'write', roles: [roleRegistrar], adminOverrides: true })
Acl({ $id: Now.ID['acl-course-write-hod'], type: 'record', table: 'x_774308_campus360_course', operation: 'write', roles: [roleHod], condition: 'department.hod.userDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: true, description: 'RL-15: HOD may update courses of their department.' })
Acl({ $id: Now.ID['acl-course-delete'], type: 'record', table: 'x_774308_campus360_course', operation: 'delete', roles: [roleAdmin], adminOverrides: true })

// ---- Course Section (timetable data; readable campus-wide) ----
Acl({ $id: Now.ID['acl-course-sec-read'], type: 'record', table: 'x_774308_campus360_course_sec', operation: 'read', roles: [roleUser], adminOverrides: true, description: 'Course sections are timetable data, readable by all Campus360 users.' })
Acl({ $id: Now.ID['acl-course-sec-create'], type: 'record', table: 'x_774308_campus360_course_sec', operation: 'create', roles: [roleRegistrar], adminOverrides: true })
Acl({ $id: Now.ID['acl-course-sec-create-hod'], type: 'record', table: 'x_774308_campus360_course_sec', operation: 'create', roles: [roleHod], condition: 'course.department.hod.userDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: true })
Acl({ $id: Now.ID['acl-course-sec-write'], type: 'record', table: 'x_774308_campus360_course_sec', operation: 'write', roles: [roleRegistrar], adminOverrides: true })
Acl({ $id: Now.ID['acl-course-sec-write-hod'], type: 'record', table: 'x_774308_campus360_course_sec', operation: 'write', roles: [roleHod], condition: 'course.department.hod.userDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: true })
Acl({ $id: Now.ID['acl-course-sec-delete'], type: 'record', table: 'x_774308_campus360_course_sec', operation: 'delete', roles: [roleAdmin], adminOverrides: true })

// ---- Enrollment ----
Acl({ $id: Now.ID['acl-enrollment-read'], type: 'record', table: 'x_774308_campus360_enrollment', operation: 'read', roles: [roleRegistrar, roleLeadership], adminOverrides: true })
Acl({ $id: Now.ID['acl-enrollment-read-student'], type: 'record', table: 'x_774308_campus360_enrollment', operation: 'read', roles: [roleStudent], condition: 'student.userDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: true, description: 'RL-14: students read their own enrollments.' })
Acl({ $id: Now.ID['acl-enrollment-read-faculty'], type: 'record', table: 'x_774308_campus360_enrollment', operation: 'read', roles: [roleFaculty], condition: 'course_section.faculty.userDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: true, description: 'Instructors read enrollments of their own sections.' })
Acl({ $id: Now.ID['acl-enrollment-read-hod'], type: 'record', table: 'x_774308_campus360_enrollment', operation: 'read', roles: [roleHod], condition: 'student.department.hod.userDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: true })
Acl({ $id: Now.ID['acl-enrollment-create'], type: 'record', table: 'x_774308_campus360_enrollment', operation: 'create', roles: [roleRegistrar], adminOverrides: true })
Acl({ $id: Now.ID['acl-enrollment-write'], type: 'record', table: 'x_774308_campus360_enrollment', operation: 'write', roles: [roleRegistrar], adminOverrides: true })
Acl({ $id: Now.ID['acl-enrollment-delete'], type: 'record', table: 'x_774308_campus360_enrollment', operation: 'delete', roles: [roleAdmin], adminOverrides: true })
