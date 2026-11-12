import React, { useMemo, useState } from 'react'
import { Button } from '@servicenow/react-components/Button'
import { Select } from '@servicenow/react-components/Select'
import { Input } from '@servicenow/react-components/Input'
import { api } from '../services/api'
import { ago, display, value } from '../utils/fields'
import { DataTable, Empty, ErrorState, Loading, PageHeader, Panel, PriorityBadge, Stat, StatusBadge, useAsync } from '../components/ui'
import { IssueActions } from './IssueActions'

const STATES = [{ id: 'all', label: 'All active' }, { id: '1', label: 'New' }, { id: '2', label: 'In Progress' }, { id: '-5', label: 'On Hold' }, { id: '6', label: 'Resolved' }]

/** IT support work queue (server scopes it: technicians → their groups; IT managers/admin → all). */
export default function Queue({ onOpen }: { onOpen: (table: string, id: string) => void }) {
    const { data, loading, error, reload } = useAsync(() => api.queue(), [])
    const [state, setState] = useState('all')
    const [search, setSearch] = useState('')
    const [selected, setSelected] = useState<any>(null)

    const items: any[] = (data && data.items) || []
    const rows = useMemo(() => items.filter((i) => (state === 'all' || value(i.state) === state) &&
        (!search || (display(i.number) + display(i.short_description) + display(i.caller)).toLowerCase().indexOf(search.toLowerCase()) > -1)), [items, state, search])
    const count = (s: string) => items.filter((i) => value(i.state) === s).length

    if (loading) return <Loading label="Loading your queue…" />
    if (error) return <ErrorState message={error} onRetry={reload} />
    return (
        <>
            <PageHeader title="IT work queue" subtitle={data.scope === 'all' ? 'All active Campus360 IT issues' : 'Issues assigned to your groups or to you'} actions={<Button label="Refresh" variant="tertiary" onClicked={reload} />} />
            <div className="c360-grid c360-grid--stats">
                <Stat label="New" value={count('1')} tone="accent" />
                <Stat label="In progress" value={count('2')} />
                <Stat label="On hold" value={count('-5')} tone="warning" />
                <Stat label="Older than 3 days" value={data.overdue} tone={data.overdue ? 'critical' : 'positive'} hint="Still active" />
            </div>
            <div className="c360-section c360-grid" style={{ gridTemplateColumns: selected ? 'minmax(0,1.6fr) minmax(320px,1fr)' : '1fr' }}>
                <Panel flush>
                    <div className="c360-toolbar">
                        <Select label="Status" items={STATES} selectedItem={state} onSelectedItemSet={(e: any) => setState(e.detail.payload.value)} />
                        <Input label="Search" placeholder="Number, title or caller" value={search} onInput={(e: any) => setSearch(e.detail.payload.fieldValue)} />
                    </div>
                    {rows.length === 0 ? <Empty title="Queue is clear" text="No issues match this filter." /> : (
                        <DataTable rows={rows} rowKey={(r: any) => r.sys_id} onRowClick={setSelected} columns={[
                            { key: 'n', label: 'Number', render: (r: any) => <span className="c360-table__primary">{display(r.number)}</span> },
                            { key: 't', label: 'Issue', render: (r: any) => <div><div>{display(r.short_description)}</div><div className="c360-subtle">{display(r.category)} · {display(r.caller)}</div></div> },
                            { key: 'p', label: 'Priority', render: (r: any) => <PriorityBadge label={display(r.priority)} /> },
                            { key: 's', label: 'Status', render: (r: any) => <StatusBadge label={display(r.state)} /> },
                            { key: 'a', label: 'Assignee', render: (r: any) => display(r.assigned_to) || <span className="c360-subtle">Unassigned</span> },
                            { key: 'c', label: 'Age', render: (r: any) => <span className={r.overdue ? '' : 'c360-subtle'} style={r.overdue ? { color: 'var(--c360-critical)', fontWeight: 600 } : undefined}>{ago(value(r.sys_created_on))}</span> },
                        ]} />
                    )}
                </Panel>
                {selected && <IssueActions issue={selected} onClose={() => setSelected(null)} onOpen={onOpen} onChanged={(u) => { setSelected(u); reload() }} />}
            </div>
        </>
    )
}
