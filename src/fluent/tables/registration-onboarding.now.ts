import {
    BooleanColumn,
    ChoiceColumn,
    ChoiceSet,
    DateColumn,
    DateTimeColumn,
    DecimalColumn,
    EmailColumn,
    IntegerColumn,
    ListColumn,
    MultiLineTextColumn,
    OverrideColumn,
    ReferenceColumn,
    StringColumn,
    Table,
} from '@servicenow/sdk/core'

// Student registration and faculty onboarding (DATABASE_SCHEMA.md §8).
// Faculty onboarding is custom because HR Service Delivery (sn_hr_core) is not installed on the PDI.

// ---------------------------------------------------------------------------------------------
// Student Registration — approval sequence: Registrar review (2) -> HOD approval (10) -> Approved (11)
// HOD approval itself is a platform approval (sysapproval_approver) created by the Part 5 flow.
// ---------------------------------------------------------------------------------------------
export const x_774308_campus360_student_reg = Table({
    name: 'x_774308_campus360_student_reg',
    label: 'Student Registration',
    extends: 'task',
    audit: true,
    allowWebServiceAccess: false,
    autoNumber: { prefix: 'REG', number: 1000, numberOfDigits: 7 },
    schema: {
        state: OverrideColumn({
            baseTable: 'task',
            default: '1',
            attributes: { close_states: '3;7;12', default_close_state: '3', default_work_state: '2' },
        }),
        first_name: StringColumn({ label: 'First Name', maxLength: 60, mandatory: true }),
        last_name: StringColumn({ label: 'Last Name', maxLength: 60, mandatory: true }),
        applicant_email: EmailColumn({ label: 'Email', mandatory: true }),
        applicant_phone: StringColumn({ label: 'Phone', maxLength: 40 }),
        date_of_birth: DateColumn({ label: 'Date of Birth' }),
        gender: ChoiceColumn({
            label: 'Gender',
            dropdown: 'dropdown_with_none',
            choices: {
                female: { label: 'Female', sequence: 10 },
                male: { label: 'Male', sequence: 20 },
                non_binary: { label: 'Non-binary', sequence: 30 },
                undisclosed: { label: 'Prefer not to say', sequence: 40 },
            },
        }),
        program: ReferenceColumn({
            label: 'Program',
            referenceTable: 'x_774308_campus360_program',
            mandatory: true,
            cascadeRule: 'restrict',
            referenceQual: 'active=true',
        }),
        admission_term: ReferenceColumn({
            label: 'Admission Term',
            referenceTable: 'x_774308_campus360_acad_term',
            mandatory: true,
            cascadeRule: 'restrict',
            referenceQual: 'registration_open=true^active=true',
        }),
        admission_category: ChoiceColumn({
            label: 'Admission Category',
            mandatory: true,
            default: 'regular',
            dropdown: 'dropdown_without_none',
            choices: {
                regular: { label: 'Regular', sequence: 10 },
                lateral_entry: { label: 'Lateral Entry', sequence: 20 },
                transfer: { label: 'Transfer', sequence: 30 },
                international: { label: 'International', sequence: 40 },
                scholarship: { label: 'Scholarship', sequence: 50 },
            },
        }),
        previous_institution: StringColumn({ label: 'Previous Institution', maxLength: 200 }),
        qualifying_score: DecimalColumn({ label: 'Qualifying Score %' }),
        guardian_name: StringColumn({ label: 'Guardian Name', maxLength: 100 }),
        guardian_phone: StringColumn({ label: 'Guardian Phone', maxLength: 40 }),
        hostel_requested: BooleanColumn({ label: 'Hostel Requested', default: false }),
        // ---- Stage 1: registrar review ----
        documents_verified: BooleanColumn({ label: 'Documents Verified', default: false }),
        registrar_recommendation: ChoiceColumn({
            label: 'Registrar Recommendation',
            dropdown: 'dropdown_with_none',
            choices: {
                recommend: { label: 'Recommend for HOD approval', sequence: 10 },
                reject: { label: 'Reject', sequence: 20 },
                more_info: { label: 'More information required', sequence: 30 },
            },
        }),
        verification_notes: MultiLineTextColumn({ label: 'Verification Notes', maxLength: 2000 }),
        registrar_reviewed_by: ReferenceColumn({
            label: 'Reviewed By (Registrar)',
            referenceTable: 'sys_user',
            cascadeRule: 'clear',
            readOnly: true,
            readOnlyOption: 'display_read_only',
        }),
        registrar_reviewed_at: DateTimeColumn({ label: 'Reviewed At', readOnly: true, readOnlyOption: 'display_read_only' }),
        // ---- Stage 2: HOD approval (platform approval record) ----
        hod_approver: ReferenceColumn({
            label: 'HOD Approver',
            referenceTable: 'sys_user',
            cascadeRule: 'clear',
            readOnly: true,
            readOnlyOption: 'display_read_only',
        }),
        // ---- Provisioning results ----
        created_user: ReferenceColumn({
            label: 'Created User',
            referenceTable: 'sys_user',
            cascadeRule: 'clear',
            readOnly: true,
            readOnlyOption: 'display_read_only',
        }),
        created_student: ReferenceColumn({
            label: 'Created Student',
            referenceTable: 'x_774308_campus360_student',
            cascadeRule: 'clear',
            readOnly: true,
            readOnlyOption: 'display_read_only',
        }),
    },
    index: [
        { name: 'c360_reg_email_term', unique: false, element: ['applicant_email', 'admission_term'] },
        { name: 'c360_reg_program', unique: false, element: 'program' },
    ],
})

ChoiceSet({
    table: 'x_774308_campus360_student_reg',
    field: 'state',
    choices: {
        1: { label: 'Submitted', sequence: 10 },
        2: { label: 'Registrar Review', sequence: 20 },
        10: { label: 'Pending HOD Approval', sequence: 30 },
        11: { label: 'Approved', sequence: 40 },
        12: { label: 'Rejected', sequence: 50 },
        3: { label: 'Enrolled', sequence: 60 },
        7: { label: 'Cancelled', sequence: 70 },
    },
})

// ---------------------------------------------------------------------------------------------
// Faculty Onboarding — approval is required BEFORE the checklist executes.
// Checklist tasks (onboard_tsk) are generated only after task.approval = 'approved' (Part 6 flow).
// ---------------------------------------------------------------------------------------------
export const x_774308_campus360_fac_onboard = Table({
    name: 'x_774308_campus360_fac_onboard',
    label: 'Faculty Onboarding',
    extends: 'task',
    audit: true,
    allowWebServiceAccess: false,
    autoNumber: { prefix: 'ONB', number: 1000, numberOfDigits: 7 },
    schema: {
        state: OverrideColumn({
            baseTable: 'task',
            default: '1',
            attributes: { close_states: '3;7;8', default_close_state: '3', default_work_state: '2' },
        }),
        first_name: StringColumn({ label: 'First Name', maxLength: 60, mandatory: true }),
        last_name: StringColumn({ label: 'Last Name', maxLength: 60, mandatory: true }),
        personal_email: EmailColumn({ label: 'Personal Email', mandatory: true }),
        personal_phone: StringColumn({ label: 'Personal Phone', maxLength: 40 }),
        department: ReferenceColumn({
            label: 'Department',
            referenceTable: 'x_774308_campus360_department',
            mandatory: true,
            cascadeRule: 'restrict',
            referenceQual: 'active=true',
        }),
        designation: ChoiceColumn({
            label: 'Designation',
            mandatory: true,
            dropdown: 'dropdown_with_none',
            choices: {
                professor: { label: 'Professor', sequence: 10 },
                assoc_professor: { label: 'Associate Professor', sequence: 20 },
                asst_professor: { label: 'Assistant Professor', sequence: 30 },
                lecturer: { label: 'Lecturer', sequence: 40 },
                lab_instructor: { label: 'Lab Instructor', sequence: 50 },
                visiting: { label: 'Visiting Faculty', sequence: 60 },
                adjunct: { label: 'Adjunct Faculty', sequence: 70 },
            },
        }),
        employment_type: ChoiceColumn({
            label: 'Employment Type',
            mandatory: true,
            dropdown: 'dropdown_with_none',
            choices: {
                permanent: { label: 'Permanent', sequence: 10 },
                contract: { label: 'Contract', sequence: 20 },
                visiting: { label: 'Visiting', sequence: 30 },
                adjunct: { label: 'Adjunct', sequence: 40 },
            },
        }),
        joining_date: DateColumn({ label: 'Joining Date', mandatory: true }),
        reporting_to: ReferenceColumn({
            label: 'Reporting To',
            referenceTable: 'x_774308_campus360_faculty',
            cascadeRule: 'clear',
            referenceQual: 'status=active',
        }),
        office_location: ReferenceColumn({ label: 'Office', referenceTable: 'cmn_location', cascadeRule: 'clear' }),
        laptop_required: BooleanColumn({ label: 'Laptop Required', default: true }),
        lab_access: ListColumn({ label: 'Lab Access', referenceTable: 'x_774308_campus360_laboratory' }),
        progress_pct: IntegerColumn({ label: 'Progress %', default: 0, readOnly: true, readOnlyOption: 'display_read_only' }),
        created_user: ReferenceColumn({
            label: 'Created User',
            referenceTable: 'sys_user',
            cascadeRule: 'clear',
            readOnly: true,
            readOnlyOption: 'display_read_only',
        }),
        created_faculty: ReferenceColumn({
            label: 'Created Faculty',
            referenceTable: 'x_774308_campus360_faculty',
            cascadeRule: 'clear',
            readOnly: true,
            readOnlyOption: 'display_read_only',
        }),
    },
    index: [{ name: 'c360_onb_dept', unique: false, element: 'department' }],
})

ChoiceSet({
    table: 'x_774308_campus360_fac_onboard',
    field: 'state',
    choices: {
        1: { label: 'Draft', sequence: 10 },
        9: { label: 'Awaiting Approval', sequence: 20 },
        2: { label: 'In Progress', sequence: 30 },
        '-5': { label: 'On Hold', sequence: 40 },
        3: { label: 'Completed', sequence: 50 },
        8: { label: 'Rejected', sequence: 60 },
        7: { label: 'Cancelled', sequence: 70 },
    },
})

export const x_774308_campus360_onb_tmpl = Table({
    name: 'x_774308_campus360_onb_tmpl',
    label: 'Onboarding Task Template',
    display: 'short_description',
    schema: {
        task_type: ChoiceColumn({
            label: 'Task Type',
            mandatory: true,
            dropdown: 'dropdown_with_none',
            choices: {
                it_account: { label: 'IT Account', sequence: 10 },
                email_setup: { label: 'Email Setup', sequence: 20 },
                laptop_allocation: { label: 'Laptop Allocation', sequence: 30 },
                id_card: { label: 'ID Card', sequence: 40 },
                office_allocation: { label: 'Office Allocation', sequence: 50 },
                lab_access: { label: 'Lab Access', sequence: 60 },
                orientation: { label: 'Orientation', sequence: 70 },
                document_verification: { label: 'Document Verification', sequence: 80 },
                payroll_setup: { label: 'Payroll Setup', sequence: 90 },
                library_card: { label: 'Library Card', sequence: 100 },
            },
        }),
        short_description: StringColumn({ label: 'Short Description', maxLength: 160, mandatory: true }),
        description: MultiLineTextColumn({ label: 'Instructions', maxLength: 4000 }),
        assignment_group: ReferenceColumn({
            label: 'Assignment Group',
            referenceTable: 'sys_user_group',
            mandatory: true,
            cascadeRule: 'restrict',
            referenceQual: 'nameSTARTSWITHC360^active=true',
        }),
        sequence: IntegerColumn({ label: 'Sequence', mandatory: true, default: 100 }),
        due_offset_days: IntegerColumn({ label: 'Due Offset (days from joining)', default: 0, min: -60, max: 90 }),
        condition_field: ChoiceColumn({
            label: 'Only If',
            default: 'always',
            dropdown: 'dropdown_without_none',
            choices: {
                always: { label: 'Always', sequence: 10 },
                laptop_required: { label: 'Laptop Required', sequence: 20 },
                lab_access: { label: 'Lab Access Requested', sequence: 30 },
            },
        }),
        active: BooleanColumn({ label: 'Active', default: true }),
    },
    index: [{ name: 'c360_onbt_type_u', unique: true, element: 'task_type' }],
})

export const x_774308_campus360_onboard_tsk = Table({
    name: 'x_774308_campus360_onboard_tsk',
    label: 'Onboarding Task',
    extends: 'task',
    audit: true,
    autoNumber: { prefix: 'OBT', number: 1000, numberOfDigits: 7 },
    schema: {
        state: OverrideColumn({
            baseTable: 'task',
            default: '1',
            attributes: { close_states: '3;4;7', default_close_state: '3', default_work_state: '2' },
        }),
        onboarding: ReferenceColumn({
            label: 'Onboarding',
            referenceTable: 'x_774308_campus360_fac_onboard',
            mandatory: true,
            cascadeRule: 'cascade',
        }),
        task_type: ChoiceColumn({
            label: 'Task Type',
            mandatory: true,
            dropdown: 'dropdown_with_none',
            choices: {
                it_account: { label: 'IT Account', sequence: 10 },
                email_setup: { label: 'Email Setup', sequence: 20 },
                laptop_allocation: { label: 'Laptop Allocation', sequence: 30 },
                id_card: { label: 'ID Card', sequence: 40 },
                office_allocation: { label: 'Office Allocation', sequence: 50 },
                lab_access: { label: 'Lab Access', sequence: 60 },
                orientation: { label: 'Orientation', sequence: 70 },
                document_verification: { label: 'Document Verification', sequence: 80 },
                payroll_setup: { label: 'Payroll Setup', sequence: 90 },
                library_card: { label: 'Library Card', sequence: 100 },
            },
        }),
        sequence: IntegerColumn({ label: 'Sequence', default: 100 }),
        allocated_asset: ReferenceColumn({
            label: 'Allocated Asset',
            referenceTable: 'alm_hardware',
            cascadeRule: 'clear',
            referenceQual: 'install_status=6',
        }),
        template: ReferenceColumn({
            label: 'Template',
            referenceTable: 'x_774308_campus360_onb_tmpl',
            cascadeRule: 'clear',
            readOnly: true,
            readOnlyOption: 'display_read_only',
        }),
    },
    index: [{ name: 'c360_obt_onboarding', unique: false, element: 'onboarding' }],
})

ChoiceSet({
    table: 'x_774308_campus360_onboard_tsk',
    field: 'state',
    choices: {
        1: { label: 'Open', sequence: 10 },
        2: { label: 'Work in Progress', sequence: 20 },
        '-5': { label: 'Pending', sequence: 30 },
        3: { label: 'Closed Complete', sequence: 40 },
        4: { label: 'Closed Incomplete', sequence: 50 },
        7: { label: 'Closed Skipped', sequence: 60 },
    },
})
