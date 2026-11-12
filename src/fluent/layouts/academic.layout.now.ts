import { Form, List, default_view } from '@servicenow/sdk/core'

// Default form views and list layouts — academic structure.

// ---- Department ----
Form({
    table: 'x_774308_campus360_department',
    view: default_view,
    sections: [
        {
            caption: 'Department',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { field: 'code', type: 'table_field' },
                        { field: 'name', type: 'table_field' },
                        { field: 'hod', type: 'table_field' },
                        { field: 'platform_dept', type: 'table_field' },
                    ],
                    rightElements: [
                        { field: 'building', type: 'table_field' },
                        { field: 'email', type: 'table_field' },
                        { field: 'phone', type: 'table_field' },
                        { field: 'established_year', type: 'table_field' },
                        { field: 'active', type: 'table_field' },
                    ],
                },
                { layout: 'one-column', elements: [{ field: 'description', type: 'table_field' }] },
            ],
        },
        {
            caption: 'Programs',
            content: [{ layout: 'one-column', elements: [{ type: 'list', listType: '12M', listRef: 'x_774308_campus360_program.department' }] }],
        },
        {
            caption: 'Faculty',
            content: [{ layout: 'one-column', elements: [{ type: 'list', listType: '12M', listRef: 'x_774308_campus360_faculty.department' }] }],
        },
        {
            caption: 'Laboratories',
            content: [{ layout: 'one-column', elements: [{ type: 'list', listType: '12M', listRef: 'x_774308_campus360_laboratory.department' }] }],
        },
    ],
})
List({
    table: 'x_774308_campus360_department',
    view: default_view,
    columns: ['code', 'name', 'hod', 'platform_dept', 'building', 'active'],
})

// ---- Academic Term ----
Form({
    table: 'x_774308_campus360_acad_term',
    view: default_view,
    sections: [
        {
            caption: 'Academic Term',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { field: 'name', type: 'table_field' },
                        { field: 'academic_year', type: 'table_field' },
                        { field: 'term_type', type: 'table_field' },
                        { field: 'active', type: 'table_field' },
                    ],
                    rightElements: [
                        { field: 'start_date', type: 'table_field' },
                        { field: 'end_date', type: 'table_field' },
                        { field: 'is_current', type: 'table_field' },
                        { field: 'registration_open', type: 'table_field' },
                    ],
                },
            ],
        },
    ],
})
List({
    table: 'x_774308_campus360_acad_term',
    view: default_view,
    columns: ['name', 'academic_year', 'term_type', 'start_date', 'end_date', 'is_current', 'registration_open', 'active'],
})

// ---- Program ----
Form({
    table: 'x_774308_campus360_program',
    view: default_view,
    sections: [
        {
            caption: 'Program',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { field: 'code', type: 'table_field' },
                        { field: 'name', type: 'table_field' },
                        { field: 'department', type: 'table_field' },
                        { field: 'degree_level', type: 'table_field' },
                    ],
                    rightElements: [
                        { field: 'duration_years', type: 'table_field' },
                        { field: 'total_semesters', type: 'table_field' },
                        { field: 'intake_capacity', type: 'table_field' },
                        { field: 'active', type: 'table_field' },
                    ],
                },
            ],
        },
        {
            caption: 'Courses',
            content: [{ layout: 'one-column', elements: [{ type: 'list', listType: '12M', listRef: 'x_774308_campus360_course.program' }] }],
        },
    ],
})
List({
    table: 'x_774308_campus360_program',
    view: default_view,
    columns: ['code', 'name', 'department', 'degree_level', 'duration_years', 'intake_capacity', 'active'],
})

// ---- Course ----
Form({
    table: 'x_774308_campus360_course',
    view: default_view,
    sections: [
        {
            caption: 'Course',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { field: 'code', type: 'table_field' },
                        { field: 'name', type: 'table_field' },
                        { field: 'department', type: 'table_field' },
                        { field: 'program', type: 'table_field' },
                    ],
                    rightElements: [
                        { field: 'semester_no', type: 'table_field' },
                        { field: 'credits', type: 'table_field' },
                        { field: 'course_type', type: 'table_field' },
                        { field: 'min_attendance_pct', type: 'table_field' },
                        { field: 'active', type: 'table_field' },
                    ],
                },
            ],
        },
        {
            caption: 'Sections',
            content: [{ layout: 'one-column', elements: [{ type: 'list', listType: '12M', listRef: 'x_774308_campus360_course_sec.course' }] }],
        },
    ],
})
List({
    table: 'x_774308_campus360_course',
    view: default_view,
    columns: ['code', 'name', 'department', 'program', 'semester_no', 'credits', 'course_type', 'active'],
})

// ---- Course Section ----
Form({
    table: 'x_774308_campus360_course_sec',
    view: default_view,
    sections: [
        {
            caption: 'Course Section',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { field: 'name', type: 'table_field' },
                        { field: 'course', type: 'table_field' },
                        { field: 'term', type: 'table_field' },
                        { field: 'section', type: 'table_field' },
                        { field: 'status', type: 'table_field' },
                    ],
                    rightElements: [
                        { field: 'faculty', type: 'table_field' },
                        { field: 'laboratory', type: 'table_field' },
                        { field: 'room', type: 'table_field' },
                        { field: 'max_students', type: 'table_field' },
                        { field: 'enrolled_count', type: 'table_field' },
                    ],
                },
                { layout: 'one-column', elements: [{ field: 'co_instructors', type: 'table_field' }] },
            ],
        },
        {
            caption: 'Enrollments',
            content: [{ layout: 'one-column', elements: [{ type: 'list', listType: '12M', listRef: 'x_774308_campus360_enrollment.course_section' }] }],
        },
        {
            caption: 'Class Sessions',
            content: [{ layout: 'one-column', elements: [{ type: 'list', listType: '12M', listRef: 'x_774308_campus360_class_sess.course_section' }] }],
        },
    ],
})
List({
    table: 'x_774308_campus360_course_sec',
    view: default_view,
    columns: ['name', 'course', 'term', 'section', 'faculty', 'enrolled_count', 'max_students', 'status'],
})

// ---- Enrollment ----
Form({
    table: 'x_774308_campus360_enrollment',
    view: default_view,
    sections: [
        {
            caption: 'Enrollment',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { field: 'student', type: 'table_field' },
                        { field: 'course_section', type: 'table_field' },
                        { field: 'enrolled_on', type: 'table_field' },
                        { field: 'status', type: 'table_field' },
                    ],
                    rightElements: [
                        { field: 'sessions_held', type: 'table_field' },
                        { field: 'sessions_attended', type: 'table_field' },
                        { field: 'attendance_pct', type: 'table_field' },
                        { field: 'exam_eligible', type: 'table_field' },
                    ],
                },
            ],
        },
    ],
})
List({
    table: 'x_774308_campus360_enrollment',
    view: default_view,
    columns: ['student', 'course_section', 'status', 'sessions_held', 'sessions_attended', 'attendance_pct', 'exam_eligible'],
})
