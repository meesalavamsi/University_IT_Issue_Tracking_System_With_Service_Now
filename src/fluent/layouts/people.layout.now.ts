import { AnnotationType, Form, List, default_view } from '@servicenow/sdk/core'

// Default form views and list layouts — people.
// Sensitive fields sit in a dedicated "Restricted" section (hidden by field ACLs for unauthorised users)
// and are never included in list layouts (x_774308_campus360.privacy.mask_in_lists).

// ---- Student ----
Form({
    table: 'x_774308_campus360_student',
    view: default_view,
    sections: [
        {
            caption: 'Student',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { field: 'student_id', type: 'table_field' },
                        { field: 'user', type: 'table_field' },
                        { field: 'department', type: 'table_field' },
                        { field: 'program', type: 'table_field' },
                        { field: 'advisor', type: 'table_field' },
                        { field: 'status', type: 'table_field' },
                    ],
                    rightElements: [
                        { field: 'admission_term', type: 'table_field' },
                        { field: 'admission_date', type: 'table_field' },
                        { field: 'batch', type: 'table_field' },
                        { field: 'current_semester', type: 'table_field' },
                        { field: 'year_of_study', type: 'table_field' },
                        { field: 'section', type: 'table_field' },
                        { field: 'hostel_resident', type: 'table_field' },
                        { field: 'registration', type: 'table_field' },
                    ],
                },
            ],
        },
        {
            caption: 'Personal & Guardian (Restricted)',
            content: [
                {
                    layout: 'one-column',
                    elements: [
                        {
                            type: 'annotation',
                            annotationId: Now.ID['ann-student-restricted'],
                            text: 'Restricted personal data. Visible only to the student, the registrar and Campus360 administrators (guardian contact also to the student\'s warden).',
                            isPlainText: true,
                            annotationType: AnnotationType.Info_Box_Red,
                        },
                    ],
                },
                {
                    layout: 'two-column',
                    leftElements: [
                        { field: 'date_of_birth', type: 'table_field' },
                        { field: 'gender', type: 'table_field' },
                        { field: 'blood_group', type: 'table_field' },
                        { field: 'personal_phone', type: 'table_field' },
                        { field: 'personal_email', type: 'table_field' },
                    ],
                    rightElements: [
                        { field: 'guardian_name', type: 'table_field' },
                        { field: 'guardian_relation', type: 'table_field' },
                        { field: 'guardian_phone', type: 'table_field' },
                    ],
                },
                { layout: 'one-column', elements: [{ field: 'home_address', type: 'table_field' }] },
            ],
        },
        {
            caption: 'Enrollments',
            content: [{ layout: 'one-column', elements: [{ type: 'list', listType: '12M', listRef: 'x_774308_campus360_enrollment.student' }] }],
        },
        {
            caption: 'Room Allocations',
            content: [{ layout: 'one-column', elements: [{ type: 'list', listType: '12M', listRef: 'x_774308_campus360_room_alloc.student' }] }],
        },
    ],
})
List({
    table: 'x_774308_campus360_student',
    view: default_view,
    columns: ['student_id', 'user', 'department', 'program', 'current_semester', 'section', 'status', 'hostel_resident'],
})

// ---- Faculty ----
Form({
    table: 'x_774308_campus360_faculty',
    view: default_view,
    sections: [
        {
            caption: 'Faculty',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { field: 'employee_id', type: 'table_field' },
                        { field: 'user', type: 'table_field' },
                        { field: 'department', type: 'table_field' },
                        { field: 'designation', type: 'table_field' },
                        { field: 'employment_type', type: 'table_field' },
                        { field: 'status', type: 'table_field' },
                    ],
                    rightElements: [
                        { field: 'joining_date', type: 'table_field' },
                        { field: 'highest_qualification', type: 'table_field' },
                        { field: 'experience_years', type: 'table_field' },
                        { field: 'office_location', type: 'table_field' },
                        { field: 'onboarding', type: 'table_field' },
                    ],
                },
                { layout: 'one-column', elements: [{ field: 'specialization', type: 'table_field' }] },
            ],
        },
        {
            caption: 'Personal & Emergency (Restricted)',
            content: [
                {
                    layout: 'one-column',
                    elements: [
                        {
                            type: 'annotation',
                            annotationId: Now.ID['ann-faculty-restricted'],
                            text: 'Restricted personal data. Visible only to the faculty member, faculty administration and Campus360 administrators.',
                            isPlainText: true,
                            annotationType: AnnotationType.Info_Box_Red,
                        },
                    ],
                },
                {
                    layout: 'two-column',
                    leftElements: [
                        { field: 'date_of_birth', type: 'table_field' },
                        { field: 'personal_phone', type: 'table_field' },
                        { field: 'personal_email', type: 'table_field' },
                    ],
                    rightElements: [
                        { field: 'emergency_contact', type: 'table_field' },
                        { field: 'emergency_phone', type: 'table_field' },
                    ],
                },
                { layout: 'one-column', elements: [{ field: 'home_address', type: 'table_field' }] },
            ],
        },
        {
            caption: 'Course Sections',
            content: [{ layout: 'one-column', elements: [{ type: 'list', listType: '12M', listRef: 'x_774308_campus360_course_sec.faculty' }] }],
        },
        {
            caption: 'Faculty Attendance',
            content: [{ layout: 'one-column', elements: [{ type: 'list', listType: '12M', listRef: 'x_774308_campus360_fac_attend.faculty' }] }],
        },
    ],
})
List({
    table: 'x_774308_campus360_faculty',
    view: default_view,
    columns: ['employee_id', 'user', 'department', 'designation', 'employment_type', 'status', 'joining_date'],
})

// ---- Technician ----
Form({
    table: 'x_774308_campus360_technician',
    view: default_view,
    sections: [
        {
            caption: 'Technician',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { field: 'user', type: 'table_field' },
                        { field: 'employee_id', type: 'table_field' },
                        { field: 'primary_group', type: 'table_field' },
                        { field: 'base_location', type: 'table_field' },
                        { field: 'active', type: 'table_field' },
                    ],
                    rightElements: [
                        { field: 'availability', type: 'table_field' },
                        { field: 'shift', type: 'table_field' },
                        { field: 'max_open_issues', type: 'table_field' },
                        { field: 'open_issue_count', type: 'table_field' },
                    ],
                },
                { layout: 'one-column', elements: [{ field: 'skills', type: 'table_field' }] },
            ],
        },
    ],
})
List({
    table: 'x_774308_campus360_technician',
    view: default_view,
    columns: ['user', 'primary_group', 'availability', 'shift', 'open_issue_count', 'max_open_issues', 'active'],
})
