import React from 'react'
import { useSession } from '../context/session'
import { api } from '../services/api'
import { ago, display, value } from '../utils/fields'
import { Empty, Panel, Stat, StatusBadge, useAsync } from '../components/ui'
import { personaLabel } from '../components/shell'
import { Icon } from '../components/icons'

type Go = (view: string, opts?: { id?: string; table?: string }) => void
const CLOSED = ['3', '4', '6', '7', '12']

function greeting(): string {
    const h = new Date().getHours()
    return h < 5 ? 'Working late' : h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}

function Hero({ go }: { go: Go }) {
    const { me, personas } = useSession()
    const first = ((me && me.user && me.user.name) || '').split(' ')[0]
    return (
        <section className="c360-hero" aria-labelledby="c360-hero-title">
            <div className="c360-hero__orb c360-hero__orb--1" aria-hidden="true" />
            <div className="c360-hero__orb c360-hero__orb--2" aria-hidden="true" />
            <div className="c360-hero__grid" aria-hidden="true" />
            <div className="c360-hero__content">
                <span className="c360-hero__eyebrow"><Icon name="sparkle" size={14} /> Campus360 · your campus, in one place</span>
                <h1 id="c360-hero-title" className="c360-hero__title">{greeting()}{first ? `, ${first}` : ''} <span className="c360-hero__wave" aria-hidden="true">👋</span></h1>
                <p className="c360-hero__text">Raise a request in seconds, follow it live, and get your work done across IT, hostels, maintenance and academics.</p>
                <div className="c360-hero__actions">
                    <button type="button" className="c360-btn c360-btn--light" onClick={() => go('raise')}><Icon name="plus" size={18} /> Raise a request</button>
                    <button type="button" className="c360-btn c360-btn--ghost" onClick={() => go('my-requests')}><Icon name="inbox" size={18} /> My requests</button>
                </div>
                {personas.length > 0 && (
                    <div className="c360-chips c360-hero__chips" aria-label="Your roles">
                        {personas.map((p) => <span key={p} className="c360-chip c360-chip--glass">{personaLabel(p)}</span>)}
                    </div>
                )}
            </div>
        </section>
    )
}

function RecentActivity({ go }: { go: Go }) {
    const { data, loading } = useAsync(() => api.myRequests(), [])
    const rows = (data || []).slice(0, 6)
    const open = (data || []).filter((r: any) => CLOSED.indexOf(value(r.state)) < 0).length
    return (
        <Panel title="My requests · recent updates" actions={<button type="button" className="c360-link" onClick={() => go('my-requests')}>View all <Icon name="arrow" size={14} /></button>}>
            {loading ? <div className="c360-skeleton-list" aria-label="Loading">{[0, 1, 2].map((i) => <div key={i} className="c360-skeleton" />)}</div>
                : rows.length === 0 ? <Empty icon="inbox" title="No requests yet" text="When you raise a request, you can follow every step of it right here."
                    action={<button type="button" className="c360-btn c360-btn--primary" onClick={() => go('raise')}><Icon name="plus" size={16} /> Raise your first request</button>} /> : (
                    <div className="c360-stack">
                        <p className="c360-muted">{open} open · {(data || []).length} total</p>
                        <ul className="c360-feed">
                            {rows.map((r: any) => (
                                <li key={r.sys_id}>
                                    <button type="button" className="c360-feed__item" onClick={() => go('record', { table: r.table, id: r.sys_id })}>
                                        <span className="c360-feed__icon"><Icon name={r.table.indexOf('hostel') > -1 ? 'building' : r.table.indexOf('maint') > -1 ? 'tools' : 'wifi'} size={18} /></span>
                                        <span className="c360-feed__text">
                                            <span className="c360-feed__title">{display(r.short_description)}</span>
                                            <span className="c360-subtle">{display(r.number)} · {r.type} · updated {ago(value(r.sys_updated_on))}</span>
                                        </span>
                                        <StatusBadge label={display(r.state)} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
        </Panel>
    )
}

function StudentPanels({ me }: { me: any }) {
    const s = me.student
    return (
        <div className="c360-grid c360-grid--3">
            <Panel title="My profile">
                <dl className="c360-kv">
                    <dt>Student ID</dt><dd>{display(s.student_id)}</dd><dt>Programme</dt><dd>{display(s.program)}</dd>
                    <dt>Department</dt><dd>{display(s.department)}</dd><dt>Semester / section</dt><dd>{display(s.current_semester) || '—'} / {display(s.section) || '—'}</dd>
                    <dt>Advisor</dt><dd>{display(s.advisor) || '—'}</dd><dt>Status</dt><dd>{display(s.status)}</dd>
                </dl>
            </Panel>
            <Panel title="My hostel">
                {me.hostel ? (
                    <dl className="c360-kv">
                        <dt>Hostel</dt><dd>{display(me.hostel.hostel)}</dd><dt>Room</dt><dd>{display(me.hostel.hostel_room)}{me.hostel.bed ? ` · bed ${me.hostel.bed}` : ''}</dd>
                        <dt>Allocation</dt><dd>{me.hostel.allocation} since {me.hostel.since}</dd>
                    </dl>
                ) : <p className="c360-muted">You do not have an active hostel allocation.</p>}
            </Panel>
            <Panel title="My attendance">
                {me.enrollments.length === 0 ? <p className="c360-muted">No current enrolments.</p> : (
                    <div className="c360-stack" style={{ gap: 12 }}>
                        {me.enrollments.map((e: any) => {
                            const pct = parseFloat(value(e.attendance_pct) || '0')
                            return (
                                <div key={e.sys_id}>
                                    <div className="c360-row" style={{ justifyContent: 'space-between' }}><span>{display(e.course_section)}</span><strong>{value(e.attendance_pct) ? `${Math.round(pct)}%` : '—'}</strong></div>
                                    <div className="c360-bar"><div className={'c360-bar__fill' + (pct && pct < 75 ? ' c360-bar__fill--critical' : '')} style={{ width: `${Math.min(pct, 100)}%` }} /></div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </Panel>
        </div>
    )
}

function StaffSnapshot() {
    const { is } = useSession()
    const queue = useAsync(() => (is('technician', 'it_manager', 'admin') ? api.queue() : Promise.resolve(null)), [])
    const hostel = useAsync(() => (is('warden') ? api.hostel() : Promise.resolve(null)), [])
    const regs = useAsync(() => (is('registrar', 'admin') ? api.registrations() : Promise.resolve(null)), [])
    const classes = useAsync(() => (is('faculty', 'hod') ? api.classes() : Promise.resolve(null)), [])
    const stats: React.ReactNode[] = []
    if (queue.data) stats.push(<Stat key="q" icon="wrench" label="IT queue (active)" value={queue.data.items.length} hint={`${queue.data.overdue} older than 3 days`} tone={queue.data.overdue ? 'warning' : 'accent'} />)
    if (hostel.data) stats.push(<Stat key="h" icon="building" label="Hostel complaints open" value={hostel.data.complaints.length} hint={`${hostel.data.residents.length} residents`} tone="warning" />)
    if (regs.data) stats.push(<Stat key="r" icon="clipboard" label="Registrations to review" value={(regs.data as any[]).filter((r) => ['1', '2'].indexOf(value(r.state)) > -1).length} hint="Submitted or in review" tone="positive" />)
    if (classes.data && classes.data.faculty) stats.push(<Stat key="c" icon="book" label="My sections" value={classes.data.sections.length} hint={`${classes.data.sessions.length} sessions in 14 days`} tone="accent" />)
    if (!stats.length) return null
    return <div className="c360-grid c360-grid--stats">{stats}</div>
}

interface Action { key: string; icon: string; title: string; text: string; view: string; tone: string }

function QuickActions({ go }: { go: Go }) {
    const { me, is } = useSession()
    const actions: Action[] = [
        { key: 'wifi', icon: 'wifi', title: 'Wi-Fi or IT problem', text: 'Internet, laptop, lab PC or account issue', view: 'raise', tone: 'indigo' },
    ]
    if (me && me.hostel) actions.push({ key: 'hostel-issue', icon: 'droplet', title: 'Hostel problem', text: 'Water, electricity, plumbing, furniture', view: 'raise', tone: 'cyan' })
    actions.push({ key: 'track', icon: 'inbox', title: 'Track my requests', text: 'See status and updates in real time', view: 'my-requests', tone: 'violet' })
    if (is('technician', 'it_manager', 'admin')) actions.push({ key: 'queue', icon: 'wrench', title: 'IT work queue', text: 'Pick up and resolve issues', view: 'queue', tone: 'amber' })
    if (is('warden')) actions.push({ key: 'hostel', icon: 'building', title: 'Manage my hostel', text: 'Rooms, residents and complaints', view: 'hostel', tone: 'cyan' })
    if (is('maintenance', 'lab_admin', 'warden', 'technician', 'admin')) actions.push({ key: 'maint', icon: 'tools', title: 'Maintenance', text: 'Work orders across campus', view: 'maintenance', tone: 'rose' })
    if (is('faculty', 'hod')) actions.push({ key: 'classes', icon: 'book', title: 'Classes & attendance', text: 'Rosters and attendance marking', view: 'classes', tone: 'emerald' })
    if (is('registrar', 'hod', 'admin')) actions.push({ key: 'regs', icon: 'clipboard', title: 'Registrations', text: 'Review student applications', view: 'registrations', tone: 'emerald' })
    if (is('leadership', 'admin', 'it_manager', 'hod')) actions.push({ key: 'insights', icon: 'chart', title: 'Campus insights', text: 'Live service statistics', view: 'insights', tone: 'violet' })
    if (is('admin')) actions.push({ key: 'admin', icon: 'shield', title: 'Administration', text: 'Data, health and configuration', view: 'admin', tone: 'slate' })
    return (
        <section aria-labelledby="c360-qa-title">
            <div className="c360-section-title"><h2 id="c360-qa-title">Quick actions</h2><span className="c360-subtle">Everything you can do, one click away</span></div>
            <div className="c360-actions">
                {actions.map((a, i) => (
                    <button key={a.key} type="button" className={`c360-action c360-action--${a.tone}`} style={{ animationDelay: `${i * 40}ms` }} onClick={() => go(a.view)}>
                        <span className="c360-action__icon"><Icon name={a.icon} size={22} /></span>
                        <span className="c360-action__title">{a.title}</span>
                        <span className="c360-action__text">{a.text}</span>
                        <span className="c360-action__arrow"><Icon name="arrow" size={16} /></span>
                    </button>
                ))}
            </div>
        </section>
    )
}

/** Role-aware home. Each panel loads only for personas that have it; the server authorises every call. */
export default function Dashboard({ go }: { go: Go }) {
    const { me } = useSession()
    return (
        <div className="c360-stack c360-stack--lg">
            <Hero go={go} />
            <StaffSnapshot />
            <QuickActions go={go} />
            {me && me.student && <StudentPanels me={me} />}
            {me && me.faculty && !me.student && (
                <Panel title="My faculty profile">
                    <dl className="c360-kv"><dt>Employee ID</dt><dd>{display(me.faculty.employee_id)}</dd><dt>Department</dt><dd>{display(me.faculty.department)}</dd>
                        <dt>Designation</dt><dd>{display(me.faculty.designation)}</dd><dt>Status</dt><dd>{display(me.faculty.status)}</dd></dl>
                </Panel>
            )}
            <RecentActivity go={go} />
        </div>
    )
}
