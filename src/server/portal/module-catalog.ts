/**
 * Campus360 records catalog: the portal mirror of the native application navigator
 * (src/fluent/menu/campus360.menu.now.ts). Same sections, titles, filters and role lists.
 * Pure data + pure functions (unit-tested). Filters are SERVER-DEFINED: the client only sends a module key.
 * Row/field access is still decided by ACLs and query rules (GlideRecordSecure), never by this catalog.
 */
import type { Persona } from './core.ts'

export type ModuleKind = 'list' | 'new' | 'native'
export interface CatalogModule {
    key: string
    group: string
    title: string
    kind: ModuleKind
    table: string
    query?: string
    order?: string
    columns?: string[]
    href?: string
    personas: Persona[]
}

const P = 'x_774308_campus360_'
const ME = 'DYNAMIC90d1921e5f510100a9ad2572f2b477fe'
const MY_GROUPS = 'DYNAMICd6435e965f510100a9ad2572f2b47744'

const COLS: { [table: string]: string[] } = {
    it_issue: ['number', 'short_description', 'caller', 'category', 'priority', 'state', 'assignment_group', 'assigned_to', 'sys_updated_on'],
    technician: ['user', 'primary_group', 'availability', 'shift', 'open_issue_count', 'max_open_issues', 'active'],
    issue_cat: ['order', 'code', 'name', 'assignment_group', 'requires_asset', 'requires_lab', 'requires_hostel', 'active'],
    issue_sub: ['category', 'code', 'name', 'assignment_group', 'active'],
    student: ['student_id', 'user', 'department', 'program', 'current_semester', 'section', 'status', 'hostel_resident'],
    student_reg: ['number', 'first_name', 'last_name', 'program', 'admission_term', 'admission_category', 'state', 'approval'],
    program: ['code', 'name', 'department', 'degree_level', 'duration_years', 'intake_capacity', 'active'],
    faculty: ['employee_id', 'user', 'department', 'designation', 'employment_type', 'status', 'joining_date'],
    fac_onboard: ['number', 'first_name', 'last_name', 'department', 'designation', 'joining_date', 'state', 'approval', 'progress_pct'],
    onboard_tsk: ['number', 'onboarding', 'task_type', 'short_description', 'state', 'assignment_group', 'due_date'],
    onb_tmpl: ['sequence', 'task_type', 'short_description', 'assignment_group', 'due_offset_days', 'condition_field', 'active'],
    department: ['code', 'name', 'hod', 'platform_dept', 'building', 'active'],
    acad_term: ['name', 'academic_year', 'term_type', 'start_date', 'end_date', 'is_current', 'registration_open', 'active'],
    course: ['code', 'name', 'department', 'program', 'semester_no', 'credits', 'course_type', 'active'],
    course_sec: ['name', 'course', 'term', 'section', 'faculty', 'enrolled_count', 'max_students', 'status'],
    enrollment: ['student', 'course_section', 'status', 'sessions_held', 'sessions_attended', 'attendance_pct', 'exam_eligible'],
    class_sess: ['number', 'course_section', 'session_date', 'start_time', 'faculty', 'session_type', 'status', 'attendance_status'],
    stu_attend: ['class_session', 'student', 'status', 'marked_by', 'marked_at', 'locked'],
    fac_attend: ['faculty', 'attendance_date', 'status', 'leave_type', 'check_in', 'check_out', 'work_hours', 'source'],
    hostel: ['code', 'name', 'hostel_type', 'warden', 'total_capacity', 'occupied_beds', 'active'],
    hostel_room: ['name', 'hostel', 'floor', 'room_type', 'capacity', 'occupied', 'status'],
    room_alloc: ['number', 'student', 'hostel_room', 'bed_label', 'term', 'status', 'start_date', 'end_date'],
    hostel_cmpl: ['number', 'short_description', 'caller', 'hostel', 'hostel_room', 'complaint_type', 'state', 'assigned_to'],
    laboratory: ['code', 'name', 'department', 'lab_type', 'location', 'lab_incharge', 'status', 'active'],
    maint_req: ['number', 'short_description', 'maintenance_type', 'request_type', 'location', 'state', 'scheduled_start', 'assignment_group'],
    pm_schedule: ['name', 'maintenance_type', 'location', 'frequency', 'next_due', 'assignment_group', 'active'],
}

function list(key: string, group: string, title: string, t: string, personas: Persona[], query?: string, order?: string): CatalogModule {
    return { key, group, title, kind: 'list', table: P + t, query, order, columns: COLS[t], personas }
}

const IT_STAFF: Persona[] = ['technician', 'admin']
export const MODULES: CatalogModule[] = [
    // IT Issues
    { key: 'it-new', group: 'IT Issues', title: 'Create New', kind: 'new', table: P + 'it_issue', personas: IT_STAFF },
    list('it-open', 'IT Issues', 'Open', 'it_issue', IT_STAFF, 'active=true'),
    list('it-unassigned', 'IT Issues', 'Open - Unassigned', 'it_issue', IT_STAFF, 'active=true^assigned_toISEMPTY'),
    list('it-my-groups', 'IT Issues', "My Groups' Work", 'it_issue', IT_STAFF, 'active=true^assignment_group' + MY_GROUPS),
    list('it-assigned-me', 'IT Issues', 'Assigned to Me', 'it_issue', IT_STAFF, 'active=true^assigned_to' + ME),
    list('it-resolved', 'IT Issues', 'Resolved', 'it_issue', IT_STAFF, 'state=6'),
    list('it-all', 'IT Issues', 'All', 'it_issue', ['technician', 'leadership', 'admin']),
    list('it-technicians', 'IT Issues', 'Technicians', 'technician', ['it_manager', 'admin'], undefined, 'ORDERBYuser'),
    list('it-categories', 'IT Issues', 'Issue Categories', 'issue_cat', ['it_manager', 'admin'], undefined, 'ORDERBYorder'),
    list('it-subcategories', 'IT Issues', 'Issue Subcategories', 'issue_sub', ['it_manager', 'admin'], undefined, 'ORDERBYcategory^ORDERBYname'),
    // Students
    list('stu-students', 'Students', 'Students', 'student', ['registrar', 'hod', 'leadership', 'admin'], undefined, 'ORDERBYstudent_id'),
    list('stu-reg-pending', 'Students', 'Registrations - Pending', 'student_reg', ['registrar', 'hod', 'admin'], 'active=true'),
    list('stu-reg-all', 'Students', 'Registrations - All', 'student_reg', ['registrar', 'admin']),
    list('stu-programs', 'Students', 'Programs', 'program', ['registrar', 'admin'], undefined, 'ORDERBYcode'),
    // Faculty
    list('fac-faculty', 'Faculty', 'Faculty', 'faculty', ['faculty_admin', 'hod', 'leadership', 'admin'], undefined, 'ORDERBYemployee_id'),
    list('fac-onboarding', 'Faculty', 'Onboarding', 'fac_onboard', ['faculty_admin', 'hod', 'admin']),
    list('fac-onboard-tasks', 'Faculty', 'Onboarding Tasks', 'onboard_tsk', ['faculty_admin', 'technician', 'admin'], 'active=true'),
    list('fac-onb-templates', 'Faculty', 'Onboarding Templates', 'onb_tmpl', ['faculty_admin', 'admin'], undefined, 'ORDERBYsequence'),
    // Academics
    list('acad-departments', 'Academics', 'Departments', 'department', ['registrar', 'hod', 'leadership', 'admin'], undefined, 'ORDERBYcode'),
    list('acad-terms', 'Academics', 'Academic Terms', 'acad_term', ['registrar', 'admin'], undefined, 'ORDERBYDESCstart_date'),
    list('acad-courses', 'Academics', 'Courses', 'course', ['registrar', 'hod', 'admin'], undefined, 'ORDERBYcode'),
    list('acad-sections', 'Academics', 'Course Sections', 'course_sec', ['registrar', 'hod', 'admin'], undefined, 'ORDERBYname'),
    list('acad-enrollments', 'Academics', 'Enrollments', 'enrollment', ['registrar', 'hod', 'admin']),
    // Attendance
    list('att-sessions-today', 'Attendance', 'Class Sessions - Today', 'class_sess', ['registrar', 'hod', 'admin'], 'session_dateONToday@javascript:gs.beginningOfToday()@javascript:gs.endOfToday()', 'ORDERBYstart_time'),
    list('att-sessions', 'Attendance', 'Class Sessions', 'class_sess', ['registrar', 'hod', 'admin'], undefined, 'ORDERBYDESCsession_date'),
    list('att-student', 'Attendance', 'Student Attendance', 'stu_attend', ['registrar', 'hod', 'admin']),
    list('att-low', 'Attendance', 'Low Attendance (< 75%)', 'enrollment', ['registrar', 'hod', 'leadership', 'admin'], 'status=enrolled^attendance_pct<75', 'ORDERBYattendance_pct'),
    list('att-faculty', 'Attendance', 'Faculty Attendance', 'fac_attend', ['faculty_admin', 'hod', 'admin'], undefined, 'ORDERBYDESCattendance_date'),
    // Hostel
    list('hos-hostels', 'Hostel', 'Hostels', 'hostel', ['warden', 'leadership', 'admin'], undefined, 'ORDERBYcode'),
    list('hos-rooms', 'Hostel', 'Rooms', 'hostel_room', ['warden', 'admin'], undefined, 'ORDERBYhostel^ORDERBYname'),
    list('hos-alloc-requests', 'Hostel', 'Allocation Requests', 'room_alloc', ['warden', 'admin'], 'status=requested'),
    list('hos-allocations', 'Hostel', 'Allocations', 'room_alloc', ['warden', 'admin']),
    list('hos-complaints', 'Hostel', 'Complaints - Open', 'hostel_cmpl', ['warden', 'admin'], 'active=true'),
    // Labs & Infrastructure
    list('lab-labs', 'Labs & Infrastructure', 'Laboratories', 'laboratory', ['lab_admin', 'maintenance', 'leadership', 'admin'], undefined, 'ORDERBYcode'),
    list('lab-maint-open', 'Labs & Infrastructure', 'Maintenance Requests - Open', 'maint_req', ['lab_admin', 'maintenance', 'admin'], 'active=true'),
    list('lab-maint-all', 'Labs & Infrastructure', 'Maintenance Requests - All', 'maint_req', ['lab_admin', 'maintenance', 'leadership', 'admin']),
    list('lab-pm-plans', 'Labs & Infrastructure', 'Preventive Maintenance Plans', 'pm_schedule', ['lab_admin', 'admin'], undefined, 'ORDERBYnext_due'),
    { key: 'lab-hardware', group: 'Labs & Infrastructure', title: 'Campus Hardware Assets', kind: 'native', table: 'alm_hardware', href: '/alm_hardware_list.do', personas: ['lab_admin', 'admin'] },
    // Administration (platform tables: opened in the native interface)
    { key: 'admin-properties', group: 'Administration', title: 'Properties', kind: 'native', table: 'sys_properties', href: '/sys_properties_list.do?sysparm_query=nameSTARTSWITHx_774308_campus360.', personas: ['admin'] },
    { key: 'admin-groups', group: 'Administration', title: 'Campus360 Groups', kind: 'native', table: 'sys_user_group', href: '/sys_user_group_list.do?sysparm_query=nameSTARTSWITHC360', personas: ['admin'] },
]

export const isVisibleTo = (m: CatalogModule, personas: string[]): boolean => m.personas.some((p) => personas.indexOf(p) > -1)
export const visibleModules = (personas: string[]): CatalogModule[] => MODULES.filter((m) => isVisibleTo(m, personas))
export const findModule = (key: string): CatalogModule | undefined => MODULES.filter((m) => m.key === key)[0]

/** Client-facing summary (no queries are sent to the browser). */
export function publicModule(m: CatalogModule) {
    return { key: m.key, group: m.group, title: m.title, kind: m.kind, table: m.table, href: m.href || '' }
}
