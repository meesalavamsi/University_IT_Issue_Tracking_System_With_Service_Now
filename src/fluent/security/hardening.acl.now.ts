import { Acl } from '@servicenow/sdk/core'
import {
    roleAdmin,
    roleFacultyAdmin,
    roleHod,
    roleLabAdmin,
    roleLeadership,
    roleMaintenance,
    roleRegistrar,
    roleTechnician,
    roleUser,
    roleWarden,
} from '../roles/roles.now'

// Pre-deployment security hardening (docs/SECURITY_AUDIT.md).
//
// F2 — System-maintained fields: `display_read_only` only protects the form UI. These field ACLs
//      make them non-writable for every user (list edit, browser-side form tampering, REST, etc.).
//      Business rules, flows and scheduled jobs use server-side GlideRecord and are unaffected.
//      Because a field without a specific create ACL is checked against its write ACL
//      (platform *.* create script, verified on dev382380), these also block setting them on insert.
//
// F3 — Inherited task field ACLs: the platform defines task.<field> write ACLs that require
//      itil/task_editor (verified on dev382380). Without table-specific overrides, Campus360 users
//      could not write short_description/description/comments/etc. on the 6 task-based tables.
//      Row access remains governed by each table's own write ACLs (field and table ACLs must BOTH pass).
//
// F4 — report_view on task-based tables: the platform task report_view ACL requires admin/itil.
//      Row- and field-level read ACLs still filter every report.

// =============================== F2: system-maintained fields ===============================
Acl({ $id: Now.ID['acl-sys-class-sess-number'], type: 'record', table: 'x_774308_campus360_class_sess', field: 'number', operation: 'write', roles: [roleAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-sys-class-sess-attstatus'], type: 'record', table: 'x_774308_campus360_class_sess', field: 'attendance_status', operation: 'write', roles: [roleAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-sys-class-sess-submitted'], type: 'record', table: 'x_774308_campus360_class_sess', field: 'submitted_at', operation: 'write', roles: [roleAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-sys-class-sess-present'], type: 'record', table: 'x_774308_campus360_class_sess', field: 'present_count', operation: 'write', roles: [roleAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-sys-class-sess-absent'], type: 'record', table: 'x_774308_campus360_class_sess', field: 'absent_count', operation: 'write', roles: [roleAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-sys-course-sec-name'], type: 'record', table: 'x_774308_campus360_course_sec', field: 'name', operation: 'write', roles: [roleAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-sys-course-sec-enrolled'], type: 'record', table: 'x_774308_campus360_course_sec', field: 'enrolled_count', operation: 'write', roles: [roleAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-sys-enrollment-held'], type: 'record', table: 'x_774308_campus360_enrollment', field: 'sessions_held', operation: 'write', roles: [roleAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-sys-enrollment-attended'], type: 'record', table: 'x_774308_campus360_enrollment', field: 'sessions_attended', operation: 'write', roles: [roleAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-sys-enrollment-pct'], type: 'record', table: 'x_774308_campus360_enrollment', field: 'attendance_pct', operation: 'write', roles: [roleAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-sys-enrollment-eligible'], type: 'record', table: 'x_774308_campus360_enrollment', field: 'exam_eligible', operation: 'write', roles: [roleAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-sys-faculty-onboarding'], type: 'record', table: 'x_774308_campus360_faculty', field: 'onboarding', operation: 'write', roles: [roleAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-sys-fac-attend-hours'], type: 'record', table: 'x_774308_campus360_fac_attend', field: 'work_hours', operation: 'write', roles: [roleAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-sys-fac-attend-source'], type: 'record', table: 'x_774308_campus360_fac_attend', field: 'source', operation: 'write', roles: [roleAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-sys-fac-attend-approved'], type: 'record', table: 'x_774308_campus360_fac_attend', field: 'approved_by', operation: 'write', roles: [roleAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-sys-fac-onboard-progress'], type: 'record', table: 'x_774308_campus360_fac_onboard', field: 'progress_pct', operation: 'write', roles: [roleAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-sys-fac-onboard-user'], type: 'record', table: 'x_774308_campus360_fac_onboard', field: 'created_user', operation: 'write', roles: [roleAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-sys-fac-onboard-faculty'], type: 'record', table: 'x_774308_campus360_fac_onboard', field: 'created_faculty', operation: 'write', roles: [roleAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-sys-hostel-capacity'], type: 'record', table: 'x_774308_campus360_hostel', field: 'total_capacity', operation: 'write', roles: [roleAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-sys-hostel-occupied'], type: 'record', table: 'x_774308_campus360_hostel', field: 'occupied_beds', operation: 'write', roles: [roleAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-sys-hostel-cmpl-student'], type: 'record', table: 'x_774308_campus360_hostel_cmpl', field: 'student', operation: 'write', roles: [roleAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-sys-hostel-room-name'], type: 'record', table: 'x_774308_campus360_hostel_room', field: 'name', operation: 'write', roles: [roleAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-sys-hostel-room-occupied'], type: 'record', table: 'x_774308_campus360_hostel_room', field: 'occupied', operation: 'write', roles: [roleAdmin], adminOverrides: true, description: 'Capacity integrity: occupancy is maintained only by C360HostelUtils and the nightly reconcile.' })
Acl({ $id: Now.ID['acl-sys-it-issue-reporter'], type: 'record', table: 'x_774308_campus360_it_issue', field: 'reporter_type', operation: 'write', roles: [roleAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-sys-it-issue-department'], type: 'record', table: 'x_774308_campus360_it_issue', field: 'department', operation: 'write', roles: [roleAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-sys-it-issue-resolved-by'], type: 'record', table: 'x_774308_campus360_it_issue', field: 'resolved_by', operation: 'write', roles: [roleAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-sys-it-issue-resolved-at'], type: 'record', table: 'x_774308_campus360_it_issue', field: 'resolved_at', operation: 'write', roles: [roleAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-sys-it-issue-reopen'], type: 'record', table: 'x_774308_campus360_it_issue', field: 'reopen_count', operation: 'write', roles: [roleAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-sys-maint-req-pm-plan'], type: 'record', table: 'x_774308_campus360_maint_req', field: 'pm_plan', operation: 'write', roles: [roleAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-sys-onboard-tsk-template'], type: 'record', table: 'x_774308_campus360_onboard_tsk', field: 'template', operation: 'write', roles: [roleAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-sys-room-alloc-number'], type: 'record', table: 'x_774308_campus360_room_alloc', field: 'number', operation: 'write', roles: [roleAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-sys-room-alloc-by'], type: 'record', table: 'x_774308_campus360_room_alloc', field: 'allocated_by', operation: 'write', roles: [roleAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-sys-student-resident'], type: 'record', table: 'x_774308_campus360_student', field: 'hostel_resident', operation: 'write', roles: [roleAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-sys-student-registration'], type: 'record', table: 'x_774308_campus360_student', field: 'registration', operation: 'write', roles: [roleAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-sys-student-reg-reviewed-by'], type: 'record', table: 'x_774308_campus360_student_reg', field: 'registrar_reviewed_by', operation: 'write', roles: [roleAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-sys-student-reg-reviewed-at'], type: 'record', table: 'x_774308_campus360_student_reg', field: 'registrar_reviewed_at', operation: 'write', roles: [roleAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-sys-student-reg-hod'], type: 'record', table: 'x_774308_campus360_student_reg', field: 'hod_approver', operation: 'write', roles: [roleAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-sys-student-reg-user'], type: 'record', table: 'x_774308_campus360_student_reg', field: 'created_user', operation: 'write', roles: [roleAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-sys-student-reg-student'], type: 'record', table: 'x_774308_campus360_student_reg', field: 'created_student', operation: 'write', roles: [roleAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-sys-student-reg-approval'], type: 'record', table: 'x_774308_campus360_student_reg', field: 'approval', operation: 'write', roles: [roleAdmin], adminOverrides: true, description: 'HOD approval state is set only by the approval engine / flow.' })
Acl({ $id: Now.ID['acl-sys-stu-attend-marked-by'], type: 'record', table: 'x_774308_campus360_stu_attend', field: 'marked_by', operation: 'write', roles: [roleAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-sys-stu-attend-marked-at'], type: 'record', table: 'x_774308_campus360_stu_attend', field: 'marked_at', operation: 'write', roles: [roleAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-sys-stu-attend-locked'], type: 'record', table: 'x_774308_campus360_stu_attend', field: 'locked', operation: 'write', roles: [roleAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-sys-technician-open-count'], type: 'record', table: 'x_774308_campus360_technician', field: 'open_issue_count', operation: 'write', roles: [roleAdmin], adminOverrides: true })

// =============================== F3: inherited task fields ===============================
// --- IT Issue (workflow fields already have Campus360-specific ACLs in it-issue.acl.now.ts) ---
Acl({ $id: Now.ID['acl-task-it-issue-sd'], type: 'record', table: 'x_774308_campus360_it_issue', field: 'short_description', operation: 'write', roles: [roleUser], adminOverrides: true })
Acl({ $id: Now.ID['acl-task-it-issue-desc'], type: 'record', table: 'x_774308_campus360_it_issue', field: 'description', operation: 'write', roles: [roleUser], adminOverrides: true })
Acl({ $id: Now.ID['acl-task-it-issue-comments'], type: 'record', table: 'x_774308_campus360_it_issue', field: 'comments', operation: 'write', roles: [roleUser], adminOverrides: true })
// --- Hostel Complaint ---
Acl({ $id: Now.ID['acl-task-hostel-cmpl-sd'], type: 'record', table: 'x_774308_campus360_hostel_cmpl', field: 'short_description', operation: 'write', roles: [roleUser], adminOverrides: true })
Acl({ $id: Now.ID['acl-task-hostel-cmpl-desc'], type: 'record', table: 'x_774308_campus360_hostel_cmpl', field: 'description', operation: 'write', roles: [roleUser], adminOverrides: true })
Acl({ $id: Now.ID['acl-task-hostel-cmpl-comments'], type: 'record', table: 'x_774308_campus360_hostel_cmpl', field: 'comments', operation: 'write', roles: [roleUser], adminOverrides: true })
// --- Maintenance Request ---
Acl({ $id: Now.ID['acl-task-maint-req-sd'], type: 'record', table: 'x_774308_campus360_maint_req', field: 'short_description', operation: 'write', roles: [roleUser], adminOverrides: true })
Acl({ $id: Now.ID['acl-task-maint-req-desc'], type: 'record', table: 'x_774308_campus360_maint_req', field: 'description', operation: 'write', roles: [roleUser], adminOverrides: true })
Acl({ $id: Now.ID['acl-task-maint-req-comments'], type: 'record', table: 'x_774308_campus360_maint_req', field: 'comments', operation: 'write', roles: [roleUser], adminOverrides: true })
Acl({ $id: Now.ID['acl-task-maint-req-state'], type: 'record', table: 'x_774308_campus360_maint_req', field: 'state', operation: 'write', roles: [roleMaintenance, roleLabAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-task-maint-req-priority'], type: 'record', table: 'x_774308_campus360_maint_req', field: 'priority', operation: 'write', roles: [roleMaintenance, roleLabAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-task-maint-req-impact'], type: 'record', table: 'x_774308_campus360_maint_req', field: 'impact', operation: 'write', roles: [roleMaintenance, roleLabAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-task-maint-req-urgency'], type: 'record', table: 'x_774308_campus360_maint_req', field: 'urgency', operation: 'write', roles: [roleMaintenance, roleLabAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-task-maint-req-assignee'], type: 'record', table: 'x_774308_campus360_maint_req', field: 'assigned_to', operation: 'write', roles: [roleMaintenance, roleLabAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-task-maint-req-wn-write'], type: 'record', table: 'x_774308_campus360_maint_req', field: 'work_notes', operation: 'write', roles: [roleMaintenance, roleLabAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-task-maint-req-wn-read'], type: 'record', table: 'x_774308_campus360_maint_req', field: 'work_notes', operation: 'read', roles: [roleMaintenance, roleLabAdmin, roleTechnician, roleWarden, roleLeadership], adminOverrides: true })
// --- Student Registration ---
Acl({ $id: Now.ID['acl-task-student-reg-sd'], type: 'record', table: 'x_774308_campus360_student_reg', field: 'short_description', operation: 'write', roles: [roleUser], adminOverrides: true })
Acl({ $id: Now.ID['acl-task-student-reg-desc'], type: 'record', table: 'x_774308_campus360_student_reg', field: 'description', operation: 'write', roles: [roleUser], adminOverrides: true })
Acl({ $id: Now.ID['acl-task-student-reg-comments'], type: 'record', table: 'x_774308_campus360_student_reg', field: 'comments', operation: 'write', roles: [roleUser], adminOverrides: true })
Acl({ $id: Now.ID['acl-task-student-reg-state'], type: 'record', table: 'x_774308_campus360_student_reg', field: 'state', operation: 'write', roles: [roleRegistrar], adminOverrides: true })
Acl({ $id: Now.ID['acl-task-student-reg-assignee'], type: 'record', table: 'x_774308_campus360_student_reg', field: 'assigned_to', operation: 'write', roles: [roleRegistrar], adminOverrides: true })
Acl({ $id: Now.ID['acl-task-student-reg-wn-write'], type: 'record', table: 'x_774308_campus360_student_reg', field: 'work_notes', operation: 'write', roles: [roleRegistrar], adminOverrides: true })
Acl({ $id: Now.ID['acl-task-student-reg-wn-read'], type: 'record', table: 'x_774308_campus360_student_reg', field: 'work_notes', operation: 'read', roles: [roleRegistrar, roleHod], adminOverrides: true })
// --- Faculty Onboarding ---
Acl({ $id: Now.ID['acl-task-fac-onboard-sd'], type: 'record', table: 'x_774308_campus360_fac_onboard', field: 'short_description', operation: 'write', roles: [roleFacultyAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-task-fac-onboard-desc'], type: 'record', table: 'x_774308_campus360_fac_onboard', field: 'description', operation: 'write', roles: [roleFacultyAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-task-fac-onboard-comments'], type: 'record', table: 'x_774308_campus360_fac_onboard', field: 'comments', operation: 'write', roles: [roleFacultyAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-task-fac-onboard-state'], type: 'record', table: 'x_774308_campus360_fac_onboard', field: 'state', operation: 'write', roles: [roleFacultyAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-task-fac-onboard-assignee'], type: 'record', table: 'x_774308_campus360_fac_onboard', field: 'assigned_to', operation: 'write', roles: [roleFacultyAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-task-fac-onboard-wn-write'], type: 'record', table: 'x_774308_campus360_fac_onboard', field: 'work_notes', operation: 'write', roles: [roleFacultyAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-task-fac-onboard-wn-read'], type: 'record', table: 'x_774308_campus360_fac_onboard', field: 'work_notes', operation: 'read', roles: [roleFacultyAdmin, roleHod], adminOverrides: true })
// --- Onboarding Task (rows already limited to faculty_admin and the assigned group) ---
Acl({ $id: Now.ID['acl-task-onboard-tsk-sd'], type: 'record', table: 'x_774308_campus360_onboard_tsk', field: 'short_description', operation: 'write', roles: [roleUser], adminOverrides: true })
Acl({ $id: Now.ID['acl-task-onboard-tsk-desc'], type: 'record', table: 'x_774308_campus360_onboard_tsk', field: 'description', operation: 'write', roles: [roleUser], adminOverrides: true })
Acl({ $id: Now.ID['acl-task-onboard-tsk-comments'], type: 'record', table: 'x_774308_campus360_onboard_tsk', field: 'comments', operation: 'write', roles: [roleUser], adminOverrides: true })
Acl({ $id: Now.ID['acl-task-onboard-tsk-state'], type: 'record', table: 'x_774308_campus360_onboard_tsk', field: 'state', operation: 'write', roles: [roleUser], adminOverrides: true })
Acl({ $id: Now.ID['acl-task-onboard-tsk-assignee'], type: 'record', table: 'x_774308_campus360_onboard_tsk', field: 'assigned_to', operation: 'write', roles: [roleUser], adminOverrides: true })
Acl({ $id: Now.ID['acl-task-onboard-tsk-due'], type: 'record', table: 'x_774308_campus360_onboard_tsk', field: 'due_date', operation: 'write', roles: [roleFacultyAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-task-onboard-tsk-wn-write'], type: 'record', table: 'x_774308_campus360_onboard_tsk', field: 'work_notes', operation: 'write', roles: [roleUser], adminOverrides: true })
Acl({ $id: Now.ID['acl-task-onboard-tsk-wn-read'], type: 'record', table: 'x_774308_campus360_onboard_tsk', field: 'work_notes', operation: 'read', roles: [roleUser], adminOverrides: true })

// =============================== F4: report_view on task-based tables ===============================
Acl({ $id: Now.ID['acl-rv-it-issue'], type: 'record', table: 'x_774308_campus360_it_issue', operation: 'report_view', roles: [roleUser], adminOverrides: true })
Acl({ $id: Now.ID['acl-rv-hostel-cmpl'], type: 'record', table: 'x_774308_campus360_hostel_cmpl', operation: 'report_view', roles: [roleUser], adminOverrides: true })
Acl({ $id: Now.ID['acl-rv-maint-req'], type: 'record', table: 'x_774308_campus360_maint_req', operation: 'report_view', roles: [roleUser], adminOverrides: true })
Acl({ $id: Now.ID['acl-rv-student-reg'], type: 'record', table: 'x_774308_campus360_student_reg', operation: 'report_view', roles: [roleRegistrar, roleHod, roleLeadership], adminOverrides: true })
Acl({ $id: Now.ID['acl-rv-fac-onboard'], type: 'record', table: 'x_774308_campus360_fac_onboard', operation: 'report_view', roles: [roleFacultyAdmin, roleHod, roleLeadership], adminOverrides: true })
Acl({ $id: Now.ID['acl-rv-onboard-tsk'], type: 'record', table: 'x_774308_campus360_onboard_tsk', operation: 'report_view', roles: [roleUser], adminOverrides: true })
