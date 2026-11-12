import { Form, List, default_view } from '@servicenow/sdk/core'

// Default form views and list layouts — attendance.

// ---- Class Session ----
Form({
    table: 'x_774308_campus360_class_sess',
    view: default_view,
    sections: [
        {
            caption: 'Class Session',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { field: 'number', type: 'table_field' },
                        { field: 'course_section', type: 'table_field' },
                        { field: 'session_date', type: 'table_field' },
                        { field: 'start_time', type: 'table_field' },
                        { field: 'end_time', type: 'table_field' },
                        { field: 'session_type', type: 'table_field' },
                    ],
                    rightElements: [
                        { field: 'faculty', type: 'table_field' },
                        { field: 'room', type: 'table_field' },
                        { field: 'laboratory', type: 'table_field' },
                        { field: 'status', type: 'table_field' },
                        { field: 'attendance_status', type: 'table_field' },
                        { field: 'submitted_at', type: 'table_field' },
                    ],
                },
                {
                    layout: 'two-column',
                    leftElements: [{ field: 'present_count', type: 'table_field' }],
                    rightElements: [{ field: 'absent_count', type: 'table_field' }],
                },
                { layout: 'one-column', elements: [{ field: 'topic', type: 'table_field' }] },
            ],
        },
        {
            caption: 'Student Attendance',
            content: [{ layout: 'one-column', elements: [{ type: 'list', listType: '12M', listRef: 'x_774308_campus360_stu_attend.class_session' }] }],
        },
    ],
})
List({
    table: 'x_774308_campus360_class_sess',
    view: default_view,
    columns: ['number', 'course_section', 'session_date', 'start_time', 'faculty', 'session_type', 'status', 'attendance_status'],
})

// ---- Student Attendance ----
Form({
    table: 'x_774308_campus360_stu_attend',
    view: default_view,
    sections: [
        {
            caption: 'Student Attendance',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { field: 'class_session', type: 'table_field' },
                        { field: 'student', type: 'table_field' },
                        { field: 'status', type: 'table_field' },
                    ],
                    rightElements: [
                        { field: 'marked_by', type: 'table_field' },
                        { field: 'marked_at', type: 'table_field' },
                        { field: 'locked', type: 'table_field' },
                    ],
                },
                { layout: 'one-column', elements: [{ field: 'remarks', type: 'table_field' }] },
            ],
        },
    ],
})
List({
    table: 'x_774308_campus360_stu_attend',
    view: default_view,
    columns: ['class_session', 'student', 'status', 'marked_by', 'marked_at', 'locked'],
})

// ---- Faculty Attendance ----
Form({
    table: 'x_774308_campus360_fac_attend',
    view: default_view,
    sections: [
        {
            caption: 'Faculty Attendance',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { field: 'faculty', type: 'table_field' },
                        { field: 'attendance_date', type: 'table_field' },
                        { field: 'status', type: 'table_field' },
                        { field: 'leave_type', type: 'table_field' },
                        { field: 'source', type: 'table_field' },
                    ],
                    rightElements: [
                        { field: 'check_in', type: 'table_field' },
                        { field: 'check_out', type: 'table_field' },
                        { field: 'work_hours', type: 'table_field' },
                        { field: 'approved_by', type: 'table_field' },
                    ],
                },
                { layout: 'one-column', elements: [{ field: 'remarks', type: 'table_field' }] },
            ],
        },
    ],
})
List({
    table: 'x_774308_campus360_fac_attend',
    view: default_view,
    columns: ['faculty', 'attendance_date', 'status', 'leave_type', 'check_in', 'check_out', 'work_hours', 'source'],
})
