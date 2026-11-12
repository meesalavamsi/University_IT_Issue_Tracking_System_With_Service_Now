// Lifecycle steps per table — taken from the DEPLOYED state choice sets (DATABASE_SCHEMA.md §4.3, §5.4, §6.2).
// Used only for display; transitions are performed and validated by the server.
export interface Step { value: string; label: string }

const ISSUE: Step[] = [
    { value: '1', label: 'New' },
    { value: '2', label: 'In Progress' },
    { value: '6', label: 'Resolved' },
    { value: '3', label: 'Closed' },
]
const MAINT: Step[] = [
    { value: '1', label: 'New' },
    { value: '10', label: 'Scheduled' },
    { value: '2', label: 'In Progress' },
    { value: '3', label: 'Completed' },
]

export function stepsFor(table: string): Step[] {
    return table.indexOf('maint_req') > -1 ? MAINT : ISSUE
}

/** Position of the current state on the happy path (On Hold sits with In Progress; Cancelled is terminal). */
export function progressIndex(table: string, state: string): number {
    const steps = stepsFor(table)
    if (state === '-5') return steps.findIndex((s) => s.value === '2')
    const i = steps.findIndex((s) => s.value === state)
    return i < 0 ? 0 : i
}

export const TYPE_LABELS: { [table: string]: string } = {
    x_774308_campus360_it_issue: 'IT issue',
    x_774308_campus360_hostel_cmpl: 'Hostel complaint',
    x_774308_campus360_maint_req: 'Maintenance request',
}
