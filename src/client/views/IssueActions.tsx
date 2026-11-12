import React, { useState } from 'react'
import { Button } from '@servicenow/react-components/Button'
import { Select } from '@servicenow/react-components/Select'
import { Textarea } from '@servicenow/react-components/Textarea'
import { Alert } from '@servicenow/react-components/Alert'
import { api } from '../services/api'
import { display, value } from '../utils/fields'
import { Panel, PriorityBadge, StatusBadge } from '../components/ui'

const HOLD = [{ id: 'awaiting_caller', label: 'Awaiting caller' }, { id: 'awaiting_parts', label: 'Awaiting parts' }, { id: 'awaiting_vendor', label: 'Awaiting vendor' }, { id: 'scheduled_visit', label: 'Scheduled visit' }]
const RESOLUTION = [{ id: 'fixed', label: 'Fixed' }, { id: 'workaround', label: 'Workaround provided' }, { id: 'hardware_replaced', label: 'Hardware replaced' }, { id: 'config_change', label: 'Configuration change' },
    { id: 'user_guidance', label: 'User guidance' }, { id: 'duplicate', label: 'Duplicate' }, { id: 'not_reproducible', label: 'Not reproducible' }, { id: 'vendor_referral', label: 'Referred to vendor' }, { id: 'referred_maintenance', label: 'Referred to maintenance' }]

// Buttons mirror the server's allowed transitions; the server re-validates and ACLs decide.
const ALLOWED: { [state: string]: string[] } = { '1': ['start', 'hold', 'resolve', 'cancel'], '2': ['hold', 'resolve', 'cancel'], '-5': ['resume', 'resolve', 'cancel'], '6': ['reopen'] }

export function IssueActions({ issue, onClose, onOpen, onChanged }: { issue: any; onClose: () => void; onOpen: (t: string, id: string) => void; onChanged: (u: any) => void }) {
    const [mode, setMode] = useState<'' | 'hold' | 'resolve' | 'cancel'>('')
    const [hold, setHold] = useState('')
    const [code, setCode] = useState('')
    const [notes, setNotes] = useState('')
    const [note, setNote] = useState('')
    const [busy, setBusy] = useState(false)
    const [msg, setMsg] = useState<{ status: 'positive' | 'critical'; text: string } | null>(null)
    const state = value(issue.state)
    const allowed = ALLOWED[state] || []

    const run = (p: Promise<any>, ok: string) => {
        setBusy(true); setMsg(null)
        p.then((u) => { setMsg({ status: 'positive', text: ok }); setMode(''); setNote(''); onChanged({ ...issue, ...u }) })
            .catch((e) => setMsg({ status: 'critical', text: e.message }))
            .finally(() => setBusy(false))
    }
    const act = (action: string, extra: any = {}, ok = 'Updated.') => run(api.issueAction(issue.sys_id, { action, work_note: note, ...extra }), ok)

    return (
        <Panel title={display(issue.number)} actions={<Button label="Close" variant="tertiary" size="sm" onClicked={onClose} />}>
            <div className="c360-stack">
                <div><strong>{display(issue.short_description)}</strong><div className="c360-subtle">{display(issue.category)} · reported by {display(issue.caller)}</div></div>
                <div className="c360-row"><StatusBadge label={display(issue.state)} /><PriorityBadge label={display(issue.priority)} /></div>
                <dl className="c360-kv">
                    <dt>Group</dt><dd>{display(issue.assignment_group) || '—'}</dd>
                    <dt>Assignee</dt><dd>{display(issue.assigned_to) || 'Unassigned'}</dd>
                    {value(issue.escalated_incident) && <><dt>Escalated</dt><dd>{display(issue.escalated_incident)}</dd></>}
                </dl>
                {msg && <Alert status={msg.status} content={msg.text} />}
                <div className="c360-row">
                    {!value(issue.assigned_to) && <Button label="Assign to me" variant="secondary" disabled={busy} onClicked={() => run(api.assignToMe(issue.sys_id), 'Assigned to you.')} />}
                    {allowed.indexOf('start') > -1 && <Button label="Start work" variant="primary" disabled={busy} onClicked={() => act('start', {}, 'Work started.')} />}
                    {allowed.indexOf('resume') > -1 && <Button label="Resume" variant="primary" disabled={busy} onClicked={() => act('resume', {}, 'Resumed.')} />}
                    {allowed.indexOf('hold') > -1 && <Button label="Put on hold" variant="secondary" disabled={busy} onClicked={() => setMode('hold')} />}
                    {allowed.indexOf('resolve') > -1 && <Button label="Resolve" variant="primary-positive" disabled={busy} onClicked={() => setMode('resolve')} />}
                    {allowed.indexOf('reopen') > -1 && <Button label="Reopen" variant="secondary" disabled={busy} onClicked={() => act('reopen', {}, 'Reopened.')} />}
                    {allowed.indexOf('cancel') > -1 && <Button label="Cancel issue" variant="tertiary" disabled={busy} onClicked={() => setMode('cancel')} />}
                </div>
                {mode === 'cancel' && (
                    <div className="c360-stack">
                        <Alert status="warning" content="Cancelling closes the issue without a fix (state Cancelled). Add a work note below explaining why." />
                        <div className="c360-row">
                            <Button label="Confirm cancellation" variant="primary-negative" disabled={busy || note.trim().length < 5} onClicked={() => act('cancel', {}, 'Issue cancelled.')} />
                            <Button label="Keep issue" variant="secondary" disabled={busy} onClicked={() => setMode('')} />
                        </div>
                    </div>
                )}
                {mode === 'hold' && (
                    <div className="c360-stack">
                        <Select label="On-hold reason" required items={HOLD} selectedItem={hold} onSelectedItemSet={(e: any) => setHold(e.detail.payload.value)} />
                        <Button label="Confirm hold" variant="primary" disabled={busy || !hold} onClicked={() => act('hold', { on_hold_reason: hold }, 'On hold.')} />
                    </div>
                )}
                {mode === 'resolve' && (
                    <div className="c360-stack">
                        <Select label="Resolution code" required items={RESOLUTION} selectedItem={code} onSelectedItemSet={(e: any) => setCode(e.detail.payload.value)} />
                        <Textarea label="Resolution notes (visible to the caller)" required rows={3} value={notes} onInput={(e: any) => setNotes(e.detail.payload.fieldValue)} />
                        <Button label="Confirm resolution" variant="primary-positive" disabled={busy || !code || notes.trim().length < 5} onClicked={() => act('resolve', { resolution_code: code, close_notes: notes }, 'Resolved.')} />
                    </div>
                )}
                <Textarea label="Work note (internal)" rows={3} value={note} onInput={(e: any) => setNote(e.detail.payload.fieldValue)} />
                <div className="c360-row">
                    <Button label="Add work note" variant="secondary" disabled={busy || !note.trim()} onClicked={() => act('note', {}, 'Work note added.')} />
                    <Button label="Open full record" variant="tertiary" onClicked={() => onOpen('x_774308_campus360_it_issue', issue.sys_id)} />
                </div>
                <p className="c360-subtle">Escalation to a central incident is limited to IT managers on the full record; the automated escalation action is planned for Part 4.</p>
            </div>
        </Panel>
    )
}
