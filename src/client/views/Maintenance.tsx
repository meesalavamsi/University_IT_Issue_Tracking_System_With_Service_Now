import React from 'react'
import { Button } from '@servicenow/react-components/Button'
import { api } from '../services/api'
import { display, value } from '../utils/fields'
import { DataTable, Empty, ErrorState, Loading, PageHeader, Panel, StatusBadge, useAsync } from '../components/ui'

/** Active maintenance work orders the user can read (ACL-filtered server-side). */
export default function Maintenance({ onOpen, onRaise }: { onOpen: (t: string, id: string) => void; onRaise: () => void }) {
    const { data, loading, error, reload } = useAsync(() => api.maintenance(), [])
    if (loading) return <Loading />
    if (error) return <ErrorState message={error} onRetry={reload} />
    const rows: any[] = data || []
    return (
        <>
            <PageHeader title="Maintenance" subtitle="Active facilities and laboratory work orders visible to you." actions={<><Button label="New work order" variant="primary" onClicked={onRaise} /><Button label="Refresh" variant="tertiary" onClicked={reload} /></>} />
            <Panel flush>
                {rows.length === 0 ? <Empty title="No active work orders" /> : (
                    <DataTable rows={rows} rowKey={(r: any) => r.sys_id} onRowClick={(r: any) => onOpen('x_774308_campus360_maint_req', r.sys_id)} columns={[
                        { key: 'n', label: 'Work order', render: (r: any) => <div><div className="c360-table__primary">{display(r.short_description)}</div><div className="c360-subtle">{display(r.number)} · {display(r.maintenance_type)}</div></div> },
                        { key: 'l', label: 'Where', render: (r: any) => display(r.laboratory) || display(r.hostel) || display(r.location) },
                        { key: 's', label: 'Status', render: (r: any) => <StatusBadge label={display(r.state)} /> },
                        { key: 'g', label: 'Team', render: (r: any) => display(r.assigned_to) || display(r.assignment_group) || '—' },
                        { key: 'd', label: 'Scheduled', render: (r: any) => (value(r.scheduled_start) ? display(r.scheduled_start) : <span className="c360-subtle">—</span>) },
                    ]} />
                )}
            </Panel>
        </>
    )
}
