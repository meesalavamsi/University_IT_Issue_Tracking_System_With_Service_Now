import {
    BooleanColumn,
    ChoiceColumn,
    ChoiceSet,
    DateColumn,
    IntegerColumn,
    MultiLineTextColumn,
    OverrideColumn,
    ReferenceColumn,
    StringColumn,
    Table,
} from '@servicenow/sdk/core'

// Hostel management (DATABASE_SCHEMA.md §5).
// Capacity is enforced server-side (Part 8: C360HostelUtils.validateAllocation, aggregate recount,
// nightly "C360 Hostel Occupancy Reconcile"). Occupancy counters are read-only and never typed in.

export const x_774308_campus360_hostel = Table({
    name: 'x_774308_campus360_hostel',
    label: 'Hostel',
    display: 'name',
    schema: {
        code: StringColumn({ label: 'Code', maxLength: 10, mandatory: true }),
        name: StringColumn({ label: 'Name', maxLength: 100, mandatory: true }),
        hostel_type: ChoiceColumn({
            label: 'Type',
            mandatory: true,
            dropdown: 'dropdown_with_none',
            choices: {
                boys: { label: 'Boys', sequence: 10 },
                girls: { label: 'Girls', sequence: 20 },
                co_ed: { label: 'Co-ed', sequence: 30 },
                staff: { label: 'Staff', sequence: 40 },
            },
        }),
        location: ReferenceColumn({ label: 'Building', referenceTable: 'cmn_location', mandatory: true, cascadeRule: 'restrict' }),
        warden: ReferenceColumn({
            label: 'Warden',
            referenceTable: 'sys_user',
            mandatory: true,
            cascadeRule: 'restrict',
            referenceQual: 'active=true^roles=x_774308_campus360.warden',
        }),
        assistant_warden: ReferenceColumn({
            label: 'Assistant Warden',
            referenceTable: 'sys_user',
            cascadeRule: 'clear',
            referenceQual: 'active=true^roles=x_774308_campus360.warden',
        }),
        floors: IntegerColumn({ label: 'Floors', min: 1 }),
        total_capacity: IntegerColumn({ label: 'Total Beds', default: 0, readOnly: true, readOnlyOption: 'display_read_only' }),
        occupied_beds: IntegerColumn({ label: 'Occupied Beds', default: 0, readOnly: true, readOnlyOption: 'display_read_only' }),
        contact_phone: StringColumn({ label: 'Office Phone', maxLength: 40 }),
        active: BooleanColumn({ label: 'Active', default: true }),
    },
    index: [
        { name: 'c360_hostel_code_u', unique: true, element: 'code' },
        { name: 'c360_hostel_warden', unique: false, element: 'warden' },
        { name: 'c360_hostel_asst_warden', unique: false, element: 'assistant_warden' },
    ],
})

export const x_774308_campus360_hostel_room = Table({
    name: 'x_774308_campus360_hostel_room',
    label: 'Hostel Room',
    display: 'name',
    schema: {
        name: StringColumn({ label: 'Room', maxLength: 30, readOnly: true, readOnlyOption: 'display_read_only' }),
        hostel: ReferenceColumn({
            label: 'Hostel',
            referenceTable: 'x_774308_campus360_hostel',
            mandatory: true,
            cascadeRule: 'restrict',
            referenceQual: 'active=true',
        }),
        room_number: StringColumn({ label: 'Room Number', maxLength: 10, mandatory: true }),
        floor: IntegerColumn({ label: 'Floor', min: 0 }),
        room_type: ChoiceColumn({
            label: 'Room Type',
            mandatory: true,
            dropdown: 'dropdown_with_none',
            choices: {
                single: { label: 'Single', sequence: 10 },
                double: { label: 'Double', sequence: 20 },
                triple: { label: 'Triple', sequence: 30 },
                quad: { label: 'Quad', sequence: 40 },
                dormitory: { label: 'Dormitory', sequence: 50 },
            },
        }),
        capacity: IntegerColumn({ label: 'Bed Capacity', mandatory: true, min: 1, max: 12 }),
        occupied: IntegerColumn({ label: 'Occupied Beds', default: 0, readOnly: true, readOnlyOption: 'display_read_only' }),
        status: ChoiceColumn({
            label: 'Status',
            mandatory: true,
            default: 'available',
            dropdown: 'dropdown_without_none',
            choices: {
                available: { label: 'Available', sequence: 10 },
                full: { label: 'Full', sequence: 20 },
                maintenance: { label: 'Under Maintenance', sequence: 30 },
                closed: { label: 'Closed', sequence: 40 },
            },
        }),
        amenities: StringColumn({ label: 'Amenities', maxLength: 200 }),
    },
    index: [
        { name: 'c360_room_hostel_number_u', unique: true, element: ['hostel', 'room_number'] },
        { name: 'c360_room_status', unique: false, element: 'status' },
    ],
})

export const x_774308_campus360_room_alloc = Table({
    name: 'x_774308_campus360_room_alloc',
    label: 'Room Allocation',
    display: 'number',
    audit: true,
    allowWebServiceAccess: false,
    autoNumber: { prefix: 'HAL', number: 1000, numberOfDigits: 7 },
    schema: {
        number: StringColumn({
            label: 'Number',
            maxLength: 40,
            default: 'javascript:global.getNextObjNumberPadded();',
            readOnly: true,
            readOnlyOption: 'display_read_only',
        }),
        student: ReferenceColumn({
            label: 'Student',
            referenceTable: 'x_774308_campus360_student',
            mandatory: true,
            cascadeRule: 'restrict',
            referenceQual: 'status=active',
        }),
        hostel_room: ReferenceColumn({
            label: 'Room',
            referenceTable: 'x_774308_campus360_hostel_room',
            mandatory: true,
            cascadeRule: 'restrict',
            referenceQual: 'status=available^hostel.active=true',
        }),
        term: ReferenceColumn({
            label: 'Academic Term',
            referenceTable: 'x_774308_campus360_acad_term',
            mandatory: true,
            cascadeRule: 'restrict',
            referenceQual: 'active=true',
        }),
        bed_label: StringColumn({ label: 'Bed', maxLength: 5 }),
        start_date: DateColumn({ label: 'Check-in Date', mandatory: true }),
        end_date: DateColumn({ label: 'Planned Check-out' }),
        status: ChoiceColumn({
            label: 'Status',
            mandatory: true,
            default: 'requested',
            dropdown: 'dropdown_without_none',
            choices: {
                requested: { label: 'Requested', sequence: 10 },
                active: { label: 'Active', sequence: 20 },
                vacated: { label: 'Vacated', sequence: 30 },
                cancelled: { label: 'Cancelled', sequence: 40 },
                rejected: { label: 'Rejected', sequence: 50 },
            },
        }),
        vacated_on: DateColumn({ label: 'Vacated On' }),
        allocated_by: ReferenceColumn({
            label: 'Allocated By',
            referenceTable: 'sys_user',
            cascadeRule: 'clear',
            readOnly: true,
            readOnlyOption: 'display_read_only',
        }),
        remarks: MultiLineTextColumn({ label: 'Remarks', maxLength: 1000 }),
    },
    index: [
        { name: 'c360_alloc_number_u', unique: true, element: 'number' },
        { name: 'c360_alloc_room_status', unique: false, element: ['hostel_room', 'status'] },
        { name: 'c360_alloc_student_status', unique: false, element: ['student', 'status'] },
    ],
})

export const x_774308_campus360_hostel_cmpl = Table({
    name: 'x_774308_campus360_hostel_cmpl',
    label: 'Hostel Complaint',
    extends: 'task',
    audit: true,
    autoNumber: { prefix: 'HCP', number: 1000, numberOfDigits: 7 },
    schema: {
        state: OverrideColumn({
            baseTable: 'task',
            default: '1',
            attributes: { close_states: '3;7', default_close_state: '3', default_work_state: '2' },
        }),
        short_description: OverrideColumn({ baseTable: 'task', mandatory: true }),
        caller: ReferenceColumn({
            label: 'Raised By',
            referenceTable: 'sys_user',
            mandatory: true,
            cascadeRule: 'clear',
            referenceQual: 'active=true',
            default: 'javascript:gs.getUserID()',
        }),
        student: ReferenceColumn({
            label: 'Student',
            referenceTable: 'x_774308_campus360_student',
            cascadeRule: 'clear',
            readOnly: true,
            readOnlyOption: 'display_read_only',
        }),
        hostel: ReferenceColumn({
            label: 'Hostel',
            referenceTable: 'x_774308_campus360_hostel',
            mandatory: true,
            cascadeRule: 'restrict',
            referenceQual: 'active=true',
        }),
        hostel_room: ReferenceColumn({
            label: 'Room',
            referenceTable: 'x_774308_campus360_hostel_room',
            cascadeRule: 'clear',
            useReferenceQualifier: 'advanced',
            referenceQual: "javascript:'hostel=' + current.getValue('hostel')",
        }),
        complaint_type: ChoiceColumn({
            label: 'Complaint Type',
            mandatory: true,
            dropdown: 'dropdown_with_none',
            choices: {
                plumbing: { label: 'Plumbing', sequence: 10 },
                electrical: { label: 'Electrical', sequence: 20 },
                furniture: { label: 'Furniture', sequence: 30 },
                cleanliness: { label: 'Cleanliness', sequence: 40 },
                pest_control: { label: 'Pest Control', sequence: 50 },
                mess_food: { label: 'Mess / Food', sequence: 60 },
                water_supply: { label: 'Water Supply', sequence: 70 },
                security: { label: 'Security', sequence: 80 },
                roommate: { label: 'Roommate', sequence: 90 },
                noise: { label: 'Noise', sequence: 100 },
                other: { label: 'Other', sequence: 110 },
            },
        }),
        is_confidential: BooleanColumn({ label: 'Confidential', default: false }),
    },
    index: [
        { name: 'c360_hcp_hostel', unique: false, element: 'hostel' },
        { name: 'c360_hcp_caller', unique: false, element: 'caller' },
    ],
})

ChoiceSet({
    table: 'x_774308_campus360_hostel_cmpl',
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
