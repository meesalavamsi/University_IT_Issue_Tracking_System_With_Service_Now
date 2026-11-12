import { ApplicationMenu, Record } from '@servicenow/sdk/core'
import {
    roleAdmin,
    roleFacultyAdmin,
    roleHod,
    roleItManager,
    roleLabAdmin,
    roleLeadership,
    roleMaintenance,
    roleRegistrar,
    roleTechnician,
    roleUser,
    roleWarden,
} from '../roles/roles.now'

// Campus360 application navigator (ARCHITECTURE.md §5.3).
// Students and faculty use the portals (Part 11); the navigator is for staff and administrators.

export const campus360Menu = ApplicationMenu({
    $id: Now.ID['menu-campus360'],
    title: 'Campus360',
    hint: 'University IT Issue Tracking & College Campus Management',
    description: 'Campus360 administration: IT issues, students, faculty, academics, attendance, hostels, labs and infrastructure.',
    order: 100,
    active: true,
    // roleUser: every Campus360 persona can see the menu, but each module keeps its own role list,
    // so students/faculty only see "Campus360 Portal".
    roles: [
        roleUser,
        roleAdmin,
        roleItManager,
        roleTechnician,
        roleWarden,
        roleMaintenance,
        roleLabAdmin,
        roleRegistrar,
        roleFacultyAdmin,
        roleLeadership,
        roleHod,
    ],
})

// ============================== IT Issues ==============================
Record({ $id: Now.ID['mod-sep-it'], table: 'sys_app_module', data: { title: 'IT Issues', application: campus360Menu, link_type: 'SEPARATOR', order: 100, active: true, roles: ['x_774308_campus360.technician', 'x_774308_campus360.leadership', 'x_774308_campus360.admin'] } })
Record({ $id: Now.ID['mod-it-new'], table: 'sys_app_module', data: { title: 'Create New', application: campus360Menu, link_type: 'NEW', name: 'x_774308_campus360_it_issue', order: 110, active: true, roles: ['x_774308_campus360.technician', 'x_774308_campus360.admin'] } })
Record({ $id: Now.ID['mod-it-open'], table: 'sys_app_module', data: { title: 'Open', application: campus360Menu, link_type: 'FILTER', name: 'x_774308_campus360_it_issue', filter: 'active=true^EQ', order: 120, active: true, roles: ['x_774308_campus360.technician', 'x_774308_campus360.admin'] } })
Record({ $id: Now.ID['mod-it-unassigned'], table: 'sys_app_module', data: { title: 'Open - Unassigned', application: campus360Menu, link_type: 'FILTER', name: 'x_774308_campus360_it_issue', filter: 'active=true^assigned_toISEMPTY^EQ', order: 130, active: true, roles: ['x_774308_campus360.technician', 'x_774308_campus360.admin'] } })
Record({ $id: Now.ID['mod-it-my-groups'], table: 'sys_app_module', data: { title: "My Groups' Work", application: campus360Menu, link_type: 'FILTER', name: 'x_774308_campus360_it_issue', filter: 'active=true^assignment_groupDYNAMICd6435e965f510100a9ad2572f2b47744^EQ', order: 140, active: true, roles: ['x_774308_campus360.technician', 'x_774308_campus360.admin'] } })
Record({ $id: Now.ID['mod-it-assigned-me'], table: 'sys_app_module', data: { title: 'Assigned to Me', application: campus360Menu, link_type: 'FILTER', name: 'x_774308_campus360_it_issue', filter: 'active=true^assigned_toDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', order: 150, active: true, roles: ['x_774308_campus360.technician', 'x_774308_campus360.admin'] } })
Record({ $id: Now.ID['mod-it-resolved'], table: 'sys_app_module', data: { title: 'Resolved', application: campus360Menu, link_type: 'FILTER', name: 'x_774308_campus360_it_issue', filter: 'state=6^EQ', order: 160, active: true, roles: ['x_774308_campus360.technician', 'x_774308_campus360.admin'] } })
Record({ $id: Now.ID['mod-it-all'], table: 'sys_app_module', data: { title: 'All', application: campus360Menu, link_type: 'LIST', name: 'x_774308_campus360_it_issue', order: 170, active: true, roles: ['x_774308_campus360.technician', 'x_774308_campus360.leadership', 'x_774308_campus360.admin'] } })
Record({ $id: Now.ID['mod-it-technicians'], table: 'sys_app_module', data: { title: 'Technicians', application: campus360Menu, link_type: 'LIST', name: 'x_774308_campus360_technician', order: 180, active: true, roles: ['x_774308_campus360.it_manager', 'x_774308_campus360.admin'] } })
Record({ $id: Now.ID['mod-it-categories'], table: 'sys_app_module', data: { title: 'Issue Categories', application: campus360Menu, link_type: 'LIST', name: 'x_774308_campus360_issue_cat', order: 190, active: true, roles: ['x_774308_campus360.it_manager', 'x_774308_campus360.admin'] } })
Record({ $id: Now.ID['mod-it-subcategories'], table: 'sys_app_module', data: { title: 'Issue Subcategories', application: campus360Menu, link_type: 'LIST', name: 'x_774308_campus360_issue_sub', order: 195, active: true, roles: ['x_774308_campus360.it_manager', 'x_774308_campus360.admin'] } })

// ============================== Students ==============================
Record({ $id: Now.ID['mod-sep-students'], table: 'sys_app_module', data: { title: 'Students', application: campus360Menu, link_type: 'SEPARATOR', order: 200, active: true, roles: ['x_774308_campus360.registrar', 'x_774308_campus360.hod', 'x_774308_campus360.leadership', 'x_774308_campus360.admin'] } })
Record({ $id: Now.ID['mod-stu-students'], table: 'sys_app_module', data: { title: 'Students', application: campus360Menu, link_type: 'LIST', name: 'x_774308_campus360_student', order: 210, active: true, roles: ['x_774308_campus360.registrar', 'x_774308_campus360.hod', 'x_774308_campus360.leadership', 'x_774308_campus360.admin'] } })
Record({ $id: Now.ID['mod-stu-reg-pending'], table: 'sys_app_module', data: { title: 'Registrations - Pending', application: campus360Menu, link_type: 'FILTER', name: 'x_774308_campus360_student_reg', filter: 'active=true^EQ', order: 220, active: true, roles: ['x_774308_campus360.registrar', 'x_774308_campus360.hod', 'x_774308_campus360.admin'] } })
Record({ $id: Now.ID['mod-stu-reg-all'], table: 'sys_app_module', data: { title: 'Registrations - All', application: campus360Menu, link_type: 'LIST', name: 'x_774308_campus360_student_reg', order: 230, active: true, roles: ['x_774308_campus360.registrar', 'x_774308_campus360.admin'] } })
Record({ $id: Now.ID['mod-stu-programs'], table: 'sys_app_module', data: { title: 'Programs', application: campus360Menu, link_type: 'LIST', name: 'x_774308_campus360_program', order: 240, active: true, roles: ['x_774308_campus360.registrar', 'x_774308_campus360.admin'] } })

// ============================== Faculty ==============================
Record({ $id: Now.ID['mod-sep-faculty'], table: 'sys_app_module', data: { title: 'Faculty', application: campus360Menu, link_type: 'SEPARATOR', order: 300, active: true, roles: ['x_774308_campus360.faculty_admin', 'x_774308_campus360.hod', 'x_774308_campus360.leadership', 'x_774308_campus360.admin'] } })
Record({ $id: Now.ID['mod-fac-faculty'], table: 'sys_app_module', data: { title: 'Faculty', application: campus360Menu, link_type: 'LIST', name: 'x_774308_campus360_faculty', order: 310, active: true, roles: ['x_774308_campus360.faculty_admin', 'x_774308_campus360.hod', 'x_774308_campus360.leadership', 'x_774308_campus360.admin'] } })
Record({ $id: Now.ID['mod-fac-onboarding'], table: 'sys_app_module', data: { title: 'Onboarding', application: campus360Menu, link_type: 'LIST', name: 'x_774308_campus360_fac_onboard', order: 320, active: true, roles: ['x_774308_campus360.faculty_admin', 'x_774308_campus360.hod', 'x_774308_campus360.admin'] } })
Record({ $id: Now.ID['mod-fac-onboard-tasks'], table: 'sys_app_module', data: { title: 'Onboarding Tasks', application: campus360Menu, link_type: 'FILTER', name: 'x_774308_campus360_onboard_tsk', filter: 'active=true^EQ', order: 330, active: true, roles: ['x_774308_campus360.faculty_admin', 'x_774308_campus360.technician', 'x_774308_campus360.admin'] } })
Record({ $id: Now.ID['mod-fac-onb-templates'], table: 'sys_app_module', data: { title: 'Onboarding Templates', application: campus360Menu, link_type: 'LIST', name: 'x_774308_campus360_onb_tmpl', order: 340, active: true, roles: ['x_774308_campus360.faculty_admin', 'x_774308_campus360.admin'] } })

// ============================== Academics ==============================
Record({ $id: Now.ID['mod-sep-academics'], table: 'sys_app_module', data: { title: 'Academics', application: campus360Menu, link_type: 'SEPARATOR', order: 400, active: true, roles: ['x_774308_campus360.registrar', 'x_774308_campus360.hod', 'x_774308_campus360.leadership', 'x_774308_campus360.admin'] } })
Record({ $id: Now.ID['mod-acad-departments'], table: 'sys_app_module', data: { title: 'Departments', application: campus360Menu, link_type: 'LIST', name: 'x_774308_campus360_department', order: 410, active: true, roles: ['x_774308_campus360.registrar', 'x_774308_campus360.hod', 'x_774308_campus360.leadership', 'x_774308_campus360.admin'] } })
Record({ $id: Now.ID['mod-acad-terms'], table: 'sys_app_module', data: { title: 'Academic Terms', application: campus360Menu, link_type: 'LIST', name: 'x_774308_campus360_acad_term', order: 420, active: true, roles: ['x_774308_campus360.registrar', 'x_774308_campus360.admin'] } })
Record({ $id: Now.ID['mod-acad-courses'], table: 'sys_app_module', data: { title: 'Courses', application: campus360Menu, link_type: 'LIST', name: 'x_774308_campus360_course', order: 430, active: true, roles: ['x_774308_campus360.registrar', 'x_774308_campus360.hod', 'x_774308_campus360.admin'] } })
Record({ $id: Now.ID['mod-acad-sections'], table: 'sys_app_module', data: { title: 'Course Sections', application: campus360Menu, link_type: 'LIST', name: 'x_774308_campus360_course_sec', order: 440, active: true, roles: ['x_774308_campus360.registrar', 'x_774308_campus360.hod', 'x_774308_campus360.admin'] } })
Record({ $id: Now.ID['mod-acad-enrollments'], table: 'sys_app_module', data: { title: 'Enrollments', application: campus360Menu, link_type: 'LIST', name: 'x_774308_campus360_enrollment', order: 450, active: true, roles: ['x_774308_campus360.registrar', 'x_774308_campus360.hod', 'x_774308_campus360.admin'] } })

// ============================== Attendance ==============================
Record({ $id: Now.ID['mod-sep-attendance'], table: 'sys_app_module', data: { title: 'Attendance', application: campus360Menu, link_type: 'SEPARATOR', order: 500, active: true, roles: ['x_774308_campus360.registrar', 'x_774308_campus360.hod', 'x_774308_campus360.faculty_admin', 'x_774308_campus360.leadership', 'x_774308_campus360.admin'] } })
Record({ $id: Now.ID['mod-att-sessions-today'], table: 'sys_app_module', data: { title: 'Class Sessions - Today', application: campus360Menu, link_type: 'FILTER', name: 'x_774308_campus360_class_sess', filter: 'session_dateONToday@javascript:gs.beginningOfToday()@javascript:gs.endOfToday()^EQ', order: 510, active: true, roles: ['x_774308_campus360.registrar', 'x_774308_campus360.hod', 'x_774308_campus360.admin'] } })
Record({ $id: Now.ID['mod-att-sessions'], table: 'sys_app_module', data: { title: 'Class Sessions', application: campus360Menu, link_type: 'LIST', name: 'x_774308_campus360_class_sess', order: 520, active: true, roles: ['x_774308_campus360.registrar', 'x_774308_campus360.hod', 'x_774308_campus360.admin'] } })
Record({ $id: Now.ID['mod-att-student'], table: 'sys_app_module', data: { title: 'Student Attendance', application: campus360Menu, link_type: 'LIST', name: 'x_774308_campus360_stu_attend', order: 530, active: true, roles: ['x_774308_campus360.registrar', 'x_774308_campus360.hod', 'x_774308_campus360.admin'] } })
Record({ $id: Now.ID['mod-att-low'], table: 'sys_app_module', data: { title: 'Low Attendance (< 75%)', application: campus360Menu, link_type: 'FILTER', name: 'x_774308_campus360_enrollment', filter: 'status=enrolled^attendance_pct<75^EQ', order: 540, active: true, roles: ['x_774308_campus360.registrar', 'x_774308_campus360.hod', 'x_774308_campus360.leadership', 'x_774308_campus360.admin'] } })
Record({ $id: Now.ID['mod-att-faculty'], table: 'sys_app_module', data: { title: 'Faculty Attendance', application: campus360Menu, link_type: 'LIST', name: 'x_774308_campus360_fac_attend', order: 550, active: true, roles: ['x_774308_campus360.faculty_admin', 'x_774308_campus360.hod', 'x_774308_campus360.admin'] } })

// ============================== Hostel ==============================
Record({ $id: Now.ID['mod-sep-hostel'], table: 'sys_app_module', data: { title: 'Hostel', application: campus360Menu, link_type: 'SEPARATOR', order: 600, active: true, roles: ['x_774308_campus360.warden', 'x_774308_campus360.leadership', 'x_774308_campus360.admin'] } })
Record({ $id: Now.ID['mod-hos-hostels'], table: 'sys_app_module', data: { title: 'Hostels', application: campus360Menu, link_type: 'LIST', name: 'x_774308_campus360_hostel', order: 610, active: true, roles: ['x_774308_campus360.warden', 'x_774308_campus360.leadership', 'x_774308_campus360.admin'] } })
Record({ $id: Now.ID['mod-hos-rooms'], table: 'sys_app_module', data: { title: 'Rooms', application: campus360Menu, link_type: 'LIST', name: 'x_774308_campus360_hostel_room', order: 620, active: true, roles: ['x_774308_campus360.warden', 'x_774308_campus360.admin'] } })
Record({ $id: Now.ID['mod-hos-alloc-requests'], table: 'sys_app_module', data: { title: 'Allocation Requests', application: campus360Menu, link_type: 'FILTER', name: 'x_774308_campus360_room_alloc', filter: 'status=requested^EQ', order: 630, active: true, roles: ['x_774308_campus360.warden', 'x_774308_campus360.admin'] } })
Record({ $id: Now.ID['mod-hos-allocations'], table: 'sys_app_module', data: { title: 'Allocations', application: campus360Menu, link_type: 'LIST', name: 'x_774308_campus360_room_alloc', order: 640, active: true, roles: ['x_774308_campus360.warden', 'x_774308_campus360.admin'] } })
Record({ $id: Now.ID['mod-hos-complaints'], table: 'sys_app_module', data: { title: 'Complaints - Open', application: campus360Menu, link_type: 'FILTER', name: 'x_774308_campus360_hostel_cmpl', filter: 'active=true^EQ', order: 650, active: true, roles: ['x_774308_campus360.warden', 'x_774308_campus360.admin'] } })

// ============================== Labs & Infrastructure ==============================
Record({ $id: Now.ID['mod-sep-labs'], table: 'sys_app_module', data: { title: 'Labs & Infrastructure', application: campus360Menu, link_type: 'SEPARATOR', order: 700, active: true, roles: ['x_774308_campus360.lab_admin', 'x_774308_campus360.maintenance', 'x_774308_campus360.leadership', 'x_774308_campus360.admin'] } })
Record({ $id: Now.ID['mod-lab-labs'], table: 'sys_app_module', data: { title: 'Laboratories', application: campus360Menu, link_type: 'LIST', name: 'x_774308_campus360_laboratory', order: 710, active: true, roles: ['x_774308_campus360.lab_admin', 'x_774308_campus360.maintenance', 'x_774308_campus360.leadership', 'x_774308_campus360.admin'] } })
Record({ $id: Now.ID['mod-lab-maint-open'], table: 'sys_app_module', data: { title: 'Maintenance Requests - Open', application: campus360Menu, link_type: 'FILTER', name: 'x_774308_campus360_maint_req', filter: 'active=true^EQ', order: 720, active: true, roles: ['x_774308_campus360.lab_admin', 'x_774308_campus360.maintenance', 'x_774308_campus360.admin'] } })
Record({ $id: Now.ID['mod-lab-maint-all'], table: 'sys_app_module', data: { title: 'Maintenance Requests - All', application: campus360Menu, link_type: 'LIST', name: 'x_774308_campus360_maint_req', order: 730, active: true, roles: ['x_774308_campus360.lab_admin', 'x_774308_campus360.maintenance', 'x_774308_campus360.leadership', 'x_774308_campus360.admin'] } })
Record({ $id: Now.ID['mod-lab-pm-plans'], table: 'sys_app_module', data: { title: 'Preventive Maintenance Plans', application: campus360Menu, link_type: 'LIST', name: 'x_774308_campus360_pm_schedule', order: 740, active: true, roles: ['x_774308_campus360.lab_admin', 'x_774308_campus360.admin'] } })
Record({ $id: Now.ID['mod-lab-hardware'], table: 'sys_app_module', data: { title: 'Campus Hardware Assets', application: campus360Menu, link_type: 'LIST', name: 'alm_hardware', order: 750, active: true, roles: ['x_774308_campus360.lab_admin', 'x_774308_campus360.admin'] } })

// ============================== Administration ==============================
Record({ $id: Now.ID['mod-sep-admin'], table: 'sys_app_module', data: { title: 'Administration', application: campus360Menu, link_type: 'SEPARATOR', order: 900, active: true, roles: ['x_774308_campus360.admin'] } })
Record({ $id: Now.ID['mod-admin-properties'], table: 'sys_app_module', data: { title: 'Properties', application: campus360Menu, link_type: 'FILTER', name: 'sys_properties', filter: 'nameSTARTSWITHx_774308_campus360.^EQ', order: 910, active: true, roles: ['x_774308_campus360.admin'] } })
Record({ $id: Now.ID['mod-admin-groups'], table: 'sys_app_module', data: { title: 'Campus360 Groups', application: campus360Menu, link_type: 'FILTER', name: 'sys_user_group', filter: 'nameSTARTSWITHC360^EQ', order: 920, active: true, roles: ['x_774308_campus360.admin'] } })
