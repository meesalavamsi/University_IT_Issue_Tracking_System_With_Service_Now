import { Record } from '@servicenow/sdk/core'
import { grpDesktopSupport, grpFacilities, grpItServiceDesk, grpLabSupport, grpOnboarding } from '../../groups/groups.now'

// Faculty onboarding checklist templates — CONFIGURATION data (always installed, not demo).
// The Part 6 flow generates onboard_tsk records from these ONLY after the onboarding is approved.

Record({
    $id: Now.ID['onbt-document-verification'],
    table: 'x_774308_campus360_onb_tmpl',
    data: { task_type: 'document_verification', short_description: 'Verify appointment letter, qualifications and identity documents', assignment_group: grpOnboarding, sequence: 10, due_offset_days: -3, condition_field: 'always', active: true },
})
Record({
    $id: Now.ID['onbt-it-account'],
    table: 'x_774308_campus360_onb_tmpl',
    data: { task_type: 'it_account', short_description: 'Create institutional IT account', assignment_group: grpItServiceDesk, sequence: 20, due_offset_days: -2, condition_field: 'always', active: true },
})
Record({
    $id: Now.ID['onbt-email-setup'],
    table: 'x_774308_campus360_onb_tmpl',
    data: { task_type: 'email_setup', short_description: 'Set up institutional email and distribution lists', assignment_group: grpItServiceDesk, sequence: 30, due_offset_days: -1, condition_field: 'always', active: true },
})
Record({
    $id: Now.ID['onbt-laptop-allocation'],
    table: 'x_774308_campus360_onb_tmpl',
    data: { task_type: 'laptop_allocation', short_description: 'Allocate an in-stock laptop and record the asset', assignment_group: grpDesktopSupport, sequence: 40, due_offset_days: 0, condition_field: 'laptop_required', active: true },
})
Record({
    $id: Now.ID['onbt-id-card'],
    table: 'x_774308_campus360_onb_tmpl',
    data: { task_type: 'id_card', short_description: 'Issue staff ID card', assignment_group: grpOnboarding, sequence: 50, due_offset_days: 0, condition_field: 'always', active: true },
})
Record({
    $id: Now.ID['onbt-office-allocation'],
    table: 'x_774308_campus360_onb_tmpl',
    data: { task_type: 'office_allocation', short_description: 'Allocate office space and furniture', assignment_group: grpFacilities, sequence: 60, due_offset_days: 0, condition_field: 'always', active: true },
})
Record({
    $id: Now.ID['onbt-lab-access'],
    table: 'x_774308_campus360_onb_tmpl',
    data: { task_type: 'lab_access', short_description: 'Grant access to requested laboratories', assignment_group: grpLabSupport, sequence: 70, due_offset_days: 1, condition_field: 'lab_access', active: true },
})
Record({
    $id: Now.ID['onbt-orientation'],
    table: 'x_774308_campus360_onb_tmpl',
    data: { task_type: 'orientation', short_description: 'Conduct faculty orientation session', assignment_group: grpOnboarding, sequence: 80, due_offset_days: 3, condition_field: 'always', active: true },
})
Record({
    $id: Now.ID['onbt-library-card'],
    table: 'x_774308_campus360_onb_tmpl',
    data: { task_type: 'library_card', short_description: 'Issue library card', assignment_group: grpOnboarding, sequence: 90, due_offset_days: 5, condition_field: 'always', active: true },
})
Record({
    $id: Now.ID['onbt-payroll-setup'],
    table: 'x_774308_campus360_onb_tmpl',
    data: { task_type: 'payroll_setup', short_description: 'Hand over to payroll (outside Campus360; record completion only)', assignment_group: grpOnboarding, sequence: 100, due_offset_days: 7, condition_field: 'always', active: true },
})
