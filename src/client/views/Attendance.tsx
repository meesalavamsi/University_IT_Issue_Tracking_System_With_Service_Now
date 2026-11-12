import React, { useEffect, useState } from 'react'
import { Button } from '@servicenow/react-components/Button'
import { Alert } from '@servicenow/react-components/Alert'
import { api } from '../services/api'
import { display, value } from '../utils/fields'
import { DataTable, Empty, ErrorState, Loading, PageHeader, Panel, Stat, useAsync } from '../components/ui'

const OPTIONS = [{ id: 'present', label: 'Present' }, { id: 'absent', label: 'Absent' }, { id: 'late', label: 'Late' }, { id: 'excused', label: 'Excused' }, { id: 'medical', label: 'Medical' }, { id: 'on_duty', label: 'On duty' }]

/** Roster for one session. Saves through the API as the user; ACLs + the (session, student) unique index apply. */
export default function Attendance({ sessionId, onBack }: { sessionId: string; onBack: () => void }) {
    const { data, loading, error, reload } = useAsync(() => api.roster(sessionId), [sessionId])
    const [marks, setMarks] = useState<{ [student: string]: string }>({})
    const [saving, setSaving] = useState(false)
    const [result, setResult] = useState<any>(null)

    useEffect(() => {
        if (!data) return
        const m: { [s: string]: string } = {}
        for (const s of data.students) m[value(s.enrollment.student)] = s.mark ? value(s.mark.status) : 'present'
        setMarks(m)
    }, [data])

    if (loading) return <Loading label="Loading roster…" />
    if (error) return <ErrorState message={error} onRetry={reload} />
    const dirty = data.students.filter((s: any) => !s.mark || value(s.mark.status) !== marks[value(s.enrollment.student)])
    const save = () => {
        setSaving(true); setResult(null)
        api.saveAttendance(sessionId, dirty.map((s: any) => ({ student: value(s.enrollment.student), status: marks[value(s.enrollment.student)] })))
            .then((r) => { setResult(r); reload() })
            .catch((e) => setResult({ error: e.message }))
            .finally(() => setSaving(false))
    }
    const present = Object.keys(marks).filter((k) => ['present', 'late', 'on_duty'].indexOf(marks[k]) > -1).length

    return (
        <>
            <PageHeader title={`Attendance · ${display(data.session.course_section)}`} subtitle={`${display(data.session.session_date)} · ${display(data.session.start_time)}–${display(data.session.end_time)}`}
                actions={<><Button label="Back" variant="secondary" onClicked={onBack} /><Button label="All present" variant="tertiary" disabled={!data.canMark} onClicked={() => { const m: any = {}; Object.keys(marks).forEach((k) => (m[k] = 'present')); setMarks(m) }} /></>} />
            {!data.canMark && <Alert status="warning" content="You can view this roster but are not allowed to record attendance for this session." />}
            <div className="c360-grid c360-grid--stats" style={{ marginTop: 16 }}>
                <Stat label="Enrolled" value={data.students.length} />
                <Stat label="Present / late / on duty" value={present} tone="positive" />
                <Stat label="Unsaved changes" value={dirty.length} tone={dirty.length ? 'warning' : undefined} />
            </div>
            {result && <div className="c360-section">{result.error ? <Alert status="critical" content={result.error} /> :
                <Alert status={result.failed ? 'warning' : 'positive'} content={`${result.saved} saved, ${result.failed} not saved${result.failed ? ' (locked, not permitted, or already recorded)' : ''}.`} />}</div>}
            <div className="c360-section">
                <Panel title="Roster" flush actions={<Button label={saving ? 'Saving…' : `Save ${dirty.length || ''} change${dirty.length === 1 ? '' : 's'}`} variant="primary" disabled={!data.canMark || saving || dirty.length === 0} onClicked={save} />}>
                    {data.students.length === 0 ? <Empty title="No enrolled students" /> : (
                        <DataTable rows={data.students} rowKey={(r: any) => value(r.enrollment.student)} columns={[
                            { key: 's', label: 'Student', render: (r: any) => <div><div className="c360-table__primary">{display(r.enrollment.student)}</div><div className="c360-subtle">Attendance {display(r.enrollment.attendance_pct) || '—'}%</div></div> },
                            { key: 'm', label: 'Mark', render: (r: any) => {
                                const id = value(r.enrollment.student)
                                const locked = r.mark && value(r.mark.locked) === '1'
                                return <div className="c360-mark-row" role="radiogroup" aria-label={`Attendance for ${display(r.enrollment.student)}`}>
                                    {OPTIONS.map((o) => <Button key={o.id} label={o.label} size="sm" variant={marks[id] === o.id ? 'primary' : 'tertiary'} disabled={!data.canMark || locked}
                                        onClicked={() => setMarks({ ...marks, [id]: o.id })} />)}
                                </div>
                            } },
                            { key: 'x', label: 'Recorded', render: (r: any) => r.mark ? <span className="c360-subtle">{display(r.mark.status)} by {display(r.mark.marked_by) || '—'}</span> : <span className="c360-subtle">Not yet</span> },
                        ]} />
                    )}
                </Panel>
            </div>
        </>
    )
}
