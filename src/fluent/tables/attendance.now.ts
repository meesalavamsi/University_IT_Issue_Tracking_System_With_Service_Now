import {
    BooleanColumn,
    ChoiceColumn,
    DateColumn,
    DateTimeColumn,
    DecimalColumn,
    IntegerColumn,
    ReferenceColumn,
    StringColumn,
    Table,
    TimeColumn,
} from '@servicenow/sdk/core'

// Attendance (DATABASE_SCHEMA.md §7).
// Duplicate prevention is enforced at database level by UNIQUE indexes:
//   stu_attend (class_session, student) and fac_attend (faculty, attendance_date).
// Friendly server-side validation messages are added by business rules in Part 7.

export const x_774308_campus360_class_sess = Table({
    name: 'x_774308_campus360_class_sess',
    label: 'Class Session',
    display: 'number',
    autoNumber: { prefix: 'SES', number: 1000, numberOfDigits: 7 },
    schema: {
        number: StringColumn({
            label: 'Number',
            maxLength: 40,
            default: 'javascript:global.getNextObjNumberPadded();',
            readOnly: true,
            readOnlyOption: 'display_read_only',
        }),
        course_section: ReferenceColumn({
            label: 'Course Section',
            referenceTable: 'x_774308_campus360_course_sec',
            mandatory: true,
            cascadeRule: 'restrict',
            referenceQual: 'status=active',
        }),
        session_date: DateColumn({ label: 'Date', mandatory: true }),
        start_time: TimeColumn({ label: 'Start Time', mandatory: true }),
        end_time: TimeColumn({ label: 'End Time', mandatory: true }),
        faculty: ReferenceColumn({
            label: 'Taken By',
            referenceTable: 'x_774308_campus360_faculty',
            mandatory: true,
            cascadeRule: 'restrict',
            referenceQual: 'status=active',
        }),
        session_type: ChoiceColumn({
            label: 'Type',
            mandatory: true,
            default: 'lecture',
            dropdown: 'dropdown_without_none',
            choices: {
                lecture: { label: 'Lecture', sequence: 10 },
                lab: { label: 'Lab', sequence: 20 },
                tutorial: { label: 'Tutorial', sequence: 30 },
                seminar: { label: 'Seminar', sequence: 40 },
                exam: { label: 'Exam', sequence: 50 },
            },
        }),
        room: ReferenceColumn({ label: 'Room', referenceTable: 'cmn_location', cascadeRule: 'clear' }),
        laboratory: ReferenceColumn({ label: 'Laboratory', referenceTable: 'x_774308_campus360_laboratory', cascadeRule: 'clear' }),
        topic: StringColumn({ label: 'Topic Covered', maxLength: 200 }),
        status: ChoiceColumn({
            label: 'Status',
            mandatory: true,
            default: 'scheduled',
            dropdown: 'dropdown_without_none',
            choices: {
                scheduled: { label: 'Scheduled', sequence: 10 },
                held: { label: 'Held', sequence: 20 },
                cancelled: { label: 'Cancelled', sequence: 30 },
                rescheduled: { label: 'Rescheduled', sequence: 40 },
            },
        }),
        attendance_status: ChoiceColumn({
            label: 'Attendance Status',
            default: 'not_started',
            readOnly: true,
            readOnlyOption: 'display_read_only',
            dropdown: 'dropdown_without_none',
            choices: {
                not_started: { label: 'Not Started', sequence: 10 },
                in_progress: { label: 'In Progress', sequence: 20 },
                submitted: { label: 'Submitted', sequence: 30 },
                locked: { label: 'Locked', sequence: 40 },
            },
        }),
        submitted_at: DateTimeColumn({ label: 'Submitted At', readOnly: true, readOnlyOption: 'display_read_only' }),
        present_count: IntegerColumn({ label: 'Present', default: 0, readOnly: true, readOnlyOption: 'display_read_only' }),
        absent_count: IntegerColumn({ label: 'Absent', default: 0, readOnly: true, readOnlyOption: 'display_read_only' }),
    },
    index: [
        { name: 'c360_ses_number_u', unique: true, element: 'number' },
        { name: 'c360_ses_section_date_time_u', unique: true, element: ['course_section', 'session_date', 'start_time'] },
        { name: 'c360_ses_faculty_date', unique: false, element: ['faculty', 'session_date'] },
    ],
})

export const x_774308_campus360_stu_attend = Table({
    name: 'x_774308_campus360_stu_attend',
    label: 'Student Attendance',
    audit: true,
    allowWebServiceAccess: false,
    schema: {
        class_session: ReferenceColumn({
            label: 'Class Session',
            referenceTable: 'x_774308_campus360_class_sess',
            mandatory: true,
            cascadeRule: 'restrict',
        }),
        student: ReferenceColumn({
            label: 'Student',
            referenceTable: 'x_774308_campus360_student',
            mandatory: true,
            cascadeRule: 'restrict',
        }),
        status: ChoiceColumn({
            label: 'Status',
            mandatory: true,
            default: 'present',
            dropdown: 'dropdown_without_none',
            choices: {
                present: { label: 'Present', sequence: 10 },
                absent: { label: 'Absent', sequence: 20 },
                late: { label: 'Late', sequence: 30 },
                excused: { label: 'Excused', sequence: 40 },
                medical: { label: 'Medical Leave', sequence: 50 },
                on_duty: { label: 'On Duty', sequence: 60 },
            },
        }),
        marked_by: ReferenceColumn({
            label: 'Marked By',
            referenceTable: 'sys_user',
            cascadeRule: 'clear',
            readOnly: true,
            readOnlyOption: 'display_read_only',
        }),
        marked_at: DateTimeColumn({ label: 'Marked At', readOnly: true, readOnlyOption: 'display_read_only' }),
        remarks: StringColumn({ label: 'Remarks', maxLength: 200 }),
        locked: BooleanColumn({ label: 'Locked', default: false, readOnly: true, readOnlyOption: 'display_read_only' }),
    },
    index: [
        { name: 'c360_satt_session_student_u', unique: true, element: ['class_session', 'student'] },
        { name: 'c360_satt_student', unique: false, element: 'student' },
    ],
})

export const x_774308_campus360_fac_attend = Table({
    name: 'x_774308_campus360_fac_attend',
    label: 'Faculty Attendance',
    audit: true,
    allowWebServiceAccess: false,
    schema: {
        faculty: ReferenceColumn({
            label: 'Faculty',
            referenceTable: 'x_774308_campus360_faculty',
            mandatory: true,
            cascadeRule: 'restrict',
        }),
        attendance_date: DateColumn({
            label: 'Date',
            mandatory: true,
            default: 'javascript:new GlideDate().getValue()',
        }),
        status: ChoiceColumn({
            label: 'Status',
            mandatory: true,
            default: 'present',
            dropdown: 'dropdown_without_none',
            choices: {
                present: { label: 'Present', sequence: 10 },
                absent: { label: 'Absent', sequence: 20 },
                half_day: { label: 'Half Day', sequence: 30 },
                on_leave: { label: 'On Leave', sequence: 40 },
                on_duty: { label: 'On Duty', sequence: 50 },
                holiday: { label: 'Holiday', sequence: 60 },
                wfh: { label: 'Work From Home', sequence: 70 },
            },
        }),
        leave_type: ChoiceColumn({
            label: 'Leave Type',
            dropdown: 'dropdown_with_none',
            choices: {
                casual: { label: 'Casual', sequence: 10 },
                sick: { label: 'Sick', sequence: 20 },
                earned: { label: 'Earned', sequence: 30 },
                duty: { label: 'Duty', sequence: 40 },
                maternity: { label: 'Maternity', sequence: 50 },
                paternity: { label: 'Paternity', sequence: 60 },
                other: { label: 'Other', sequence: 70 },
            },
        }),
        check_in: DateTimeColumn({ label: 'Check-in' }),
        check_out: DateTimeColumn({ label: 'Check-out' }),
        work_hours: DecimalColumn({ label: 'Work Hours', readOnly: true, readOnlyOption: 'display_read_only' }),
        source: ChoiceColumn({
            label: 'Source',
            default: 'self',
            readOnly: true,
            readOnlyOption: 'display_read_only',
            dropdown: 'dropdown_without_none',
            choices: {
                self: { label: 'Self', sequence: 10 },
                biometric_import: { label: 'Biometric Import', sequence: 20 },
                admin: { label: 'Administrator', sequence: 30 },
            },
        }),
        approved_by: ReferenceColumn({
            label: 'Approved By',
            referenceTable: 'sys_user',
            cascadeRule: 'clear',
            readOnly: true,
            readOnlyOption: 'display_read_only',
        }),
        remarks: StringColumn({ label: 'Remarks', maxLength: 200 }),
    },
    index: [
        { name: 'c360_fatt_faculty_date_u', unique: true, element: ['faculty', 'attendance_date'] },
        { name: 'c360_fatt_date', unique: false, element: 'attendance_date' },
    ],
})
