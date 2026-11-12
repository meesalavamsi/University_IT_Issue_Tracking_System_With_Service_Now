import { gs, GlideRecord, type GlideRecord as GR } from '@servicenow/glide'
import {
    changedProtected,
    COMPLAINT_WORKFLOW_FIELDS,
    ISSUE_WORKFLOW_FIELDS,
    mayChangeComplaintWorkflow,
    mayChangeIssueWorkflow,
} from './workflow-authority.ts'

/**
 * Before-update guard business rules (native-form security, revision 3).
 * Field ACLs already stop forms, list editing, the REST Table API and GlideRecordSecure. These rules
 * additionally stop scripted updates running as the user (plain GlideRecord, imports, integrations).
 * They never modify data: they only abort an unauthorised update, so audit history is unaffected.
 * Role checks use gs.hasRole() to mirror the ACL engine's role semantics (adminOverrides=true there).
 */
const R = 'x_774308_campus360.'

// rev 3.1 (DEF-1): a GlideElement whose value is EMPTY evaluates falsy on this platform, so `!!el`
// missed changes that clear a field. Test for presence explicitly.
function changes(current: any): (f: string) => boolean {
    return (f: string) => {
        const el = current.getElement(f)
        return el !== null && el !== undefined && el.changes() === true
    }
}

function deny(current: any, what: string, fields: string[]): void {
    gs.addErrorMessage('Not allowed: only ' + what + ' can change ' + fields.join(', ') + '.')
    current.setAbortAction(true)
}

export function guardIssueWorkflow(current: GR<'x_774308_campus360_it_issue'>, previous: GR<'x_774308_campus360_it_issue'>): void {
    const changed = changedProtected(ISSUE_WORKFLOW_FIELDS, changes(current))
    if (changed.length === 0) return
    const group = String(previous.getValue('assignment_group') || '')
    const allowed = mayChangeIssueWorkflow({
        isSystem: gs.getUserName() === 'system',
        itManager: gs.hasRole(R + 'it_manager'),
        technician: gs.hasRole(R + 'technician'),
        memberOfPreviousGroup: group !== '' && gs.getUser().isMemberOf(group) === true,
    })
    if (!allowed) deny(current, 'IT managers or technicians of the assigned group', changed)
}

export function guardComplaintWorkflow(current: GR<'x_774308_campus360_hostel_cmpl'>, previous: GR<'x_774308_campus360_hostel_cmpl'>): void {
    const changed = changedProtected(COMPLAINT_WORKFLOW_FIELDS, changes(current))
    if (changed.length === 0) return
    const me = gs.getUserID()
    let wardenOfHostel = false
    const hostelId = String(previous.getValue('hostel') || '')
    if (hostelId) {
        const h = new GlideRecord('x_774308_campus360_hostel')
        if (h.get(hostelId)) wardenOfHostel = h.getValue('warden') === me || h.getValue('assistant_warden') === me
    }
    const allowed = mayChangeComplaintWorkflow({
        isSystem: gs.getUserName() === 'system',
        admin: gs.hasRole(R + 'admin'),
        warden: gs.hasRole(R + 'warden'),
        wardenOfPreviousHostel: wardenOfHostel,
    })
    if (!allowed) deny(current, 'Campus360 administrators or the warden of this hostel', changed)
}
