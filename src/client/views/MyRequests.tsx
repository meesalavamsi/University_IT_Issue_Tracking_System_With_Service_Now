import React, { useMemo, useState } from 'react'
import { Button } from '@servicenow/react-components/Button'
import { Input } from '@servicenow/react-components/Input'
import { Select } from '@servicenow/react-components/Select'
import { api } from '../services/api'
import { ago, display, value } from '../utils/fields'
import { DataTable, Empty, ErrorState, Loading, PageHeader, Panel, PriorityBadge, StatusBadge, useAsync } from '../components/ui'

const FILTERS = [{ id: 'open', label: 'Open' }, { id: 'resolved', label: 'Resolved / closed' }, { id: 'all', label: 'All' }]
const CLOSED = ['3', '4', '6', '7', '12']

/** My requests across IT issues, hostel complaints and maintenance (server returns only the caller's records). */
export default function MyRequests({ onOpen, onRaise }: { onOpen: (table: string, id: string) => void; onRaise: () => void }) {
    const { data, loading, error, reload } = useAsync(() => api.myRequests(), [])
    const [filter, setFilter] = useState('open')
    const [search, setSearch] = useState('')

    const rows = useMemo(() => (data || []).filter((r: any) => {
        const closed = CLOSED.indexOf(value(r.state)) > -1
        if (filter === 'open' && closed) return false
        if (filter === 'resolved' && !closed) return false
        const q = search.trim().toLowerCase()
        return !q || (display(r.number) + ' ' + display(r.short_description)).toLowerCase().indexOf(q) > -1
    }), [data, filter, search])

    return (
        <>
            <PageHeader title="My requests" subtitle="Everything you have reported, with its current status." actions={<Button label="Raise a request" variant="primary" onClicked={onRaise} />} />
            <Panel flush>
                <div className="c360-toolbar">
                    <Select label="Show" items={FILTERS} selectedItem={filter} onSelectedItemSet={(e: any) => setFilter(e.detail.payload.value)} />
                    <Input label="Search" placeholder="Number or title" value={search} onInput={(e: any) => setSearch(e.detail.payload.fieldValue)} />
                    <Button label="Refresh" variant="tertiary" onClicked={reload} />
                </div>
                {loading ? <Loading /> : error ? <div className="c360-panel__body"><ErrorState message={error} onRetry={reload} /></div> : rows.length === 0 ? (
                    <Empty title="No requests here" text={filter === 'open' ? 'You have no open requests.' : 'Nothing matches this filter.'} action={<Button label="Raise a request" variant="secondary" onClicked={onRaise} />} />
                ) : (
                    <DataTable rows={rows} rowKey={(r: any) => r.sys_id} onRowClick={(r: any) => onOpen(r.table, r.sys_id)} columns={[
                        { key: 'n', label: 'Number', render: (r: any) => <span className="c360-table__primary">{display(r.number)}</span> },
                        { key: 't', label: 'Title', render: (r: any) => display(r.short_description) },
                        { key: 'k', label: 'Type', render: (r: any) => <span className="c360-muted">{r.type}{r[r.kind] ? ` · ${display(r[r.kind])}` : ''}</span> },
                        { key: 's', label: 'Status', render: (r: any) => <StatusBadge label={display(r.state)} /> },
                        { key: 'p', label: 'Priority', render: (r: any) => <PriorityBadge label={display(r.priority)} /> },
                        { key: 'a', label: 'With', render: (r: any) => display(r.assigned_to) || display(r.assignment_group) || <span className="c360-subtle">Unassigned</span> },
                        { key: 'u', label: 'Updated', render: (r: any) => <span className="c360-subtle">{ago(value(r.sys_updated_on))}</span> },
                    ]} />
                )}
            </Panel>
        </>
    )
}
