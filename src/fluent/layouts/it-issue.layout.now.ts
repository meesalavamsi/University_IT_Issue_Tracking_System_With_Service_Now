import { Form, List, default_view } from '@servicenow/sdk/core'

// Default form views and list layouts — core IT Issue Tracking.

// ---- IT Issue ----
Form({
    table: 'x_774308_campus360_it_issue',
    view: default_view,
    sections: [
        {
            caption: 'IT Issue',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { field: 'number', type: 'table_field' },
                        { field: 'caller', type: 'table_field' },
                        { field: 'reporter_type', type: 'table_field' },
                        { field: 'department', type: 'table_field' },
                        { field: 'category', type: 'table_field' },
                        { field: 'subcategory', type: 'table_field' },
                        { field: 'channel', type: 'table_field' },
                    ],
                    rightElements: [
                        { field: 'state', type: 'table_field' },
                        { field: 'on_hold_reason', type: 'table_field' },
                        { field: 'impact', type: 'table_field' },
                        { field: 'urgency', type: 'table_field' },
                        { field: 'priority', type: 'table_field' },
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
            caption: 'Location & Affected Item',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { field: 'location', type: 'table_field' },
                        { field: 'room_detail', type: 'table_field' },
                        { field: 'laboratory', type: 'table_field' },
                    ],
                    rightElements: [
                        { field: 'hostel', type: 'table_field' },
                        { field: 'hostel_room', type: 'table_field' },
                        { field: 'cmdb_ci', type: 'table_field' },
                        { field: 'affected_asset', type: 'table_field' },
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
                    ],
                },
            ],
        },
        {
            caption: 'Activity',
            content: [{ layout: 'one-column', elements: [{ type: 'formatter', formatterRef: 'Activities_Filtered' }] }],
        },
        {
            caption: 'Resolution',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { field: 'resolution_code', type: 'table_field' },
                        { field: 'resolved_by', type: 'table_field' },
                        { field: 'resolved_at', type: 'table_field' },
                    ],
                    rightElements: [
                        { field: 'reopen_count', type: 'table_field' },
                        { field: 'escalated_incident', type: 'table_field' },
                    ],
                },
                { layout: 'one-column', elements: [{ field: 'close_notes', type: 'table_field' }] },
            ],
        },
        {
            caption: 'SLAs',
            content: [{ layout: 'one-column', elements: [{ type: 'list', listType: '12M', listRef: 'task_sla.task' }] }],
        },
        {
            caption: 'Maintenance Requests',
            content: [{ layout: 'one-column', elements: [{ type: 'list', listType: '12M', listRef: 'x_774308_campus360_maint_req.parent' }] }],
        },
    ],
})
List({
    table: 'x_774308_campus360_it_issue',
    view: default_view,
    columns: ['number', 'short_description', 'caller', 'category', 'priority', 'state', 'assignment_group', 'assigned_to', 'sys_updated_on'],
})

// ---- Issue Category ----
Form({
    table: 'x_774308_campus360_issue_cat',
    view: default_view,
    sections: [
        {
            caption: 'Issue Category',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { field: 'code', type: 'table_field' },
                        { field: 'name', type: 'table_field' },
                        { field: 'assignment_group', type: 'table_field' },
                        { field: 'default_impact', type: 'table_field' },
                        { field: 'default_urgency', type: 'table_field' },
                        { field: 'order', type: 'table_field' },
                    ],
                    rightElements: [
                        { field: 'requires_asset', type: 'table_field' },
                        { field: 'requires_lab', type: 'table_field' },
                        { field: 'requires_hostel', type: 'table_field' },
                        { field: 'portal_visible', type: 'table_field' },
                        { field: 'icon', type: 'table_field' },
                        { field: 'active', type: 'table_field' },
                    ],
                },
                { layout: 'one-column', elements: [{ field: 'description', type: 'table_field' }] },
            ],
        },
        {
            caption: 'Subcategories',
            content: [{ layout: 'one-column', elements: [{ type: 'list', listType: '12M', listRef: 'x_774308_campus360_issue_sub.category' }] }],
        },
    ],
})
List({
    table: 'x_774308_campus360_issue_cat',
    view: default_view,
    columns: ['order', 'code', 'name', 'assignment_group', 'requires_asset', 'requires_lab', 'requires_hostel', 'active'],
})

// ---- Issue Subcategory ----
Form({
    table: 'x_774308_campus360_issue_sub',
    view: default_view,
    sections: [
        {
            caption: 'Issue Subcategory',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { field: 'category', type: 'table_field' },
                        { field: 'code', type: 'table_field' },
                        { field: 'name', type: 'table_field' },
                    ],
                    rightElements: [
                        { field: 'assignment_group', type: 'table_field' },
                        { field: 'active', type: 'table_field' },
                    ],
                },
            ],
        },
    ],
})
List({
    table: 'x_774308_campus360_issue_sub',
    view: default_view,
    columns: ['category', 'code', 'name', 'assignment_group', 'active'],
})
