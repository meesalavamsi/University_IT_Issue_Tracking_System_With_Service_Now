import React, { useState } from 'react'
import { Button } from '@servicenow/react-components/Button'
import { Alert } from '@servicenow/react-components/Alert'
import { Checkbox } from '@servicenow/react-components/Checkbox'
import { Select } from '@servicenow/react-components/Select'
import { Textarea } from '@servicenow/react-components/Textarea'
import { api } from '../services/api'
import { useSession } from '../context/session'
import { ago, display, value } from '../utils/fields'
import { DataTable, Empty, ErrorState, Loading, PageHeader, Panel, Stat, StatusBadge, useAsync } from '../components/ui'

const RECS = [{ id: 'recommend', label: 'Recommend → HOD approval' }, { id: 'more_info', label: 'More information required' }, { id: 'reject', label: 'Reject' }]

/** Registrar Review step (existing states 1/2 → 10 Pending HOD Approval, 12 Rejected). HODs see their department read-only. */
export default function Registrations({ onOpen }: { onOpen: (t: string, id: string) => void }) {
    const { is } = useSession()
    const { data, loading, error, reload } = useAsync(() => api.registrations(), [])
    const [sel, setSel] = useState<any>(null)
    const [docs, setDocs] = useState(false)
    const [rec, setRec] = useState('')
    const [notes, setNotes] = useState('')
    const [msg, setMsg] = useState<{ s: 'positive' | 'critical'; t: string } | null>(null)
    const canReview = is('registrar', 'admin')

    if (loading) return <Loading />
    if (error) return <ErrorState message={error} onRetry={reload} />
    const list: any[] = data || []
    const pick = (r: any) => { setSel(r); setDocs(value(r.documents_verified) === '1' || value(r.documents_verified) === 'true'); setRec(''); setNotes(''); setMsg(null) }
    const submit = () => api.reviewRegistration(sel.sys_id, { documents_verified: docs, recommendation: rec, notes })
        .then(() => { setMsg({ s: 'positive', t: 'Review saved.' }); setSel(null); reload() })
        .catch((e) => setMsg({ s: 'critical', t: e.message }))

    return (
        <>
            <PageHeader title="Student registrations" subtitle={canReview ? 'Registrar review: verify documents, then recommend for HOD approval or reject.' : 'Registrations for your department (read-only).'} />
            <div className="c360-grid c360-grid--stats">
                <Stat label="Submitted" value={list.filter((r) => value(r.state) === '1').length} tone="accent" />
                <Stat label="In registrar review" value={list.filter((r) => value(r.state) === '2').length} />
                <Stat label="Pending HOD approval" value={list.filter((r) => value(r.state) === '10').length} tone="warning" />
                <Stat label="Approved" value={list.filter((r) => value(r.state) === '11').length} tone="positive" />
            </div>
            {msg && <div className="c360-section"><Alert status={msg.s} content={msg.t} /></div>}
            <div className="c360-section c360-grid" style={{ gridTemplateColumns: sel ? 'minmax(0,1.5fr) minmax(320px,1fr)' : '1fr' }}>
                <Panel flush>
                    {list.length === 0 ? <Empty title="No registrations awaiting action" /> : (
                        <DataTable rows={list} rowKey={(r: any) => r.sys_id} onRowClick={pick} columns={[
                            { key: 'n', label: 'Applicant', render: (r: any) => <div><div className="c360-table__primary">{display(r.first_name)} {display(r.last_name)}</div><div className="c360-subtle">{display(r.number)} · {display(r.applicant_email)}</div></div> },
                            { key: 'p', label: 'Programme / term', render: (r: any) => <div><div>{display(r.program)}</div><div className="c360-subtle">{display(r.admission_term)}</div></div> },
                            { key: 's', label: 'Status', render: (r: any) => <StatusBadge label={display(r.state)} /> },
                            { key: 'd', label: 'Submitted', render: (r: any) => <span className="c360-subtle">{ago(value(r.sys_created_on))}</span> },
                        ]} />
                    )}
                </Panel>
                {sel && (
                    <Panel title={`${display(sel.first_name)} ${display(sel.last_name)}`} actions={<Button label="Close" size="sm" variant="tertiary" onClicked={() => setSel(null)} />}>
                        <div className="c360-stack">
                            <dl className="c360-kv">
                                <dt>Number</dt><dd>{display(sel.number)}</dd><dt>Category</dt><dd>{display(sel.admission_category)}</dd>
                                <dt>Status</dt><dd>{display(sel.state)}</dd><dt>Last review</dt><dd>{display(sel.registrar_reviewed_by) || '—'} {display(sel.registrar_reviewed_at)}</dd>
                            </dl>
                            {canReview && ['1', '2'].indexOf(value(sel.state)) > -1 ? (
                                <>
                                    <Checkbox label="Documents verified" checked={docs} onCheckedSet={(e: any) => setDocs(!!e.detail.payload.value)} />
                                    <Select label="Recommendation" required items={RECS} selectedItem={rec} onSelectedItemSet={(e: any) => setRec(e.detail.payload.value)} />
                                    <Textarea label="Verification notes" rows={3} value={notes} onInput={(e: any) => setNotes(e.detail.payload.fieldValue)} />
                                    <Button label="Save review" variant="primary" disabled={!rec} onClicked={submit} />
                                    <p className="c360-subtle">HOD approval and student provisioning are performed by the registration flow (planned for Part 5).</p>
                                </>
                            ) : <Alert status="info" content={canReview ? 'This registration is past the registrar review step.' : 'Read-only view.'} />}
                            <Button label="Open full record" variant="tertiary" onClicked={() => onOpen('x_774308_campus360_student_reg', sel.sys_id)} />
                        </div>
                    </Panel>
                )}
            </div>
        </>
    )
}
