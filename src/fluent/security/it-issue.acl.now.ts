import { Acl } from '@servicenow/sdk/core'
import {
    roleAdmin,
    roleHod,
    roleItManager,
    roleLabAdmin,
    roleLeadership,
    roleTechnician,
    roleUser,
    roleWarden,
} from '../roles/roles.now'

// ACLs — core IT Issue Tracking (ROLE_PERMISSION_MATRIX.md §3–4).
// "Me" = DYNAMIC90d1921e5f510100a9ad2572f2b477fe · "One of My Groups" = DYNAMICd6435e965f510100a9ad2572f2b47744

// ---- Issue Category / Subcategory (configuration) ----
Acl({ $id: Now.ID['acl-issue-cat-read'], type: 'record', table: 'x_774308_campus360_issue_cat', operation: 'read', roles: [roleUser], adminOverrides: true })
Acl({ $id: Now.ID['acl-issue-cat-create'], type: 'record', table: 'x_774308_campus360_issue_cat', operation: 'create', roles: [roleItManager], adminOverrides: true })
Acl({ $id: Now.ID['acl-issue-cat-write'], type: 'record', table: 'x_774308_campus360_issue_cat', operation: 'write', roles: [roleItManager], adminOverrides: true })
Acl({ $id: Now.ID['acl-issue-cat-delete'], type: 'record', table: 'x_774308_campus360_issue_cat', operation: 'delete', roles: [roleAdmin], adminOverrides: true })
Acl({ $id: Now.ID['acl-issue-sub-read'], type: 'record', table: 'x_774308_campus360_issue_sub', operation: 'read', roles: [roleUser], adminOverrides: true })
Acl({ $id: Now.ID['acl-issue-sub-create'], type: 'record', table: 'x_774308_campus360_issue_sub', operation: 'create', roles: [roleItManager], adminOverrides: true })
Acl({ $id: Now.ID['acl-issue-sub-write'], type: 'record', table: 'x_774308_campus360_issue_sub', operation: 'write', roles: [roleItManager], adminOverrides: true })
Acl({ $id: Now.ID['acl-issue-sub-delete'], type: 'record', table: 'x_774308_campus360_issue_sub', operation: 'delete', roles: [roleAdmin], adminOverrides: true })

// ---- IT Issue: read ----
Acl({ $id: Now.ID['acl-it-issue-read'], type: 'record', table: 'x_774308_campus360_it_issue', operation: 'read', roles: [roleTechnician, roleLeadership], adminOverrides: true })
Acl({ $id: Now.ID['acl-it-issue-read-caller'], type: 'record', table: 'x_774308_campus360_it_issue', operation: 'read', roles: [roleUser], condition: 'callerDYNAMIC90d1921e5f510100a9ad2572f2b477fe^ORopened_byDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: true, description: 'RL-05: callers read their own issues.' })
Acl({ $id: Now.ID['acl-it-issue-read-warden'], type: 'record', table: 'x_774308_campus360_it_issue', operation: 'read', roles: [roleWarden], condition: 'hostel.wardenDYNAMIC90d1921e5f510100a9ad2572f2b477fe^ORhostel.assistant_wardenDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: true, description: 'Wardens read IT issues (e.g. hostel Wi-Fi) for their hostels.' })
Acl({ $id: Now.ID['acl-it-issue-read-lab'], type: 'record', table: 'x_774308_campus360_it_issue', operation: 'read', roles: [roleLabAdmin], condition: 'laboratoryISNOTEMPTY^EQ', adminOverrides: true, description: 'Lab administrators read laboratory issues.' })
Acl({ $id: Now.ID['acl-it-issue-read-hod'], type: 'record', table: 'x_774308_campus360_it_issue', operation: 'read', roles: [roleHod], condition: 'department.hod.userDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: true, description: 'HODs read issues raised in their department.' })

// ---- IT Issue: create / write / delete ----
Acl({ $id: Now.ID['acl-it-issue-create'], type: 'record', table: 'x_774308_campus360_it_issue', operation: 'create', roles: [roleUser], adminOverrides: true, description: 'Any Campus360 user may report an IT issue.' })
Acl({ $id: Now.ID['acl-it-issue-write-manager'], type: 'record', table: 'x_774308_campus360_it_issue', operation: 'write', roles: [roleItManager], adminOverrides: true })
Acl({ $id: Now.ID['acl-it-issue-write-tech'], type: 'record', table: 'x_774308_campus360_it_issue', operation: 'write', roles: [roleTechnician], condition: 'assignment_groupDYNAMICd6435e965f510100a9ad2572f2b47744^EQ', adminOverrides: true, description: 'RL-06: technicians update issues assigned to one of their groups.' })
Acl({ $id: Now.ID['acl-it-issue-write-caller'], type: 'record', table: 'x_774308_campus360_it_issue', operation: 'write', roles: [roleUser], condition: 'callerDYNAMIC90d1921e5f510100a9ad2572f2b477fe^ORopened_byDYNAMIC90d1921e5f510100a9ad2572f2b477fe^EQ', adminOverrides: true, description: 'RL-05: callers may comment on their own issues; workflow fields are protected by field ACLs.' })
Acl({ $id: Now.ID['acl-it-issue-delete'], type: 'record', table: 'x_774308_campus360_it_issue', operation: 'delete', roles: [roleAdmin], adminOverrides: true })

// ---- IT Issue: workflow fields ----
// Revision 3 (native-form security): technicians may change workflow fields ONLY on issues assigned to
// one of their groups (same rule as the RL-06 record write ACL). Without the condition, a technician who
// RAISED an issue in another group passed the caller record ACL + this role-only field ACL and could
// cancel/resolve it. IT managers (⊂ Campus360 admin) keep unconditional access via the *-mgr ACLs.
// Backed by the before-update guard "C360 IT Issue - workflow changes need group authority".
Acl({ $id: Now.ID['acl-it-issue-state-write'], type: 'record', table: 'x_774308_campus360_it_issue', field: 'state', operation: 'write', roles: [roleTechnician], condition: 'assignment_groupDYNAMICd6435e965f510100a9ad2572f2b47744^EQ', adminOverrides: true, description: 'Technicians of the assigned group only.' })
Acl({ $id: Now.ID['acl-it-issue-priority-write'], type: 'record', table: 'x_774308_campus360_it_issue', field: 'priority', operation: 'write', roles: [roleTechnician], condition: 'assignment_groupDYNAMICd6435e965f510100a9ad2572f2b47744^EQ', adminOverrides: true, description: 'Technicians of the assigned group only.' })
Acl({ $id: Now.ID['acl-it-issue-impact-write'], type: 'record', table: 'x_774308_campus360_it_issue', field: 'impact', operation: 'write', roles: [roleTechnician], condition: 'assignment_groupDYNAMICd6435e965f510100a9ad2572f2b47744^EQ', adminOverrides: true, description: 'Technicians of the assigned group only.' })
Acl({ $id: Now.ID['acl-it-issue-urgency-write'], type: 'record', table: 'x_774308_campus360_it_issue', field: 'urgency', operation: 'write', roles: [roleTechnician], condition: 'assignment_groupDYNAMICd6435e965f510100a9ad2572f2b47744^EQ', adminOverrides: true, description: 'Technicians of the assigned group only.' })
Acl({ $id: Now.ID['acl-it-issue-group-write'], type: 'record', table: 'x_774308_campus360_it_issue', field: 'assignment_group', operation: 'write', roles: [roleTechnician], condition: 'assignment_groupDYNAMICd6435e965f510100a9ad2572f2b47744^EQ', adminOverrides: true, description: 'Technicians of the assigned group only (prevents pulling another group\'s issue into one\'s own group).' })
Acl({ $id: Now.ID['acl-it-issue-assignee-write'], type: 'record', table: 'x_774308_campus360_it_issue', field: 'assigned_to', operation: 'write', roles: [roleTechnician], condition: 'assignment_groupDYNAMICd6435e965f510100a9ad2572f2b47744^EQ', adminOverrides: true, description: 'Technicians of the assigned group only.' })
Acl({ $id: Now.ID['acl-it-issue-onhold-write'], type: 'record', table: 'x_774308_campus360_it_issue', field: 'on_hold_reason', operation: 'write', roles: [roleTechnician], condition: 'assignment_groupDYNAMICd6435e965f510100a9ad2572f2b47744^EQ', adminOverrides: true, description: 'Technicians of the assigned group only.' })
Acl({ $id: Now.ID['acl-it-issue-rescode-write'], type: 'record', table: 'x_774308_campus360_it_issue', field: 'resolution_code', operation: 'write', roles: [roleTechnician], condition: 'assignment_groupDYNAMICd6435e965f510100a9ad2572f2b47744^EQ', adminOverrides: true, description: 'Technicians of the assigned group only.' })
Acl({ $id: Now.ID['acl-it-issue-closenotes-write'], type: 'record', table: 'x_774308_campus360_it_issue', field: 'close_notes', operation: 'write', roles: [roleTechnician], condition: 'assignment_groupDYNAMICd6435e965f510100a9ad2572f2b47744^EQ', adminOverrides: true, description: 'Technicians of the assigned group only.' })
Acl({ $id: Now.ID['acl-it-issue-worknotes-write'], type: 'record', table: 'x_774308_campus360_it_issue', field: 'work_notes', operation: 'write', roles: [roleTechnician], condition: 'assignment_groupDYNAMICd6435e965f510100a9ad2572f2b47744^EQ', adminOverrides: true, description: 'Technicians of the assigned group only.' })
Acl({ $id: Now.ID['acl-it-issue-worknotes-read'], type: 'record', table: 'x_774308_campus360_it_issue', field: 'work_notes', operation: 'read', roles: [roleTechnician], adminOverrides: true, description: 'Internal work notes are not visible to callers.' })
Acl({ $id: Now.ID['acl-it-issue-caller-write'], type: 'record', table: 'x_774308_campus360_it_issue', field: 'caller', operation: 'write', roles: [roleTechnician], condition: 'assignment_groupDYNAMICd6435e965f510100a9ad2572f2b47744^EQ', adminOverrides: true, description: 'Technicians of the assigned group only.' })
Acl({ $id: Now.ID['acl-it-issue-category-write'], type: 'record', table: 'x_774308_campus360_it_issue', field: 'category', operation: 'write', roles: [roleTechnician], condition: 'assignment_groupDYNAMICd6435e965f510100a9ad2572f2b47744^EQ', adminOverrides: true, description: 'Technicians of the assigned group only.' })
// IT managers (and therefore Campus360 admins) work any issue.
Acl({ $id: Now.ID['acl-it-issue-state-write-mgr'], type: 'record', table: 'x_774308_campus360_it_issue', field: 'state', operation: 'write', roles: [roleItManager], adminOverrides: true })
Acl({ $id: Now.ID['acl-it-issue-priority-write-mgr'], type: 'record', table: 'x_774308_campus360_it_issue', field: 'priority', operation: 'write', roles: [roleItManager], adminOverrides: true })
Acl({ $id: Now.ID['acl-it-issue-impact-write-mgr'], type: 'record', table: 'x_774308_campus360_it_issue', field: 'impact', operation: 'write', roles: [roleItManager], adminOverrides: true })
Acl({ $id: Now.ID['acl-it-issue-urgency-write-mgr'], type: 'record', table: 'x_774308_campus360_it_issue', field: 'urgency', operation: 'write', roles: [roleItManager], adminOverrides: true })
Acl({ $id: Now.ID['acl-it-issue-group-write-mgr'], type: 'record', table: 'x_774308_campus360_it_issue', field: 'assignment_group', operation: 'write', roles: [roleItManager], adminOverrides: true })
Acl({ $id: Now.ID['acl-it-issue-assignee-write-mgr'], type: 'record', table: 'x_774308_campus360_it_issue', field: 'assigned_to', operation: 'write', roles: [roleItManager], adminOverrides: true })
Acl({ $id: Now.ID['acl-it-issue-onhold-write-mgr'], type: 'record', table: 'x_774308_campus360_it_issue', field: 'on_hold_reason', operation: 'write', roles: [roleItManager], adminOverrides: true })
Acl({ $id: Now.ID['acl-it-issue-rescode-write-mgr'], type: 'record', table: 'x_774308_campus360_it_issue', field: 'resolution_code', operation: 'write', roles: [roleItManager], adminOverrides: true })
Acl({ $id: Now.ID['acl-it-issue-closenotes-write-mgr'], type: 'record', table: 'x_774308_campus360_it_issue', field: 'close_notes', operation: 'write', roles: [roleItManager], adminOverrides: true })
Acl({ $id: Now.ID['acl-it-issue-worknotes-write-mgr'], type: 'record', table: 'x_774308_campus360_it_issue', field: 'work_notes', operation: 'write', roles: [roleItManager], adminOverrides: true })
Acl({ $id: Now.ID['acl-it-issue-caller-write-mgr'], type: 'record', table: 'x_774308_campus360_it_issue', field: 'caller', operation: 'write', roles: [roleItManager], adminOverrides: true })
Acl({ $id: Now.ID['acl-it-issue-category-write-mgr'], type: 'record', table: 'x_774308_campus360_it_issue', field: 'category', operation: 'write', roles: [roleItManager], adminOverrides: true })

// ---- Fields a reporter legitimately sets when CREATING an issue (field create ACLs take precedence
//      over the technician-only field write ACLs above on insert) ----
Acl({ $id: Now.ID['acl-it-issue-category-create'], type: 'record', table: 'x_774308_campus360_it_issue', field: 'category', operation: 'create', roles: [roleUser], adminOverrides: true })
Acl({ $id: Now.ID['acl-it-issue-caller-create'], type: 'record', table: 'x_774308_campus360_it_issue', field: 'caller', operation: 'create', roles: [roleUser], adminOverrides: true })
Acl({ $id: Now.ID['acl-it-issue-impact-create'], type: 'record', table: 'x_774308_campus360_it_issue', field: 'impact', operation: 'create', roles: [roleUser], adminOverrides: true })
Acl({ $id: Now.ID['acl-it-issue-urgency-create'], type: 'record', table: 'x_774308_campus360_it_issue', field: 'urgency', operation: 'create', roles: [roleUser], adminOverrides: true })

// ---- Authorised, duplicate-protected incident escalation: only IT managers may set the link ----
Acl({ $id: Now.ID['acl-it-issue-escalated-write'], type: 'record', table: 'x_774308_campus360_it_issue', field: 'escalated_incident', operation: 'write', roles: [roleItManager], condition: 'escalated_incidentISEMPTY^EQ', adminOverrides: false, description: 'Escalation link is write-once (only while empty) and limited to IT managers. The Part 4 UI action adds the server-side duplicate check.' })
