import React, { useMemo, useState } from 'react'
import { api } from '../services/api'
import { display } from '../utils/fields'
import { DataTable, Empty, ErrorState, Panel, StatusBadge, useAsync } from '../components/ui'
import { GROUP_ICON } from '../components/shell'
import { Icon } from '../components/icons'

const STATUS_FIELDS = ['state', 'status', 'attendance_status', 'approval', 'availability']
const BOOL_FIELDS = ['active', 'is_current', 'registration_open', 'hostel_resident', 'locked', 'exam_eligible', 'requires_asset', 'requires_lab', 'requires_hostel']

function Cell({ field, row, first }: { field: string; row: any; first: boolean }) {
    const v = row[field]
    if (v === undefined) return <span className="c360-subtle" title="Not visible to you">—</span>
    const text = display(v)
    if (first) return <span className="c360-table__primary">{text || '—'}</span>
    if (STATUS_FIELDS.indexOf(field) > -1 && text) return <StatusBadge label={text} />
    if (BOOL_FIELDS.indexOf(field) > -1) return <span className={'c360-bool' + (v.value === 'true' || v.value === '1' ? ' c360-bool--yes' : '')}>{v.value === 'true' || v.value === '1' ? 'Yes' : 'No'}</span>
    return <>{text || <span className="c360-subtle">—</span>}</>
}

/**
 * Campus records list: one entry of the native Campus360 navigator, shown inside the portal.
 * Data comes from GET /browse/{module}: server-defined filter, GlideRecordSecure as the user.
 */
export default function Browse({ moduleKey, onOpen, onNew }: { moduleKey: string; onOpen: (table: string, id: string) => void; onNew: (table: string) => void }) {
    const { data, loading, error, reload } = useAsync(() => api.browseModule(moduleKey), [moduleKey])
    const [q, setQ] = useState('')
    const items: any[] = (data && data.items) || []
    const filtered = useMemo(() => {
        const s = q.trim().toLowerCase()
        if (!s) return items
        return items.filter((r) => Object.keys(r).some((k) => k !== 'sys_id' && display(r[k]).toLowerCase().indexOf(s) > -1))
    }, [items, q])

    if (error) return <ErrorState message={error} onRetry={reload} />
    const m = data && data.module
    const cols: { name: string; label: string }[] = (data && data.columns) || []
    return (
        <div className="c360-stack">
            <header className="c360-browse-head">
                <div className="c360-browse-head__icon"><Icon name={GROUP_ICON[m ? m.group : ''] || 'list'} size={24} /></div>
                <div className="c360-browse-head__titles">
                    <span className="c360-browse-head__group">{m ? m.group : 'Campus records'}</span>
                    <h1>{m ? m.title : 'Loading…'}</h1>
                </div>
                <div className="c360-browse-head__actions">
                    <button type="button" className="c360-btn c360-btn--soft" onClick={reload} aria-label="Refresh"><Icon name="refresh" size={16} /> Refresh</button>
                    {data && data.canCreate && <button type="button" className="c360-btn c360-btn--primary" onClick={() => onNew(m.table)}><Icon name="plus" size={16} /> New</button>}
                </div>
            </header>
            <Panel flush>
                <div className="c360-browse-bar">
                    <label className="c360-search">
                        <Icon name="search" size={16} />
                        <input type="search" placeholder="Search this list…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search this list" />
                    </label>
                    <span className="c360-chip">{loading ? 'Loading…' : `${filtered.length}${q ? ` of ${items.length}` : ''} record${filtered.length === 1 ? '' : 's'}`}</span>
                    {items.length >= ((data && data.limit) || 200) && <span className="c360-subtle">Showing the latest {data.limit}. Use search to narrow down.</span>}
                </div>
                {loading ? <div className="c360-skeleton-list" style={{ padding: 20 }}>{[0, 1, 2, 3].map((i) => <div key={i} className="c360-skeleton" />)}</div>
                    : filtered.length === 0 ? <Empty icon="list" title={q ? 'No matching records' : 'No records here yet'}
                        text={q ? 'Try a different search.' : 'Nothing in this list is visible to you right now. Records appear here as soon as they are created.'} />
                        : <DataTable rows={filtered} rowKey={(r: any) => r.sys_id} onRowClick={(r: any) => onOpen(m.table, r.sys_id)}
                            columns={cols.map((c, i) => ({ key: c.name, label: c.label, render: (r: any) => <Cell field={c.name} row={r} first={i === 0} /> }))} />}
            </Panel>
            <p className="c360-subtle">Same list as <em>Campus360 → {m ? `${m.group} → ${m.title}` : '…'}</em> in the ServiceNow navigator. You only see the records and fields your role allows.</p>
        </div>
    )
}
