import React, { useState } from 'react'
import { Button } from '@servicenow/react-components/Button'
import { Alert } from '@servicenow/react-components/Alert'
import { Textarea } from '@servicenow/react-components/Textarea'
import { api } from '../services/api'
import { ago, display, value } from '../utils/fields'
import { DataTable, Empty, ErrorState, Loading, PageHeader, Panel, Stat, StatusBadge, useAsync } from '../components/ui'

const NEXT: { [s: string]: { action: string; label: string }[] } = {
    '1': [{ action: 'start', label: 'Start' }], '2': [{ action: 'hold', label: 'Hold' }], '-5': [{ action: 'resume', label: 'Resume' }],
}
const RESOLVABLE = ['1', '2', '-5']

/** Warden view: ONLY hostels where the user is warden/assistant warden (server-scoped + ACLs). */
export default function Hostel({ onOpen }: { onOpen: (t: string, id: string) => void }) {
    const { data, loading, error, reload } = useAsync(() => api.hostel(), [])
    const [msg, setMsg] = useState('')
    const [resolving, setResolving] = useState<any>(null)
    const [notes, setNotes] = useState('')
    if (loading) return <Loading label="Loading your hostel…" />
    if (error) return <ErrorState message={error} onRetry={reload} />
    if (!data.hostels.length) return <><PageHeader title="My hostel" /><Panel><Empty title="No hostel assigned" text="You are not recorded as warden or assistant warden of any hostel." /></Panel></>

    const capacity = data.rooms.reduce((s: number, r: any) => s + parseInt(value(r.capacity) || '0', 10), 0)
    const occupied = data.rooms.reduce((s: number, r: any) => s + parseInt(value(r.occupied) || '0', 10), 0)
    const act = (id: string, action: string, extra: any = {}) => api.complaintAction(id, { action, ...extra })
        .then(() => { setMsg('Complaint updated.'); setResolving(null); setNotes(''); reload() }).catch((e) => setMsg(e.message))

    return (
        <>
            <PageHeader title="My hostel" subtitle={data.hostels.map((h: any) => display(h.name)).join(', ')} actions={<Button label="Refresh" variant="tertiary" onClicked={reload} />} />
            <div className="c360-grid c360-grid--stats">
                <Stat label="Beds occupied" value={`${occupied}/${capacity}`} hint={capacity ? `${Math.round((occupied / capacity) * 100)}% occupancy` : ''} tone="accent" />
                <Stat label="Residents" value={data.residents.length} />
                <Stat label="Rooms full" value={data.rooms.filter((r: any) => value(r.status) === 'full').length} />
                <Stat label="Open complaints" value={data.complaints.length} tone={data.complaints.length ? 'warning' : 'positive'} />
            </div>
            {msg && <div className="c360-section"><Alert status="info" content={msg} /></div>}
            {resolving && (
                <div className="c360-section">
                    <Panel title={`Resolve ${display(resolving.number)}`}>
                        <div className="c360-stack">
                            <Textarea label="Resolution notes (visible to the student)" required rows={3} value={notes} onInput={(e: any) => setNotes(e.detail.payload.fieldValue)} />
                            <div className="c360-row">
                                <Button label="Confirm resolution" variant="primary-positive" disabled={notes.trim().length < 5} onClicked={() => act(resolving.sys_id, 'resolve', { close_notes: notes })} />
                                <Button label="Cancel" variant="secondary" onClicked={() => setResolving(null)} />
                            </div>
                        </div>
                    </Panel>
                </div>
            )}
            <div className="c360-section c360-grid c360-grid--2">
                <Panel title="Open complaints" flush>
                    {data.complaints.length === 0 ? <Empty title="No open complaints" /> : (
                        <DataTable rows={data.complaints} rowKey={(r: any) => r.sys_id} columns={[
                            { key: 'n', label: 'Complaint', render: (r: any) => <div><div className="c360-table__primary">{display(r.short_description)}</div><div className="c360-subtle">{display(r.number)} · {display(r.complaint_type)} · {display(r.hostel_room)} · {ago(value(r.sys_created_on))}</div></div> },
                            { key: 's', label: 'Status', render: (r: any) => <StatusBadge label={display(r.state)} /> },
                            { key: 'a', label: '', render: (r: any) => <div className="c360-row">{(NEXT[value(r.state)] || []).map((n) => <Button key={n.action} label={n.label} size="sm" variant="secondary" onClicked={() => act(r.sys_id, n.action)} />)}
                                {RESOLVABLE.indexOf(value(r.state)) > -1 && <Button label="Resolve" size="sm" variant="secondary-positive" onClicked={() => { setResolving(r); setNotes('') }} />}
                                <Button label="Open" size="sm" variant="tertiary" onClicked={() => onOpen('x_774308_campus360_hostel_cmpl', r.sys_id)} /></div> },
                        ]} />
                    )}
                </Panel>
                <Panel title="Rooms" flush>
                    <DataTable rows={data.rooms} rowKey={(r: any) => r.sys_id} columns={[
                        { key: 'r', label: 'Room', render: (r: any) => <span className="c360-table__primary">{display(r.name)}</span> },
                        { key: 't', label: 'Type', render: (r: any) => display(r.room_type) },
                        { key: 'o', label: 'Occupancy', render: (r: any) => {
                            const cap = parseInt(value(r.capacity) || '0', 10), occ = parseInt(value(r.occupied) || '0', 10)
                            return <div style={{ minWidth: 110 }}><div className="c360-subtle">{occ}/{cap}</div><div className="c360-bar"><div className={'c360-bar__fill' + (occ >= cap ? ' c360-bar__fill--warning' : '')} style={{ width: `${cap ? (occ / cap) * 100 : 0}%` }} /></div></div>
                        } },
                        { key: 's', label: 'Status', render: (r: any) => display(r.status) },
                    ]} />
                </Panel>
            </div>
            <div className="c360-section">
                <Panel title="Residents" flush>
                    {data.residents.length === 0 ? <Empty title="No active residents" /> : (
                        <DataTable rows={data.residents} rowKey={(r: any) => r.allocation.sys_id} columns={[
                            { key: 's', label: 'Student', render: (r: any) => <span className="c360-table__primary">{display(r.allocation.student)}</span> },
                            { key: 'r', label: 'Room / bed', render: (r: any) => `${display(r.allocation.hostel_room)}${value(r.allocation.bed_label) ? ' · ' + display(r.allocation.bed_label) : ''}` },
                            { key: 'p', label: 'Programme', render: (r: any) => (r.student ? display(r.student.program) : '—') },
                            { key: 'g', label: 'Guardian (emergency)', render: (r: any) => r.student && r.student.guardian_phone ? `${display(r.student.guardian_name)} · ${display(r.student.guardian_phone)}` : <span className="c360-subtle">Not available</span> },
                        ]} />
                    )}
                </Panel>
            </div>
        </>
    )
}
