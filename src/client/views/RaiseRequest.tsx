import React, { useMemo, useState } from 'react'
import { Button } from '@servicenow/react-components/Button'
import { Alert } from '@servicenow/react-components/Alert'
import { api } from '../services/api'
import { useSession } from '../context/session'
import { display, value } from '../utils/fields'
import { Empty, ErrorState, Loading, PageHeader, Panel, useAsync } from '../components/ui'
import { RequestDetailsForm, type Draft } from './RequestDetailsForm'

export type Kind = 'it' | 'hostel' | 'maintenance'
export interface Choice { kind: Kind; id: string; title: string; desc: string; category?: any }

const HOSTEL_CHOICE: Choice = { kind: 'hostel', id: 'hostel', title: 'Hostel complaint', desc: 'Hot water, plumbing, electricity, furniture, cleanliness, mess, security…' }
const MAINT_CHOICE: Choice = { kind: 'maintenance', id: 'maintenance', title: 'Maintenance work order', desc: 'Facilities work for a lab or hostel (staff only).' }

/** "Raise a request": 1 choose → 2 describe → 3 review & submit → actual ServiceNow record. */
export default function RaiseRequest({ onOpen }: { onOpen: (table: string, id: string) => void }) {
    const { me, is } = useSession()
    const { data: catalog, loading, error, reload } = useAsync(() => api.catalog(), [])
    const [step, setStep] = useState(1)
    const [choice, setChoice] = useState<Choice | null>(null)
    const [draft, setDraft] = useState<Draft>({ short_description: '', description: '', urgency: '3' })
    const [submitting, setSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState('')
    const [done, setDone] = useState<any>(null)

    const resident = !!(me && me.hostel)
    const choices = useMemo<Choice[]>(() => {
        const cats: Choice[] = ((catalog && catalog.categories) || []).map((c: any) => ({ kind: 'it' as Kind, id: c.sys_id, title: display(c.name), desc: display(c.description), category: c }))
        const extra: Choice[] = []
        if (resident || is('warden')) extra.push(HOSTEL_CHOICE)
        if (is('faculty', 'technician', 'warden', 'maintenance', 'lab_admin', 'admin')) extra.push(MAINT_CHOICE)
        return [...cats, ...extra]
    }, [catalog, resident, is])

    if (loading) return <Loading label="Loading request types…" />
    if (error) return <ErrorState message={error} onRetry={reload} />

    const submit = () => {
        if (!choice) return
        setSubmitting(true)
        setSubmitError('')
        const body: any = { kind: choice.kind, ...draft }
        if (choice.kind === 'it') body.category = choice.id
        if (choice.kind === 'hostel' && me && me.hostel) { body.hostel = value(me.hostel.hostel); body.hostel_room = value(me.hostel.hostel_room) }
        api.createRequest(body)
            .then((r) => setDone(r))
            .catch((e) => setSubmitError(e.message))
            .finally(() => setSubmitting(false))
    }

    if (done) {
        return (
            <>
                <PageHeader title="Request submitted" subtitle="Your request was created in ServiceNow and routed to the responsible team." />
                <Panel>
                    <Empty title={`Reference ${done.number}`} text="You can follow its progress, add comments and attachments from the request page."
                        action={<div className="c360-row"><Button label="View request" variant="primary" onClicked={() => onOpen(done.table, done.sys_id)} />
                            <Button label="Raise another" variant="secondary" onClicked={() => { setDone(null); setStep(1); setChoice(null); setDraft({ short_description: '', description: '', urgency: '3' }) }} /></div>} />
                </Panel>
            </>
        )
    }

    return (
        <>
            <PageHeader title="Raise a request" subtitle="Report an IT, Wi-Fi, laboratory, hostel or facilities problem. It goes straight to the responsible team." />
            <div className="c360-steps" aria-label="Progress">
                {['Choose type', 'Describe', 'Review & submit'].map((s, i) => (
                    <React.Fragment key={s}>
                        {i > 0 && <span className="c360-step__line" aria-hidden="true" />}
                        <span className={'c360-step' + (step === i + 1 ? ' c360-step--active' : step > i + 1 ? ' c360-step--done' : '')}>
                            <span className="c360-step__dot">{i + 1}</span>{s}
                        </span>
                    </React.Fragment>
                ))}
            </div>
            {step === 1 && (
                <Panel title="What do you need help with?">
                    <div className="c360-tiles" role="list">
                        {choices.map((c) => (
                            <div key={c.id} role="listitem" tabIndex={0} className={'c360-tile' + (choice && choice.id === c.id ? ' c360-tile--selected' : '')}
                                onClick={() => setChoice(c)} onKeyDown={(e) => { if (e.key === 'Enter') setChoice(c) }}>
                                <span className="c360-tile__title">{c.title}</span>
                                <span className="c360-tile__desc">{c.desc}</span>
                            </div>
                        ))}
                    </div>
                    <div className="c360-form__actions" style={{ marginTop: 16 }}>
                        <Button label="Continue" variant="primary" disabled={!choice} onClicked={() => setStep(2)} />
                    </div>
                </Panel>
            )}
            {step === 2 && choice && (
                <RequestDetailsForm choice={choice} catalog={catalog} me={me} draft={draft} onChange={setDraft} onBack={() => setStep(1)} onNext={() => setStep(3)} />
            )}
            {step === 3 && choice && (
                <Panel title="Review your request">
                    <dl className="c360-kv">
                        <dt>Type</dt><dd>{choice.kind === 'it' ? `IT issue · ${choice.title}` : choice.title}</dd>
                        <dt>Title</dt><dd>{draft.short_description}</dd>
                        <dt>Details</dt><dd>{draft.description || '—'}</dd>
                        {choice.kind === 'hostel' && <><dt>Hostel / room</dt><dd>{me && me.hostel ? `${display(me.hostel.hostel)} · ${display(me.hostel.hostel_room)}` : '—'}</dd></>}
                    </dl>
                    {submitError && <div style={{ marginTop: 16 }}><Alert status="critical" header="Not submitted" content={submitError} /></div>}
                    <div className="c360-form__actions" style={{ marginTop: 16 }}>
                        <Button label="Back" variant="secondary" onClicked={() => setStep(2)} />
                        <Button label={submitting ? 'Submitting…' : 'Submit request'} variant="primary" disabled={submitting} onClicked={submit} />
                    </div>
                </Panel>
            )}
        </>
    )
}
