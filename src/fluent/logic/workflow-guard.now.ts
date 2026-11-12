import { BusinessRule } from '@servicenow/sdk/core'
import { guardComplaintWorkflow, guardIssueWorkflow } from '../../server/issue/workflow-guard'

// Native-form security (revision 3). Field ACLs (it-issue.acl.now.ts / hostel.acl.now.ts) protect forms,
// list editing, the REST Table API and GlideRecordSecure; these before-update guards also cover scripted
// updates made as the user. They abort only — no data is changed — so audit history is preserved.
export const itIssueWorkflowGuard = BusinessRule({
    $id: Now.ID['br-it-issue-workflow-guard'],
    name: 'C360 IT Issue - workflow changes need group authority',
    table: 'x_774308_campus360_it_issue',
    when: 'before',
    action: ['update'],
    order: 50,
    active: true,
    script: guardIssueWorkflow,
    description: 'Aborts changes to workflow fields (state, resolution, notes, assignment, priority, caller, category) unless the user is an IT manager / Campus360 admin or a technician in the issue\'s assignment group before the update. Raising an issue never confers this authority.',
})

export const hostelComplaintWorkflowGuard = BusinessRule({
    $id: Now.ID['br-hostel-cmpl-workflow-guard'],
    name: 'C360 Hostel Complaint - workflow changes need hostel authority',
    table: 'x_774308_campus360_hostel_cmpl',
    when: 'before',
    action: ['update'],
    order: 50,
    active: true,
    script: guardComplaintWorkflow,
    description: 'Aborts changes to workflow fields (state, close notes, work notes, assignment, priority) unless the user is a Campus360 admin or the warden / assistant warden of the complaint\'s hostel before the update. Raising a complaint never confers this authority.',
})
