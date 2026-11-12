import React from 'react'
import { Button } from '@servicenow/react-components/Button'
import { api } from '../services/api'
import { display, value } from '../utils/fields'
import { DataTable, Empty, ErrorState, Loading, PageHeader, Panel, Stat, StatusBadge, useAsync } from '../components/ui'

/** Faculty: sections taught/co-taught and recent sessions (server-scoped to the user's faculty profile). */
export default function Classes({ onTakeAttendance }: { onTakeAttendance: (sessionId: string) => void }) {
    const { data, loading, error, reload } = useAsync(() => api.classes(), [])
    if (loading) return <Loading label="Loading your classes…" />
    if (error) return <ErrorState message={error} onRetry={reload} />
    if (!data.faculty) return <><PageHeader title="Classes & attendance" /><Panel><Empty title="No faculty profile" text="Your account is not linked to an active Campus360 faculty record." /></Panel></>
    const today = new Date().toISOString().slice(0, 10)
    const todays = data.sessions.filter((s: any) => value(s.session_date) === today)
    return (
        <>
            <PageHeader title="Classes & attendance" subtitle={`${display(data.faculty.designation)} · ${display(data.faculty.department)}`} actions={<Button label="Refresh" variant="tertiary" onClicked={reload} />} />
            <div className="c360-grid c360-grid--stats">
                <Stat label="Sections" value={data.sections.length} tone="accent" />
                <Stat label="Sessions today" value={todays.length} />
                <Stat label="Students enrolled" value={data.sections.reduce((n: number, s: any) => n + parseInt(value(s.enrolled_count) || '0', 10), 0)} />
            </div>
            <div className="c360-section c360-grid c360-grid--2">
                <Panel title="My sections" flush>
                    {data.sections.length === 0 ? <Empty title="No active sections" /> : (
                        <DataTable rows={data.sections} rowKey={(r: any) => r.sys_id} columns={[
                            { key: 'n', label: 'Section', render: (r: any) => <span className="c360-table__primary">{display(r.name)}</span> },
                            { key: 'e', label: 'Enrolled', className: 'c360-table__num', render: (r: any) => `${display(r.enrolled_count) || 0}/${display(r.max_students)}` },
                            { key: 's', label: 'Status', render: (r: any) => display(r.status) },
                        ]} />
                    )}
                </Panel>
                <Panel title="Recent and upcoming sessions" flush>
                    {data.sessions.length === 0 ? <Empty title="No sessions in the last 14 days" text="Sessions are created by the registrar or by you on the Class Session form." /> : (
                        <DataTable rows={data.sessions} rowKey={(r: any) => r.sys_id} columns={[
                            { key: 'd', label: 'Date', render: (r: any) => <span className="c360-table__primary">{display(r.session_date)}</span> },
                            { key: 'c', label: 'Section', render: (r: any) => <div><div>{display(r.course_section)}</div><div className="c360-subtle">{display(r.start_time)}–{display(r.end_time)} · {display(r.session_type)}</div></div> },
                            { key: 'a', label: 'Attendance', render: (r: any) => <StatusBadge label={display(r.attendance_status)} /> },
                            { key: 'x', label: '', render: (r: any) => <Button label="Take attendance" size="sm" variant="secondary" onClicked={() => onTakeAttendance(r.sys_id)} /> },
                        ]} />
                    )}
                </Panel>
            </div>
        </>
    )
}
