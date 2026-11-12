import { Form, List, default_view } from '@servicenow/sdk/core'

// Default form views and list layouts — hostel management.

// ---- Hostel ----
Form({
    table: 'x_774308_campus360_hostel',
    view: default_view,
    sections: [
        {
            caption: 'Hostel',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { field: 'code', type: 'table_field' },
                        { field: 'name', type: 'table_field' },
                        { field: 'hostel_type', type: 'table_field' },
                        { field: 'location', type: 'table_field' },
                        { field: 'floors', type: 'table_field' },
                        { field: 'active', type: 'table_field' },
                    ],
                    rightElements: [
                        { field: 'warden', type: 'table_field' },
                        { field: 'assistant_warden', type: 'table_field' },
                        { field: 'contact_phone', type: 'table_field' },
                        { field: 'total_capacity', type: 'table_field' },
                        { field: 'occupied_beds', type: 'table_field' },
                    ],
                },
            ],
        },
        {
            caption: 'Rooms',
            content: [{ layout: 'one-column', elements: [{ type: 'list', listType: '12M', listRef: 'x_774308_campus360_hostel_room.hostel' }] }],
        },
        {
            caption: 'Complaints',
            content: [{ layout: 'one-column', elements: [{ type: 'list', listType: '12M', listRef: 'x_774308_campus360_hostel_cmpl.hostel' }] }],
        },
    ],
})
List({
    table: 'x_774308_campus360_hostel',
    view: default_view,
    columns: ['code', 'name', 'hostel_type', 'warden', 'total_capacity', 'occupied_beds', 'active'],
})

// ---- Hostel Room ----
Form({
    table: 'x_774308_campus360_hostel_room',
    view: default_view,
    sections: [
        {
            caption: 'Hostel Room',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { field: 'name', type: 'table_field' },
                        { field: 'hostel', type: 'table_field' },
                        { field: 'room_number', type: 'table_field' },
                        { field: 'floor', type: 'table_field' },
                    ],
                    rightElements: [
                        { field: 'room_type', type: 'table_field' },
                        { field: 'capacity', type: 'table_field' },
                        { field: 'occupied', type: 'table_field' },
                        { field: 'status', type: 'table_field' },
                    ],
                },
                { layout: 'one-column', elements: [{ field: 'amenities', type: 'table_field' }] },
            ],
        },
        {
            caption: 'Allocations',
            content: [{ layout: 'one-column', elements: [{ type: 'list', listType: '12M', listRef: 'x_774308_campus360_room_alloc.hostel_room' }] }],
        },
    ],
})
List({
    table: 'x_774308_campus360_hostel_room',
    view: default_view,
    columns: ['name', 'hostel', 'floor', 'room_type', 'capacity', 'occupied', 'status'],
})

// ---- Room Allocation ----
Form({
    table: 'x_774308_campus360_room_alloc',
    view: default_view,
    sections: [
        {
            caption: 'Room Allocation',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { field: 'number', type: 'table_field' },
                        { field: 'student', type: 'table_field' },
                        { field: 'hostel_room', type: 'table_field' },
                        { field: 'bed_label', type: 'table_field' },
                        { field: 'term', type: 'table_field' },
                    ],
                    rightElements: [
                        { field: 'status', type: 'table_field' },
                        { field: 'start_date', type: 'table_field' },
                        { field: 'end_date', type: 'table_field' },
                        { field: 'vacated_on', type: 'table_field' },
                        { field: 'allocated_by', type: 'table_field' },
                    ],
                },
                { layout: 'one-column', elements: [{ field: 'remarks', type: 'table_field' }] },
            ],
        },
    ],
})
List({
    table: 'x_774308_campus360_room_alloc',
    view: default_view,
    columns: ['number', 'student', 'hostel_room', 'bed_label', 'term', 'status', 'start_date', 'end_date'],
})

// ---- Hostel Complaint ----
Form({
    table: 'x_774308_campus360_hostel_cmpl',
    view: default_view,
    sections: [
        {
            caption: 'Hostel Complaint',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { field: 'number', type: 'table_field' },
                        { field: 'caller', type: 'table_field' },
                        { field: 'student', type: 'table_field' },
                        { field: 'hostel', type: 'table_field' },
                        { field: 'hostel_room', type: 'table_field' },
                        { field: 'complaint_type', type: 'table_field' },
                    ],
                    rightElements: [
                        { field: 'state', type: 'table_field' },
                        { field: 'priority', type: 'table_field' },
                        { field: 'is_confidential', type: 'table_field' },
                        { field: 'assignment_group', type: 'table_field' },
                        { field: 'assigned_to', type: 'table_field' },
                    ],
                },
                {
                    layout: 'one-column',
                    elements: [
                        { field: 'short_description', type: 'table_field' },
                        { field: 'description', type: 'table_field' },
                    ],
                },
            ],
        },
        {
            caption: 'Notes',
            content: [
                {
                    layout: 'one-column',
                    elements: [
                        { field: 'comments', type: 'table_field' },
                        { field: 'work_notes', type: 'table_field' },
                        { field: 'close_notes', type: 'table_field' },
                    ],
                },
            ],
        },
        {
            caption: 'Activity',
            content: [{ layout: 'one-column', elements: [{ type: 'formatter', formatterRef: 'Activities_Filtered' }] }],
        },
        {
            caption: 'Maintenance Requests',
            content: [{ layout: 'one-column', elements: [{ type: 'list', listType: '12M', listRef: 'x_774308_campus360_maint_req.parent' }] }],
        },
    ],
})
List({
    table: 'x_774308_campus360_hostel_cmpl',
    view: default_view,
    columns: ['number', 'short_description', 'caller', 'hostel', 'hostel_room', 'complaint_type', 'state', 'assigned_to'],
})
