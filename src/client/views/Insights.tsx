import React from 'react'
import { Button } from '@servicenow/react-components/Button'
import { Alert } from '@servicenow/react-components/Alert'
import { api } from '../services/api'
import { ErrorState, Loading, PageHeader, Panel, Stat, useAsync } from '../components/ui'

function Breakdown({ title, data }: { title: string; data: { [k: string]: number } }) {
    const entries = Object.keys(data || {}).map((k) => ({ k, n: data[k] })).sort((a, b) => b.n - a.n)
    const max = entries.reduce((m, e) => Math.max(m, e.n), 0) || 1
    return (
        <Panel title={title}>
            {entries.length === 0 ? <p className="c360-muted">No records you can see yet.</p> : (
                <div className="c360-stack" style={{ gap: 10 }}>
                    {entries.map((e) => (
                        <div key={e.k}>
                            <div className="c360-row" style={{ justifyContent: 'space-between' }}><span>{e.k}</span><strong className="c360-table__num">{e.n}</strong></div>
                            <div className="c360-bar" role="img" aria-label={`${e.k}: ${e.n}`}><div className="c360-bar__fill" style={{ width: `${(e.n / max) * 100}%` }} /></div>
                        </div>
                    ))}
                </div>
            )}
        </Panel>
    )
}

/** Campus statistics computed server-side ONLY from rows the viewer can read (ACL + W-3 query rule). */
export default function Insights() {
    const { data, loading, error, reload } = useAsync(() => api.stats(), [])
    if (loading) return <Loading label="Calculating…" />
    if (error) return <ErrorState message={error} onRetry={reload} />
    const occ = data.hostel.capacity ? Math.round((data.hostel.occupied / data.hostel.capacity) * 100) : 0
    const open = (b: any) => b.total - ((b.by.state || {})['Closed'] || 0) - ((b.by.state || {})['Cancelled'] || 0) - ((b.by.state || {})['Completed'] || 0)
    return (
        <>
            <PageHeader title="Campus insights" subtitle="Live operational picture. Figures include only records your role is allowed to see." actions={<Button label="Refresh" variant="tertiary" onClicked={reload} />} />
            {(data.issues.capped || data.complaints.capped) && <Alert status="info" content="Counts are capped at 5,000 records per table." />}
            <div className="c360-grid c360-grid--stats">
                <Stat label="IT issues (open)" value={open(data.issues)} hint={`${data.issues.total} total`} tone="accent" />
                <Stat label="Hostel complaints (open)" value={open(data.complaints)} hint={`${data.complaints.total} total`} tone="warning" />
                <Stat label="Maintenance (open)" value={open(data.maintenance)} hint={`${data.maintenance.total} total`} />
                <Stat label="Hostel occupancy" value={`${occ}%`} hint={`${data.hostel.occupied}/${data.hostel.capacity} beds`} tone="positive" />
                <Stat label="Registrations" value={data.registrations.total} />
            </div>
            <div className="c360-section c360-grid c360-grid--3">
                <Breakdown title="IT issues by status" data={data.issues.by.state} />
                <Breakdown title="IT issues by category" data={data.issues.by.category} />
                <Breakdown title="Open IT issues by team" data={data.openIssues.by.assignment_group} />
                <Breakdown title="Hostel complaints by type" data={data.complaints.by.complaint_type} />
                <Breakdown title="Maintenance by type" data={data.maintenance.by.maintenance_type} />
                <Breakdown title="Registrations by status" data={data.registrations.by.state} />
            </div>
        </>
    )
}
