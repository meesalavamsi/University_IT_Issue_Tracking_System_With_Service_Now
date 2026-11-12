import {
    BooleanColumn,
    ChoiceColumn,
    ChoiceSet,
    DateTimeColumn,
    IntegerColumn,
    MultiLineTextColumn,
    OverrideColumn,
    ReferenceColumn,
    StringColumn,
    Table,
} from '@servicenow/sdk/core'

// Core IT Issue Tracking (DATABASE_SCHEMA.md §4) — the primary Campus360 module.

export const x_774308_campus360_issue_cat = Table({
    name: 'x_774308_campus360_issue_cat',
    label: 'Issue Category',
    display: 'name',
    schema: {
        code: StringColumn({ label: 'Code', maxLength: 40, mandatory: true }),
        name: StringColumn({ label: 'Name', maxLength: 80, mandatory: true }),
        description: MultiLineTextColumn({ label: 'Description', maxLength: 1000 }),
        assignment_group: ReferenceColumn({
            label: 'Assignment Group',
            referenceTable: 'sys_user_group',
            mandatory: true,
            cascadeRule: 'restrict',
            referenceQual: 'nameSTARTSWITHC360^active=true',
        }),
        default_impact: ChoiceColumn({
            label: 'Default Impact',
            default: '3',
            dropdown: 'dropdown_without_none',
            choices: {
                1: { label: '1 - High', sequence: 10 },
                2: { label: '2 - Medium', sequence: 20 },
                3: { label: '3 - Low', sequence: 30 },
            },
        }),
        default_urgency: ChoiceColumn({
            label: 'Default Urgency',
            default: '3',
            dropdown: 'dropdown_without_none',
            choices: {
                1: { label: '1 - High', sequence: 10 },
                2: { label: '2 - Medium', sequence: 20 },
                3: { label: '3 - Low', sequence: 30 },
            },
        }),
        requires_asset: BooleanColumn({ label: 'Asset Required', default: false }),
        requires_lab: BooleanColumn({ label: 'Lab Required', default: false }),
        requires_hostel: BooleanColumn({ label: 'Hostel Required', default: false }),
        portal_visible: BooleanColumn({ label: 'Show on Portal', default: true }),
        icon: StringColumn({ label: 'Portal Icon', maxLength: 40 }),
        order: IntegerColumn({ label: 'Order', default: 100 }),
        active: BooleanColumn({ label: 'Active', default: true }),
    },
    index: [{ name: 'c360_icat_code_u', unique: true, element: 'code' }],
})

export const x_774308_campus360_issue_sub = Table({
    name: 'x_774308_campus360_issue_sub',
    label: 'Issue Subcategory',
    display: 'name',
    schema: {
        category: ReferenceColumn({
            label: 'Category',
            referenceTable: 'x_774308_campus360_issue_cat',
            mandatory: true,
            cascadeRule: 'cascade',
        }),
        code: StringColumn({ label: 'Code', maxLength: 40, mandatory: true }),
        name: StringColumn({ label: 'Name', maxLength: 80, mandatory: true }),
        assignment_group: ReferenceColumn({
            label: 'Override Group',
            referenceTable: 'sys_user_group',
            cascadeRule: 'clear',
            referenceQual: 'nameSTARTSWITHC360^active=true',
        }),
        active: BooleanColumn({ label: 'Active', default: true }),
    },
    index: [{ name: 'c360_isub_cat_code_u', unique: true, element: ['category', 'code'] }],
})

export const x_774308_campus360_it_issue = Table({
    name: 'x_774308_campus360_it_issue',
    label: 'IT Issue',
    extends: 'task',
    audit: true,
    autoNumber: { prefix: 'ITI', number: 1000, numberOfDigits: 7 },
    schema: {
        // ---- Inherited task field overrides ----
        state: OverrideColumn({
            baseTable: 'task',
            default: '1',
            attributes: { close_states: '3;7', default_close_state: '3', default_work_state: '2' },
        }),
        short_description: OverrideColumn({ baseTable: 'task', mandatory: true }),
        // ---- New columns ----
        caller: ReferenceColumn({
            label: 'Reported For',
            referenceTable: 'sys_user',
            mandatory: true,
            cascadeRule: 'clear',
            referenceQual: 'active=true',
            default: 'javascript:gs.getUserID()',
        }),
        reporter_type: ChoiceColumn({
            label: 'Reporter Type',
            readOnly: true, readOnlyOption: 'display_read_only',
            dropdown: 'dropdown_with_none',
            choices: {
                student: { label: 'Student', sequence: 10 },
                faculty: { label: 'Faculty', sequence: 20 },
                staff: { label: 'Staff', sequence: 30 },
                guest: { label: 'Guest', sequence: 40 },
            },
        }),
        department: ReferenceColumn({
            label: 'Department',
            referenceTable: 'x_774308_campus360_department',
            cascadeRule: 'clear',
            readOnly: true, readOnlyOption: 'display_read_only',
        }),
        category: ReferenceColumn({
            label: 'Category',
            referenceTable: 'x_774308_campus360_issue_cat',
            mandatory: true,
            cascadeRule: 'restrict',
            referenceQual: 'active=true',
        }),
        subcategory: ReferenceColumn({
            label: 'Subcategory',
            referenceTable: 'x_774308_campus360_issue_sub',
            cascadeRule: 'clear',
            useReferenceQualifier: 'advanced',
            referenceQual: "javascript:'active=true^category=' + current.getValue('category')",
        }),
        channel: ChoiceColumn({
            label: 'Channel',
            default: 'portal',
            dropdown: 'dropdown_with_none',
            choices: {
                portal: { label: 'Portal', sequence: 10 },
                phone: { label: 'Phone', sequence: 20 },
                email: { label: 'Email', sequence: 30 },
                walk_in: { label: 'Walk-in', sequence: 40 },
                catalog: { label: 'Service Catalog', sequence: 50 },
            },
        }),
        room_detail: StringColumn({ label: 'Room / Spot', maxLength: 60 }),
        laboratory: ReferenceColumn({ label: 'Laboratory', referenceTable: 'x_774308_campus360_laboratory', cascadeRule: 'clear' }),
        hostel: ReferenceColumn({ label: 'Hostel', referenceTable: 'x_774308_campus360_hostel', cascadeRule: 'clear' }),
        hostel_room: ReferenceColumn({
            label: 'Hostel Room',
            referenceTable: 'x_774308_campus360_hostel_room',
            cascadeRule: 'clear',
            useReferenceQualifier: 'advanced',
            referenceQual: "javascript:'hostel=' + current.getValue('hostel')",
        }),
        affected_asset: ReferenceColumn({ label: 'Affected Asset', referenceTable: 'alm_asset', cascadeRule: 'clear' }),
        on_hold_reason: ChoiceColumn({
            label: 'On Hold Reason',
            dropdown: 'dropdown_with_none',
            choices: {
                awaiting_caller: { label: 'Awaiting Caller', sequence: 10 },
                awaiting_parts: { label: 'Awaiting Parts', sequence: 20 },
                awaiting_vendor: { label: 'Awaiting Vendor', sequence: 30 },
                scheduled_visit: { label: 'Scheduled Visit', sequence: 40 },
            },
        }),
        resolution_code: ChoiceColumn({
            label: 'Resolution Code',
            dropdown: 'dropdown_with_none',
            choices: {
                fixed: { label: 'Fixed', sequence: 10 },
                workaround: { label: 'Workaround Provided', sequence: 20 },
                hardware_replaced: { label: 'Hardware Replaced', sequence: 30 },
                config_change: { label: 'Configuration Change', sequence: 40 },
                user_guidance: { label: 'User Guidance', sequence: 50 },
                duplicate: { label: 'Duplicate', sequence: 60 },
                not_reproducible: { label: 'Not Reproducible', sequence: 70 },
                vendor_referral: { label: 'Referred to Vendor', sequence: 80 },
                referred_maintenance: { label: 'Referred to Maintenance', sequence: 90 },
            },
        }),
        resolved_by: ReferenceColumn({ label: 'Resolved By', referenceTable: 'sys_user', cascadeRule: 'clear', readOnly: true, readOnlyOption: 'display_read_only' }),
        resolved_at: DateTimeColumn({ label: 'Resolved At', readOnly: true, readOnlyOption: 'display_read_only' }),
        reopen_count: IntegerColumn({ label: 'Reopen Count', default: 0, readOnly: true, readOnlyOption: 'display_read_only' }),
        // Set only by the authorised, duplicate-protected "Escalate to Incident" action (Part 4).
        // Field-level write ACL restricts it to it_manager/admin (security/it-issue.acl.now.ts).
        escalated_incident: ReferenceColumn({
            label: 'Escalated Incident',
            referenceTable: 'incident',
            cascadeRule: 'clear',
            readOnly: true, readOnlyOption: 'display_read_only',
        }),
    },
    index: [
        { name: 'c360_iti_caller', unique: false, element: 'caller' },
        { name: 'c360_iti_category', unique: false, element: 'category' },
        { name: 'c360_iti_hostel', unique: false, element: 'hostel' },
        { name: 'c360_iti_lab', unique: false, element: 'laboratory' },
        { name: 'c360_iti_esc_incident', unique: false, element: 'escalated_incident' },
    ],
})

// IT Issue lifecycle states (inherited task.state; ChoiceSet on our own scoped table).
ChoiceSet({
    table: 'x_774308_campus360_it_issue',
    field: 'state',
    choices: {
        1: { label: 'New', sequence: 10 },
        2: { label: 'In Progress', sequence: 20 },
        '-5': { label: 'On Hold', sequence: 30 },
        6: { label: 'Resolved', sequence: 40 },
        3: { label: 'Closed', sequence: 50 },
        7: { label: 'Cancelled', sequence: 60 },
    },
})
