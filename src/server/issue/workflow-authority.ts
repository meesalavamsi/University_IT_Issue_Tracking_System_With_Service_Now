/**
 * Workflow authority for ticket tables (pure, unit-tested). Used by the before-update guard business
 * rules, which back up the field ACLs on EVERY server-side update path (scripts using GlideRecord,
 * imports, integrations running as a user) — paths where ACLs are not evaluated.
 *
 * Authority is judged against the record AS IT WAS (previous values), so a user cannot gain authority
 * by moving a ticket into their own group or hostel in the same update.
 * Raising a ticket (caller / opened_by) never confers workflow authority.
 */

/** IT issue fields that only the assigned group's technicians / IT managers may change (mirrors it-issue.acl.now.ts). */
export const ISSUE_WORKFLOW_FIELDS = [
    'state', 'on_hold_reason', 'resolution_code', 'close_notes', 'work_notes',
    'assignment_group', 'assigned_to', 'priority', 'impact', 'urgency', 'caller', 'category',
] as const

/** Hostel complaint fields that only the hostel's wardens / Campus360 admins may change (mirrors hostel.acl.now.ts). */
export const COMPLAINT_WORKFLOW_FIELDS = ['state', 'close_notes', 'work_notes', 'assignment_group', 'assigned_to', 'priority'] as const

export interface IssueActor {
    isSystem: boolean // scheduled jobs / system context
    itManager: boolean // ACL role semantics (it_manager ⊂ Campus360 admin; platform admin passes)
    technician: boolean
    memberOfPreviousGroup: boolean // member of the issue's assignment group BEFORE this update
}

export function mayChangeIssueWorkflow(a: IssueActor): boolean {
    if (a.isSystem || a.itManager) return true
    return a.technician && a.memberOfPreviousGroup
}

export interface ComplaintActor {
    isSystem: boolean
    admin: boolean // x_774308_campus360.admin (ACL role semantics)
    warden: boolean
    wardenOfPreviousHostel: boolean // warden / assistant warden of the complaint's hostel BEFORE this update
}

export function mayChangeComplaintWorkflow(a: ComplaintActor): boolean {
    if (a.isSystem || a.admin) return true
    return a.warden && a.wardenOfPreviousHostel
}

/** Which of the protected fields changed (element-level `changes()` results supplied by the caller). */
export function changedProtected(fields: readonly string[], changed: (field: string) => boolean): string[] {
    return fields.filter((f) => changed(f))
}
