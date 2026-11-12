import { Form, List, default_view } from '@servicenow/sdk/core'

// Default form views and list layouts — laboratories & infrastructure.
// Lab asset / CI related lists ("C360 Lab Assets", "C360 Lab CIs") are explicit sys_relationship
// records added in Part 9, where they are wired into this form.

// ---- Laboratory ----
Form({
    table: 'x_774308_campus360_laboratory',
    view: default_view,
    sections: [
        {
            caption: 'Laboratory',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { field: 'code', type: 'table_field' },
                        { field: 'name', type: 'table_field' },
                        { field: 'department', type: 'table_field' },
                        { field: 'lab_type', type: 'table_field' },
                        { field: 'location', type: 'table_field' },
                        { field: 'status', type: 'table_field' },
                        { field: 'active', type: 'table_field' },
                    ],
                    rightElements: [
                        { field: 'lab_incharge', type: 'table_field' },
                        { field: 'lab_assistant', type: 'table_field' },
                        { field: 'support_group', type: 'table_field' },
                        { field: 'seating_capacity', type: 'table_field' },
                        { field: 'workstation_count', type: 'table_field' },
                        { field: 'operating_hours', type: 'table_field' },
                    ],
                },
                { layout: 'one-column', elements: [{ field: 'safety_notes', type: 'table_field' }] },
            ],
        },
        {
            caption: 'IT Issues',
            content: [{ layout: 'one-column', elements: [{ type: 'list', listType: '12M', listRef: 'x_774308_campus360_it_issue.laboratory' }] }],
        },
        {
            caption: 'Maintenance Requests',
            content: [{ layout: 'one-column', elements: [{ type: 'list', listType: '12M', listRef: 'x_774308_campus360_maint_req.laboratory' }] }],
        },
    ],
})
List({
    table: 'x_774308_campus360_laboratory',
    view: default_view,
    columns: ['code', 'name', 'department', 'lab_type', 'location', 'lab_incharge', 'status', 'active'],
})

// ---- Maintenance Request ----
Form({
    table: 'x_774308_campus360_maint_req',
    view: default_view,
    sections: [
        {
            caption: 'Maintenance Request',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { field: 'number', type: 'table_field' },
                        { field: 'caller', type: 'table_field' },
                        { field: 'maintenance_type', type: 'table_field' },
                        { field: 'request_type', type: 'table_field' },
                        { field: 'parent', type: 'table_field' },
                        { field: 'pm_plan', type: 'table_field' },
                    ],
                    rightElements: [
                        { field: 'state', type: 'table_field' },
                        { field: 'priority', type: 'table_field' },
                        { field: 'safety_risk', type: 'table_field' },
                        { field: 'downtime_required', type: 'table_field' },
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
            caption: 'Location & Asset',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { field: 'location', type: 'table_field' },
                        { field: 'laboratory', type: 'table_field' },
                        { field: 'asset', type: 'table_field' },
                    ],
                    rightElements: [
                        { field: 'hostel', type: 'table_field' },
                        { field: 'hostel_room', type: 'table_field' },
                    ],
                },
            ],
        },
        {
            caption: 'Schedule & Cost',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { field: 'scheduled_start', type: 'table_field' },
                        { field: 'scheduled_end', type: 'table_field' },
                        { field: 'vendor', type: 'table_field' },
                    ],
                    rightElements: [
                        { field: 'estimated_cost', type: 'table_field' },
                        { field: 'actual_cost', type: 'table_field' },
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
    ],
})
List({
    table: 'x_774308_campus360_maint_req',
    view: default_view,
    columns: ['number', 'short_description', 'maintenance_type', 'request_type', 'location', 'state', 'scheduled_start', 'assignment_group'],
})

// ---- Preventive Maintenance Plan ----
Form({
    table: 'x_774308_campus360_pm_schedule',
    view: default_view,
    sections: [
        {
            caption: 'Preventive Maintenance Plan',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { field: 'name', type: 'table_field' },
                        { field: 'maintenance_type', type: 'table_field' },
                        { field: 'location', type: 'table_field' },
                        { field: 'laboratory', type: 'table_field' },
                        { field: 'asset', type: 'table_field' },
                    ],
                    rightElements: [
                        { field: 'frequency', type: 'table_field' },
                        { field: 'next_due', type: 'table_field' },
                        { field: 'lead_days', type: 'table_field' },
                        { field: 'assignment_group', type: 'table_field' },
                        { field: 'active', type: 'table_field' },
                    ],
                },
                { layout: 'one-column', elements: [{ field: 'instructions', type: 'table_field' }] },
            ],
        },
        {
            caption: 'Generated Work Orders',
            content: [{ layout: 'one-column', elements: [{ type: 'list', listType: '12M', listRef: 'x_774308_campus360_maint_req.pm_plan' }] }],
        },
    ],
})
List({
    table: 'x_774308_campus360_pm_schedule',
    view: default_view,
    columns: ['name', 'maintenance_type', 'location', 'frequency', 'next_due', 'assignment_group', 'active'],
})
