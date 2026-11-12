import { Role } from '@servicenow/sdk/core'

// Campus360 application roles (ROLE_PERMISSION_MATRIX.md §1).
// Role identity is derived from `name` (SDK 4.14), so no $id is needed.

export const roleUser = Role({
    name: 'x_774308_campus360.user',
    description: 'Base Campus360 access: portals and own records.',
})

export const roleStudent = Role({
    name: 'x_774308_campus360.student',
    description: 'Student self-service: own profile, courses, attendance, hostel and requests.',
    containsRoles: [roleUser],
})

export const roleFaculty = Role({
    name: 'x_774308_campus360.faculty',
    description: 'Teaching staff: own sections, class sessions, student attendance marking and self check-in.',
    containsRoles: [roleUser],
})

export const roleHod = Role({
    name: 'x_774308_campus360.hod',
    description: 'Head of Department: department-wide academic oversight and approvals.',
    containsRoles: [roleFaculty],
})

export const roleTechnician = Role({
    name: 'x_774308_campus360.technician',
    description: 'IT support staff who work Campus360 IT issues.',
    containsRoles: [roleUser],
})

export const roleItManager = Role({
    name: 'x_774308_campus360.it_manager',
    description: 'IT service desk lead: IT queue, technicians, issue categories and SLAs.',
    containsRoles: [roleTechnician],
})

export const roleWarden = Role({
    name: 'x_774308_campus360.warden',
    description: 'Hostel warden: rooms, allocations and complaints for assigned hostels.',
    containsRoles: [roleUser],
})

export const roleMaintenance = Role({
    name: 'x_774308_campus360.maintenance',
    description: 'Facilities and electrical staff who work maintenance requests.',
    containsRoles: [roleUser],
})

export const roleLabAdmin = Role({
    name: 'x_774308_campus360.lab_admin',
    description: 'Laboratory administration and preventive maintenance plans.',
    containsRoles: [roleUser],
})

export const roleRegistrar = Role({
    name: 'x_774308_campus360.registrar',
    description: 'Registrar office: students, programs, courses, terms, registrations and attendance override.',
    containsRoles: [roleUser],
})

export const roleFacultyAdmin = Role({
    name: 'x_774308_campus360.faculty_admin',
    description: 'Faculty administration: faculty records, onboarding and faculty attendance.',
    containsRoles: [roleUser],
})

export const roleLeadership = Role({
    name: 'x_774308_campus360.leadership',
    description: 'Read-only analytics across Campus360 modules (no sensitive personal fields).',
    containsRoles: [roleUser],
})

export const roleAdmin = Role({
    name: 'x_774308_campus360.admin',
    description: 'Campus360 application administrator.',
    // Deliberately excludes the self-service personas (student, faculty/hod): self-service
    // row filters must never restrict administrators. Admin is granted explicitly in every ACL.
    containsRoles: [
        roleItManager,
        roleWarden,
        roleMaintenance,
        roleLabAdmin,
        roleRegistrar,
        roleFacultyAdmin,
        roleLeadership,
    ],
})
