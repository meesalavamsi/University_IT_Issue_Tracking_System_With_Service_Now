import React, { useState } from 'react'
import { Button } from '@servicenow/react-components/Button'
import { Select } from '@servicenow/react-components/Select'
import { NowRecordListConnected } from '@servicenow/react-components/NowRecordListConnected'
import { api } from '../services/api'
import { DataTable, ErrorState, Loading, PageHeader, Panel, useAsync } from '../components/ui'

const NATIVE = [
    { label: 'Campus360 navigator modules', href: '/sys_app_module_list.do?sysparm_query=sys_scope=0fa4e9c7e087434bb52c03096bab3ae9' },
    { label: 'Campus360 roles', href: '/sys_user_role_list.do?sysparm_query=nameSTARTSWITHx_774308_campus360.' },
    { label: 'Campus360 groups', href: '/sys_user_group_list.do?sysparm_query=nameSTARTSWITHC360' },
    { label: 'Campus360 properties', href: '/sys_properties_list.do?sysparm_query=nameSTARTSWITHx_774308_campus360.' },
    { label: 'Application record', href: '/sys_app.do?sys_id=0fa4e9c7e087434bb52c03096bab3ae9' },
]

/** Campus360 admin: record counts, a native list explorer per table and links to native configuration. */
export default function Admin({ onOpen }: { onOpen: (t: string, id: string) => void }) {
    const { data, loading, error, reload } = useAsync(() => api.adminOverview(), [])
    const [table, setTable] = useState('x_774308_campus360_it_issue')
    if (loading) return <Loading />
    if (error) return <ErrorState message={error} onRetry={reload} />
    const items = data.tables.map((t: any) => ({ id: t.table, label: `${t.name} (${t.readable})` }))
    return (
        <>
            <PageHeader title="Administration" subtitle="Explore every Campus360 table. Configuration (roles, groups, ACLs, properties) stays in the native ServiceNow interface." actions={<Button label="Refresh" variant="tertiary" onClicked={reload} />} />
            <div className="c360-grid c360-grid--2">
                <Panel title="Records per table" flush>
                    <DataTable rows={data.tables} rowKey={(r: any) => r.table} onRowClick={(r: any) => setTable(r.table)} columns={[
                        { key: 't', label: 'Table', render: (r: any) => <span className="c360-table__primary">{r.name}</span> },
                        { key: 'n', label: 'Records', className: 'c360-table__num', render: (r: any) => `${r.readable}${r.capped ? '+' : ''}` },
                    ]} />
                </Panel>
                <Panel title="Native configuration">
                    <ul className="c360-stack" style={{ paddingLeft: 18 }}>
                        {NATIVE.map((n) => <li key={n.label}><a href={n.href} target="_top">{n.label}</a></li>)}
                    </ul>
                    <p className="c360-subtle" style={{ marginTop: 12 }}>ACL review requires the security_admin elevated role in the native interface.</p>
                </Panel>
            </div>
            <div className="c360-section">
                <Panel title="Table explorer" actions={<div style={{ minWidth: 260 }}><Select label="Table" search="contains" items={items} selectedItem={table} onSelectedItemSet={(e: any) => setTable(e.detail.payload.value)} /></div>}>
                    <NowRecordListConnected key={table} table={table} listTitle={table.replace('x_774308_campus360_', '')} limit={20} hideQuickEdit
                        onRowClicked={(e: any) => onOpen(table, e.detail.payload.sys_id)} onNewActionClicked={() => onOpen(table, '-1')} />
                </Panel>
            </div>
        </>
    )
}
