import {
    BooleanColumn,
    ChoiceColumn,
    DateColumn,
    DecimalColumn,
    EmailColumn,
    IntegerColumn,
    ListColumn,
    MultiLineTextColumn,
    ReferenceColumn,
    StringColumn,
    Table,
} from '@servicenow/sdk/core'

// Academic structure (DATABASE_SCHEMA.md §2).

export const x_774308_campus360_department = Table({
    name: 'x_774308_campus360_department',
    label: 'Department',
    display: 'name',
    schema: {
        code: StringColumn({ label: 'Code', maxLength: 10, mandatory: true }),
        name: StringColumn({ label: 'Name', maxLength: 100, mandatory: true }),
        hod: ReferenceColumn({
            label: 'Head of Department',
            referenceTable: 'x_774308_campus360_faculty',
            cascadeRule: 'clear',
            useReferenceQualifier: 'advanced',
            referenceQual: "javascript:'status=active^department=' + current.getUniqueValue()",
        }),
        platform_dept: ReferenceColumn({
            label: 'Platform Department',
            referenceTable: 'cmn_department',
            cascadeRule: 'clear',
            hint: 'Links this academic department to the platform department used by sys_user and alm_asset.',
        }),
        building: ReferenceColumn({ label: 'Building', referenceTable: 'cmn_location', cascadeRule: 'clear' }),
        email: EmailColumn({ label: 'Department Email' }),
        phone: StringColumn({ label: 'Phone', maxLength: 40 }),
        established_year: IntegerColumn({ label: 'Established', min: 1800, max: 2100 }),
        description: MultiLineTextColumn({ label: 'Description', maxLength: 4000 }),
        active: BooleanColumn({ label: 'Active', default: true }),
    },
    index: [
        { name: 'c360_dept_code_u', unique: true, element: 'code' },
        { name: 'c360_dept_name_u', unique: true, element: 'name' },
        { name: 'c360_dept_platform', unique: false, element: 'platform_dept' },
    ],
})

export const x_774308_campus360_acad_term = Table({
    name: 'x_774308_campus360_acad_term',
    label: 'Academic Term',
    display: 'name',
    schema: {
        name: StringColumn({ label: 'Name', maxLength: 60, mandatory: true }),
        academic_year: StringColumn({ label: 'Academic Year', maxLength: 9, mandatory: true, hint: 'Format YYYY-YY, e.g. 2026-27' }),
        term_type: ChoiceColumn({
            label: 'Term Type',
            mandatory: true,
            dropdown: 'dropdown_with_none',
            choices: {
                odd: { label: 'Odd Semester', sequence: 10 },
                even: { label: 'Even Semester', sequence: 20 },
                summer: { label: 'Summer Term', sequence: 30 },
            },
        }),
        start_date: DateColumn({ label: 'Start Date', mandatory: true }),
        end_date: DateColumn({ label: 'End Date', mandatory: true }),
        is_current: BooleanColumn({ label: 'Current Term', default: false }),
        registration_open: BooleanColumn({ label: 'Registration Open', default: false }),
        active: BooleanColumn({ label: 'Active', default: true }),
    },
    index: [
        { name: 'c360_term_name_u', unique: true, element: 'name' },
        { name: 'c360_term_year_type_u', unique: true, element: ['academic_year', 'term_type'] },
    ],
})

export const x_774308_campus360_program = Table({
    name: 'x_774308_campus360_program',
    label: 'Academic Program',
    display: 'name',
    schema: {
        code: StringColumn({ label: 'Code', maxLength: 20, mandatory: true }),
        name: StringColumn({ label: 'Name', maxLength: 120, mandatory: true }),
        department: ReferenceColumn({
            label: 'Department',
            referenceTable: 'x_774308_campus360_department',
            mandatory: true,
            cascadeRule: 'restrict',
            referenceQual: 'active=true',
        }),
        degree_level: ChoiceColumn({
            label: 'Degree Level',
            mandatory: true,
            dropdown: 'dropdown_with_none',
            choices: {
                certificate: { label: 'Certificate', sequence: 10 },
                diploma: { label: 'Diploma', sequence: 20 },
                ug: { label: 'Undergraduate', sequence: 30 },
                pg: { label: 'Postgraduate', sequence: 40 },
                phd: { label: 'Doctoral', sequence: 50 },
            },
        }),
        duration_years: IntegerColumn({ label: 'Duration (Years)', mandatory: true, min: 1, max: 6 }),
        total_semesters: IntegerColumn({ label: 'Total Semesters', mandatory: true, min: 1, max: 12 }),
        intake_capacity: IntegerColumn({ label: 'Annual Intake', min: 0 }),
        active: BooleanColumn({ label: 'Active', default: true }),
    },
    index: [
        { name: 'c360_prog_code_u', unique: true, element: 'code' },
        { name: 'c360_prog_dept', unique: false, element: 'department' },
    ],
})

export const x_774308_campus360_course = Table({
    name: 'x_774308_campus360_course',
    label: 'Course',
    display: 'name',
    schema: {
        code: StringColumn({ label: 'Course Code', maxLength: 20, mandatory: true }),
        name: StringColumn({ label: 'Course Name', maxLength: 120, mandatory: true }),
        department: ReferenceColumn({
            label: 'Offering Department',
            referenceTable: 'x_774308_campus360_department',
            mandatory: true,
            cascadeRule: 'restrict',
            referenceQual: 'active=true',
        }),
        program: ReferenceColumn({
            label: 'Program',
            referenceTable: 'x_774308_campus360_program',
            cascadeRule: 'clear',
            referenceQual: 'active=true',
            hint: 'Leave empty for electives open to every program.',
        }),
        semester_no: IntegerColumn({ label: 'Semester', min: 1, max: 12 }),
        credits: DecimalColumn({ label: 'Credits', mandatory: true }),
        course_type: ChoiceColumn({
            label: 'Course Type',
            mandatory: true,
            dropdown: 'dropdown_with_none',
            choices: {
                theory: { label: 'Theory', sequence: 10 },
                lab: { label: 'Laboratory', sequence: 20 },
                theory_lab: { label: 'Theory + Lab', sequence: 30 },
                elective: { label: 'Elective', sequence: 40 },
                project: { label: 'Project', sequence: 50 },
            },
        }),
        min_attendance_pct: IntegerColumn({ label: 'Min. Attendance %', default: 75, min: 0, max: 100 }),
        active: BooleanColumn({ label: 'Active', default: true }),
    },
    index: [
        { name: 'c360_course_code_u', unique: true, element: 'code' },
        { name: 'c360_course_dept', unique: false, element: 'department' },
    ],
})

export const x_774308_campus360_course_sec = Table({
    name: 'x_774308_campus360_course_sec',
    label: 'Course Section',
    display: 'name',
    schema: {
        name: StringColumn({ label: 'Name', maxLength: 80, readOnly: true, readOnlyOption: 'display_read_only' }),
        course: ReferenceColumn({
            label: 'Course',
            referenceTable: 'x_774308_campus360_course',
            mandatory: true,
            cascadeRule: 'restrict',
            referenceQual: 'active=true',
        }),
        term: ReferenceColumn({
            label: 'Academic Term',
            referenceTable: 'x_774308_campus360_acad_term',
            mandatory: true,
            cascadeRule: 'restrict',
            referenceQual: 'active=true',
        }),
        section: StringColumn({ label: 'Section', maxLength: 5, mandatory: true }),
        faculty: ReferenceColumn({
            label: 'Instructor',
            referenceTable: 'x_774308_campus360_faculty',
            mandatory: true,
            cascadeRule: 'restrict',
            referenceQual: 'status=active',
        }),
        co_instructors: ListColumn({ label: 'Co-Instructors', referenceTable: 'x_774308_campus360_faculty' }),
        laboratory: ReferenceColumn({ label: 'Laboratory', referenceTable: 'x_774308_campus360_laboratory', cascadeRule: 'clear' }),
        room: ReferenceColumn({ label: 'Classroom', referenceTable: 'cmn_location', cascadeRule: 'clear' }),
        max_students: IntegerColumn({ label: 'Max Students', mandatory: true, min: 1 }),
        enrolled_count: IntegerColumn({ label: 'Enrolled', default: 0, readOnly: true, readOnlyOption: 'display_read_only' }),
        status: ChoiceColumn({
            label: 'Status',
            mandatory: true,
            default: 'planned',
            dropdown: 'dropdown_without_none',
            choices: {
                planned: { label: 'Planned', sequence: 10 },
                active: { label: 'Active', sequence: 20 },
                completed: { label: 'Completed', sequence: 30 },
                cancelled: { label: 'Cancelled', sequence: 40 },
            },
        }),
    },
    index: [
        { name: 'c360_sec_course_term_sec_u', unique: true, element: ['course', 'term', 'section'] },
        { name: 'c360_sec_faculty', unique: false, element: 'faculty' },
        { name: 'c360_sec_term', unique: false, element: 'term' },
    ],
})

export const x_774308_campus360_enrollment = Table({
    name: 'x_774308_campus360_enrollment',
    label: 'Course Enrollment',
    audit: true,
    allowWebServiceAccess: false,
    schema: {
        student: ReferenceColumn({
            label: 'Student',
            referenceTable: 'x_774308_campus360_student',
            mandatory: true,
            cascadeRule: 'restrict',
            referenceQual: 'status=active',
        }),
        course_section: ReferenceColumn({
            label: 'Course Section',
            referenceTable: 'x_774308_campus360_course_sec',
            mandatory: true,
            cascadeRule: 'restrict',
            referenceQual: 'statusINplanned,active',
        }),
        enrolled_on: DateColumn({ label: 'Enrolled On', default: 'javascript:new GlideDate().getValue()' }),
        status: ChoiceColumn({
            label: 'Status',
            mandatory: true,
            default: 'enrolled',
            dropdown: 'dropdown_without_none',
            choices: {
                enrolled: { label: 'Enrolled', sequence: 10 },
                dropped: { label: 'Dropped', sequence: 20 },
                completed: { label: 'Completed', sequence: 30 },
                failed: { label: 'Failed', sequence: 40 },
                withdrawn: { label: 'Withdrawn', sequence: 50 },
            },
        }),
        sessions_held: IntegerColumn({ label: 'Sessions Held', default: 0, readOnly: true, readOnlyOption: 'display_read_only' }),
        sessions_attended: IntegerColumn({ label: 'Sessions Attended', default: 0, readOnly: true, readOnlyOption: 'display_read_only' }),
        attendance_pct: DecimalColumn({ label: 'Attendance %', readOnly: true, readOnlyOption: 'display_read_only' }),
        exam_eligible: BooleanColumn({ label: 'Exam Eligible', default: false, readOnly: true, readOnlyOption: 'display_read_only' }),
    },
    index: [
        { name: 'c360_enr_student_section_u', unique: true, element: ['student', 'course_section'] },
        { name: 'c360_enr_section', unique: false, element: 'course_section' },
    ],
})
