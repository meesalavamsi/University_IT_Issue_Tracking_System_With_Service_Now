import React from 'react'
import { Button } from '@servicenow/react-components/Button'
import { Alert } from '@servicenow/react-components/Alert'
import { RecordProvider } from '@servicenow/react-components/RecordContext'
import { FormColumnLayout } from '@servicenow/react-components/FormColumnLayout'
import { FormActionBar } from '@servicenow/react-components/FormActionBar'
import { Attachments } from '@servicenow/react-components/Attachments'
import { api } from '../services/api'
import { ago, display, value } from '../utils/fields'
import { progressIndex, stepsFor, TYPE_LABELS } from '../utils/lifecycle'
import { ErrorState, Loading, PageHeader, Panel, PriorityBadge, StatusBadge, useAsync } from '../components/ui'

/**
 * Request detail: lifecycle summary (portal API) + the platform record form (RecordProvider), which
 * applies the record's ACLs, UI policies, business rules, journal (comments) and attachments natively.
 */
export default function RequestDetail({ table, id, onBack }: { table: string; id: string; onBack: () => void }) {
    const { data: r, loading, error, reload } = useAsync(() => api.record(table, id), [table, id])
    if (loading) return <Loading />
    if (error) return <ErrorState message={error} onRetry={reload} />
    const state = value(r.state)
    const steps = stepsFor(table)
    const current = progressIndex(table, state)
    const cancelled = state === '7'
    return (
        <>
            <PageHeader title={`${display(r.number)} · ${display(r.short_description)}`} subtitle={TYPE_LABELS[table] || 'Request'}
                actions={<><Button label="Back" variant="secondary" onClicked={onBack} /><Button label="Refresh" variant="tertiary" onClicked={reload} /></>} />
            <div className="c360-grid c360-grid--3">
                <Panel title="Status">
                    <div className="c360-stack">
                        <div className="c360-row"><StatusBadge label={display(r.state)} /><PriorityBadge label={display(r.priority)} /></div>
                        {cancelled ? <Alert status="low" content="This request was cancelled." /> : (
                            <ol className="c360-timeline" aria-label="Request progress">
                                {steps.map((s, i) => (
                                    <li key={s.value} className={'c360-timeline__item' + (i < current ? ' c360-timeline__item--done' : i === current ? ' c360-timeline__item--current' : '')}>
                                        <span className="c360-timeline__dot" aria-hidden="true" />
                                        <span>{s.label}{i === current && state === '-5' ? ' (on hold)' : ''}</span>
                                    </li>
                                ))}
                            </ol>
                        )}
                    </div>
                </Panel>
                <Panel title="Handling">
                    <dl className="c360-kv">
                        <dt>Team</dt><dd>{display(r.assignment_group) || '—'}</dd>
                        <dt>Assignee</dt><dd>{display(r.assigned_to) || 'Not yet assigned'}</dd>
                        <dt>Raised</dt><dd>{display(r.sys_created_on)} ({ago(value(r.sys_created_on))})</dd>
                        <dt>Last update</dt><dd>{ago(value(r.sys_updated_on))}</dd>
                        {r.resolved_at && value(r.resolved_at) && <><dt>Resolved</dt><dd>{display(r.resolved_at)}</dd></>}
                        {r.escalated_incident && value(r.escalated_incident) && <><dt>Escalated to</dt><dd>{display(r.escalated_incident)}</dd></>}
                    </dl>
                </Panel>
                <Panel title="How this works">
                    <p className="c360-muted">Your request is handled by the team shown. Add comments or attachments below; the team sees them immediately and updates appear here.</p>
                </Panel>
            </div>
            <div className="c360-section">
                <Panel title="Record, comments and attachments">
                    <RecordProvider table={table} sysId={id} isReadOnly={false}>
                        <FormActionBar />
                        <FormColumnLayout />
                        <Attachments />
                    </RecordProvider>
                </Panel>
            </div>
        </>
    )
}
