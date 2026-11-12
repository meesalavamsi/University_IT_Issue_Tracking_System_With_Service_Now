import { AnnotationType, Form, List, default_view } from '@servicenow/sdk/core'

// Default form views and list layouts — student registration & faculty onboarding.

// ---- Student Registration ----
Form({
    table: 'x_774308_campus360_student_reg',
    view: default_view,
    sections: [
        {
            caption: 'Student Registration',
            content: [
                {
                    layout: 'one-column',
                    elements: [
                        {
                            type: 'annotation',
                            annotationId: Now.ID['ann-reg-approval-sequence'],
                            text: 'Approval sequence: 1) Registrar review and document verification, 2) Head of Department approval. Provisioning runs only after both stages.',
                            isPlainText: true,
                            annotationType: AnnotationType.Info_Box_Blue,
                        },
                    ],
                },
                {
                    layout: 'two-column',
                    leftElements: [
                        { field: 'number', type: 'table_field' },
                        { field: 'first_name', type: 'table_field' },
                        { field: 'last_name', type: 'table_field' },
                        { field: 'applicant_email', type: 'table_field' },
                        { field: 'program', type: 'table_field' },
                        { field: 'admission_term', type: 'table_field' },
                        { field: 'admission_category', type: 'table_field' },
                    ],
                    rightElements: [
                        { field: 'state', type: 'table_field' },
                        { field: 'approval', type: 'table_field' },
                        { field: 'assignment_group', type: 'table_field' },
                        { field: 'assigned_to', type: 'table_field' },
                        { field: 'previous_institution', type: 'table_field' },
                        { field: 'qualifying_score', type: 'table_field' },
                        { field: 'hostel_requested', type: 'table_field' },
                    ],
                },
            ],
        },
        {
            caption: 'Applicant Personal Details (Restricted)',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { field: 'applicant_phone', type: 'table_field' },
                        { field: 'date_of_birth', type: 'table_field' },
                        { field: 'gender', type: 'table_field' },
                    ],
                    rightElements: [
                        { field: 'guardian_name', type: 'table_field' },
                        { field: 'guardian_phone', type: 'table_field' },
                    ],
                },
            ],
        },
        {
            caption: 'Registrar Review',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { field: 'documents_verified', type: 'table_field' },
                        { field: 'registrar_recommendation', type: 'table_field' },
                    ],
                    rightElements: [
                        { field: 'registrar_reviewed_by', type: 'table_field' },
                        { field: 'registrar_reviewed_at', type: 'table_field' },
                        { field: 'hod_approver', type: 'table_field' },
                    ],
                },
                { layout: 'one-column', elements: [{ field: 'verification_notes', type: 'table_field' }] },
            ],
        },
        {
            caption: 'Provisioning',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [{ field: 'created_user', type: 'table_field' }],
                    rightElements: [{ field: 'created_student', type: 'table_field' }],
                },
            ],
        },
        {
            caption: 'Activity',
            content: [{ layout: 'one-column', elements: [{ type: 'formatter', formatterRef: 'Activities_Filtered' }] }],
        },
        {
            caption: 'Approvals',
            content: [{ layout: 'one-column', elements: [{ type: 'list', listType: '12M', listRef: 'sysapproval_approver.sysapproval' }] }],
        },
    ],
})
List({
    table: 'x_774308_campus360_student_reg',
    view: default_view,
    columns: ['number', 'first_name', 'last_name', 'program', 'admission_term', 'admission_category', 'state', 'approval'],
})

// ---- Faculty Onboarding ----
Form({
    table: 'x_774308_campus360_fac_onboard',
    view: default_view,
    sections: [
        {
            caption: 'Faculty Onboarding',
            content: [
                {
                    layout: 'one-column',
                    elements: [
                        {
                            type: 'annotation',
                            annotationId: Now.ID['ann-onb-approval-first'],
                            text: 'The onboarding checklist is generated only after this onboarding has been approved.',
                            isPlainText: true,
                            annotationType: AnnotationType.Info_Box_Blue,
                        },
                    ],
                },
                {
                    layout: 'two-column',
                    leftElements: [
                        { field: 'number', type: 'table_field' },
                        { field: 'first_name', type: 'table_field' },
                        { field: 'last_name', type: 'table_field' },
                        { field: 'department', type: 'table_field' },
                        { field: 'designation', type: 'table_field' },
                        { field: 'employment_type', type: 'table_field' },
                        { field: 'joining_date', type: 'table_field' },
                    ],
                    rightElements: [
                        { field: 'state', type: 'table_field' },
                        { field: 'approval', type: 'table_field' },
                        { field: 'progress_pct', type: 'table_field' },
                        { field: 'reporting_to', type: 'table_field' },
                        { field: 'office_location', type: 'table_field' },
                        { field: 'laptop_required', type: 'table_field' },
                        { field: 'assignment_group', type: 'table_field' },
                    ],
                },
                { layout: 'one-column', elements: [{ field: 'lab_access', type: 'table_field' }] },
            ],
        },
        {
            caption: 'Personal Contact (Restricted)',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [{ field: 'personal_email', type: 'table_field' }],
                    rightElements: [{ field: 'personal_phone', type: 'table_field' }],
                },
            ],
        },
        {
            caption: 'Provisioning',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [{ field: 'created_user', type: 'table_field' }],
                    rightElements: [{ field: 'created_faculty', type: 'table_field' }],
                },
            ],
        },
        {
            caption: 'Onboarding Tasks',
            content: [{ layout: 'one-column', elements: [{ type: 'list', listType: '12M', listRef: 'x_774308_campus360_onboard_tsk.onboarding' }] }],
        },
        {
            caption: 'Approvals',
            content: [{ layout: 'one-column', elements: [{ type: 'list', listType: '12M', listRef: 'sysapproval_approver.sysapproval' }] }],
        },
    ],
})
List({
    table: 'x_774308_campus360_fac_onboard',
    view: default_view,
    columns: ['number', 'first_name', 'last_name', 'department', 'designation', 'joining_date', 'state', 'approval', 'progress_pct'],
})

// ---- Onboarding Task ----
Form({
    table: 'x_774308_campus360_onboard_tsk',
    view: default_view,
    sections: [
        {
            caption: 'Onboarding Task',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { field: 'number', type: 'table_field' },
                        { field: 'onboarding', type: 'table_field' },
                        { field: 'task_type', type: 'table_field' },
                        { field: 'sequence', type: 'table_field' },
                        { field: 'template', type: 'table_field' },
                    ],
                    rightElements: [
                        { field: 'state', type: 'table_field' },
                        { field: 'assignment_group', type: 'table_field' },
                        { field: 'assigned_to', type: 'table_field' },
                        { field: 'due_date', type: 'table_field' },
                        { field: 'allocated_asset', type: 'table_field' },
                    ],
                },
                {
                    layout: 'one-column',
                    elements: [
                        { field: 'short_description', type: 'table_field' },
                        { field: 'description', type: 'table_field' },
                        { field: 'work_notes', type: 'table_field' },
                    ],
                },
            ],
        },
    ],
})
List({
    table: 'x_774308_campus360_onboard_tsk',
    view: default_view,
    columns: ['number', 'onboarding', 'task_type', 'short_description', 'state', 'assignment_group', 'due_date'],
})

// ---- Onboarding Task Template ----
Form({
    table: 'x_774308_campus360_onb_tmpl',
    view: default_view,
    sections: [
        {
            caption: 'Onboarding Task Template',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { field: 'task_type', type: 'table_field' },
                        { field: 'short_description', type: 'table_field' },
                        { field: 'assignment_group', type: 'table_field' },
                    ],
                    rightElements: [
                        { field: 'sequence', type: 'table_field' },
                        { field: 'due_offset_days', type: 'table_field' },
                        { field: 'condition_field', type: 'table_field' },
                        { field: 'active', type: 'table_field' },
                    ],
                },
                { layout: 'one-column', elements: [{ field: 'description', type: 'table_field' }] },
            ],
        },
    ],
})
List({
    table: 'x_774308_campus360_onb_tmpl',
    view: default_view,
    columns: ['sequence', 'task_type', 'short_description', 'assignment_group', 'due_offset_days', 'condition_field', 'active'],
})
